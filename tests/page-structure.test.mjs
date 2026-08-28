import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const workspace = readFileSync(new URL('../app/components/comparison-workspace.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

const rankingIndex = page.indexOf('<ComparisonWorkspace');
const searchIndex = page.indexOf('id="search"');
const compareIndex = page.indexOf('id="compare"');
const costIndex = page.indexOf('id="cost"');
const scholarshipIndex = page.indexOf('id="scholarships"');

assert.ok(rankingIndex >= 0, 'ranking section should exist');
assert.ok(rankingIndex < searchIndex, 'ranking should come before search');
assert.ok(searchIndex < compareIndex, 'search should come before compare');
assert.ok(compareIndex < costIndex, 'compare should come before cost details');
assert.ok(costIndex < scholarshipIndex, 'cost should come before scholarship details');
assert.ok(!page.includes('className="workflow-index"'), 'workflow explainer should not interrupt the decision flow');
assert.ok(!page.includes('情報掲載方針'), 'editorial policy should stay out of the decision flow');
assert.match(page, /useState<string\[\]>\(\[\]\)/, 'comparison should start with no selected schools');
assert.match(page, /ComparisonWorkspace/, 'the ranking should be the comparison workspace entry point');
assert.match(workspace, /選んだ学校の要点/, 'selected school information should be grouped in one place');
assert.match(workspace, /id="ranking"/);
assert.match(workspace, /4年間の実負担目安/);
assert.match(workspace, /学校ごとの情報を一つにまとめました/);
assert.match(styles, /main\{display:flex;flex-direction:column/);
assert.match(styles, /#cost\{order:6\}/);
assert.match(styles, /#commute\{order:7\}/);
assert.match(styles, /#data-details\{order:8\}/);
assert.match(styles, /#compare:has\(\.no-results\)\{display:none\}/, 'empty comparison should stay out of the initial flow');

console.log('page structure tests passed');
