import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OfficerClaimsComponent } from './claims.component';

describe('OfficerClaimsComponent', () => {
    let component: OfficerClaimsComponent;
    let fixture: ComponentFixture<OfficerClaimsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OfficerClaimsComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(OfficerClaimsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have claims signal', () => {
        expect(component.claims).toBeDefined();
    });

    it('should have loading state', () => {
        expect(component.loading()).toBeDefined();
    });

    it('should have pagination state', () => {
        expect(component.currentPage()).toBeDefined();
    });
});
