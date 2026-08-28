import { calculateFourYearCost, type FourYearCost, type LivingMode } from './costs.ts';
import type { HousingEstimate } from './housing.ts';

export type RankingSchool = {
  id: string;
  name: string;
  tuition: number;
  entranceExamFeeYen?: number;
  annualExtraEstimateYen?: number;
  housing?: HousingEstimate;
};

export type CostRankingOptions = {
  livingMode: LivingMode;
  monthlyLivingCostYen: number;
  managementFeeMonthlyYen?: number;
  initialCostMonths?: number;
  annualScholarshipSupportYen?: number;
  commutePassSixMonthYenBySchoolId?: Record<string, number>;
};

export type CostRankedSchool<T extends RankingSchool = RankingSchool> = T & {
  rank: number;
  cost: FourYearCost;
};

export const rankSchoolsByFourYearCost = <T extends RankingSchool>(
  schools: T[],
  options: CostRankingOptions,
): CostRankedSchool<T>[] => schools
  .map((school) => ({
    school,
    cost: calculateFourYearCost({
      schoolCostYen: Math.round(school.tuition * 10000),
      entranceExamFeeYen: school.entranceExamFeeYen,
      annualExtraYen: school.annualExtraEstimateYen ?? 0,
      livingMode: options.livingMode,
      housing: school.housing,
      managementFeeMonthlyYen: options.managementFeeMonthlyYen,
      initialCostMonths: options.initialCostMonths,
      monthlyLivingCostYen: options.monthlyLivingCostYen,
      commutePassSixMonthYen: options.commutePassSixMonthYenBySchoolId?.[school.id],
      annualScholarshipSupportYen: options.annualScholarshipSupportYen,
    }),
  }))
  .sort((left, right) => left.cost.totalCostYen - right.cost.totalCostYen || left.school.name.localeCompare(right.school.name, 'ja'))
  .map(({ school, cost }, index) => ({ ...school, rank: index + 1, cost }));
