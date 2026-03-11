import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OfficerLayoutComponent } from './officer-layout.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorLogService } from '../../core/services/error-log.service';
import { signal } from '@angular/core';

describe('OfficerLayoutComponent', () => {
    let component: OfficerLayoutComponent;
    let fixture: ComponentFixture<OfficerLayoutComponent>;

    const mockAuthService = {
        currentUser: signal({ fullName: 'Officer User', email: 'officer@test.com', role: 'ClaimsOfficer' }),
        logout: jasmine.createSpy('logout'),
        initializeAuth: jasmine.createSpy('initializeAuth')
    };

    const mockNotificationService = {
        unreadCount: signal(1),
        getUnreadCount: jasmine.createSpy('getUnreadCount')
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OfficerLayoutComponent, RouterTestingModule],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: NotificationService, useValue: mockNotificationService },
                ErrorLogService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(OfficerLayoutComponent);
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

    it('should call logout', () => {
        component.logout();
        expect(mockAuthService.logout).toHaveBeenCalled();
    });
});
