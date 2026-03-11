export interface InsuranceTypeDto {
    id: number | string;
    name: string;
    description: string;
    category: string;
    isActive: boolean;
    planCount: number;
}

export interface PlanDto {
    id: number | string;
    insuranceTypeId: number | string;
    insuranceTypeName: string;
    tierName: string;
    basePremium: number;
    coverageLimit: number;
    features: string[];
    exclusions: string[];
    commissionRate: number;
    isActive: boolean;
}

export interface PlanComparisonDto {
    insuranceTypeId: number | string;
    insuranceTypeName: string;
    description: string;
    basicPlan: PlanDto;
    standardPlan: PlanDto;
    premiumPlan: PlanDto;
}

export interface CreateInsuranceTypeRequest {
    name: string;
    description: string;
    category: string;
}

export interface CreatePlanRequest {
    insuranceTypeId: number | string;
    tierName: string;
    basePremium: number;
    coverageLimit: number;
    commissionRate: number;
    features: string[];
    exclusions: string[];
}
