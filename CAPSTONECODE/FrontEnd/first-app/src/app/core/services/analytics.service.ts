import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { DashboardStatsDto, CustomerDashboardDto, MonthlyRevenueDto, ClaimsRatioDto, PoliciesByTypeDto, PlanDistributionDto } from '../models/analytics.model';
import { AgentPerformanceDto } from '../models/commission.model';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    private http = inject(HttpClient);
    private readonly API_URL = 'https://localhost:7207/api/analytics';

    getAdminDashboard(): Observable<ApiResponse<DashboardStatsDto>> {
        return this.http.get<ApiResponse<DashboardStatsDto>>(`${this.API_URL}/admin/dashboard`);
    }

    getCustomerDashboard(): Observable<ApiResponse<CustomerDashboardDto>> {
        return this.http.get<ApiResponse<CustomerDashboardDto>>(`${this.API_URL}/customer/dashboard`);
    }

    getMonthlyRevenue(months?: number): Observable<ApiResponse<MonthlyRevenueDto[]>> {
        let params = new HttpParams();
        if (months) {
            params = params.set('months', months);
        }
        return this.http.get<ApiResponse<MonthlyRevenueDto[]>>(`${this.API_URL}/monthly-revenue`, { params });
    }

    getClaimsRatio(): Observable<ApiResponse<ClaimsRatioDto>> {
        return this.http.get<ApiResponse<ClaimsRatioDto>>(`${this.API_URL}/claims-ratio`);
    }

    getPoliciesByType(): Observable<ApiResponse<PoliciesByTypeDto[]>> {
        return this.http.get<ApiResponse<PoliciesByTypeDto[]>>(`${this.API_URL}/policies-by-type`);
    }

    getPlanDistribution(): Observable<ApiResponse<PlanDistributionDto[]>> {
        return this.http.get<ApiResponse<PlanDistributionDto[]>>(`${this.API_URL}/plan-distribution`);
    }

    getAgentPerformance(): Observable<ApiResponse<AgentPerformanceDto[]>> {
        return this.http.get<ApiResponse<AgentPerformanceDto[]>>(`${this.API_URL}/agent-performance`);
    }
}
