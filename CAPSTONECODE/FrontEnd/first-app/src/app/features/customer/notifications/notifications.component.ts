import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationDto } from '../../../core/models/notification.model';
import { PaginationComponent } from '../../../shared/components/pagination.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h2 class="text-xl font-semibold text-gray-800">Notifications</h2>
        <button 
          (click)="markAllAsRead()" 
          [disabled]="hasUnread() === false || loading()"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors">
          Mark All as Read
        </button>
      </div>

      <div *ngIf="loading() && notifications().length === 0" class="flex justify-center py-10">
        <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <div *ngIf="!loading() && notifications().length === 0" class="bg-white rounded-lg p-10 text-center border border-gray-100">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
        <p class="mt-1 text-sm text-gray-500">You're all caught up! We'll notify you when something important happens.</p>
      </div>

      <div *ngIf="notifications().length > 0" class="space-y-4">
        <!-- Notification list -->
        <div *ngFor="let notif of notifications()" 
          class="bg-white rounded-lg shadow-sm border p-4 transition-all"
          [ngClass]="notif.isRead ? 'border-gray-100' : 'border-l-4 border-l-blue-500 border-t-gray-100 border-r-gray-100 border-b-gray-100 bg-blue-50/30'">
          
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h4 class="text-sm text-gray-900" [ngClass]="notif.isRead ? 'font-medium' : 'font-bold'">{{ notif.title }}</h4>
              <p class="mt-1 text-sm text-gray-600">{{ notif.message }}</p>
              <p class="mt-2 text-xs text-gray-400">{{ notif.createdAt | date:'medium' }}</p>
            </div>
            
            <div *ngIf="!notif.isRead">
              <button (click)="markAsRead(notif)" class="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors">
                Mark as read
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-100 p-2">
          <app-pagination *ngIf="totalPages() > 1"
            [currentPage]="currentPage()"
            [totalPages]="totalPages()"
            (pageChange)="onPageChange($event)">
          </app-pagination>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);

  notifications = signal<NotificationDto[]>([]);
  currentPage = signal(1);
  totalPages = signal(1);
  loading = signal(false);

  ngOnInit() {
    this.loadNotifications(1);
  }

  loadNotifications(page: number) {
    this.loading.set(true);
    this.notificationService.getNotifications(page, 10).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.notifications.set(res.data);
          this.totalPages.set(1);
          this.currentPage.set(page);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(page: number) {
    this.loadNotifications(page);
  }

  hasUnread(): boolean {
    return this.notifications().some(n => !n.isRead);
  }

  markAsRead(notif: NotificationDto) {
    this.notificationService.markAsRead(notif.id).subscribe(res => {
      if (res.success) {
        // Update local signal to avoid network jitter UI
        const updated = this.notifications().map(n => n.id === notif.id ? { ...n, isRead: true } : n);
        this.notifications.set(updated);
        // decrement main service unread counter
        const currentCount = this.notificationService.unreadCount();
        if (currentCount > 0) {
          this.notificationService.unreadCount.set(currentCount - 1);
        }
      }
    });
  }

  markAllAsRead() {
    if (!this.hasUnread()) return;
    this.loading.set(true);
    this.notificationService.markAllAsRead().subscribe(res => {
      this.loading.set(false);
      if (res.success) {
        const updated = this.notifications().map(n => ({ ...n, isRead: true }));
        this.notifications.set(updated);
        this.notificationService.unreadCount.set(0);
      }
    });
  }
}
