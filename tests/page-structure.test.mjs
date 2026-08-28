import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

const rankingIndex = page.indexOf('id="ranking"');
const searchIndex = page.indexOf('id="search"');
const compareIndex = page.indexOf('id="compare"');
const costIndex = page.indexOf('id="cost"');
const commuteIndex = page.indexOf('id="commute"');
const scholarshipIndex = page.indexOf('id="scholarships"');

assert.ok(rankingIndex >= 0, 'ranking section should exist');
assert.ok(rankingIndex < searchIndex, 'ranking should come before search');
assert.ok(searchIndex < compareIndex, 'search should come before compare');
assert.ok(compareIndex < costIndex, 'compare should come before cost details');
assert.ok(costIndex < scholarshipIndex, 'cost should come before scholarship details');
assert.ok(!page.includes('className="workflow-index"'), 'workflow explainer should not interrupt the decision flow');
assert.ok(!page.includes('情報掲載方針'), 'editorial policy should stay out of the decision flow');
assert.match(page, /ランキングの総額に含まれるもの/);
assert.match(page, /学校納付金/);
assert.match(page, /住居・生活費/);
assert.match(page, /受験料・教材・通学費/);

console.log('page structure tests passed');
