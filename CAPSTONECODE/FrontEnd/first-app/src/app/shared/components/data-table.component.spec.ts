import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTableComponent } from './data-table.component';

describe('DataTableComponent', () => {
    let component: DataTableComponent;
    let fixture: ComponentFixture<DataTableComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DataTableComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(DataTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should accept columns input', () => {
        component.columns = [{ key: 'name', label: 'Name' }];
        fixture.detectChanges();
        expect(component.columns.length).toBe(1);
    });

    it('should accept data input', () => {
        component.data = [{ name: 'Test' }];
        fixture.detectChanges();
        expect(component.data.length).toBe(1);
    });

    it('should have loading input defaulting to false', () => {
        expect(component.loading).toBeFalse();
    });

    it('should have default empty message', () => {
        expect(component.emptyMessage).toBe('No data available.');
    });
});
