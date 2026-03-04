import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { CommissionDto, CommissionSummaryDto, AgentPerformanceDto } from '../models/commission.model';
import { PagedResult } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class CommissionService {
    private http = inject(HttpClient);
    private readonly API_URL = 'https://localhost:7207/api/commissions';

    getCommissions(page: number, pageSize: number): Observable<ApiResponse<PagedResult<CommissionDto>>> {
        const params = new HttpParams().set('page', page).set('pageSize', pageSize);
        return this.http.get<ApiResponse<PagedResult<CommissionDto>>>(this.API_URL, { params });
    }

    getAgentSummary(agentId: number | string): Observable<ApiResponse<CommissionSummaryDto>> {
        return this.http.get<ApiResponse<CommissionSummaryDto>>(`${this.API_URL}/agent/${agentId}/summary`);
    }

    getAgentPerformance(): Observable<ApiResponse<AgentPerformanceDto[]>> {
        return this.http.get<ApiResponse<AgentPerformanceDto[]>>(`${this.API_URL}/performance`);
    }
}
