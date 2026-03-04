import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { BusinessProfileDto, CreateBusinessProfileRequest, UpdateBusinessProfileRequest } from '../models/business-profile.model';

@Injectable({
    providedIn: 'root'
})
export class BusinessProfileService {
    private http = inject(HttpClient);
    private readonly API_URL = 'https://localhost:7207/api/BusinessProfile';

    getMyProfile(): Observable<ApiResponse<BusinessProfileDto>> {
        return this.http.get<ApiResponse<BusinessProfileDto>>(this.API_URL);
    }

    create(req: CreateBusinessProfileRequest): Observable<ApiResponse<BusinessProfileDto>> {
        return this.http.post<ApiResponse<BusinessProfileDto>>(this.API_URL, req);
    }

    update(req: UpdateBusinessProfileRequest): Observable<ApiResponse<BusinessProfileDto>> {
        return this.http.put<ApiResponse<BusinessProfileDto>>(this.API_URL, req);
    }
}
