import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
    let component: BadgeComponent;
    let fixture: ComponentFixture<BadgeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BadgeComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(BadgeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the status text', () => {
        component.status = 'Active';
        component.ngOnChanges({ status: { currentValue: 'Active', previousValue: '', firstChange: true, isFirstChange: () => true } });
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Active');
    });

    it('should apply green classes for active status', () => {
        component.status = 'Active';
        component.ngOnChanges({ status: { currentValue: 'Active', previousValue: '', firstChange: true, isFirstChange: () => true } });
        fixture.detectChanges();
        expect(component.colorClasses()).toContain('green');
    });

    it('should apply red classes for cancelled status', () => {
        component.status = 'Cancelled';
        component.ngOnChanges({ status: { currentValue: 'Cancelled', previousValue: '', firstChange: true, isFirstChange: () => true } });
        fixture.detectChanges();
        expect(component.colorClasses()).toContain('red');
    });

    it('should apply yellow classes for pending status', () => {
        component.status = 'Pending';
        component.ngOnChanges({ status: { currentValue: 'Pending', previousValue: '', firstChange: true, isFirstChange: () => true } });
        fixture.detectChanges();
        expect(component.colorClasses()).toContain('yellow');
    });

    it('should apply yellow classes for PendingApproval status', () => {
        component.status = 'PendingApproval';
        component.ngOnChanges({ status: { currentValue: 'PendingApproval', previousValue: '', firstChange: true, isFirstChange: () => true } });
        fixture.detectChanges();
        expect(component.colorClasses()).toContain('yellow');
    });
});
