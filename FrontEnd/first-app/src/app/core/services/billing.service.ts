import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { InvoiceDto, PaymentDto, RecordPaymentRequest, GenerateEmiRequest, BillingDashboardDto } from '../models/billing.model';

@Injectable({
    providedIn: 'root'
})
export class BillingService {
    private http = inject(HttpClient);
    private readonly API_URL = 'https://localhost:7207/api/Billing';

    getInvoicesByPolicy(policyId: number | string): Observable<ApiResponse<InvoiceDto[]>> {
        return this.http.get<ApiResponse<InvoiceDto[]>>(`${this.API_URL}/policy/${policyId}/invoices`);
    }

    getInvoiceById(id: number | string): Observable<ApiResponse<InvoiceDto>> {
        return this.http.get<ApiResponse<InvoiceDto>>(`${this.API_URL}/invoices/${id}`);
    }

    recordPayment(req: RecordPaymentRequest): Observable<ApiResponse<PaymentDto>> {
        return this.http.post<ApiResponse<PaymentDto>>(`${this.API_URL}/payments`, req);
    }

    generateEmi(req: GenerateEmiRequest): Observable<ApiResponse<InvoiceDto[]>> {
        return this.http.post<ApiResponse<InvoiceDto[]>>(`${this.API_URL}/emi`, req);
    }

    getBillingDashboard(): Observable<ApiResponse<BillingDashboardDto>> {
        return this.http.get<ApiResponse<BillingDashboardDto>>(`${this.API_URL}/dashboard`);
    }
}
