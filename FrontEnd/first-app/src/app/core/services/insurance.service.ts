import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { InsuranceTypeDto, PlanDto, PlanComparisonDto, CreateInsuranceTypeRequest, CreatePlanRequest } from '../models/insurance.model';

@Injectable({
    providedIn: 'root'
})
export class InsuranceService {
    private http = inject(HttpClient);
    private readonly API_URL = 'https://localhost:7207/api/insurance';

    getAllTypes(): Observable<ApiResponse<InsuranceTypeDto[]>> {
        return this.http.get<ApiResponse<InsuranceTypeDto[]>>(`${this.API_URL}/types`);
    }

    getTypeById(id: number | string): Observable<ApiResponse<InsuranceTypeDto>> {
        return this.http.get<ApiResponse<InsuranceTypeDto>>(`${this.API_URL}/types/${id}`);
    }

    comparePlans(id: number | string): Observable<ApiResponse<PlanComparisonDto>> {
        return this.http.get<ApiResponse<PlanComparisonDto>>(`${this.API_URL}/types/${id}/compare`);
    }

    createType(req: CreateInsuranceTypeRequest): Observable<ApiResponse<InsuranceTypeDto>> {
        return this.http.post<ApiResponse<InsuranceTypeDto>>(`${this.API_URL}/types`, req);
    }

    updateType(id: number | string, req: CreateInsuranceTypeRequest): Observable<ApiResponse<InsuranceTypeDto>> {
        return this.http.put<ApiResponse<InsuranceTypeDto>>(`${this.API_URL}/types/${id}`, req);
    }

    toggleTypeStatus(id: number | string): Observable<ApiResponse<boolean>> {
        return this.http.patch<ApiResponse<boolean>>(`${this.API_URL}/types/${id}/toggle`, {});
    }

    createPlan(req: CreatePlanRequest): Observable<ApiResponse<PlanDto>> {
        return this.http.post<ApiResponse<PlanDto>>(`${this.API_URL}/plans`, req);
    }

    getPlansByType(typeId: number | string): Observable<ApiResponse<PlanDto[]>> {
        return this.http.get<ApiResponse<PlanDto[]>>(`${this.API_URL}/types/${typeId}/plans`);
    }
}
