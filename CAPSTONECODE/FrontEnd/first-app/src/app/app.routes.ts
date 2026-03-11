import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./features/landing/landing.component').then(c => c.LandingComponent) },
    { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent) },
    { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(c => c.RegisterComponent) },
    { path: 'unauthorized', loadComponent: () => import('./features/unauthorized/unauthorized.component').then(c => c.UnauthorizedComponent) },
    {
        path: 'admin',
        loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(c => c.AdminLayoutComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Admin'] },
        children: [
            { path: 'dashboard', loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(c => c.AdminDashboardComponent) },
            { path: 'users', loadComponent: () => import('./features/admin/users/users.component').then(c => c.UsersComponent) },
            { path: 'insurance', loadComponent: () => import('./features/admin/insurance/insurance.component').then(c => c.InsuranceComponent) },
            { path: 'analytics', loadComponent: () => import('./features/admin/analytics/analytics.component').then(c => c.AnalyticsComponent) },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    {
        path: 'customer',
        loadComponent: () => import('./layouts/customer-layout/customer-layout.component').then(c => c.CustomerLayoutComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Customer'] },
        children: [
            { path: 'dashboard', loadComponent: () => import('./features/customer/customer-dashboard/customer-dashboard.component').then(c => c.CustomerDashboardComponent) },
            { path: 'business-profile', loadComponent: () => import('./features/customer/business-profile/business-profile.component').then(c => c.BusinessProfileComponent) },
            { path: 'quotes', loadComponent: () => import('./features/customer/quotes/quotes.component').then(c => c.QuotesComponent) },
            { path: 'policies', loadComponent: () => import('./features/customer/policies/policies.component').then(c => c.PoliciesComponent) },
            { path: 'billing', loadComponent: () => import('./features/customer/billing/billing.component').then(c => c.BillingComponent) },
            { path: 'claims', loadComponent: () => import('./features/customer/claims/claims.component').then(c => c.ClaimsComponent) },
            { path: 'notifications', loadComponent: () => import('./features/customer/notifications/notifications.component').then(c => c.NotificationsComponent) },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    {
        path: 'agent',
        loadComponent: () => import('./layouts/agent-layout/agent-layout.component').then(c => c.AgentLayoutComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Agent'] },
        children: [
            { path: 'dashboard', loadComponent: () => import('./features/agent/agent-dashboard/agent-dashboard.component').then(c => c.AgentDashboardComponent) },
            { path: 'policies', loadComponent: () => import('./features/agent/agent-policies/agent-policies.component').then(c => c.AgentPoliciesComponent) },
            { path: 'commissions', loadComponent: () => import('./features/agent/agent-commissions/agent-commissions.component').then(c => c.AgentCommissionsComponent) },
            { path: 'notifications', loadComponent: () => import('./features/customer/notifications/notifications.component').then(c => c.NotificationsComponent) },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    {
        path: 'officer',
        loadComponent: () => import('./layouts/officer-layout/officer-layout.component').then(c => c.OfficerLayoutComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ClaimsOfficer'] },
        children: [
            { path: 'dashboard', loadComponent: () => import('./features/officer/officer-dashboard/officer-dashboard.component').then(c => c.OfficerDashboardComponent) },
            { path: 'claims', loadComponent: () => import('./features/officer/claims/claims.component').then(c => c.OfficerClaimsComponent) },
            { path: 'notifications', loadComponent: () => import('./features/customer/notifications/notifications.component').then(c => c.NotificationsComponent) },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then(c => c.NotFoundComponent) }
];
