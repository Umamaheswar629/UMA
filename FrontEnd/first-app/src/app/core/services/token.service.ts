import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private readonly TOKEN_KEY = 'cipms_token';

    saveToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    removeToken(): void {
        localStorage.removeItem(this.TOKEN_KEY);
    }

    getUserFromToken(): any | null {
        const token = this.getToken();
        if (!token) return null;

        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload);
            const parsed = JSON.parse(decoded);

            return {
                userId: parsed.userId || parsed.sub || parsed.nameid,
                fullName: parsed.fullName || parsed.name || parsed['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                email: parsed.email || parsed['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                role: parsed.role || parsed['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
            };
        } catch (e) {
            return null;
        }
    }

    isTokenExpired(): boolean {
        const token = this.getToken();
        if (!token) return true;

        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload);
            const { exp } = JSON.parse(decoded);
            if (!exp) return false;

            // exp is in seconds, Date.now() is in milliseconds
            return (exp * 1000) < Date.now();
        } catch (e) {
            return true;
        }
    }
}
