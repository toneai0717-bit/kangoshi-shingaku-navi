'use client';

import { useMemo, useState } from 'react';

type SchoolKind = '大学' | '専門学校';
type LivingMode = 'home' | 'alone';
type School = {
  id: string; name: string; shortName: string; prefecture: '東京都' | '神奈川県'; kind: SchoolKind;
  station: string; tuition: number; commute: string; passRate: number; capacity: number;
  applicantRatio: string; highlight: string; accent: 'navy' | 'coral' | 'sage';
};

const schools: School[] = [
  { id: 'seaside', name: '東京シーサイド看護大学', shortName: 'シーサイド看護大', prefecture: '東京都', kind: '大学', station: '台場駅から徒歩8分', tuition: 5820000, commute: '品川から約24分', passRate: 96.4, capacity: 80, applicantRatio: '3.2倍', highlight: '地域医療と在宅看護に強い', accent: 'navy' },
  { id: 'musashino', name: '武蔵野メディカル大学 看護学部', shortName: '武蔵野メディカル大', prefecture: '東京都', kind: '大学', station: '吉祥寺駅からバス12分', tuition: 6180000, commute: '新宿から約35分', passRate: 98.1, capacity: 100, applicantRatio: '4.0倍', highlight: '附属病院での実習機会が豊富', accent: 'coral' },
  { id: 'kanagawa', name: 'かながわ県立保健医療大学', shortName: 'かながわ県立大', prefecture: '神奈川県', kind: '大学', station: '横須賀中央駅から徒歩15分', tuition: 2640000, commute: '横浜から約42分', passRate: 100, capacity: 90, applicantRatio: '2.8倍', highlight: '公立ならではの学費と地域連携', accent: 'sage' },
  { id: 'yokohama', name: '横浜みなと看護専門学校', shortName: '横浜みなと看護', prefecture: '神奈川県', kind: '専門学校', station: '関内駅から徒歩6分', tuition: 2980000, commute: '横浜駅から約10分', passRate: 97.2, capacity: 40, applicantRatio: '2.1倍', highlight: '3年間で現場力を集中して学ぶ', accent: 'coral' },
  { id: 'setagaya', name: '世田谷医療看護専門学校', shortName: '世田谷医療看護', prefecture: '東京都', kind: '専門学校', station: '千歳船橋駅から徒歩10分', tuition: 3240000, commute: '渋谷から約26分', passRate: 95.8, capacity: 80, applicantRatio: '1.9倍', highlight: '少人数制と社会人入試に対応', accent: 'sage' },
  { id: 'kawasaki', name: '川崎市立看護大学', shortName: '川崎市立看護大', prefecture: '神奈川県', kind: '大学', station: '川崎駅からバス10分', tuition: 2720000, commute: '品川から約25分', passRate: 99.1, capacity: 100, applicantRatio: '3.6倍', highlight: '市立病院・地域との連携が近い', accent: 'navy' },
];

const yen = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 });
const formatYen = (value: number) => yen.format(value).replace('￥', '¥');
const formatCompactYen = (value: number) => `${Math.round(value / 10000).toLocaleString('ja-JP')}万円`;

function IconMark() { return <span className="brand-mark" aria-hidden="true">＋</span>; }

