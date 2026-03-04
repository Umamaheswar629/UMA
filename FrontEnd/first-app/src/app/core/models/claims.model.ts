export interface ClaimDocumentDto {
    documentId: number | string;
    fileName: string;
    fileType: string;
    fileSizeKb: number;
    uploadedAt: string | Date;
    downloadUrl: string;
}

export interface ClaimDto {
    claimId: number | string;
    claimNumber: string;
    policyNumber: string;
    policyId: number | string;
    insuranceTypeName: string;
    planName: string;
    customerId: number | string;
    customerName: string;
    customerEmail: string;
    officerId?: number | string;
    officerName?: string;
    incidentDate: string | Date;
    incidentType: string;
    description: string;
    estimatedAmount: number;
    settlementAmount?: number;
    coverageLimit: number;
    status: string;
    rejectionReason?: string;
    officerNotes?: string;
    filedAt: string | Date;
    reviewedAt?: string | Date;
    settledAt?: string | Date;
    documents: ClaimDocumentDto[];
}

export interface CreateClaimRequest {
    policyId: number | string;
    incidentDate: string;
    incidentType: string;
    description: string;
    estimatedAmount: number;
}

export interface ClaimDecisionRequest {
    claimId: number | string;
    decision: string;
    settlementAmount?: number;
    notes: string;
}

export interface AssignOfficerRequest {
    claimId: number | string;
    officerId: number | string;
}
