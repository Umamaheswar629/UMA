import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AgentDashboardComponent } from './agent-dashboard.component';

describe('AgentDashboardComponent', () => {
    let component: AgentDashboardComponent;
    let fixture: ComponentFixture<AgentDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AgentDashboardComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(AgentDashboardComponent);
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
