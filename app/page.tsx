'use client';

import { useMemo, useState } from 'react';
import { calculateFourYearCost, type FourYearCost } from './data/costs';
import { formatCommuteTimeEstimate } from './data/commute';
import { housingAssumptions } from './data/housing';
import { rankSchoolsByFourYearCost, type CostRankedSchool } from './data/ranking';
import { datasetMeta, schools as sourceSchools, type School } from './data/schools';

type LivingMode = 'home' | 'away';

const formatYen = (man: number) => `${man.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`;

const getCommuteLabel = (school: School, commuteTimes: Record<string, string>) => {
  const entered = commuteTimes[school.id]?.trim();
  const minutes = entered ? Number(entered) : NaN;
  return Number.isFinite(minutes) && minutes > 0
    ? `${minutes}分（入力値）`
    : formatCommuteTimeEstimate(school.commuteEstimate);
};

const getCostBreakdown = (cost: FourYearCost) => [
  { label: '学校納付金', value: cost.schoolCostYen + cost.entranceExamFeeYen, tone: 'school' },
  { label: '教材・実習', value: cost.annualExtraCostYen, tone: 'materials' },
  { label: '住居・生活', value: cost.housingCostYen + cost.livingCostYen, tone: 'living' },
  { label: '通学費', value: cost.commutePassCostYen, tone: 'commute' },
].filter((part) => part.value > 0);

const CostBreakdown = ({ cost }: { cost: FourYearCost }) => (
  <div className="cost-breakdown">
    <div className="cost-bar" aria-hidden="true">
      {getCostBreakdown(cost).map((part) => <span className={`cost-bar-${part.tone}`} style={{ flexGrow: part.value }} key={part.label} />)}
    </div>
    <div className="cost-breakdown-list">
      {getCostBreakdown(cost).map((part) => <div key={part.label}><span>{part.label}</span><b>{formatYen(part.value / 10000)}</b></div>)}
      {cost.scholarshipSupportYen > 0 && <div className="support-line"><span>給付・減免</span><b>−{formatYen(cost.scholarshipSupportYen / 10000)}</b></div>}
    </div>
  </div>
);

const SchoolDetails = ({
  school,
  cost,
  ranked,
  commuteLabel,
  onToggle,
  selected,
}: {
  school: School;
  cost: FourYearCost;
  ranked?: CostRankedSchool<School>;
  commuteLabel: string;
  onToggle: () => void;
  selected: boolean;
}) => (
  <section id="school-details" className="school-details">
    <div className="detail-heading">
      <div>
        <div className="eyebrow">選んだ学校の情報</div>
        <h2>{school.name}</h2>
        <p>{school.faculty}・{school.prefecture}{school.city}　<span>{school.confidence}・出典 {school.sourceCount}件</span></p>
      </div>
      <div className="detail-actions">
        <span>{ranked ? `${ranked.rank}位` : '詳細'}</span>
        <button className={`select-button ${selected ? 'selected' : ''}`} onClick={onToggle}>{selected ? '比較から外す' : '比較に追加'}</button>
      </div>
    </div>
    <div className="detail-total"><span>あなたの条件での4年間実負担目安</span><b>{formatYen(cost.totalCostYen / 10000)}</b><small>月あたり {formatYen(cost.totalCostYen / 48 / 10000)}相当</small></div>
    <div className="detail-grid">
      <article className="detail-card detail-card-cost"><h3>費用</h3><CostBreakdown cost={cost} /><p>入学金・授業料・受験料・教材費・生活費などを含む概算です。住まいの条件は上の条件入力で変更できます。</p></article>
      <article className="detail-card"><h3>通学・暮らし</h3><dl className="detail-list"><div><dt>通学時間</dt><dd>{commuteLabel}</dd></div><div><dt>通学先</dt><dd>{school.commuteStation}</dd></div><div><dt>一人暮らし</dt><dd>{school.housing ? `家賃 ${formatYen(school.housing.rentMonthlyYen / 10000)}/月` : '住居費 未収録'}</dd></div></dl><p>{school.accessSummary}</p></article>
      <article className="detail-card"><h3>資格・進路</h3><dl className="detail-list"><div><dt>看護師国家試験</dt><dd>{school.passRate}%（3年平均）</dd></div><div><dt>取得可能資格</dt><dd>{school.certificates}</dd></div><div><dt>卒業後</dt><dd>{school.careerSummary}</dd></div></dl><p>{school.practiceSummary}</p></article>
      <article className="detail-card"><h3>支援</h3><p>{school.scholarshipSummary}</p>{school.scholarshipPrograms.length > 0 && <div className="program-list">{school.scholarshipPrograms.map((program) => <details key={program.name}><summary>{program.name}<span>{program.supportType}</span></summary><p>{program.eligibility}<br />{program.amount}<br />{program.applicationTiming}</p></details>)}</div>}<a className="detail-link" href="#conditions">支援額を総額に反映する ↑</a></article>
      <article className="detail-card"><h3>入試</h3><dl className="detail-list"><div><dt>検定料</dt><dd>{school.entranceExamFeeLabel}</dd></div><div><dt>最新の入試結果</dt><dd>{school.admissionResultSummary}</dd></div><div><dt>募集枠</dt><dd>{school.admissionSummary}</dd></div></dl></article>
      <details className="detail-card source-card"><summary>出典と未収録項目 <span>最終確認 {school.lastChecked.replaceAll('-', '.')}</span></summary><ul>{school.sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></li>)}</ul>{school.missingFieldLabels.length > 0 && <p>未収録：{school.missingFieldLabels.join('・')}</p>}</details>
    </div>
  </section>
);

