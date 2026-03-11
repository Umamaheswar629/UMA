import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { UserDto, PagedResult, UpdateRoleRequest } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private readonly API_URL = 'https://localhost:7207/api/users';

    getAllUsers(page: number, pageSize: number, role?: string, search?: string): Observable<ApiResponse<PagedResult<UserDto>>> {
        let params = new HttpParams()
            .set('page', page)
            .set('pageSize', pageSize);
        if (role) {
            params = params.set('role', role);
        }
        if (search) {
            params = params.set('search', search);
        }
        return this.http.get<ApiResponse<PagedResult<UserDto>>>(this.API_URL, { params });
    }

    getUserById(id: number | string): Observable<ApiResponse<UserDto>> {
        return this.http.get<ApiResponse<UserDto>>(`${this.API_URL}/${id}`);
    }

    getMe(): Observable<ApiResponse<UserDto>> {
        return this.http.get<ApiResponse<UserDto>>(`${this.API_URL}/me`);
    }

    updateRole(req: UpdateRoleRequest): Observable<ApiResponse<UserDto>> {
        return this.http.put<ApiResponse<UserDto>>(`${this.API_URL}/role`, req);
    }

    toggleStatus(id: number | string): Observable<ApiResponse<boolean>> {
        return this.http.patch<ApiResponse<boolean>>(`${this.API_URL}/${id}/toggle-status`, {});
    }
}
