import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ClaimsComponent } from './claims.component';

describe('ClaimsComponent', () => {
    let component: ClaimsComponent;
    let fixture: ComponentFixture<ClaimsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ClaimsComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(ClaimsComponent);
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
});
