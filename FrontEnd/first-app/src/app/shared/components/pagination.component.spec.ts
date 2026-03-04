import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
    let component: PaginationComponent;
    let fixture: ComponentFixture<PaginationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PaginationComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(PaginationComponent);
        component = fixture.componentInstance;
        component.currentPage = 1;
        component.totalPages = 5;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit pageChange on page click', () => {
        spyOn(component.pageChange, 'emit');
        component.onPage(3);
        expect(component.pageChange.emit).toHaveBeenCalledWith(3);
    });

    it('should emit pageChange on next', () => {
        spyOn(component.pageChange, 'emit');
        component.onNext();
        expect(component.pageChange.emit).toHaveBeenCalledWith(2);
    });

    it('should not emit on prev when on first page', () => {
        spyOn(component.pageChange, 'emit');
        component.onPrev();
        expect(component.pageChange.emit).not.toHaveBeenCalled();
    });

    it('should display current page info', () => {
        fixture.detectChanges();
        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent).toContain('1');
    });
});
