import assert from 'node:assert/strict';

import {
  commuteFareKey,
  commuteStations,
  commuteTimeEstimates,
  formatCommuteTimeEstimate,
  getCommuteFare,
  getCommuteTimeEstimate,
  parseFareYen,
} from '../app/data/commute.ts';

assert.equal(commuteStations.length, 10);
assert.equal(new Set(commuteStations.map((station) => station.id)).size, commuteStations.length);
assert.ok(commuteStations.some((station) => station.id === 'omiya'));
assert.ok(commuteStations.some((station) => station.id === 'yokohama'));

assert.equal(commuteFareKey('omiya', 'tokyo-metropolitan-university-nursing'), 'omiya:tokyo-metropolitan-university-nursing');

const unverified = getCommuteFare('omiya', 'tokyo-metropolitan-university-nursing');
assert.equal(unverified.status, 'unverified');
assert.equal(unverified.studentSixMonthYen, null);
assert.equal(unverified.routeLabel, null);

assert.equal(parseFareYen('60,000'), 60000);
assert.equal(parseFareYen('60000'), 60000);
assert.equal(parseFareYen(''), null);
assert.equal(parseFareYen('-100'), null);
assert.equal(parseFareYen('未確認'), null);

assert.equal(commuteTimeEstimates.length, 5);
assert.equal(getCommuteTimeEstimate('tokyo-metropolitan-university-nursing')?.averageMinutes, 45);
assert.equal(formatCommuteTimeEstimate(getCommuteTimeEstimate('tokyo-metropolitan-university-nursing')), '35〜55分（平均45分）');
assert.equal(formatCommuteTimeEstimate(getCommuteTimeEstimate('unknown-school')), '未収録');

console.log('commute data tests passed');
