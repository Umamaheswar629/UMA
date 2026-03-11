import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AgentLayoutComponent } from './agent-layout.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorLogService } from '../../core/services/error-log.service';
import { signal } from '@angular/core';

describe('AgentLayoutComponent', () => {
    let component: AgentLayoutComponent;
    let fixture: ComponentFixture<AgentLayoutComponent>;

    const mockAuthService = {
        currentUser: signal({ fullName: 'Agent User', email: 'agent@test.com', role: 'Agent' }),
        logout: jasmine.createSpy('logout'),
        initializeAuth: jasmine.createSpy('initializeAuth')
    };

    const mockNotificationService = {
        unreadCount: signal(3),
        getUnreadCount: jasmine.createSpy('getUnreadCount')
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AgentLayoutComponent, RouterTestingModule],
            providers: [
                { provide: AuthService, useValue: mockAuthService },
                { provide: NotificationService, useValue: mockNotificationService },
                ErrorLogService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AgentLayoutComponent);
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

    it('should have unread notification count', () => {
        expect(component.unreadCount()).toBe(3);
    });

    it('should call logout', () => {
        component.logout();
        expect(mockAuthService.logout).toHaveBeenCalled();
    });
});
