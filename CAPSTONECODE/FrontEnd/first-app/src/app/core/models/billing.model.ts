export interface PaymentDto {
    paymentId: number | string;
    invoiceId: number | string;
    amountPaid: number;
    paymentDate: string | Date;
    paymentMethod: string;
    transactionReference: string;
}

export interface InvoiceDto {
    invoiceId: number | string;
    invoiceNumber: string;
    policyNumber: string;
    policyId: number | string;
    amount: number;
    dueDate: string | Date;
    paidDate?: string | Date;
    status: string;
    isEmi: boolean;
    emiMonth?: number;
    totalEmiMonths?: number;
    payments: PaymentDto[];
}

export interface RecordPaymentRequest {
    invoiceId: number | string;
    amountPaid: number;
    paymentMethod: string;
    transactionReference: string;
}

export interface GenerateEmiRequest {
    policyId: number | string;
    invoiceId?: number | string;
    numberOfMonths: number;
}

export interface BillingDashboardDto {
    totalPaid: number;
    pendingAmount: number;
    overdueAmount: number;
    nextDueDate?: string | Date;
    nextDueAmount?: number;
    recentInvoices: InvoiceDto[];
}
