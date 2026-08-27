import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const data = JSON.parse(await readFile(new URL('../data/research/kanto-nursing-5-2026-08-26.json', import.meta.url), 'utf8'));
const schoolById = new Map(data.schools.map((school) => [school.id, school]));

const tmu = schoolById.get('tokyo-metropolitan-university-nursing');
const ycu = schoolById.get('yokohama-city-university-nursing');
const chiba = schoolById.get('chiba-university-nursing');
const junshin = schoolById.get('tokyo-junshin-university-nursing');

assert.ok(data.sources.some((source) => source.id === 'tmu-fees-2026-exemption'));
assert.ok(data.sources.some((source) => source.id === 'tmu-admission-results-2025-general'));
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
assert.equal(chiba.fees.find((fee) => fee.academicYear === 2026).knownFourYearSchoolCostEstimate.value, 2931210);

const tmuGeneralResult = tmu.admissions.find((admission) => admission.selectionType === 'generalFirstTerm').result;
assert.equal(tmuGeneralResult.applicants, 94);
assert.equal(tmuGeneralResult.admitted, 43);
assert.equal(tmuGeneralResult.enrollees, 35);

const junshinResult = junshin.admissions.find((admission) => admission.academicYear === 2025).result;
assert.equal(junshinResult.general.applicants, 52);
assert.equal(junshinResult.general.admitted, 48);
assert.equal(junshinResult.general.enrollees, 16);

const chibaAccess = chiba.campusAccess;
assert.equal(chibaAccess.address, '千葉市中央区亥鼻1-8-1');
assert.match(chibaAccess.notes, /西千葉/);
assert.equal(junshin.campusAccess.nearestStation, 'JR八王子駅北口／京王八王子駅');
assert.match(junshin.campusAccess.accessNote, /純心女子学園/);

const junshinLatestExam = junshin.nationalExamResults.find((result) => result.examYear === 2026);
assert.equal(junshinLatestExam.examinees, 62);
assert.equal(junshinLatestExam.passers, 53);
assert.equal(junshinLatestExam.passRate, 85.5);
assert.match(junshinLatestExam.cohort, /第三者集計/);
assert.ok(data.sources.some((source) => source.id === 'junshin-national-exam-2026'));

console.log('research data tests passed');
