import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AgentPoliciesComponent } from './agent-policies.component';

describe('AgentPoliciesComponent', () => {
    let component: AgentPoliciesComponent;
    let fixture: ComponentFixture<AgentPoliciesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AgentPoliciesComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(AgentPoliciesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have policies signal', () => {
        expect(component.policies).toBeDefined();
    });

    it('should have status filter signal', () => {
        expect(component.statusFilter()).toBe('');
    });

    it('should compute total pages', () => {
        expect(component.totalPages()).toBeDefined();
    });
});
