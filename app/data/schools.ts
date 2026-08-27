import researchData from '@/data/research/kanto-nursing-5-2026-08-26.json';
import { housingBySchoolId, type HousingEstimate } from './housing';

type RawSchool = {
  id: string;
  institution: {
    officialName: string;
    category: string;
    prefecture: string;
    city: string;
    faculty?: string;
    campus?: string;
  };
  program: {
    faculty: string;
    department: string;
    admissionCapacity?: number;
    qualifications?: string[];
  };
  campusAccess?: {
    nearestStation?: string | null;
    stationForCommute?: string;
    stationAccessNote?: string;
    walkMinutes?: number;
    busMinutes?: number;
    busFareOneWay?: number;
    notes?: string;
    accessNote?: string;
  };
  admissions?: Array<{
    academicYear: number;
    selectionType?: string;
    recruitment?: Record<string, number | string | null>;
    result?: Record<string, unknown>;
    notes?: string;
  }>;
  fees: Array<{
    academicYear: number;
    entranceExamFee?: number | Record<string, number>;
    annualTuition?: number;
    textbookAndUniformEstimateAnnual?: { min: number; max: number };
    insuranceEstimateFourYear?: number;
    otherInitialCostsEstimate?: number;
    otherInitialCosts?: string;
    additionalCostNote?: string;
    practicalFee?: number;
    breakdown?: { practicalTraining?: number };
    experimentalPracticeFee?: { annualFromYear2?: number };
    knownFourYearSchoolCostEstimate?: Record<string, number | string | undefined>;
  }>;
  nationalExamResults: Array<{
    examYear: number;
    examinees: number;
    passers: number;
    passRate: number;
    cohort?: string;
  }>;
  career?: {
    careerDecisionRate?: number;
    employed?: number;
    advancing?: number;
    scope?: string;
    facultyWide?: { employed?: number; advancing?: number; careerDecisionRate?: number };
    universityWide?: { employed?: number; advancing?: number };
    destinationsWithPublishedCounts?: Array<{ destination: string; count: number }>;
    mainDestinations?: string[];
  };
  financialAid?: { summary?: string };
  practice?: { sites?: string[]; notes?: string };
  dataQuality: {
    confidence: string;
    missingFields: string[];
  };
  sourceIds: string[];
};

type SourceLink = { id: string; title: string; url: string };

export type School = {
  id: string;
  name: string;
  category: string;
  faculty: string;
  prefecture: string;
  city: string;
  tags: string[];
  tuition: number;
  annualTuition: number;
  costLabel: string;
  livingTotal: number | null;
  commute: number | null;
  housing?: HousingEstimate;
  passRate: number;
  latestPassRate: number;
  latestPassCount: number;
  latestExamineeCount: number;
  examBasis: string;
  certificates: string;
  confidence: string;
  sourceCount: number;
  sources: SourceLink[];
  lastChecked: string;
  missingFields: string[];
  missingFieldLabels: string[];
  entranceExamFeeLabel: string;
  materialsCostLabel: string;
  otherInitialCostLabel: string;
  additionalCostNote: string;
  annualExtraEstimateYen: number;
  commuteStation: string;
  commuteStationNote: string;
  accessSummary: string;
  admissionSummary: string;
  admissionResultSummary: string;
  careerSummary: string;
  scholarshipSummary: string;
  practiceSummary: string;
};

export const datasetMeta = {
  collectedAt: researchData.dataset.collectedAt,
  schoolCount: researchData.dataset.scope.schools,
};

const rawSchools = researchData.schools as unknown as RawSchool[];
const sourceCatalog = researchData.sources as SourceLink[];

const missingFieldLabels: Record<string, string> = {
  textbookCost: '教科書代',
  clinicalPracticeCost: '臨地実習関連費',
  homeCommuteTime: '自宅からの通学時間',
  employmentBreakdown: '就職先の内訳',
  '2026 national exam result': '2026年の看護師国家試験結果',
  '2026 national exam result (official source not found)': '2026年の看護師国家試験結果（公式未確認）',
  'detailed admission allocation': '詳細な入試枠',
};

const formatMan = (yen: number) => {
  const man = yen / 10000;
  return `${man.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`;
};

export const roughAnnualAdditionalCostYen = 50000;

