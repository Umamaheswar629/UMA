import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { PolicyDto, PolicyDetailDto, CreatePolicyRequest, RenewPolicyRequest, CancelPolicyRequest } from '../models/policy.model';
import { PagedResult } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class PolicyService {
    private http = inject(HttpClient);
    private readonly API_URL = 'https://localhost:7207/api/policies';

    createPolicy(req: CreatePolicyRequest): Observable<ApiResponse<PolicyDto>> {
        return this.http.post<ApiResponse<PolicyDto>>(this.API_URL, req);
    }

    getPolicies(params: any): Observable<ApiResponse<PagedResult<PolicyDto>>> {
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                httpParams = httpParams.append(key, params[key]);
            }
        });
        return this.http.get<ApiResponse<PagedResult<PolicyDto>>>(this.API_URL, { params: httpParams });
    }

    getPolicyById(id: number | string): Observable<ApiResponse<PolicyDetailDto>> {
        return this.http.get<ApiResponse<PolicyDetailDto>>(`${this.API_URL}/${id}`);
    }

    renewPolicy(req: RenewPolicyRequest): Observable<ApiResponse<PolicyDto>> {
        return this.http.post<ApiResponse<PolicyDto>>(`${this.API_URL}/renew`, req);
    }

    cancelPolicy(req: CancelPolicyRequest): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/cancel`, req);
    }

    approvePolicy(id: number | string): Observable<ApiResponse<PolicyDto>> {
        return this.http.post<ApiResponse<PolicyDto>>(`${this.API_URL}/${id}/approve`, {});
    }
}
