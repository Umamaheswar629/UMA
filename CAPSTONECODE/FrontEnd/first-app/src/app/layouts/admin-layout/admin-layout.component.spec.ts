import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminLayoutComponent } from './admin-layout.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { signal } from '@angular/core';

describe('AdminLayoutComponent', () => {
    let component: AdminLayoutComponent;
    let fixture: ComponentFixture<AdminLayoutComponent>;

    const mockAuthService = {
        currentUser: signal({ fullName: 'Admin User', email: 'admin@test.com', role: 'Admin' }),
        logout: jasmine.createSpy('logout'),
        initializeAuth: jasmine.createSpy('initializeAuth')
    };

    const mockNotificationService = {
        unreadCount: signal(0),
        getUnreadCount: jasmine.createSpy('getUnreadCount')
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminLayoutComponent, RouterTestingModule],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: NotificationService, useValue: mockNotificationService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AdminLayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle sidebar', () => {
        const initial = component.sidebarOpen();
        component.toggleSidebar();
        expect(component.sidebarOpen()).toBe(!initial);
    });

    it('should call logout on authService', () => {
        component.logout();
        expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should return user initials', () => {
        expect(component.userInitials()).toBe('AU');
    });
});