const getCostValues = (estimate?: Record<string, number | string | undefined>) => {
  if (!estimate) return [];
  return Object.values(estimate).filter((value): value is number => typeof value === 'number');
};

const formatCareerSummary = (career: RawSchool['career']) => {
  if (!career) return '未収録';
  const parts: string[] = [];
  if (career.careerDecisionRate !== undefined) {
    const label = career.universityWide ? '看護学科の進路決定率' : '進路決定率';
    parts.push(`${label} ${career.careerDecisionRate}%`);
  }
  if (career.employed !== undefined) parts.push(`就職 ${career.employed}人`);
  if (career.advancing !== undefined) parts.push(`進学 ${career.advancing}人`);
  if (career.facultyWide) parts.push(`学部全体：就職 ${career.facultyWide.employed ?? '—'}人・進学 ${career.facultyWide.advancing ?? '—'}人`);
  if (career.universityWide) parts.push(`大学全体：就職 ${career.universityWide.employed ?? '—'}人・進学 ${career.universityWide.advancing ?? '—'}人`);
  if (career.destinationsWithPublishedCounts?.length) {
    parts.push(career.destinationsWithPublishedCounts.map((item) => `${item.destination.replace('横浜市立大学', '')}${item.count}人`).join('・'));
  }
  if (career.mainDestinations?.length) parts.push('主な就職先を掲載');
  return parts.join(' / ') || '主な就職先を掲載';
};

const formatAdmissionSummary = (admissions: RawSchool['admissions']) => {
  const recruitment = admissions?.find((item) => item.academicYear === 2027)?.recruitment;
  if (!recruitment) return '未収録';
  const labels: Record<string, string> = {
    comprehensive: '総合型',
    schoolRecommendation: '学校推薦',
    general: '一般',
    generalFirstTerm: '一般前期',
    generalSecondTerm: '一般後期',
    generalFirstTermTotal: '一般前期（合計）',
    generalRecommendation: '一般推薦',
    designatedSchoolRecommendation: '指定校推薦',
    recommendation: '推薦',
    'generalA方式': '一般A方式',
    'generalB方式': '一般B方式',
    specialPublicRecommendation: '特別公募推薦',
    commonTestUse: '共テ利用',
    socialAdult: '社会人',
    overseasReturnee: '海外帰国生',
  };
  return Object.entries(recruitment)
    .filter(([, value]) => value !== null)
    .map(([key, value]) => `${labels[key] ?? 'その他の選抜区分'}${typeof value === 'number' ? `${value}名` : value}`)
    .join('・');
};

const formatAdmissionResult = (admissions: RawSchool['admissions']) => {
  const admissionRecord = admissions?.find((item) => item.selectionType === 'generalFirstTerm' && item.result)
    ?? admissions?.find((item) => item.result);
  const admission = admissionRecord?.result;
  const academicYear = admissionRecord?.academicYear;
  if (!admission || academicYear === undefined) return '未収録';

  const formatRow = (label: string, row: Record<string, unknown>) => {
    const applicants = typeof row.applicants === 'number' ? `志願${row.applicants}人` : '';
    const examinees = typeof row.examinees === 'number' ? `・受験${row.examinees}人` : '';
    const finalPassers = typeof row.finalPassers === 'number' ? `・合格${row.finalPassers}人` : '';
    const enrollees = typeof row.enrollees === 'number' ? `・入学${row.enrollees}人` : '';
    const ratio = typeof row.applicantRatio === 'number' ? `・倍率${row.applicantRatio}` : '';
    return `${label} ${applicants}${examinees}${finalPassers}${enrollees}${ratio}`;
  };

  const rows = Object.entries(admission)
    .filter(([, value]) => value && typeof value === 'object' && !Array.isArray(value))
    .map(([label, value]) => formatRow(label === 'generalFirstTerm' ? '一般前期' : label === 'socialAdult' ? '社会人' : label === 'recommendation' ? '推薦' : label, value as Record<string, unknown>));
  if (rows.length) return `${academicYear}年度：${rows.join(' / ')}`;

  if (typeof admission.applicants === 'number') {
    const selectionLabel = admissionRecord.selectionType === 'generalFirstTerm' ? ' 一般前期' : '';
    const applicants = `志願${admission.applicants}人`;
    const examinees = typeof admission.examinees === 'number' ? `・受験${admission.examinees}人` : '';
    const finalPassers = typeof admission.finalPassers === 'number' ? `・合格${admission.finalPassers}人` : '';
    const enrollees = typeof admission.enrollees === 'number' ? `・入学${admission.enrollees}人` : '';
    const ratio = typeof admission.applicantRatio === 'number' ? `・倍率${admission.applicantRatio}` : '';
    const note = admission.departmentCapacity !== undefined ? '（区分定義は原表確認）' : '';
    return `${academicYear}年度${selectionLabel}：${applicants}${examinees}${finalPassers}${enrollees}${ratio}${note}`;
  }

  if (typeof admission.generalA方式Applicants === 'number') {
    const ratio = typeof admission.generalA方式ApplicantRatio === 'number' ? `・倍率${admission.generalA方式ApplicantRatio}` : '';
    return `${academicYear}年度 一般A方式：志願${admission.generalA方式Applicants}人${ratio}（速報）`;
  }

  if (typeof admission.applicants === 'number' || typeof admission.admitted === 'number') {
    const applicants = typeof admission.applicants === 'number' ? `志願${admission.applicants}人` : '';
    const admitted = typeof admission.admitted === 'number' ? `・合格${admission.admitted}人` : '';
    const ratio = typeof admission.applicantRatio === 'number' ? `・倍率${admission.applicantRatio}` : '';
    return `${academicYear}年度：${applicants}${admitted}${ratio}（区分定義は原表確認）`;
  }

  return '未収録';
};

