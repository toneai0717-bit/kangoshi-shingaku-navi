'use client';

import { useMemo, useState } from 'react';
import { calculateFourYearCost } from './data/costs';
import { commuteFareKey, formatCommuteTimeEstimate, getCommuteFare, parseFareYen } from './data/commute';
import { housingAssumptions } from './data/housing';
import { preferenceToFilters, type CareerPreference, type PriorityPreference } from './data/preferences';
import { datasetMeta, formatSchoolCost, schools as sourceSchools, type ScholarshipProgram, type School } from './data/schools';
import CommutePassFinder from './components/commute-pass-finder';

type LivingMode = 'home' | 'away';

const formatYen = (man: number) => `${man.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}万円`;
const formatOptional = (value: number | null, suffix = '') => value === null ? '未収録' : `${value}${suffix}`;
const priorityLabels: Record<PriorityPreference, string> = { cost: '学費重視', commute: '通いやすさ重視', qualification: '資格実績重視', content: '学ぶ内容重視' };
const careerLabels: Record<CareerPreference, string> = { hospital: '大きな病院', community: '地域医療', undecided: 'まだ未定' };

const ScholarshipProgramCard = ({ program }: { program: ScholarshipProgram }) => (
  <details className="aid-program">
    <summary><span>{program.name}</span><em>{program.supportType}</em></summary>
    <dl>
      <div><dt>対象者・主な条件</dt><dd>{program.eligibility}</dd></div>
      <div><dt>支援額・内容</dt><dd>{program.amount}</dd></div>
      <div><dt>申請時期・方法</dt><dd>{program.applicationTiming}</dd></div>
      <div><dt>返済・継続条件</dt><dd>{program.repaymentCondition}</dd></div>
    </dl>
    <small>出典：{program.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.id}>{source.title} ↗</a>)}</small>
  </details>
);

