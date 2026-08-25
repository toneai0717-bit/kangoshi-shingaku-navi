'use client';

import { useMemo, useState } from 'react';

type LivingMode = 'home' | 'away';

type School = {
  id: string;
  name: string;
  faculty: string;
  prefecture: '東京都' | '神奈川県';
  tags: string[];
  tuition: number;
  livingTotal: number;
  commute: number;
  passRate: number;
  passCount: number;
  employment: number;
  certificates: string;
  confidence: string;
};

const schools: School[] = [
  {
    id: 'aoba', name: '青葉看護大学', faculty: '看護学部 看護学科', prefecture: '東京都', tags: ['奨学金あり'],
    tuition: 624, livingTotal: 812, commute: 42, passRate: 96.8, passCount: 186, employment: 72, certificates: '看護師・保健師', confidence: 'A 公式構造化',
  },
  {
    id: 'mirai', name: 'みらい医療大学', faculty: '医療保健学部 看護学科', prefecture: '神奈川県', tags: ['駅徒歩8分'],
    tuition: 578, livingTotal: 766, commute: 58, passRate: 95.1, passCount: 214, employment: 81, certificates: '看護師・助産師', confidence: 'A 公式構造化',
  },
  {
    id: 'bay', name: '都立湾岸大学', faculty: '健康科学部 看護学科', prefecture: '東京都', tags: ['公立'],
    tuition: 243, livingTotal: 431, commute: 73, passRate: 97.4, passCount: 152, employment: 67, certificates: '看護師・保健師', confidence: 'B 公式PDF',
  },
];

const formatYen = (man: number) => `${man.toLocaleString('ja-JP')}万円`;

