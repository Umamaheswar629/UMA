import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BusinessProfileComponent } from './business-profile.component';

describe('BusinessProfileComponent', () => {
    let component: BusinessProfileComponent;
    let fixture: ComponentFixture<BusinessProfileComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BusinessProfileComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(BusinessProfileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have profile signal', () => {
        expect(component.profile).toBeDefined();
    });

    it('should have loading state', () => {
        expect(component.loading()).toBeDefined();
    });

    it('should render form elements', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.children.length).toBeGreaterThan(0);
    });
});