const ComparisonTable = ({ schools, costs, commuteLabels }: { schools: School[]; costs: Map<string, FourYearCost>; commuteLabels: Map<string, string> }) => (
  <section id="compare" className="comparison-section">
    <div className="section-heading"><div><div className="eyebrow">任意の比較</div><h2>選んだ学校の違い</h2></div><p>比較したい学校だけを並べています。学校を外すとここも閉じます。</p></div>
    <div className="table-scroll"><table><thead><tr><th>比較項目</th>{schools.map((school) => <th key={school.id}>{school.name}</th>)}</tr></thead><tbody>
      <tr><th>4年間実負担</th>{schools.map((school) => <td className="table-total" key={school.id}>{formatYen((costs.get(school.id)?.totalCostYen ?? 0) / 10000)}</td>)}</tr>
      <tr><th>通学時間</th>{schools.map((school) => <td key={school.id}>{commuteLabels.get(school.id)}</td>)}</tr>
      <tr><th>国家試験 3年平均</th>{schools.map((school) => <td key={school.id}>{school.passRate}%</td>)}</tr>
      <tr><th>資格</th>{schools.map((school) => <td key={school.id}>{school.certificates}</td>)}</tr>
      <tr><th>卒業後の進路</th>{schools.map((school) => <td key={school.id}>{school.careerSummary}</td>)}</tr>
      <tr><th>支援制度</th>{schools.map((school) => <td key={school.id}>{school.scholarshipSummary}</td>)}</tr>
    </tbody></table></div>
  </section>
);

