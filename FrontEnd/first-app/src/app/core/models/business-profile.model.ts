export interface BusinessProfileDto {
    id: number | string;
    userId: number | string;
    businessName: string;
    industryType: string;
    employeeCount: number;
    annualRevenue: number;
    yearsInOperation: number;
    location: string;
    priorClaimsCount: number;
    createdAt: string | Date;
}

export interface CreateBusinessProfileRequest {
    businessName: string;
    industryType: string;
    employeeCount: number;
    annualRevenue: number;
    yearsInOperation: number;
    location: string;
    priorClaimsCount: number;
}

export interface UpdateBusinessProfileRequest {
    businessName?: string;
    industryType?: string;
    employeeCount?: number;
    annualRevenue?: number;
    yearsInOperation?: number;
    location?: string;
    priorClaimsCount?: number;
}
