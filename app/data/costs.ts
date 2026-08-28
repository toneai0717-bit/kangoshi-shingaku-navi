import type { HousingEstimate } from './housing.ts';

export type LivingMode = 'home' | 'away';

export type FourYearCostInput = {
  schoolCostYen: number;
  entranceExamFeeYen?: number;
  annualExtraYen: number;
  livingMode: LivingMode;
  housing?: HousingEstimate;
  managementFeeMonthlyYen?: number;
  initialCostMonths?: number;
  monthlyLivingCostYen: number;
  commutePassSixMonthYen?: number;
  annualScholarshipSupportYen?: number;
};

export type FourYearCost = {
  schoolCostYen: number;
  entranceExamFeeYen: number;
  annualExtraCostYen: number;
  housingCostYen: number;
  livingCostYen: number;
  commutePassCostYen: number;
  scholarshipSupportYen: number;
  totalCostYen: number;
};

export const calculateFourYearCost = ({
  schoolCostYen,
  entranceExamFeeYen = 0,
  annualExtraYen,
  livingMode,
  housing,
  managementFeeMonthlyYen = 0,
  initialCostMonths = 0,
  monthlyLivingCostYen,
  commutePassSixMonthYen = 0,
  annualScholarshipSupportYen = 0,
}: FourYearCostInput): FourYearCost => {
  const annualExtraCostYen = annualExtraYen * 4;
  const housingCostYen = livingMode === 'away' && housing
    ? (housing.rentMonthlyYen + managementFeeMonthlyYen) * 48
      + housing.rentMonthlyYen * initialCostMonths
    : 0;
  const livingCostYen = monthlyLivingCostYen * 48;
  const commutePassCostYen = commutePassSixMonthYen * 8;
  const grossTotalYen = schoolCostYen + entranceExamFeeYen + annualExtraCostYen + housingCostYen + livingCostYen + commutePassCostYen;
  const scholarshipSupportYen = Math.min(Math.max(0, annualScholarshipSupportYen * 4), grossTotalYen);

  return {
    schoolCostYen,
    entranceExamFeeYen,
    annualExtraCostYen,
    housingCostYen,
    livingCostYen,
    commutePassCostYen,
    scholarshipSupportYen,
    totalCostYen: grossTotalYen - scholarshipSupportYen,
  };
};
