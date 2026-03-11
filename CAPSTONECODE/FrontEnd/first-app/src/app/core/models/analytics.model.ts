import { PolicyDto } from './policy.model';
import { AgentPerformanceDto } from './commission.model';

export interface DashboardStatsDto {
    totalUsers: number;
    totalPolicies: number;
    activePolicies: number;
    totalClaims: number;
    openClaims: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalAgents: number;
    newUsersThisMonth: number;
}

export interface CustomerDashboardDto {
    activePolicies: number;
    totalClaims: number;
    openClaims: number;
    nextRenewalDate?: string | Date;
    nextRenewalPolicyNumber?: string;
    totalPremiumPaid: number;
    policiesExpiringSoon: PolicyDto[];
}

export interface MonthlyRevenueDto {
    month: string;
    revenue: number;
    policyCount: number;
}

export interface ClaimsRatioDto {
    totalClaims: number;
    submitted: number;
    underReview: number;
    approved: number;
    rejected: number;
    settled: number;
    approvalRate: number;
    averageSettlementAmount: number;
}

export interface PoliciesByTypeDto {
    insuranceTypeName: string;
    count: number;
    percentage: number;
}

export interface PlanDistributionDto {
    tierName: string;
    count: number;
    percentage: number;
}
