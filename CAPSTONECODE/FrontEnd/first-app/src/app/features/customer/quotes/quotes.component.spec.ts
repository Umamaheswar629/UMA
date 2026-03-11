import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { QuotesComponent } from './quotes.component';

describe('QuotesComponent', () => {
    let component: QuotesComponent;
    let fixture: ComponentFixture<QuotesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [QuotesComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(QuotesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have insurance types signal', () => {
        expect(component.insuranceTypes).toBeDefined();
    });

    it('should have plans signal', () => {
        expect(component.plans).toBeDefined();
    });

    it('should have generating state', () => {
        expect(component.generating()).toBeFalse();
    });

    it('should have my quotes signal', () => {
        expect(component.myQuotes).toBeDefined();
    });
});
