import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OfficerDashboardComponent } from './officer-dashboard.component';

describe('OfficerDashboardComponent', () => {
    let component: OfficerDashboardComponent;
    let fixture: ComponentFixture<OfficerDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OfficerDashboardComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(OfficerDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have loading state', () => {
        expect(component.loading()).toBeDefined();
    });

    it('should render dashboard content', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.children.length).toBeGreaterThan(0);
    });
});
