import housingData from '@/data/research/housing-estimates-5-2026-08-27.json';

export type HousingEstimate = {
  schoolId: string;
  referencePoint: string;
  estimateType: string;
  estimateLabel: string;
  rentMonthlyYen: number;
  rentRangeMonthlyYen?: { min: number; max: number };
  managementFeeIncluded: boolean;
  collectedAt: string;
  sourceTitle: string;
  sourceUrl: string;
  note: string;
};

export const housingEstimates = housingData.estimates as HousingEstimate[];
export const housingBySchoolId = new Map(housingEstimates.map((estimate) => [estimate.schoolId, estimate]));

export const housingAssumptions = {
  managementFeeMonthlyYen: 5000,
  initialCostMonths: 5,
};
