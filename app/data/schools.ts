import researchData from '@/data/research/kanto-nursing-5-2026-08-26.json';

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
  fees: Array<{
    academicYear: number;
    entranceExamFee?: number | Record<string, number>;
    annualTuition?: number;
    textbookAndUniformEstimateAnnual?: { min: number; max: number };
    practicalFee?: number;
    breakdown?: { practicalTraining?: number };
    knownFourYearSchoolCostEstimate?: Record<string, number | string | undefined>;
  }>;
  nationalExamResults: Array<{
    examYear: number;
    examinees: number;
    passers: number;
    passRate: number;
  }>;
  career?: {
    careerDecisionRate?: number;
    employed?: number;
    advancing?: number;
    scope?: string;
    facultyWide?: { employed?: number; advancing?: number; careerDecisionRate?: number };
    universityWide?: { employed?: number; advancing?: number };
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
  passRate: number;
  latestPassRate: number;
  latestPassCount: number;
  certificates: string;
  confidence: string;
  sourceCount: number;
  lastChecked: string;
  missingFields: string[];
  entranceExamFeeLabel: string;
  materialsCostLabel: string;
  careerSummary: string;
  scholarshipSummary: string;
  practiceSummary: string;
};

export const datasetMeta = {
  collectedAt: researchData.dataset.collectedAt,
  schoolCount: researchData.dataset.scope.schools,
};

const rawSchools = researchData.schools as unknown as RawSchool[];

const formatMan = (yen: number) => {
  const man = yen / 10000;
  return `${man.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`;
};

const getCostValues = (estimate?: Record<string, number | string | undefined>) => {
  if (!estimate) return [];
  return Object.values(estimate).filter((value): value is number => typeof value === 'number');
};

const formatCareerSummary = (career: RawSchool['career']) => {
  if (!career) return '未収録';
  const parts: string[] = [];
  if (career.careerDecisionRate !== undefined) parts.push(`進路決定率 ${career.careerDecisionRate}%`);
  if (career.employed !== undefined) parts.push(`就職 ${career.employed}人`);
  if (career.advancing !== undefined) parts.push(`進学 ${career.advancing}人`);
  if (career.facultyWide) parts.push(`学部全体：就職 ${career.facultyWide.employed ?? '—'}人・進学 ${career.facultyWide.advancing ?? '—'}人`);
  if (career.universityWide) parts.push(`大学全体：就職 ${career.universityWide.employed ?? '—'}人・進学 ${career.universityWide.advancing ?? '—'}人`);
  if (career.mainDestinations?.length) parts.push('主な就職先を掲載');
  return parts.join(' / ') || '主な就職先を掲載';
};

const formatEntranceExamFee = (fee: RawSchool['fees'][number]['entranceExamFee']) => {
  if (fee === undefined) return '未収録';
  if (typeof fee === 'number') return formatMan(fee);
  return Object.entries(fee).map(([label, value]) => `${label} ${formatMan(value)}`).join('・');
};

const formatMaterialsCost = (fee: RawSchool['fees'][number] | undefined) => {
  if (!fee) return '未収録';
  if (fee.textbookAndUniformEstimateAnnual) {
    return `教材・実習着 年${formatMan(fee.textbookAndUniformEstimateAnnual.min)}〜${formatMan(fee.textbookAndUniformEstimateAnnual.max)}`;
  }
  const practicalTraining = fee.breakdown?.practicalTraining ?? fee.practicalFee;
  return practicalTraining === undefined ? '未収録' : `実習費 年${formatMan(practicalTraining)}`;
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
    passRate: Math.round(passRate * 10) / 10,
    latestPassRate: latestResult?.passRate ?? 0,
    latestPassCount: latestResult?.passers ?? 0,
    certificates: qualifications.join('・'),
    confidence: raw.dataQuality.confidence === 'high' ? 'A 公式情報（初回確認）' : raw.dataQuality.confidence,
    sourceCount: raw.sourceIds.length,
    lastChecked: datasetMeta.collectedAt,
    missingFields: raw.dataQuality.missingFields,
    entranceExamFeeLabel: formatEntranceExamFee(fee?.entranceExamFee),
    materialsCostLabel: formatMaterialsCost(fee),
    careerSummary: formatCareerSummary(raw.career),
    scholarshipSummary: raw.financialAid?.summary ?? '未収録',
    practiceSummary: raw.practice?.sites?.join('・') ?? raw.practice?.notes ?? '未収録',
  };
};

export const schools = rawSchools.map(buildSchool);

export const formatSchoolCost = (school: School) => school.costLabel;

export const formatAnnualTuition = (school: School) => `${school.annualTuition.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`;
