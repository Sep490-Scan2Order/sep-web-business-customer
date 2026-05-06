import { PlanUpsertRequest } from "@/src/types/type";

export type PlanDetailResponse = {
  id: number;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  durationInDays?: number;
  dailyRateMonth: number;
  dailyRateYear: number;
  level: number;
  status: string;
  isTrial?: boolean;
  isCommissionExempt?: boolean;
  features: {
    maxStaff?: number;
    canUseCombo?: boolean;
    canUsePromotions?: boolean;
    canCustomMenuTemplate?: boolean;
    canUseAIUpsell?: boolean;
    canRecommendationOnTop?: boolean;
  };
};

export const defaultPlanForm = (): PlanUpsertRequest => ({
  name: "",
  monthlyPrice: 0,
  yearlyPrice: 0,
  durationInDays: 30,
  level: 1,
  isTrial: false,
  isCommissionExempt: false,
  features: {
    canUseAIUpsell: false,
    canRecommendationOnTop: false,
    canUsePromotions: false,
    canCustomMenuTemplate: false,
  },
});

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

export const getStatusTag = (status: string) => {
  const normalized = status?.toLowerCase();
  const isActive = normalized === "active" || normalized === "true";
  return isActive
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-rose-50 text-rose-700 border-rose-200";
};