const formatEntranceExamFee = (fee: RawSchool['fees'][number]['entranceExamFee']) => {
  if (fee === undefined) return '未収録';
  if (typeof fee === 'number') return formatMan(fee);
  const labels: Record<string, string> = {
    standard: '通常選抜',
    commonTestUse: '共通テスト利用',
    multipleApplications: '複数出願',
  };
  return Object.entries(fee).map(([label, value]) => `${labels[label] ?? 'その他の検定料'} ${formatMan(value)}`).join('・');
};

const formatMaterialsCost = (fee: RawSchool['fees'][number] | undefined) => {
  if (!fee) return `目安 年${formatMan(roughAnnualAdditionalCostYen)}（公開額からの概算・確定値ではない）`;
  if (fee.textbookAndUniformEstimateAnnual) {
    const insurance = fee.insuranceEstimateFourYear ? `・保険4年${formatMan(fee.insuranceEstimateFourYear)}` : '';
    return `教材・実習着 年${formatMan(fee.textbookAndUniformEstimateAnnual.min)}〜${formatMan(fee.textbookAndUniformEstimateAnnual.max)}${insurance}`;
  }
  const practicalTraining = fee.breakdown?.practicalTraining ?? fee.practicalFee ?? fee.experimentalPracticeFee?.annualFromYear2;
  if (practicalTraining === undefined) return `目安 年${formatMan(roughAnnualAdditionalCostYen)}（公開額からの概算・確定値ではない）`;
  const fromYear = fee.experimentalPracticeFee?.annualFromYear2 ? '（2年次〜）' : '';
  return `実習費 年${formatMan(practicalTraining)}${fromYear}`;
};

const estimateAnnualAdditionalCost = (fee: RawSchool['fees'][number] | undefined) => {
  if (!fee) return roughAnnualAdditionalCostYen;
  if (fee.textbookAndUniformEstimateAnnual) {
    return Math.round((fee.textbookAndUniformEstimateAnnual.min + fee.textbookAndUniformEstimateAnnual.max) / 2)
      + Math.round((fee.insuranceEstimateFourYear ?? 0) / 4);
  }
  const practicalTraining = fee.breakdown?.practicalTraining ?? fee.practicalFee ?? fee.experimentalPracticeFee?.annualFromYear2;
  return practicalTraining === undefined ? roughAnnualAdditionalCostYen : 0;
};

const formatOtherInitialCosts = (fee: RawSchool['fees'][number] | undefined) => {
  if (!fee?.otherInitialCostsEstimate) return '未収録';
  return `${formatMan(fee.otherInitialCostsEstimate)}${fee.otherInitialCosts ? `（${fee.otherInitialCosts}）` : ''}`;
};

const formatAdditionalCostNote = (fee: RawSchool['fees'][number] | undefined) => fee?.additionalCostNote ?? '未収録';

