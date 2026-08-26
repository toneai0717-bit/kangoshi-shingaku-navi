import type { HousingEstimate } from './housing';

export type LivingMode = 'home' | 'away';

export type FourYearCostInput = {
  schoolCostYen: number;
  annualExtraYen: number;
  livingMode: LivingMode;
  housing?: HousingEstimate;
  managementFeeMonthlyYen?: number;
  initialCostMonths?: number;
  monthlyLivingCostYen: number;
};

export type FourYearCost = {
  schoolCostYen: number;
  annualExtraCostYen: number;
  housingCostYen: number;
  livingCostYen: number;
  totalCostYen: number;
};

export const calculateFourYearCost = ({
  schoolCostYen,
  annualExtraYen,
  livingMode,
  housing,
  managementFeeMonthlyYen = 0,
  initialCostMonths = 0,
  monthlyLivingCostYen,
}: FourYearCostInput): FourYearCost => {
  const annualExtraCostYen = annualExtraYen * 4;
  const housingCostYen = livingMode === 'away' && housing
    ? (housing.rentMonthlyYen + managementFeeMonthlyYen) * 48
      + housing.rentMonthlyYen * initialCostMonths
    : 0;
  const livingCostYen = monthlyLivingCostYen * 48;

  return {
    schoolCostYen,
    annualExtraCostYen,
    housingCostYen,
    livingCostYen,
    totalCostYen: schoolCostYen + annualExtraCostYen + housingCostYen + livingCostYen,
  };
};
