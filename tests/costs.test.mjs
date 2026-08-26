import assert from 'node:assert/strict';
import { calculateFourYearCost } from '../app/data/costs.ts';

const housing = {
  rentMonthlyYen: 60000,
  managementFeeMonthlyYen: 5000,
  initialCostMonths: 5,
};

const home = calculateFourYearCost({
  schoolCostYen: 2365200,
  annualExtraYen: 100000,
  livingMode: 'home',
  monthlyLivingCostYen: 20000,
});

assert.equal(home.schoolCostYen, 2365200);
assert.equal(home.housingCostYen, 0);
assert.equal(home.livingCostYen, 960000);
assert.equal(home.totalCostYen, 3725200);

const away = calculateFourYearCost({
  schoolCostYen: 2000000,
  annualExtraYen: 100000,
  livingMode: 'away',
  housing,
  managementFeeMonthlyYen: 5000,
  initialCostMonths: 5,
  monthlyLivingCostYen: 80000,
});

assert.equal(away.housingCostYen, 3420000);
assert.equal(away.livingCostYen, 3840000);
assert.equal(away.totalCostYen, 9660000);

const missingHousing = calculateFourYearCost({
  schoolCostYen: 2000000,
  annualExtraYen: 100000,
  livingMode: 'away',
  monthlyLivingCostYen: 80000,
});

assert.equal(missingHousing.housingCostYen, 0);
assert.equal(missingHousing.totalCostYen, 6240000);

console.log('cost calculation tests passed');
