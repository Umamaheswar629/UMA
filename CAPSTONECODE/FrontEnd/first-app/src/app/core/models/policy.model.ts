import { InvoiceDto } from './billing.model';       

export interface PolicyDto {
    policyId: number | string;
    policyNumber: string;
    quoteId: number | string;
    customerId: number | string;
    customerName: string;
    customerEmail: string;
    agentId?: number | string;
    agentName?: string;
    insuranceTypeName: string;
    planName: string;
    tierName: string;
    premiumAmount: number;
    coverageLimit: number;
    status: string;
    startDate: string | Date;
    endDate: string | Date;
    createdAt: string | Date;
    canRenew: boolean;
    canCancel: boolean;
}

export interface ClaimSummaryDto {
    claimNumber: string;
    status: string;
    filedAt: string | Date;
    settlementAmount?: number;
}

export interface PolicyDetailDto extends PolicyDto {
    features: string[];
    invoices: InvoiceDto[];
    claims: ClaimSummaryDto[];
}

export interface CreatePolicyRequest {
    quoteId: number | string;
    startDate: string;
    agentId?: number;
}

export interface RenewPolicyRequest {
    policyId: number | string;
    newPlanId?: number;
}

export interface CancelPolicyRequest {
    policyId: number | string;
    reason: string;
}
