import assert from 'node:assert/strict';

import {
  commuteFareKey,
  commuteStations,
  getCommuteFare,
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

console.log('commute data tests passed');
