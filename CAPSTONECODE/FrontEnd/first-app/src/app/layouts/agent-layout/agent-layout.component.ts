import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-agent-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-layout.component.html',
  styles: [`
    :host { display: block; }
  `]
})
export class AgentLayoutComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);

  sidebarOpen = signal(true);
  currentUser = this.authService.currentUser;
  unreadCount = this.notificationService.unreadCount;

  private refreshInterval: any;

  ngOnInit() {
    this.notificationService.getUnreadCount();
    this.refreshInterval = setInterval(() => {
      this.notificationService.getUnreadCount();
    }, 60000);

    if (window.innerWidth < 768) {
      this.sidebarOpen.set(false);
    }
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  logout(): void {
    this.authService.logout();
  }

  userInitials(): string {
    const name = this.currentUser()?.fullName || '';
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
