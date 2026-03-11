import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { ErrorLogService } from '../services/error-log.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const tokenService = inject(TokenService);
    const authService = inject(AuthService);
    const errorLogService = inject(ErrorLogService);
    const token = tokenService.getToken();

    let clonedReq = req;
    if (token) {
        clonedReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                authService.logout();
            }

            // Log ALL errors to the ErrorLogService
            errorLogService.addError({
                status: error.status,
                method: req.method,
                url: req.url,
                message: error.error?.message || error.message || `HTTP ${error.status} Error`,
                detail: error.error?.detail || error.error?.title || undefined
            });

            return throwError(() => error);
        })
    );
};

