import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AgentCommissionsComponent } from './agent-commissions.component';

describe('AgentCommissionsComponent', () => {
    let component: AgentCommissionsComponent;
    let fixture: ComponentFixture<AgentCommissionsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AgentCommissionsComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(AgentCommissionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have commissions signal', () => {
        expect(component.commissions).toBeDefined();
    });

    it('should have pagination state', () => {
        expect(component.currentPage()).toBeDefined();
    });
});
