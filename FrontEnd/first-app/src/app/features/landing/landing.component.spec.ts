import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
    let component: LandingComponent;
    let fixture: ComponentFixture<LandingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LandingComponent, RouterTestingModule]
        }).compileComponents();

        fixture = TestBed.createComponent(LandingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render the landing page content', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.children.length).toBeGreaterThan(0);
    });

    it('should have a call-to-action', () => {
        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('a') || el.querySelector('button')).toBeTruthy();
    });
});
