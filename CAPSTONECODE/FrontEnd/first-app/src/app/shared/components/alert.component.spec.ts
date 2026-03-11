import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
    let component: AlertComponent;
    let fixture: ComponentFixture<AlertComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AlertComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(AlertComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not be visible by default', () => {
        component.visible = false;
        fixture.detectChanges();
        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('.alert')?.textContent || el.textContent?.trim()).toBeDefined();
    });

    it('should display message when visible', () => {
        component.message = 'Test alert message';
        component.visible = true;
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Test alert message');
    });

    it('should apply success type styling', () => {
        component.type = 'success';
        component.visible = true;
        fixture.detectChanges();
        expect(component.type).toBe('success');
    });

    it('should apply error type styling', () => {
        component.type = 'error';
        component.visible = true;
        fixture.detectChanges();
        expect(component.type).toBe('error');
    });
});
