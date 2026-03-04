import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { TokenService } from './token.service';
import { ApiResponse } from '../models/api-response.model';
import { LoginRequest, RegisterRequest, AuthResponse, AdminCreateUserRequest } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private tokenService = inject(TokenService);
    private router = inject(Router);

    private readonly API_URL = 'https://localhost:7207/api/auth';

    currentUser = signal<AuthResponse | null>(null);
    isLoggedIn = computed(() => this.currentUser() !== null);
    userRole = computed(() => this.currentUser()?.role ?? null);

    constructor() {
        this.initializeAuth();
    }

    initializeAuth(): void {
        const token = this.tokenService.getToken();
        if (token && !this.tokenService.isTokenExpired()) {
            const payload = this.tokenService.getUserFromToken();
            if (payload) {
                // Construct partial AuthResponse from token
                this.currentUser.set({
                    token,
                    tokenExpiry: '', // Not strictly needed here unless calculated
                    userId: payload.userId,
                    fullName: payload.fullName,
                    email: payload.email,
                    role: payload.role
                });
            }
        } else {
            this.tokenService.removeToken();
        }
    }

    login(req: LoginRequest): Observable<ApiResponse<AuthResponse>> {
        return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/login`, req).pipe(
            tap(response => {
                if (response.success && response.data) {
                    this.tokenService.saveToken(response.data.token);
                    this.currentUser.set(response.data);
                }
            })
        );
    }

    register(req: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
        return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/register`, req).pipe(
            tap(response => {
                if (response.success && response.data) {
                    this.tokenService.saveToken(response.data.token);
                    this.currentUser.set(response.data);
                }
            })
        );
    }

    adminCreateUser(req: AdminCreateUserRequest): Observable<ApiResponse<AuthResponse>> {
        return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/admin/create-user`, req);
    }

    logout(): void {
        this.tokenService.removeToken();
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }
}
