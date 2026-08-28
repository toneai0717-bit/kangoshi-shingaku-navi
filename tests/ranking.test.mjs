import assert from 'node:assert/strict';
import { rankSchoolsByFourYearCost } from '../app/data/ranking.ts';

const schools = [
  {
    id: 'expensive',
    name: '高額看護大学',
    tuition: 650,
    entranceExamFeeYen: 35000,
    annualExtraEstimateYen: 120000,
    housing: { rentMonthlyYen: 70000 },
  },
  {
    id: 'affordable',
    name: '現実的看護大学',
    tuition: 500,
    entranceExamFeeYen: 30000,
    annualExtraEstimateYen: 80000,
    housing: { rentMonthlyYen: 55000 },
  },
];

const homeRanking = rankSchoolsByFourYearCost(schools, {
  livingMode: 'home',
  monthlyLivingCostYen: 20000,
});

assert.deepEqual(homeRanking.map((school) => school.id), ['affordable', 'expensive']);
assert.equal(homeRanking[0].rank, 1);
assert.equal(homeRanking[0].cost.totalCostYen, 6165000);

const awayRanking = rankSchoolsByFourYearCost(schools, {
  livingMode: 'away',
  monthlyLivingCostYen: 80000,
  managementFeeMonthlyYen: 5000,
  initialCostMonths: 5,
});

assert.equal(awayRanking[0].id, 'affordable');
assert.equal(awayRanking[0].cost.housingCostYen, 3180000);
assert.equal(awayRanking[0].cost.totalCostYen, 12045000);

const scholarshipRanking = rankSchoolsByFourYearCost(schools, {
  livingMode: 'home',
  monthlyLivingCostYen: 20000,
  annualScholarshipSupportYen: 100000,
});

assert.equal(scholarshipRanking[0].cost.scholarshipSupportYen, 400000);
assert.equal(scholarshipRanking[0].cost.totalCostYen, 5765000);

console.log('ranking tests passed');
