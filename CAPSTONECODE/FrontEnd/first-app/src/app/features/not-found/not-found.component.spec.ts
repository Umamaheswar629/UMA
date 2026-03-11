import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
    let component: NotFoundComponent;
    let fixture: ComponentFixture<NotFoundComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NotFoundComponent, RouterTestingModule]
        }).compileComponents();

        fixture = TestBed.createComponent(NotFoundComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display 404 content', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent).toContain('404');
    });

    it('should display page not found text', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent).toContain('Page not found');
    });
});
