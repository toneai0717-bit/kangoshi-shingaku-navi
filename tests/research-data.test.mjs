import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const data = JSON.parse(await readFile(new URL('../data/research/kanto-nursing-5-2026-08-26.json', import.meta.url), 'utf8'));
const schoolById = new Map(data.schools.map((school) => [school.id, school]));

const tmu = schoolById.get('tokyo-metropolitan-university-nursing');
const ycu = schoolById.get('yokohama-city-university-nursing');
const chiba = schoolById.get('chiba-university-nursing');
const junshin = schoolById.get('tokyo-junshin-university-nursing');

assert.match(tmu.financialAid.summary, /全額免除/);
assert.match(tmu.financialAid.summary, /半額/);
assert.match(ycu.financialAid.summary, /1\.7万円/);
assert.match(ycu.financialAid.summary, /4万円/);
assert.match(chiba.financialAid.summary, /自宅外/);
assert.match(chiba.financialAid.summary, /5\.1万円/);
assert.match(junshin.financialAid.summary, /5万円/);
assert.ok(junshin.financialAid.programs.some((program) => program.includes('92万円')));

const chibaResult = chiba.admissions.find((admission) => admission.academicYear === 2026).result;
assert.equal(chibaResult.generalFirstTerm.applicants, 167);
assert.equal(chibaResult.generalFirstTerm.enrollees, 58);
assert.equal(chibaResult.recommendation.applicantRatio, 2.6);
assert.equal(chibaResult.socialAdult.applicantRatio, 0.9);

console.log('research data tests passed');
