import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BillingComponent } from './billing.component';

describe('BillingComponent', () => {
    let component: BillingComponent;
    let fixture: ComponentFixture<BillingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BillingComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(BillingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have invoices signal', () => {
        expect(component.invoices).toBeDefined();
    });

    it('should have loading state', () => {
        expect(component.loading()).toBeDefined();
    });

    it('should render billing content', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.children.length).toBeGreaterThan(0);
    });
});