const formatAccessSummary = (access: RawSchool['campusAccess']) => {
  if (!access) return '未収録';
  const parts: string[] = [];
  if (access.nearestStation) parts.push(access.nearestStation);
  if (access.busMinutes !== undefined) {
    const fare = access.busFareOneWay !== undefined ? `・片道${access.busFareOneWay}円` : '';
    parts.push(`バス${access.busMinutes}分${fare}`);
  }
  if (access.walkMinutes !== undefined) parts.push(`徒歩${access.walkMinutes}分`);
  const route = parts.join('／');
  const note = access.notes ?? access.accessNote;
  return `${route || 'アクセス情報あり'}${note ? `。${note}` : ''}`;
};

const buildSchool = (raw: RawSchool): School => {
  const fee = raw.fees.find((item) => item.academicYear === 2026) ?? raw.fees[0];
  const costValues = getCostValues(fee?.knownFourYearSchoolCostEstimate);
  const costMin = costValues.length > 0 ? Math.min(...costValues) : 0;
  const costMax = costValues.length > 0 ? Math.max(...costValues) : 0;
  const examResults = [...raw.nationalExamResults].sort((a, b) => b.examYear - a.examYear);
  const passRate = examResults.length > 0
    ? examResults.reduce((total, result) => total + result.passRate, 0) / examResults.length
    : 0;
  const latestResult = examResults[0];
  const qualifications = raw.program.qualifications ?? [];
  const tags = [raw.institution.category];

  if (qualifications.some((qualification) => qualification.includes('保健師'))) tags.push('保健師課程');
  if (qualifications.some((qualification) => qualification.includes('助産師'))) tags.push('助産師課程');

  return {
    id: raw.id,
    name: raw.institution.officialName,
    category: raw.institution.category,
    faculty: `${raw.program.faculty} ${raw.program.department}`,
    prefecture: raw.institution.prefecture,
    city: raw.institution.city,
    tags,
    tuition: costMax / 10000,
    annualTuition: (fee?.annualTuition ?? 0) / 10000,
    costLabel: costMin === costMax ? formatMan(costMax) : `${formatMan(costMin)}〜${formatMan(costMax)}`,
    livingTotal: null,
    commute: null,
    housing: housingBySchoolId.get(raw.id),
    passRate: Math.round(passRate * 10) / 10,
    latestPassRate: latestResult?.passRate ?? 0,
    latestPassCount: latestResult?.passers ?? 0,
    latestExamineeCount: latestResult?.examinees ?? 0,
    examBasis: latestResult?.cohort ?? '対象区分未収録',
    certificates: qualifications.join('・'),
    confidence: raw.dataQuality.confidence === 'high' ? 'A 公式情報（初回確認）' : raw.dataQuality.confidence,
    sourceCount: raw.sourceIds.length,
    sources: raw.sourceIds.map((sourceId) => sourceCatalog.find((source) => source.id === sourceId)).filter((source): source is SourceLink => Boolean(source)),
    lastChecked: datasetMeta.collectedAt,
    missingFields: raw.dataQuality.missingFields,
    missingFieldLabels: raw.dataQuality.missingFields.map((field) => missingFieldLabels[field] ?? field),
    entranceExamFeeLabel: formatEntranceExamFee(fee?.entranceExamFee),
    materialsCostLabel: formatMaterialsCost(fee),
    otherInitialCostLabel: formatOtherInitialCosts(fee),
    additionalCostNote: formatAdditionalCostNote(fee),
    annualExtraEstimateYen: estimateAnnualAdditionalCost(fee),
    commuteStation: raw.campusAccess?.stationForCommute ?? raw.campusAccess?.nearestStation ?? '未収録',
    commuteStationNote: raw.campusAccess?.stationAccessNote ?? '',
    accessSummary: formatAccessSummary(raw.campusAccess),
    admissionSummary: formatAdmissionSummary(raw.admissions),
    admissionResultSummary: formatAdmissionResult(raw.admissions),
    careerSummary: formatCareerSummary(raw.career),
    scholarshipSummary: raw.financialAid?.summary ?? '未収録',
    practiceSummary: raw.practice?.sites?.join('・') ?? raw.practice?.notes ?? '未収録',
  };
};

export const schools = rawSchools.map(buildSchool);

export const formatSchoolCost = (school: School) => school.costLabel;

export const formatAnnualTuition = (school: School) => `${school.annualTuition.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`;