export default function Home() {
  const [query, setQuery] = useState('');
  const [prefecture, setPrefecture] = useState('すべて');
  const [kind, setKind] = useState('すべて');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [livingMode, setLivingMode] = useState<LivingMode>('home');

  const filteredSchools = useMemo(() => schools.filter((school) => {
    const matchesQuery = [school.name, school.shortName, school.station, school.highlight].join(' ').toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (prefecture === 'すべて' || school.prefecture === prefecture) && (kind === 'すべて' || school.kind === kind);
  }), [kind, prefecture, query]);
  const selectedSchools = selectedIds.map((id) => schools.find((school) => school.id === id)).filter((school): school is School => Boolean(school));
  const toggleSchool = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 3 ? current : [...current, id]);
  const livingCost = livingMode === 'alone' ? 1020000 : 180000;
  const averageTuition = selectedSchools.length ? Math.round(selectedSchools.reduce((sum, school) => sum + school.tuition, 0) / selectedSchools.length) : 0;
  const comparisonCost = averageTuition ? averageTuition + livingCost * 4 : 0;

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="看護進学ナビ トップ"><IconMark /><span><strong>看護進学ナビ</strong><small>学校選びを、数字で見える化。</small></span></a>
        <nav className="header-nav" aria-label="メインナビゲーション"><a href="#schools">学校を探す</a><a href="#compare">比較する{selectedSchools.length > 0 && <em>{selectedSchools.length}</em>}</a><a href="#about">このサイトについて</a></nav>
        <a className="header-link" href="#schools">条件から探す <span>↗</span></a>
      </header>

      <div id="top" className="hero-wrap">
        <section className="hero-copy"><p className="eyebrow"><span />看護師を目指す人のための学校比較</p><h1>あなたの「通いたい」が、<br /><span>数字で見えてくる。</span></h1><p className="hero-lead">学費、通学、入試、国家試験。学校案内だけでは比べにくい情報を、同じ基準で並べました。</p><div className="hero-proof"><div><strong>6</strong><span>掲載校<br />デモ</span></div><div><strong>3</strong><span>校まで<br />比較</span></div><div><strong>4年</strong><span>の費用を<br />シミュレーション</span></div></div></section>
        <section className="finder-panel" aria-labelledby="finder-title"><div className="panel-kicker">FIND YOUR SCHOOL</div><h2 id="finder-title">条件から学校を探す</h2><p>気になる条件をひとつ選ぶだけでも大丈夫。</p><label className="search-field"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="学校名・駅名・特徴で検索" aria-label="学校名・駅名・特徴で検索" /></label><div className="filter-row"><label><span>エリア</span><select value={prefecture} onChange={(event) => setPrefecture(event.target.value)}><option>すべて</option><option>東京都</option><option>神奈川県</option></select></label><label><span>学校種別</span><select value={kind} onChange={(event) => setKind(event.target.value)}><option>すべて</option><option>大学</option><option>専門学校</option></select></label></div><a className="panel-action" href="#schools">学校一覧を見る <span>↓</span></a></section>
      </div>

      <section className="section-block school-section" id="schools"><div className="section-heading"><div><p className="eyebrow"><span />SCHOOLS</p><h2>学校を比べてみる</h2></div><p className="result-count"><strong>{filteredSchools.length}</strong>校 <span>条件に一致</span></p></div><div className="school-grid">{filteredSchools.map((school) => { const isSelected = selectedIds.includes(school.id); return <article className={`school-card accent-${school.accent} ${isSelected ? 'is-selected' : ''}`} key={school.id}><div className="school-card-top"><span className="school-kind">{school.prefecture} / {school.kind}</span><button className={`compare-toggle ${isSelected ? 'is-active' : ''}`} onClick={() => toggleSchool(school.id)} aria-pressed={isSelected} aria-label={`${school.name}を比較${isSelected ? 'から外す' : 'に追加'}`}>{isSelected ? '✓ 比較中' : '+ 比較する'}</button></div><div className="school-identity"><div className="school-emblem">{school.shortName.slice(0, 1)}</div><div><h3>{school.name}</h3><p>{school.highlight}</p></div></div><div className="school-stats"><div><span>4年間の学費</span><strong>{formatCompactYen(school.tuition)}</strong></div><div><span>国試合格率</span><strong>{school.passRate}%</strong></div></div><div className="school-meta"><span>⌖ {school.station}</span><span>入試倍率 {school.applicantRatio}</span></div><button className="text-link" onClick={() => toggleSchool(school.id)}>{isSelected ? '比較から外す' : '比較に追加する'} <span>→</span></button></article>; })}</div>{filteredSchools.length === 0 && <div className="empty-state"><strong>条件に合う学校が見つかりませんでした。</strong><button onClick={() => { setQuery(''); setPrefecture('すべて'); setKind('すべて'); }}>条件をリセットする</button></div>}<p className="demo-note">※現在は画面確認用のデモデータです。本番公開時は各校の公式情報・年度・出典を表示します。</p></section>

      <section className="section-block comparison-section" id="compare"><div className="section-heading comparison-heading"><div><p className="eyebrow"><span />COMPARE</p><h2>選んだ学校を、<br className="mobile-only" />同じものさしで見る。</h2></div><p className="section-intro">学校の違いは、良し悪しではなく相性。<br />まずは気になる学校を2〜3校選んでみてください。</p></div>{selectedSchools.length === 0 ? <div className="comparison-empty"><div className="empty-symbol">＋</div><div><strong>比較する学校を選んでください</strong><p>学校カードの「比較に追加する」から選べます。</p></div><a className="button button-dark" href="#schools">学校を探す</a></div> : <div className="comparison-table-wrap"><div className="comparison-table" role="table" aria-label="学校比較表"><div className="table-row table-head" role="row"><div role="columnheader">比較項目</div>{selectedSchools.map((school) => <div role="columnheader" key={school.id}><span>{school.kind}</span><strong>{school.shortName}</strong></div>)}</div>{[['4年間の学費', ...selectedSchools.map((school) => formatCompactYen(school.tuition))], ['修業年限', ...selectedSchools.map((school) => school.kind === '大学' ? '4年' : '3年')], ['国家試験合格率', ...selectedSchools.map((school) => `${school.passRate}%`)], ['1学年定員', ...selectedSchools.map((school) => `${school.capacity}人`)], ['入試倍率', ...selectedSchools.map((school) => school.applicantRatio)], ['最寄り駅', ...selectedSchools.map((school) => school.station.replace('から徒歩', ' 徒歩'))]].map(([label, ...values]) => <div className="table-row" role="row" key={label}><div role="rowheader">{label}</div>{values.map((value, index) => <div role="cell" key={`${label}-${index}`}>{value}</div>)}</div>)}</div><p className="table-footnote">※国家試験合格率は学校ごとの受験者数を確認して比較してください。数値はデモデータです。</p></div>}</section>

      <section className="section-block simulator-section" id="simulator"><div className="simulator-copy"><p className="eyebrow"><span />COST SIMULATOR</p><h2>学費だけじゃない、<br /><em>通うためのお金</em>も考える。</h2><p>一人暮らしか、実家から通うか。進学後の生活まで含めて、4年間にかかる費用の目安を見てみましょう。</p><div className="living-switch" role="group" aria-label="住まいの選択"><button className={livingMode === 'home' ? 'is-active' : ''} onClick={() => setLivingMode('home')}>実家から通う</button><button className={livingMode === 'alone' ? 'is-active' : ''} onClick={() => setLivingMode('alone')}>一人暮らし</button></div></div><div className="simulator-result"><div className="simulator-label">{selectedSchools.length ? '選択校の平均 + 生活費' : '学校を選ぶと表示されます'}</div><div className="simulator-number">{comparisonCost ? formatYen(comparisonCost) : '—'}</div><p>4年間の費用目安</p>{selectedSchools.length > 0 && <div className="cost-breakdown"><span>学費平均 <b>{formatCompactYen(averageTuition)}</b></span><span>生活費 <b>{formatCompactYen(livingCost * 4)}</b></span></div>}</div></section>

      <section className="trust-section" id="about"><div className="trust-icon">◎</div><div><p className="eyebrow">OUR PROMISE</p><h2>数字の出どころまで、わかるように。</h2><p>看護進学ナビは、学校を一方的におすすめするサイトではありません。公式情報を年度・定義・出典と一緒に整理し、自分で納得して選べる材料をつくります。</p></div><a className="text-link" href="#top">運営方針を見る <span>→</span></a></section>
      <footer className="site-footer"><span>看護進学ナビ</span><span>学校選びを、数字で見える化。</span><span>© 2026 Kangoshi Shingaku Navi</span></footer>
      {selectedSchools.length > 0 && <div className="compare-tray" role="status" aria-live="polite"><div><strong>{selectedSchools.length}校を比較中</strong><span>{selectedSchools.map((school) => school.shortName).join(' / ')}</span></div><a className="button button-coral" href="#compare">比較表を見る <span>↓</span></a><button className="tray-clear" onClick={() => setSelectedIds([])}>クリア</button></div>}
    </main>
  );
}
