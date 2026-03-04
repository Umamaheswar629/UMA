import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnauthorizedComponent } from './unauthorized.component';
import { AuthService } from '../../core/services/auth.service';

describe('UnauthorizedComponent', () => {
    let component: UnauthorizedComponent;
    let fixture: ComponentFixture<UnauthorizedComponent>;

    const mockAuthService = {
        logout: jasmine.createSpy('logout'),
        currentUser: () => null,
        initializeAuth: jasmine.createSpy('initializeAuth')
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UnauthorizedComponent],
            providers: [
                { provide: AuthService, useValue: mockAuthService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UnauthorizedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display access denied content', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent).toContain('Access Denied');
    });
});