export default function Home() {
  const [area, setArea] = useState('東京都・神奈川県');
  const [tuitionLimit, setTuitionLimit] = useState('650万円以内');
  const [commuteLimit, setCommuteLimit] = useState('60分以内');
  const [selectedIds, setSelectedIds] = useState<string[]>(['aoba', 'mirai']);
  const [searching, setSearching] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizSent, setQuizSent] = useState(false);
  const [livingMode, setLivingMode] = useState<LivingMode>('home');
  const [annualTuition, setAnnualTuition] = useState(145);
  const [annualExtra, setAnnualExtra] = useState(18);

  const filteredSchools = useMemo(() => schools.filter((school) => {
    const inArea = area === '東京都・神奈川県' || school.prefecture === area;
    const maxTuition = Number(tuitionLimit.replace(/[^0-9]/g, ''));
    const maxCommute = Number(commuteLimit.replace(/[^0-9]/g, ''));
    return inArea && school.tuition <= maxTuition && school.commute <= maxCommute;
  }), [area, commuteLimit, tuitionLimit]);

  const selectedSchools = selectedIds.map((id) => schools.find((school) => school.id === id)).filter((school): school is School => Boolean(school));
  const livingCost = livingMode === 'away' ? 400 : 100;
  const totalCost = annualTuition * 4 + annualExtra * 4 + livingCost;
  const costBar = Math.min(100, Math.max(18, Math.round(totalCost / 10)));

  const toggleSchool = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 3 ? current : [...current, id]);
  };

  const handleSearch = () => {
    setSearching(true);
    window.setTimeout(() => setSearching(false), 550);
  };

  const handleQuizSubmit = () => {
    setQuizSent(true);
    window.setTimeout(() => {
      setQuizOpen(false);
      setQuizSent(false);
      document.querySelector('#search')?.scrollIntoView({ behavior: 'smooth' });
    }, 750);
  };

  return (
    <div className="site-shell">
      <header>
        <div className="wrap nav">
          <a className="brand" href="#top"><span className="logo">看</span>看護進学ナビ <span className="brand-sub">進学情報</span></a>
          <nav className="navlinks" aria-label="メインナビゲーション">
            <a href="#search">学校を探す</a><a href="#compare">比較する</a><a href="#cost">費用を計算</a>
            <button className="outline" onClick={() => setQuizOpen(true)}>希望条件を整理</button>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero"><div className="wrap hero-grid"><div>
          <div className="eyebrow">公式情報をもとにした看護学校比較</div>
          <h1>納得できる進路を、<br /><span>比較できる情報</span>から。</h1>
          <p>学費、通学条件、取得できる資格、国家試験、卒業後の進路。学校ごとに分かれている情報を整理し、同じ画面で比較できます。</p>
          <div className="hero-actions"><button className="primary" onClick={() => document.querySelector('#search')?.scrollIntoView({ behavior: 'smooth' })}>条件から学校を探す</button><button className="outline" onClick={() => setQuizOpen(true)}>希望条件を整理する</button></div>
          <div className="checks"><span className="check">登録せずに利用可能</span><span className="check">数値の出典を表示</span><span className="check">スマートフォン対応</span></div>
        </div><div className="visual"><div className="visual-top"><div className="visual-title">条件に近い学校</div><span className="pill">指定条件 {filteredSchools.length}件</span></div>{schools.slice(0, 2).map((school, index) => <div className="school-card" key={school.id}><div className="school-head"><div><div className="school-name">{school.name}</div><small className="major">{school.faculty}</small></div><span className="match">条件一致 {index === 0 ? '5/6' : '4/6'}</span></div><div className="metrics"><div className="metric"><small>4年間学費</small><b>{formatYen(school.tuition)}</b></div><div className="metric"><small>通学時間</small><b>{school.commute}分</b></div><div className="metric"><small>国試・3年</small><b>{school.passRate}%</b></div></div><div className="source">公式情報 A　最終確認 2026.08</div></div>)}</div></div></section>

        <div className="wrap trust"><div className="trust-line"><div className="trust-item"><b>4年間の総額</b><span>初年度だけでなく、実習費や生活費まで</span></div><div className="trust-item"><b>数字の根拠</b><span>年度・定義・出典をすべて表示</span></div><div className="trust-item"><b>親子で比較</b><span>候補を並べて、違いがすぐ分かる</span></div></div></div>

        <section id="search"><div className="wrap"><div className="section-head"><div className="eyebrow">学校検索</div><h2>希望条件に合う学校を探す</h2><p>地域、費用、通学時間などの条件を指定し、候補となる学校を絞り込めます。</p></div><div className="searchbox"><div className="filters"><div className="field"><label htmlFor="area">通学エリア</label><select id="area" value={area} onChange={(event) => setArea(event.target.value)}><option>東京都・神奈川県</option><option>東京都</option><option>神奈川県</option></select></div><div className="field"><label htmlFor="tuition">4年間学費</label><select id="tuition" value={tuitionLimit} onChange={(event) => setTuitionLimit(event.target.value)}><option>650万円以内</option><option>550万円以内</option><option>700万円以内</option></select></div><div className="field"><label htmlFor="commute">通学時間</label><select id="commute" value={commuteLimit} onChange={(event) => setCommuteLimit(event.target.value)}><option>60分以内</option><option>45分以内</option><option>90分以内</option></select></div><button className="searchbtn" onClick={handleSearch}>{searching ? '検索中...' : `${filteredSchools.length}校を表示`}</button></div><div className="result-summary"><b>条件に合う学校 {filteredSchools.length}校</b><small>費用が低い順　↕</small></div><div className="cards" id="cards">{filteredSchools.map((school) => { const selected = selectedIds.includes(school.id); return <article className={`result ${selected ? 'selected' : ''}`} key={school.id}><div className="tagrow"><span className="tag">{school.prefecture}</span>{school.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><h3>{school.name}</h3><div className="major">{school.faculty}</div><div className="cost">{formatYen(school.tuition)} <small>4年間推定</small></div><div className="row"><span>看護師国試 3年平均</span><b>{school.passRate}%</b></div><div className="row"><span>自宅からの通学</span><b>{school.commute}分</b></div><div className="row"><span>一般病院への就職</span><b>{school.employment}%</b></div><button className="selectbtn" onClick={() => toggleSchool(school.id)}>{selected ? '✓ 比較に追加済み' : '＋ 比較に追加'}</button></article>; })}</div>{filteredSchools.length === 0 && <p className="no-results">条件に合う学校がありません。検索条件を広げてみてください。</p>}</div></div></section>

        <section className="dark" id="compare"><div className="wrap"><div className="section-head"><div className="eyebrow">学校比較</div><h2>学校ごとの違いを、同じ基準で比較</h2><p>数値だけでなく、対象年度や集計条件もあわせて確認できます。</p></div><div className="compare-wrap"><table className="compare-table"><thead><tr><th>比較項目</th>{schools.map((school) => <th key={school.id}>{school.name}</th>)}</tr></thead><tbody><tr><td>4年間推定学費</td>{schools.map((school) => <td className={school.id === 'bay' ? 'good' : ''} key={school.id}>{formatYen(school.tuition)}</td>)}</tr><tr><td>生活費込み総額</td>{schools.map((school) => <td className={school.id === 'bay' ? 'good' : ''} key={school.id}>{formatYen(school.livingTotal)}</td>)}</tr><tr><td>看護師国試 3年平均<br /><span className="info">新卒・受験者ベース</span></td>{schools.map((school) => <td className={school.id === 'bay' ? 'good' : ''} key={school.id}>{school.passRate}%（{school.passCount}人）</td>)}</tr><tr><td>通学時間</td>{schools.map((school) => <td className={school.id === 'aoba' ? 'good' : ''} key={school.id}>{school.commute}分</td>)}</tr><tr><td>取得可能資格</td>{schools.map((school) => <td key={school.id}>{school.certificates}</td>)}</tr><tr><td>情報の信頼度</td>{schools.map((school) => <td className={school.confidence.startsWith('A') ? 'good' : ''} key={school.id}>{school.confidence}</td>)}</tr></tbody></table></div></div></section>

        <section id="cost"><div className="wrap"><div className="section-head"><div className="eyebrow">費用シミュレーション</div><h2>卒業までに必要な費用を試算</h2><p>学費だけではなく、通学・住居・奨学金を含めた、卒業までのお金を試算します。</p></div><div className="sim-grid"><div className="panel"><h3>条件を調整</h3><div className="range-line"><label htmlFor="annual-tuition"><span>年間学費</span><b>{annualTuition}万円</b></label><input id="annual-tuition" type="range" min="50" max="220" value={annualTuition} onChange={(event) => setAnnualTuition(Number(event.target.value))} /></div><div className="range-line"><label htmlFor="annual-extra"><span>年間の教材・実習費</span><b>{annualExtra}万円</b></label><input id="annual-extra" type="range" min="0" max="60" value={annualExtra} onChange={(event) => setAnnualExtra(Number(event.target.value))} /></div><label className="living-label">生活スタイル</label><div className="toggle"><button className={livingMode === 'home' ? 'active' : ''} onClick={() => setLivingMode('home')}>自宅から通う</button><button className={livingMode === 'away' ? 'active' : ''} onClick={() => setLivingMode('away')}>一人暮らし</button></div></div><div className="panel"><small className="muted-label">4年間の推定総額</small><div className="big-number">{formatYen(totalCost)}</div><div className="bar"><span style={{ width: `${costBar}%` }} /></div><div className="breakdown"><div><small>学費</small><b>{formatYen(annualTuition * 4)}</b></div><div><small>教材・実習</small><b>{formatYen(annualExtra * 4)}</b></div><div><small>通学・生活</small><b>{formatYen(livingCost)}</b></div></div><p className="info simulator-note">これは概算です。学校の公式情報、年度別納付金、住居条件を確認してください。</p></div></div></div></section>

        <section><div className="wrap"><div className="section-head"><div className="eyebrow">情報掲載方針</div><h2>判断に必要な情報を、分かりやすく。</h2><p>特定の学校を一律に評価するのではなく、進路を検討するための客観的な情報を整理して提供します。</p></div><div className="principles"><div className="principle"><div className="icon">✓</div><h3>広告と順位を分離</h3><p>学校からの広告掲載があっても、検索順位や比較評価には反映しません。</p></div><div className="principle"><div className="icon">↻</div><h3>年度と更新日を表示</h3><p>すべての主要数値に対象年度、取得日、データの定義を記載します。</p></div><div className="principle"><div className="icon">i</div><h3>欠けている情報も示す</h3><p>推定値や未確認情報を、確定データのように見せない設計を徹底します。</p></div></div></div></section>
      </main>

      <footer><div className="wrap"><div className="footer-grid"><div><div className="brand footer-brand"><span className="logo">看</span>看護進学ナビ</div><p>数字と根拠から、納得できる進路選びを支える比較サービス。</p></div><div><b>このサイトについて</b><p>掲載されている学校名・数値は、UI確認用の架空データです。実在の学校・団体とは関係ありません。</p></div></div><div className="disclaimer">© 2026 看護進学ナビ。学校情報は公式情報をもとに整備します。</div></div></footer>

      <div className={`comparebar ${selectedSchools.length === 0 ? 'hidden' : ''}`}><div><b>{selectedSchools.length}校を比較中</b> <small>{selectedSchools.map((school) => school.name).join('・')}</small></div><button onClick={() => document.querySelector('#compare')?.scrollIntoView({ behavior: 'smooth' })}>比較表を見る →</button></div>

      {quizOpen && <div className="modal open" role="dialog" aria-modal="true" aria-labelledby="quiz-title" onClick={() => setQuizOpen(false)}><div className="modal-card" onClick={(event) => event.stopPropagation()}><button className="close" onClick={() => setQuizOpen(false)} aria-label="閉じる">×</button><div className="eyebrow">希望条件の整理</div><h2 id="quiz-title">進路選びで重視する条件</h2><p className="quiz-intro">現在の希望に近い項目を選択してください。</p><div className="q"><label>一番譲れないことは？</label><div className="choice"><button>学費を抑えたい</button><button>資格実績を重視</button><button>通いやすさ</button><button>学べる内容</button></div></div><div className="q"><label>卒業後のイメージは？</label><div className="choice"><button>大きな病院</button><button>地域医療</button><button>まだ決めていない</button><button>大学院・研究</button></div></div><button className="modal-action" onClick={handleQuizSubmit}>{quizSent ? '希望条件に近い学校を表示します' : '条件に合う学校を見る'}</button></div></div>}
    </div>
  );
}
