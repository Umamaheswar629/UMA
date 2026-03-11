import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoginComponent, RouterTestingModule],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have email and password fields', () => {
        expect(component.email).toBeDefined();
        expect(component.password).toBeDefined();
    });

    it('should have loading state', () => {
        expect(component.loading()).toBeFalse();
    });

    it('should render login form', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('form') || el.querySelector('input')).toBeTruthy();
    });
});
