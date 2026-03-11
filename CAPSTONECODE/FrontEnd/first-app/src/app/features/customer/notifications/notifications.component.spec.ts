import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NotificationsComponent } from './notifications.component';

describe('NotificationsComponent', () => {
    let component: NotificationsComponent;
    let fixture: ComponentFixture<NotificationsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NotificationsComponent],
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(NotificationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have notifications signal', () => {
        expect(component.notifications).toBeDefined();
    });

    it('should have loading state', () => {
        expect(component.loading()).toBeDefined();
    });

    it('should have pagination state', () => {
        expect(component.currentPage()).toBeDefined();
    });
});
