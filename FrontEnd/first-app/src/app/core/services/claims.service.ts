import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { ClaimDto, CreateClaimRequest, ClaimDecisionRequest, AssignOfficerRequest } from '../models/claims.model';
import { PagedResult } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class ClaimsService {
    private http = inject(HttpClient);
    private readonly API_URL = 'https://localhost:7207/api/Claims';

    createClaim(req: CreateClaimRequest): Observable<ApiResponse<ClaimDto>> {
        return this.http.post<ApiResponse<ClaimDto>>(this.API_URL, req);
    }

    getClaims(params: any): Observable<ApiResponse<PagedResult<ClaimDto>>> {
        let httpParams = new HttpParams();
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                httpParams = httpParams.append(key, params[key]);
            }
        });
        return this.http.get<ApiResponse<PagedResult<ClaimDto>>>(this.API_URL, { params: httpParams });
    }

    getClaimById(id: number | string): Observable<ApiResponse<ClaimDto>> {
        return this.http.get<ApiResponse<ClaimDto>>(`${this.API_URL}/${id}`);
    }

    assignOfficer(req: AssignOfficerRequest): Observable<ApiResponse<ClaimDto>> {
        return this.http.post<ApiResponse<ClaimDto>>(`${this.API_URL}/assign-officer`, req);
    }

    processDecision(req: ClaimDecisionRequest): Observable<ApiResponse<ClaimDto>> {
        return this.http.post<ApiResponse<ClaimDto>>(`${this.API_URL}/decision`, req);
    }

    uploadClaimDocument(claimId: number, file: File): Observable<ApiResponse<any>> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<ApiResponse<any>>(`${this.API_URL}/${claimId}/documents`, formData);
    }
}
