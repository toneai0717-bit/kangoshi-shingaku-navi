import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

const rankingIndex = page.indexOf('id="ranking"');
const searchIndex = page.indexOf('id="search"');
const compareIndex = page.indexOf('id="compare"');
const costIndex = page.indexOf('id="cost"');
const scholarshipIndex = page.indexOf('id="scholarships"');

assert.ok(rankingIndex >= 0, 'ranking section should exist');
assert.ok(rankingIndex < searchIndex, 'ranking should come before search');
assert.ok(searchIndex < compareIndex, 'search should come before compare');
assert.ok(compareIndex < costIndex, 'compare should come before cost details');
assert.ok(costIndex < scholarshipIndex, 'cost should come before scholarship details');
assert.match(page, /className="workflow-index"/);
assert.match(page, /まず総額を見る/);
assert.match(page, /条件を変えて絞る/);
assert.match(page, /候補を横並びで比べる/);
assert.match(page, /内訳と支援を確認する/);
assert.match(page, /総額を見たあとに、条件を変えて候補を絞り込めます/);
assert.match(page, /気になる学校を横並びで比較できます/);
assert.match(page, /内訳を確認してから、支援制度を反映できます/);

console.log('page structure tests passed');