export default function Home() {
  const [area, setArea] = useState('関東全域');
  const [tuitionLimit, setTuitionLimit] = useState('650万円以内');
  const [commuteLimit, setCommuteLimit] = useState('60分以内');
  const [commuteTimes, setCommuteTimes] = useState<Record<string, string>>({});
  const [homeStationId, setHomeStationId] = useState('');
  const [commutePassCosts, setCommutePassCosts] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>(sourceSchools.slice(0, 2).map((school) => school.id));
  const [quizOpen, setQuizOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [priorityPreference, setPriorityPreference] = useState<PriorityPreference>('cost');
  const [careerPreference, setCareerPreference] = useState<CareerPreference>('undecided');
  const [livingMode, setLivingMode] = useState<LivingMode>('home');
  const [selectedCostSchoolId, setSelectedCostSchoolId] = useState(sourceSchools[0]?.id ?? '');
  const [annualExtra, setAnnualExtra] = useState(5);
  const [annualScholarshipSupportMan, setAnnualScholarshipSupportMan] = useState(0);
  const [monthlyLivingCostMan, setMonthlyLivingCostMan] = useState(8);

  const schools = useMemo(() => sourceSchools.map((school) => {
    const entered = commuteTimes[school.id]?.trim();
    const minutes = entered ? Number(entered) : NaN;
    return {
      ...school,
      commute: Number.isFinite(minutes) && minutes > 0
        ? minutes
        : school.commuteEstimate?.averageMinutes ?? school.commute,
    };
  }), [commuteTimes]);

  const filteredSchools = useMemo(() => schools.filter((school) => {
    const inArea = area === '関東全域' || school.prefecture === area;
    const maxTuition = Number(tuitionLimit.replace(/[^0-9]/g, ''));
    const maxCommute = Number(commuteLimit.replace(/[^0-9]/g, ''));
    const inBudget = school.tuition <= maxTuition;
    const inCommute = school.commute === null || school.commute <= maxCommute;
    return inArea && inBudget && inCommute;
  }), [area, commuteLimit, tuitionLimit, schools]);

  const selectedSchools = selectedIds.map((id) => schools.find((school) => school.id === id)).filter((school): school is School => Boolean(school));
  const selectedCostSchool = sourceSchools.find((school) => school.id === selectedCostSchoolId) ?? sourceSchools[0];
  const selectedCommuteKey = homeStationId && selectedCostSchool
    ? commuteFareKey(homeStationId, selectedCostSchool.id)
    : '';
  const selectedCommuteFare = homeStationId && selectedCostSchool
    ? getCommuteFare(homeStationId, selectedCostSchool.id)
    : null;
  const enteredCommutePass = selectedCommuteKey ? parseFareYen(commutePassCosts[selectedCommuteKey] ?? '') : null;
  const selectedCommutePass = enteredCommutePass ?? selectedCommuteFare?.studentSixMonthYen ?? 0;
  const selectedAnnualExtraEstimateMan = (selectedCostSchool?.annualExtraEstimateYen ?? 50000) / 10000;
  const fourYearCost = calculateFourYearCost({
    schoolCostYen: Math.round((selectedCostSchool?.tuition ?? 0) * 10000),
    entranceExamFeeYen: selectedCostSchool?.entranceExamFeeYen ?? 0,
    annualExtraYen: annualExtra * 10000,
    livingMode,
    housing: selectedCostSchool?.housing,
    managementFeeMonthlyYen: housingAssumptions.managementFeeMonthlyYen,
    initialCostMonths: housingAssumptions.initialCostMonths,
    monthlyLivingCostYen: livingMode === 'away' ? monthlyLivingCostMan * 10000 : 20000,
    commutePassSixMonthYen: livingMode === 'home' && Number.isFinite(selectedCommutePass) && selectedCommutePass > 0 ? selectedCommutePass : 0,
    annualScholarshipSupportYen: annualScholarshipSupportMan * 10000,
  });
  const costBar = Math.min(100, Math.max(18, Math.round(fourYearCost.totalCostYen / 100000)));
  const commuteDisplay = (school: School) => {
    const entered = commuteTimes[school.id]?.trim();
    const minutes = entered ? Number(entered) : NaN;
    return Number.isFinite(minutes) && minutes > 0
      ? formatOptional(school.commute, '分')
      : formatCommuteTimeEstimate(school.commuteEstimate);
  };

  const toggleSchool = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 3 ? current : [...current, id]);
  };

  const handleQuizSubmit = () => {
    const filters = preferenceToFilters({ priority: priorityPreference, career: careerPreference });
    setTuitionLimit(filters.tuitionLimit);
    setCommuteLimit(filters.commuteLimit);
    setQuizOpen(false);
    document.querySelector('#search')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetFilters = () => {
    setArea('関東全域');
    setTuitionLimit('650万円以内');
    setCommuteLimit('60分以内');
    setPriorityPreference('cost');
    setCareerPreference('undecided');
  };

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const showCostForSchool = (schoolId: string) => {
    setSelectedCostSchoolId(schoolId);
    scrollTo('#cost');
  };

  return (
    <div className="site-shell">
      <header>
        <div className="wrap nav">
          <a className="brand" href="#top"><span className="logo">看</span>看護進学ナビ <span className="brand-sub">進学情報</span></a>
          <nav className="navlinks" aria-label="メインナビゲーション">
            <a href="#search" onClick={() => setMobileMenuOpen(false)}>学校を探す</a><a href="#compare" onClick={() => setMobileMenuOpen(false)}>比較する</a><a href="#cost" onClick={() => setMobileMenuOpen(false)}>費用を計算</a><a href="#scholarships" onClick={() => setMobileMenuOpen(false)}>支援制度</a>
            <button className="outline" onClick={() => { setQuizOpen(true); setMobileMenuOpen(false); }}>希望条件を整理</button>
          </nav>
          <button className="mobile-menu-button" aria-label={mobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((current) => !current)}>{mobileMenuOpen ? '×' : '☰'}</button>
          {mobileMenuOpen && <div className="mobile-menu"><a href="#search" onClick={() => setMobileMenuOpen(false)}>学校を探す</a><a href="#compare" onClick={() => setMobileMenuOpen(false)}>比較する</a><a href="#cost" onClick={() => setMobileMenuOpen(false)}>費用を計算</a><a href="#scholarships" onClick={() => setMobileMenuOpen(false)}>支援制度</a><button className="primary" onClick={() => { setQuizOpen(true); setMobileMenuOpen(false); }}>希望条件を整理</button></div>}
        </div>
      </header>

      <main id="top">
        <section className="hero"><div className="wrap hero-grid"><div>
          <div className="eyebrow">公式情報をもとにした看護学校比較</div>
          <h1>納得できる進路を、<br /><span>比較できる情報</span>から。</h1>
          <p>学費、通学条件、取得できる資格、国家試験、卒業後の進路。学校ごとに分かれている情報を整理し、同じ画面で比較できます。</p>
          <div className="hero-actions"><button className="primary" onClick={() => document.querySelector('#search')?.scrollIntoView({ behavior: 'smooth' })}>条件から学校を探す</button><button className="outline" onClick={() => setQuizOpen(true)}>希望条件を整理する</button></div>
          <div className="checks"><span className="check">登録せずに利用可能</span><span className="check">数値の出典を表示</span><span className="check">スマートフォン対応</span></div>
        </div><div className="visual"><div className="visual-top"><div className="visual-title">条件に近い学校</div><span className="pill">指定条件 {filteredSchools.length}件</span></div>{schools.slice(0, 2).map((school) => <div className="school-card" key={school.id}><div className="school-head"><div><div className="school-name">{school.name}</div><small className="major">{school.faculty}</small></div><span className="match">{school.category}</span></div><div className="metrics"><div className="metric"><small>4年間学費</small><b>{formatSchoolCost(school)}</b></div><div className="metric"><small>通学時間</small><b>{commuteDisplay(school)}</b></div><div className="metric"><small>国試・3年平均</small><b>{school.passRate}%</b></div></div><div className="source">{school.confidence}　{school.sourceCount}出典　最終確認 {school.lastChecked.replaceAll('-', '.').slice(0, 7)}</div></div>)}</div></div></section>

        <div className="wrap trust"><div className="trust-line"><div className="trust-item"><b>4年間の総額</b><span>初年度だけでなく、実習費や生活費まで</span></div><div className="trust-item"><b>数字の根拠</b><span>年度・定義・出典をすべて表示</span></div><div className="trust-item"><b>親子で比較</b><span>候補を並べて、違いがすぐ分かる</span></div></div></div>

        <section id="search"><div className="wrap"><div className="section-head"><div className="eyebrow">学校検索</div><h2>希望条件に合う学校を探す</h2><p>地域、費用、通学時間などの条件を指定すると、候補がすぐに絞り込まれます。</p></div><div className="searchbox"><div className="filters"><div className="field"><label htmlFor="area">通学エリア</label><select id="area" value={area} onChange={(event) => setArea(event.target.value)}><option>関東全域</option><option>東京都</option><option>神奈川県</option><option>埼玉県</option><option>千葉県</option><option>茨城県</option><option>栃木県</option><option>群馬県</option></select></div><div className="field"><label htmlFor="tuition">4年間学費</label><select id="tuition" value={tuitionLimit} onChange={(event) => setTuitionLimit(event.target.value)}><option>650万円以内</option><option>550万円以内</option><option>700万円以内</option></select></div><div className="field"><label htmlFor="commute">通学時間</label><select id="commute" value={commuteLimit} onChange={(event) => setCommuteLimit(event.target.value)}><option>60分以内</option><option>45分以内</option><option>90分以内</option></select></div><button className="searchbtn" onClick={() => scrollTo('#cards')}>結果を見る（{filteredSchools.length}校）</button></div><div className="active-filter-row"><span><b>適用中：</b>{area}・学費 {tuitionLimit}・通学 {commuteLimit}・{priorityLabels[priorityPreference]}・卒業後 {careerLabels[careerPreference]}</span><button className="reset-button" onClick={resetFilters}>条件をリセット</button></div><div className="result-summary"><b>条件に合う学校 {filteredSchools.length}校</b><small>初回収集：公式情報＋通学時間の概算</small></div><div className="cards" id="cards">{filteredSchools.map((school) => { const selected = selectedIds.includes(school.id); return <article className={`result ${selected ? 'selected' : ''}`} key={school.id}><div className="tagrow"><span className="tag">{school.prefecture}</span>{school.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><h3>{school.name}</h3><div className="major">{school.faculty}</div><div className="cost">{formatSchoolCost(school)} <small>4年間既知費用</small></div><div className="row"><span>看護師国試 3年平均</span><b>{school.passRate}%</b></div><div className="row"><span>卒業後の進路</span><b>{school.careerSummary}</b></div><div className="row"><span>奨学金・支援</span><b>{school.scholarshipSummary === '未収録' ? school.scholarshipSummary : '制度情報あり'}</b></div><div className="row"><span>自宅からの通学</span><b>{commuteDisplay(school)}</b></div><div className="row"><span>未収録項目</span><b>{school.missingFieldLabels.length ? `${school.missingFieldLabels.length}項目` : 'なし'}<br /><small className="info">{school.missingFieldLabels.join('・')}</small></b></div><div className="source">{school.sourceCount}出典・{school.lastChecked.replaceAll('-', '.')}</div><div className="result-actions"><button className="selectbtn" onClick={() => toggleSchool(school.id)}>{selected ? '✓ 比較に追加済み' : '＋ 比較に追加'}</button><button className="secondarybtn" onClick={() => showCostForSchool(school.id)}>この学校の費用を見る</button></div></article>; })}</div>{filteredSchools.length === 0 && <p className="no-results">条件に合う学校がありません。検索条件を広げてみてください。</p>}</div></div></section>

        <section className="dark" id="compare"><div className="wrap"><div className="section-head"><div className="eyebrow">学校比較</div><h2>学校ごとの違いを、同じ基準で比較</h2><p>比較に追加した学校だけを、対象年度や集計条件とあわせて確認できます。</p></div>{selectedSchools.length === 0 ? <p className="no-results">比較する学校がありません。学校検索から候補を追加してください。</p> : <div className="compare-wrap"><table className="compare-table"><thead><tr><th>比較項目</th>{selectedSchools.map((school) => <th key={school.id}>{school.name}</th>)}</tr></thead><tbody><tr><td>4年間の既知費用<br /><span className="info">居住地で変動する場合あり</span></td>{selectedSchools.map((school) => <td className="good" key={school.id}>{formatSchoolCost(school)}</td>)}</tr><tr><td>生活費込み総額</td>{selectedSchools.map((school) => <td key={school.id}>{formatOptional(school.livingTotal, '万円')}</td>)}</tr><tr><td>看護師国試 3年平均<br /><span className="info">大学公表値・対象区分は学校ごとに確認</span></td>{selectedSchools.map((school) => <td className="good" key={school.id}>{school.passRate}%<br /><span className="info">最新 {school.latestPassRate}%・合格者 {school.latestPassCount}/{school.latestExamineeCount}人（{school.examBasis}）</span></td>)}</tr><tr><td>最新の入試結果<br /><span className="info">結果を公表している年度</span></td>{selectedSchools.map((school) => <td key={school.id}>{school.admissionResultSummary}</td>)}</tr><tr><td>大学へのアクセス</td>{selectedSchools.map((school) => <td key={school.id}>{school.accessSummary}</td>)}</tr><tr><td>通学時間</td>{selectedSchools.map((school) => <td key={school.id}>{commuteDisplay(school)}</td>)}</tr><tr><td>取得可能資格</td>{selectedSchools.map((school) => <td key={school.id}>{school.certificates}</td>)}</tr><tr><td>卒業後の進路</td>{selectedSchools.map((school) => <td key={school.id}>{school.careerSummary}</td>)}</tr><tr><td>奨学金・支援</td>{selectedSchools.map((school) => <td key={school.id}>{school.scholarshipSummary}</td>)}</tr><tr><td>主な実習先・実習メモ</td>{selectedSchools.map((school) => <td key={school.id}>{school.practiceSummary}</td>)}</tr><tr><td>情報の信頼度</td>{selectedSchools.map((school) => <td className={school.confidence.startsWith('A') ? 'good' : ''} key={school.id}>{school.confidence}<br /><span className="info">未収録 {school.missingFields.length}項目・出典{school.sourceCount}件</span></td>)}</tr></tbody></table></div>}</div></section>

        <section id="cost"><div className="wrap"><div className="section-head"><div className="eyebrow">費用シミュレーション</div><h2>卒業までに必要な実負担を試算</h2><p>学校納付金だけでなく、受験料・教材・住居・生活・通学まで含めて4年間の総額を試算します。</p></div><div className="sim-grid"><div className="panel"><h3>条件を調整</h3><div className="field"><label htmlFor="cost-school">学校</label><select id="cost-school" value={selectedCostSchoolId} onChange={(event) => setSelectedCostSchoolId(event.target.value)}>{sourceSchools.map((school) => <option value={school.id} key={school.id}>{school.name}</option>)}</select></div><div className="range-line"><label htmlFor="annual-extra"><span>年間の教材・実習費</span><b>{annualExtra}万円</b></label><input id="annual-extra" type="range" min="0" max="60" value={annualExtra} onChange={(event) => setAnnualExtra(Number(event.target.value))} /></div><p className="info simulator-note">選択校の公開情報・公開校の金額をもとにした初期目安は年{selectedAnnualExtraEstimateMan}万円。未収録分を含む概算なので、必要に応じて調整してください。</p><label className="living-label">生活スタイル</label><div className="toggle"><button className={livingMode === 'home' ? 'active' : ''} onClick={() => setLivingMode('home')}>自宅から通う</button><button className={livingMode === 'away' ? 'active' : ''} onClick={() => setLivingMode('away')}>一人暮らし</button></div>{livingMode === 'away' && <div className="range-line"><label htmlFor="monthly-living"><span>月の生活費（食費・光熱費等）</span><b>{monthlyLivingCostMan}万円</b></label><input id="monthly-living" type="range" min="5" max="15" value={monthlyLivingCostMan} onChange={(event) => setMonthlyLivingCostMan(Number(event.target.value))} /></div>}<p className="info simulator-note">学校費用は表示中の「4年間既知費用」の上限側を使用。定期代を入力すると6か月分×8回を加算します。</p><a className="support-jump" href="#scholarships">返済不要の支援を入力・確認する →</a></div><div className="panel"><small className="muted-label">{selectedCostSchool?.name}・4年間の実負担目安</small><div className="big-number">{formatYen(fourYearCost.totalCostYen / 10000)}</div><div className="cost-status">支援反映後の目安</div><div className="bar"><span style={{ width: `${costBar}%` }} /></div><div className="breakdown"><div><small>学校納付金（既知）</small><b>{formatYen(fourYearCost.schoolCostYen / 10000)}</b></div><div><small>受験料（1校分）</small><b>{formatYen(fourYearCost.entranceExamFeeYen / 10000)}</b></div><div><small>教材・実習等</small><b>{formatYen(fourYearCost.annualExtraCostYen / 10000)}</b></div><div><small>住居費</small><b>{formatYen(fourYearCost.housingCostYen / 10000)}</b></div><div><small>生活費</small><b>{formatYen(fourYearCost.livingCostYen / 10000)}</b></div><div><small>通学定期</small><b>{formatYen(fourYearCost.commutePassCostYen / 10000)}</b></div><div className="breakdown-support"><small>給付・減免</small><b>−{formatYen(fourYearCost.scholarshipSupportYen / 10000)}</b></div></div>{livingMode === 'away' && selectedCostSchool?.housing && <p className="info simulator-note">家賃目安：月{formatYen(selectedCostSchool.housing.rentMonthlyYen / 10000)}（{selectedCostSchool.housing.estimateLabel}）。管理費月0.5万円、契約初期費用は家賃5か月分で仮置きしています。<br /><a href={selectedCostSchool.housing.sourceUrl} target="_blank" rel="noreferrer">相場の出典：{selectedCostSchool.housing.sourceTitle} ↗</a></p>}{livingMode === 'home' && <p className="info simulator-note">自宅通学は生活費を月2万円で仮置き。住居費は0円、定期代は入力した学生6か月定期×8回で計算しています。</p>}<p className="info simulator-note">「既知」以外は概算または入力値です。住居費は公式な学校情報ではなく、周辺の相場・掲載例による推定です。調査日：2026.08.27</p></div></div></div></section>

        <section><div className="wrap"><div className="section-head"><div className="eyebrow">情報掲載方針</div><h2>判断に必要な情報を、分かりやすく。</h2><p>特定の学校を一律に評価するのではなく、進路を検討するための客観的な情報を整理して提供します。</p></div><div className="principles"><div className="principle"><div className="icon">✓</div><h3>広告と順位を分離</h3><p>学校からの広告掲載があっても、検索順位や比較評価には反映しません。</p></div><div className="principle"><div className="icon">↻</div><h3>年度と更新日を表示</h3><p>すべての主要数値に対象年度、取得日、データの定義を記載します。</p></div><div className="principle"><div className="icon">i</div><h3>欠けている情報も示す</h3><p>推定値や未確認情報を、確定データのように見せない設計を徹底します。</p></div></div></div></section>
        <section id="data-details"><div className="wrap"><div className="section-head"><div className="eyebrow">費用の内訳</div><h2>初期費用と教材・実習費も確認</h2><p>4年間の既知費用とは別に、出願時の検定料、教材・実習関連費、その他の初年度費用を表示しています。</p></div><div className="compare-wrap"><table className="compare-table"><thead><tr><th>費用項目</th>{schools.map((school) => <th key={school.id}>{school.name}</th>)}</tr></thead><tbody><tr><td>入試検定料</td>{schools.map((school) => <td key={school.id}>{school.entranceExamFeeLabel}</td>)}</tr><tr><td>教材・実習費</td>{schools.map((school) => <td key={school.id}>{school.materialsCostLabel}</td>)}</tr><tr><td>その他の初年度費用</td>{schools.map((school) => <td key={school.id}>{school.otherInitialCostLabel}</td>)}</tr><tr><td>金額未収録の追加費用メモ</td>{schools.map((school) => <td key={school.id}>{school.additionalCostNote}</td>)}</tr></tbody></table></div></div></section>
        <section id="scholarships"><div className="wrap"><div className="section-head"><div className="eyebrow">奨学金・授業料支援</div><h2>支援を得た場合の実負担も試算</h2><p>返済不要の給付や授業料減免を入力すると、4年間の総額から差し引けます。貸与型は将来返すため、支援情報として表示しますが総額からは自動で引きません。</p></div><div className="support-panel"><div className="field"><label htmlFor="scholarship-support">返済不要の支援・授業料減免（年間）</label><input id="scholarship-support" type="number" min="0" max="200" step="0.1" inputMode="decimal" value={annualScholarshipSupportMan} onChange={(event) => setAnnualScholarshipSupportMan(Number(event.target.value))} /><small>採用された給付・減免の年間実額を入力。4年間分を総額から差し引きます。</small></div><div className="support-result"><span>現在の試算への反映額</span><b>−{formatYen(fourYearCost.scholarshipSupportYen / 10000)}</b><small>支援反映後：{formatYen(fourYearCost.totalCostYen / 10000)}</small></div></div><div className="aid-steps"><h3>奨学金・減免を得るまでの一般的な流れ</h3><ol><li>家計、学業成績、居住地、卒業後の勤務条件など対象要件を確認する。</li><li>入学前は高校・大学の予約採用や入試要項、入学後は大学の学生支援窓口で募集時期を確認する。</li><li>申請書、家計資料、在学・進学に関する書類を学内締切までに提出する。</li><li>採用後は在籍・成績などの継続要件と、貸与型の返還・勤務条件を確認する。</li></ol><p className="info">制度・年度・世帯状況で条件が変わるため、最終的な採否や金額は各制度の募集要項で確認してください。</p></div><div className="aid-grid">{schools.map((school) => <article className="aid-card" key={school.id}><h3>{school.name}</h3><p>{school.scholarshipSummary}</p>{school.scholarshipPrograms.length > 0 && <div className="aid-programs">{school.scholarshipPrograms.map((program) => <ScholarshipProgramCard key={program.name} program={program} />)}</div>}<small className="info">申請先の目安：大学の学生支援窓口・各制度の募集要項</small></article>)}</div></div></section>

        <section id="admissions-details"><div className="wrap"><div className="section-head"><div className="eyebrow">入試情報</div><h2>募集枠の違いも確認</h2><p>2027年度の公式募集人員を、学校ごとの選抜区分で整理しています。若干名は公式表記のままです。</p></div><div className="compare-wrap"><table className="compare-table"><thead><tr><th>2027年度募集枠</th>{schools.map((school) => <th key={school.id}>{school.name}</th>)}</tr></thead><tbody><tr><td>選抜区分別</td>{schools.map((school) => <td key={school.id}>{school.admissionSummary}</td>)}</tr></tbody></table></div></div></section>
        <section id="sources"><div className="wrap"><div className="section-head"><div className="eyebrow">出典</div><h2>数字の根拠を確認する</h2><p>学校ごとに確認した公式ページ・公式PDFを一覧で確認できます。</p></div><div className="source-grid">{schools.map((school) => <details key={school.id}><summary>{school.name}（{school.sourceCount}件）</summary><ul>{school.sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></li>)}</ul></details>)}</div></div></section>
        <CommutePassFinder
          schools={sourceSchools}
          homeStationId={homeStationId}
          setHomeStationId={setHomeStationId}
          commutePassCosts={commutePassCosts}
          setCommutePassCosts={setCommutePassCosts}
          commuteTimes={commuteTimes}
          setCommuteTimes={setCommuteTimes}
        />
      </main>

      <footer><div className="wrap"><div className="footer-grid"><div><div className="brand footer-brand"><span className="logo">看</span>看護進学ナビ</div><p>数字と根拠から、納得できる進路選びを支える比較サービス。</p></div><div><b>このサイトについて</b><p>{datasetMeta.schoolCount}校の公式情報を初回接続しています。未収録項目は確定情報のように表示せず、順次追加します。</p></div></div><div className="disclaimer">© 2026 看護進学ナビ。初回データ最終確認：{datasetMeta.collectedAt.replaceAll('-', '.')}。</div></div></footer>

      <div className={`comparebar ${selectedSchools.length === 0 ? 'hidden' : ''}`}><div><b>{selectedSchools.length}校を比較中</b> <small>{selectedSchools.map((school) => school.name).join('・')}</small></div><button onClick={() => document.querySelector('#compare')?.scrollIntoView({ behavior: 'smooth' })}>比較表を見る →</button></div>

      {quizOpen && <div className="modal open" role="dialog" aria-modal="true" aria-labelledby="quiz-title" onClick={() => setQuizOpen(false)}><div className="modal-card" onClick={(event) => event.stopPropagation()}><button className="close" onClick={() => setQuizOpen(false)} aria-label="閉じる">×</button><div className="eyebrow">希望条件の整理</div><h2 id="quiz-title">進路選びで重視する条件</h2><p className="quiz-intro">選んだ内容を学校検索の条件に反映します。あとから検索画面で変更できます。</p><div className="q"><label>一番譲れないことは？</label><div className="choice"><button className={priorityPreference === 'cost' ? 'selected' : ''} aria-pressed={priorityPreference === 'cost'} onClick={() => setPriorityPreference('cost')}>学費を抑えたい</button><button className={priorityPreference === 'qualification' ? 'selected' : ''} aria-pressed={priorityPreference === 'qualification'} onClick={() => setPriorityPreference('qualification')}>資格実績を重視</button><button className={priorityPreference === 'commute' ? 'selected' : ''} aria-pressed={priorityPreference === 'commute'} onClick={() => setPriorityPreference('commute')}>通いやすさ</button><button className={priorityPreference === 'content' ? 'selected' : ''} aria-pressed={priorityPreference === 'content'} onClick={() => setPriorityPreference('content')}>学べる内容</button></div></div><div className="q"><label>卒業後のイメージは？</label><div className="choice"><button className={careerPreference === 'hospital' ? 'selected' : ''} aria-pressed={careerPreference === 'hospital'} onClick={() => setCareerPreference('hospital')}>大きな病院</button><button className={careerPreference === 'community' ? 'selected' : ''} aria-pressed={careerPreference === 'community'} onClick={() => setCareerPreference('community')}>地域医療</button><button className={careerPreference === 'undecided' ? 'selected' : ''} aria-pressed={careerPreference === 'undecided'} onClick={() => setCareerPreference('undecided')}>まだ決めていない</button></div></div><button className="modal-action" onClick={handleQuizSubmit}>この条件で学校を探す →</button></div></div>}
    </div>
  );
}
