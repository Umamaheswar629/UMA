import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { InsuranceComponent } from './insurance.component';

describe('InsuranceComponent', () => {
    let component: InsuranceComponent;
    let fixture: ComponentFixture<InsuranceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InsuranceComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(InsuranceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have types signal', () => {
        expect(component.types).toBeDefined();
    });

    it('should render insurance management UI', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent).toBeTruthy();
    });
});
