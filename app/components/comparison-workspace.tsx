'use client';

import { useMemo } from 'react';
import type { CostRankedSchool } from '../data/ranking';
import type { School } from '../data/schools';

type LivingMode = 'home' | 'away';

type ComparisonWorkspaceProps = {
  rankings: CostRankedSchool<School>[];
  selectedSchools: School[];
  selectedIds: string[];
  livingMode: LivingMode;
  monthlyLivingCostMan: number;
  annualScholarshipSupportMan: number;
  collectedAt: string;
  commuteDisplay: (school: School) => string;
  formatYen: (man: number) => string;
  onToggleSchool: (id: string) => void;
  onChangeLivingMode: (mode: LivingMode) => void;
  onShowCost: (id: string) => void;
  onShowComparison: () => void;
};

const SchoolSnapshot = ({
  school,
  ranking,
  commuteDisplay,
  formatYen,
  onShowCost,
}: {
  school: School;
  ranking: CostRankedSchool<School>;
  commuteDisplay: (school: School) => string;
  formatYen: (man: number) => string;
  onShowCost: (id: string) => void;
}) => (
  <article className="school-snapshot">
    <div className="snapshot-heading">
      <div>
        <span className="snapshot-label">選択中の学校</span>
        <h3>{school.name}</h3>
        <p>{school.faculty}・{school.prefecture}{school.city}</p>
      </div>
      <button className="snapshot-cost" onClick={() => onShowCost(school.id)}>
        <small>4年間実負担目安</small>
        <b>{formatYen(ranking.cost.totalCostYen / 10000)}</b>
      </button>
    </div>
    <div className="snapshot-grid">
      <div><small>費用の内訳</small><b>学費 {formatYen(ranking.cost.schoolCostYen / 10000)}</b><span>住居 {formatYen(ranking.cost.housingCostYen / 10000)}</span></div>
      <div><small>通学・暮らし</small><b>{commuteDisplay(school)}</b><span>{school.accessSummary}</span></div>
      <div><small>進路・資格</small><b>国試 {school.passRate}%</b><span>{school.certificates}</span></div>
      <div><small>支援・入試</small><b>{school.scholarshipSummary === '未収録' ? '支援情報 未収録' : '支援制度あり'}</b><span>{school.admissionResultSummary}</span></div>
    </div>
    <div className="snapshot-footer">
      <span>{school.confidence}・出典 {school.sourceCount}件・最終確認 {school.lastChecked.replaceAll('-', '.')}</span>
      <a href="#sources">出典を確認 →</a>
    </div>
  </article>
);

export default function ComparisonWorkspace({
  rankings,
  selectedSchools,
  selectedIds,
  livingMode,
  monthlyLivingCostMan,
  annualScholarshipSupportMan,
  collectedAt,
  commuteDisplay,
  formatYen,
  onToggleSchool,
  onChangeLivingMode,
  onShowCost,
  onShowComparison,
}: ComparisonWorkspaceProps) {
  const rankingById = useMemo(() => new Map(rankings.map((school) => [school.id, school])), [rankings]);

  return (
    <section id="ranking" className="ranking-section comparison-workspace">
      <div className="wrap">
        <div className="workspace-heading">
          <div>
            <div className="eyebrow">まずはここを見る</div>
            <h2>関東の看護大学、4年間の実負担で比べる</h2>
            <p>学費だけではなく、受験料・教材・住まい・生活費・通学費まで同じ条件で並べています。気になる学校を選ぶと、必要な情報が学校ごとにまとまります。</p>
          </div>
          <div className="ranking-mode">
            <span>生活スタイル</span>
            <div className="toggle">
              <button className={livingMode === 'home' ? 'active' : ''} onClick={() => onChangeLivingMode('home')}>自宅通学</button>
              <button className={livingMode === 'away' ? 'active' : ''} onClick={() => onChangeLivingMode('away')}>一人暮らし</button>
            </div>
            <small className="workspace-mode-note">切り替えは費用計算で調整できます</small>
          </div>
        </div>

        <div className="ranking-assumptions">
          <b>{livingMode === 'home' ? '自宅通学' : '一人暮らし'}の条件で比較中</b>
          <span>{livingMode === 'home' ? '生活費 月2万円・住居費0円' : `生活費 月${monthlyLivingCostMan}万円・学校周辺の家賃目安`}</span>
          <span>給付・減免：{annualScholarshipSupportMan > 0 ? `年${annualScholarshipSupportMan}万円を反映` : '未反映'}</span>
        </div>

        <div className="workspace-selection">
          <div>
            <b>比較する学校を選ぶ</b>
            <span>{selectedSchools.length === 0 ? 'まだ選択されていません' : `${selectedSchools.length}校を選択中`}</span>
          </div>
          <small>最大3校。選んだ学校の費用・通学・資格・支援を下にまとめます。</small>
          {selectedSchools.length > 0 && <button className="workspace-compare-link" onClick={onShowComparison}>比較表を見る →</button>}
        </div>

        <div className="ranking-list">
          {rankings.map((ranked) => {
            const selected = selectedIds.includes(ranked.id);
            return (
              <article className={`ranking-card ${ranked.rank === 1 ? 'featured' : ''} ${selected ? 'selected' : ''}`} key={ranked.id}>
                <div className="rank-num"><b>{ranked.rank}</b><small>位</small></div>
                <div className="ranking-main">
                  <div className="ranking-title-row">
                    <div><h3>{ranked.name}</h3><p>{ranked.faculty}</p></div>
                    <span className="ranking-confidence">{ranked.confidence}</span>
                  </div>
                  <div className="ranking-cost"><span>4年間の実負担目安</span><b>{formatYen(ranked.cost.totalCostYen / 10000)}</b></div>
                  <div className="ranking-metrics"><span>学費 {formatYen(ranked.cost.schoolCostYen / 10000)}</span><span>住居 {formatYen(ranked.cost.housingCostYen / 10000)}</span><span>通学 {commuteDisplay(ranked)}</span><span>国試 {ranked.passRate}%</span></div>
                  <div className="ranking-actions">
                    <button className={`ranking-select ${selected ? 'selected' : ''}`} onClick={() => onToggleSchool(ranked.id)}>{selected ? '✓ 比較に追加済み' : '＋ 比較に追加'}</button>
                    <button className="ranking-detail" onClick={() => onShowCost(ranked.id)}>費用の内訳を見る →</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {selectedSchools.length > 0 && (
          <div className="selected-overview">
            <div className="selected-overview-heading"><div><div className="eyebrow">選んだ学校の要点</div><h3>学校ごとの情報を一つにまとめました</h3></div><span>比較中 {selectedSchools.length}/3校</span></div>
            <div className="snapshot-list">
              {selectedSchools.map((school) => {
                const ranking = rankingById.get(school.id);
                return ranking ? <SchoolSnapshot key={school.id} school={school} ranking={ranking} commuteDisplay={commuteDisplay} formatYen={formatYen} onShowCost={onShowCost} /> : null;
              })}
            </div>
            <button className="selected-overview-cta" onClick={onShowComparison}>3校までの違いを比較表で見る →</button>
          </div>
        )}

        <p className="ranking-note">※大学の優劣ではなく、現在収録している5校を共通条件で並べた費用目安です。未収録項目や推定値を含みます。調査日：{collectedAt.replaceAll('-', '.')}</p>
      </div>
    </section>
  );
}
