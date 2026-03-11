import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CustomerLayoutComponent } from './customer-layout.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorLogService } from '../../core/services/error-log.service';
import { signal } from '@angular/core';

describe('CustomerLayoutComponent', () => {
    let component: CustomerLayoutComponent;
    let fixture: ComponentFixture<CustomerLayoutComponent>;

    const mockAuthService = {
        currentUser: signal({ fullName: 'John Doe', email: 'john@test.com', role: 'Customer' }),
        logout: jasmine.createSpy('logout'),
        initializeAuth: jasmine.createSpy('initializeAuth')
    };

    const mockNotificationService = {
        unreadCount: signal(5),
        getUnreadCount: jasmine.createSpy('getUnreadCount')
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CustomerLayoutComponent, RouterTestingModule],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: NotificationService, useValue: mockNotificationService },
                ErrorLogService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(CustomerLayoutComponent);
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

    it('should display user initials', () => {
        expect(component.userInitials()).toBe('JD');
    });

    it('should show unread count', () => {
        expect(component.unreadCount()).toBe(5);
    });

    it('should call logout', () => {
        component.logout();
        expect(mockAuthService.logout).toHaveBeenCalled();
    });
});
