import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PoliciesComponent } from './policies.component';

describe('PoliciesComponent', () => {
    let component: PoliciesComponent;
    let fixture: ComponentFixture<PoliciesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PoliciesComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(PoliciesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have policies signal', () => {
        expect(component.policies).toBeDefined();
    });

    it('should have loading state', () => {
        expect(component.loading()).toBeDefined();
    });

    it('should have pagination state', () => {
        expect(component.currentPage()).toBeDefined();
        expect(component.totalCount()).toBeDefined();
    });
});
