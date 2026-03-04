export interface QuoteRequest {
    businessProfileId: number | string;
    planId: number | string;
}

export interface RiskScoreDto {
    score: number;
    level: string;
    levelName: string;
    multiplier: number;
    breakdown: Record<string, number>;
}

export interface QuoteResponse {
    quoteId: number | string;
    planId: number | string;
    planName: string;
    insuranceTypeName: string;
    tierName: string;
    basePremium: number;
    riskScore: RiskScoreDto;
    finalPremium: number;
    coverageLimit: number;
    features: string[];
    createdAt: string | Date;
    isConverted: boolean;
}
