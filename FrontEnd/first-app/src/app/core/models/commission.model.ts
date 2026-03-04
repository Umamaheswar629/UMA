export interface CommissionDto {
    commissionId: number | string;
    agentId: number | string;
    agentName: string;
    policyId: number | string;
    policyNumber: string;
    customerName: string;
    insuranceTypeName: string;
    planName: string;
    premiumAmount: number;
    commissionRate: number;
    commissionAmount: number;
    earnedAt: string | Date;
}

export interface CommissionSummaryDto {
    agentId: number | string;
    agentName: string;
    totalCommissionEarned: number;
    thisMonthCommission: number;
    totalPoliciesCreated: number;
    averagePremium: number;
    commissions: CommissionDto[];
}

export interface AgentPerformanceDto {
    agentId: number | string;
    agentName: string;
    totalPolicies: number;
    totalCommission: number;
    averagePremium: number;
}
