import assert from 'node:assert/strict';
import { preferenceToFilters } from '../app/data/preferences.ts';

assert.deepEqual(
  preferenceToFilters({ priority: 'cost', career: 'hospital' }),
  { tuitionLimit: '550万円以内', commuteLimit: '60分以内' },
);

assert.deepEqual(
  preferenceToFilters({ priority: 'commute', career: 'community' }),
  { tuitionLimit: '650万円以内', commuteLimit: '45分以内' },
);

assert.deepEqual(
  preferenceToFilters({ priority: 'qualification', career: 'undecided' }),
  { tuitionLimit: '650万円以内', commuteLimit: '60分以内' },
);

console.log('preference filter tests passed');
