import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AdminDashboardComponent } from './admin-dashboard.component';

describe('AdminDashboardComponent', () => {
    let component: AdminDashboardComponent;
    let fixture: ComponentFixture<AdminDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminDashboardComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(AdminDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have loading state initially true', () => {
        expect(component.loading()).toBeTrue();
    });

    it('should render content area', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('div')).toBeTruthy();
    });
});
