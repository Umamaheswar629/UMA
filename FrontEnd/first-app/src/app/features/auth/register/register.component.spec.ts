import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RegisterComponent, RouterTestingModule],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have registration fields', () => {
        expect(component.fullName).toBeDefined();
        expect(component.email).toBeDefined();
        expect(component.password).toBeDefined();
    });

    it('should have loading state', () => {
        expect(component.loading()).toBeFalse();
    });

    it('should render registration form', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('form') || el.querySelector('input')).toBeTruthy();
    });
});
