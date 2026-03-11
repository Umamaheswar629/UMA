import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorLogComponent } from './error-log.component';
import { ErrorLogService } from '../../core/services/error-log.service';

describe('ErrorLogComponent', () => {
    let component: ErrorLogComponent;
    let fixture: ComponentFixture<ErrorLogComponent>;
    let errorLogService: ErrorLogService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ErrorLogComponent],
            providers: [ErrorLogService]
        }).compileComponents();

        fixture = TestBed.createComponent(ErrorLogComponent);
        component = fixture.componentInstance;
        errorLogService = TestBed.inject(ErrorLogService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show no errors message when empty', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent).toContain('No errors');
    });

    it('should display errors when added', () => {
        errorLogService.addError({ status: 500, method: 'GET', url: '/api/test', message: 'Server Error' });
        fixture.detectChanges();
        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent).toContain('500');
        expect(el.textContent).toContain('Server Error');
    });

    it('should clear errors', () => {
        errorLogService.addError({ status: 404, method: 'GET', url: '/api/test', message: 'Not Found' });
        errorLogService.clearErrors();
        fixture.detectChanges();
        expect(errorLogService.errorCount()).toBe(0);
    });
});
