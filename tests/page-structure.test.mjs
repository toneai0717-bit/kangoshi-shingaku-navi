import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

assert.match(page, /id="conditions"/, 'the page should start with condition inputs');
assert.match(page, /id="results"/, 'the page should have a single results workspace');
assert.match(page, /className="condition-card"/, 'condition inputs should be a focused card');
assert.match(page, /この条件で総額を見る/, 'the primary action should calculate total cost');
assert.match(page, /useState<string\[\]>\(\[\]\)/, 'comparison should start with no selected schools');
assert.match(page, /4年間の総費用ランキング/, 'results should lead with the four-year total');
assert.match(page, /選んだ学校の情報/, 'school details should be grouped by school');
assert.match(page, /selectedIds.length > 0/, 'comparison should be conditional on explicit selection');

assert.doesNotMatch(page, /className="hero"/, 'the old marketing hero should be removed');
assert.doesNotMatch(page, /id="search"/, 'search should not be a separate lower page');
assert.doesNotMatch(page, /id="data-details"/, 'cost details should live in school details');
assert.doesNotMatch(page, /className="trust"/, 'explanatory trust content should not interrupt the flow');
assert.doesNotMatch(page, /情報掲載方針/, 'editorial policy should stay out of the decision flow');

console.log('page structure tests passed');