export default function Home() {
  const [area, setArea] = useState('関東全域');
  const [tuitionLimit, setTuitionLimit] = useState('650万円以内');
  const [commuteLimit, setCommuteLimit] = useState('60分以内');
  const [livingMode, setLivingMode] = useState<LivingMode>('home');
  const [monthlyLivingCostMan, setMonthlyLivingCostMan] = useState(8);
  const [annualExtra, setAnnualExtra] = useState(5);
  const [annualScholarshipSupportMan, setAnnualScholarshipSupportMan] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailSchoolId, setDetailSchoolId] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const commuteTimes: Record<string, string> = {};
  const schools = useMemo(() => sourceSchools.map((school) => ({
    ...school,
    commute: school.commuteEstimate?.averageMinutes ?? school.commute,
  })), []);

  const filteredSchools = useMemo(() => schools.filter((school) => {
    const maxTuition = Number(tuitionLimit.replace(/[^0-9]/g, ''));
    const maxCommute = Number(commuteLimit.replace(/[^0-9]/g, ''));
    return (area === '関東全域' || school.prefecture === area) && school.tuition <= maxTuition && (school.commute === null || school.commute <= maxCommute);
  }), [area, commuteLimit, schools, tuitionLimit]);

  const rankingCommutePassCosts = useMemo(() => Object.fromEntries(schools.map((school) => [school.id, 0])), [schools]);
  const costOptions = useMemo(() => ({
    livingMode,
    monthlyLivingCostYen: livingMode === 'away' ? monthlyLivingCostMan * 10000 : 20000,
    managementFeeMonthlyYen: housingAssumptions.managementFeeMonthlyYen,
    initialCostMonths: housingAssumptions.initialCostMonths,
    annualScholarshipSupportYen: annualScholarshipSupportMan * 10000,
    commutePassSixMonthYenBySchoolId: rankingCommutePassCosts,
  }), [annualScholarshipSupportMan, livingMode, monthlyLivingCostMan, rankingCommutePassCosts]);
  const costRankings = useMemo(() => rankSchoolsByFourYearCost(
    filteredSchools.map((school) => ({ ...school, annualExtraEstimateYen: annualExtra * 10000 })),
    costOptions,
  ), [annualExtra, costOptions, filteredSchools]);
  const costsBySchoolId = useMemo(() => new Map(schools.map((school) => [school.id, calculateFourYearCost({
    schoolCostYen: Math.round(school.tuition * 10000),
    entranceExamFeeYen: school.entranceExamFeeYen,
    annualExtraYen: annualExtra * 10000,
    livingMode,
    housing: school.housing,
    managementFeeMonthlyYen: housingAssumptions.managementFeeMonthlyYen,
    initialCostMonths: housingAssumptions.initialCostMonths,
    monthlyLivingCostYen: livingMode === 'away' ? monthlyLivingCostMan * 10000 : 20000,
    annualScholarshipSupportYen: annualScholarshipSupportMan * 10000,
  })])), [annualExtra, annualScholarshipSupportMan, livingMode, monthlyLivingCostMan, schools]);
  const selectedSchools = selectedIds.map((id) => schools.find((school) => school.id === id)).filter((school): school is School => Boolean(school));
  const detailSchool = schools.find((school) => school.id === detailSchoolId) ?? null;
  const detailCost = detailSchool ? costsBySchoolId.get(detailSchool.id) ?? null : null;
  const detailRanking = detailSchool ? costRankings.find((school) => school.id === detailSchool.id) : undefined;
  const commuteLabels = new Map(schools.map((school) => [school.id, getCommuteLabel(school, commuteTimes)]));

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  const toggleSchool = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);
  const openDetails = (id: string) => { setDetailSchoolId(id); window.setTimeout(() => scrollTo('#school-details'), 0); };
  const resetConditions = () => { setArea('関東全域'); setTuitionLimit('650万円以内'); setCommuteLimit('60分以内'); setLivingMode('home'); setMonthlyLivingCostMan(8); setAnnualExtra(5); setAnnualScholarshipSupportMan(0); };

  return (
    <div className="site-shell">
      <header><div className="wrap nav"><a className="brand" href="#top"><span className="logo">看</span>看護進学ナビ <span className="brand-sub">実負担で学校を選ぶ</span></a><nav className="navlinks"><a href="#conditions">条件を決める</a><a href="#results">結果を見る</a>{selectedIds.length > 0 && <a href="#compare">比較を見る</a>}</nav><button className="mobile-menu-button" aria-label="メニュー" onClick={() => setMobileMenuOpen((current) => !current)}>{mobileMenuOpen ? '×' : '☰'}</button>{mobileMenuOpen && <div className="mobile-menu"><a href="#conditions" onClick={() => setMobileMenuOpen(false)}>条件を決める</a><a href="#results" onClick={() => setMobileMenuOpen(false)}>結果を見る</a>{selectedIds.length > 0 && <a href="#compare" onClick={() => setMobileMenuOpen(false)}>比較を見る</a>}</div>}</div></header>

      <main id="top">
        <section className="app-intro"><div className="wrap"><div className="intro-copy"><div className="eyebrow">関東・看護大学</div><h1>卒業までにかかるお金で、<br /><span>進学先を考える。</span></h1><p>学費だけでなく、住まい・生活費・通学費まで含めた「実際に必要な金額」の目安を出します。</p></div>
          <div id="conditions" className="condition-card"><div className="condition-card-heading"><div><span>STEP 1</span><h2>あなたの条件を入れる</h2></div><button className="reset-link" onClick={resetConditions}>リセット</button></div><div className="condition-grid">
            <fieldset><legend>住まい</legend><div className="choice-row"><button className={livingMode === 'home' ? 'active' : ''} onClick={() => setLivingMode('home')}>自宅から通う</button><button className={livingMode === 'away' ? 'active' : ''} onClick={() => setLivingMode('away')}>一人暮らし</button></div>{livingMode === 'away' && <label className="inline-input">生活費（月）<input type="number" min="3" max="20" value={monthlyLivingCostMan} onChange={(event) => setMonthlyLivingCostMan(Number(event.target.value))} />万円</label>}</fieldset>
            <label>エリア<select value={area} onChange={(event) => setArea(event.target.value)}><option>関東全域</option><option>東京都</option><option>神奈川県</option><option>埼玉県</option><option>千葉県</option><option>茨城県</option><option>栃木県</option><option>群馬県</option></select></label>
            <label>学費の上限<select value={tuitionLimit} onChange={(event) => setTuitionLimit(event.target.value)}><option>550万円以内</option><option>650万円以内</option><option>700万円以内</option></select></label>
            <label>通学時間の上限<select value={commuteLimit} onChange={(event) => setCommuteLimit(event.target.value)}><option>45分以内</option><option>60分以内</option><option>90分以内</option></select></label>
            <label>教材・実習費（年）<input type="number" min="0" max="60" value={annualExtra} onChange={(event) => setAnnualExtra(Number(event.target.value))} /><small>万円</small></label>
            <label>返済不要の支援（年）<input type="number" min="0" max="200" step="0.1" value={annualScholarshipSupportMan} onChange={(event) => setAnnualScholarshipSupportMan(Number(event.target.value))} /><small>万円</small></label>
          </div><button className="primary condition-submit" onClick={() => scrollTo('#results')}>この条件で総額を見る ↓</button><p className="condition-note">未入力の項目は、現在収録している公開情報または地域相場の目安で計算します。</p></div>
        </div></section>

        <section id="results" className="results-section"><div className="wrap"><div className="results-heading"><div><div className="eyebrow">STEP 2</div><h2>4年間の総費用ランキング</h2><p>{area}・{livingMode === 'home' ? '自宅通学' : '一人暮らし'}・学費 {tuitionLimit}・通学 {commuteLimit}</p></div><span className="result-count">{costRankings.length}校</span></div>{costRankings.length === 0 ? <p className="empty-message">条件に合う学校がありません。条件を広げてみてください。</p> : <div className="result-list">{costRankings.map((ranked) => <article className="result-card" key={ranked.id}><div className="result-rank"><b>{ranked.rank}</b><span>位</span></div><div className="result-content"><div className="result-name"><div><h3>{ranked.name}</h3><p>{ranked.faculty}・{ranked.prefecture}{ranked.city}</p></div><span>{ranked.confidence}</span></div><div className="result-total"><span>4年間実負担目安</span><b>{formatYen(ranked.cost.totalCostYen / 10000)}</b></div><CostBreakdown cost={ranked.cost} /><div className="result-meta"><span>通学 {getCommuteLabel(ranked, commuteTimes)}</span><span>国試 {ranked.passRate}%</span><span>{ranked.missingFieldLabels.length ? `未収録 ${ranked.missingFieldLabels.length}項目` : '主要情報あり'}</span></div><div className="result-actions"><button className="detail-button" onClick={() => openDetails(ranked.id)}>学校の情報を見る →</button><button className={`select-button ${selectedIds.includes(ranked.id) ? 'selected' : ''}`} onClick={() => toggleSchool(ranked.id)}>{selectedIds.includes(ranked.id) ? '✓ 比較中' : '＋ 比較に追加'}</button></div></div></article>)}</div>}<p className="result-note">表示は大学の優劣ではなく、入力条件での費用目安です。総額には推定値・未収録項目が含まれます。調査日：{datasetMeta.collectedAt.replaceAll('-', '.')}</p></div></section>

        {detailSchool && detailCost && <SchoolDetails school={detailSchool} cost={detailCost} ranked={detailRanking} commuteLabel={getCommuteLabel(detailSchool, commuteTimes)} selected={selectedIds.includes(detailSchool.id)} onToggle={() => toggleSchool(detailSchool.id)} />}
        {selectedIds.length > 0 && <ComparisonTable schools={selectedSchools} costs={costsBySchoolId} commuteLabels={commuteLabels} />}

        <section className="next-step"><div className="wrap"><div><div className="eyebrow">まだ迷っているなら</div><h2>条件を変えて、もう一度見てみる</h2><p>自宅通学と一人暮らしを切り替えるだけでも、順位は大きく変わります。</p></div><button className="outline" onClick={() => scrollTo('#conditions')}>条件を調整する ↑</button></div></section>
      </main>
      <footer><div className="wrap"><div className="footer-brand"><span className="logo">看</span>看護進学ナビ</div><p>公式情報と地域相場から、看護大学の実負担を目安として比較するサービスです。</p><small>初回データ最終確認：{datasetMeta.collectedAt.replaceAll('-', '.')}。掲載情報は必ず各学校の公式情報も確認してください。</small></div></footer>
    </div>
  );
}
