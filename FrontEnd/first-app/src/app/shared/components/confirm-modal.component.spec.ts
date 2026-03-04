import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
    let component: ConfirmModalComponent;
    let fixture: ComponentFixture<ConfirmModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConfirmModalComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit confirmed event on confirm', () => {
        spyOn(component.confirmed, 'emit');
        component.onConfirm();
        expect(component.confirmed.emit).toHaveBeenCalled();
    });

    it('should emit cancelled event on cancel', () => {
        spyOn(component.cancelled, 'emit');
        component.onCancel();
        expect(component.cancelled.emit).toHaveBeenCalled();
    });

    it('should display title and message', () => {
        component.title = 'Confirm Delete';
        component.message = 'Are you sure?';
        component.visible = true;
        fixture.detectChanges();
        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent).toContain('Confirm Delete');
        expect(el.textContent).toContain('Are you sure?');
    });
});
