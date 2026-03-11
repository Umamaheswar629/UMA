export interface LoginRequest {
    email?: string;
    password?: string;
}

export interface RegisterRequest {
    fullName?: string;
    email?: string;
    password?: string;
    role?: number;
}

export interface AuthResponse {
    token: string;
    tokenExpiry: string;
    userId: number | string;
    fullName: string;
    email: string;
    role: string;
}

export interface AdminCreateUserRequest {
    fullName?: string;
    email?: string;
    password?: string;
    role?: number;
}
