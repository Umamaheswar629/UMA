import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const expectedRoles = route.data['roles'] as Array<string | number>;
    const userRole = authService.userRole();

    if (!expectedRoles || expectedRoles.length === 0) {
        return true;
    }

    if (userRole && expectedRoles.includes(userRole)) {
        return true;
    }

    router.navigate(['/unauthorized']);
    return false;
};
