import { Component, effect, inject, signal, computed, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserDto } from '../../../core/models/user.model';
import { DataTableComponent } from '../../../shared/components/data-table.component';
import { PaginationComponent } from '../../../shared/components/pagination.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, BadgeComponent],
  templateUrl: './users.component.html'
})
export class UsersComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  users = signal<UserDto[]>([]);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  roleFilter = signal('');
  loading = signal(false);

  showCreateModal = signal(false);
  fullName = signal('');
  email = signal('');
  password = signal('');
  role = signal(2); // Default to Agent
  createError = signal('');
  createLoading = signal(false);

  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));

  private searchTimeout: any;

  constructor() {
    effect(() => {
      // Re-run whenever these signals change
      const page = this.currentPage();
      const size = this.pageSize();
      const term = this.searchTerm();
      const rFilter = this.roleFilter();

      untracked(() => {
        this.loadUsers(page, size, term, rFilter);
      });
    });
  }

  onSearchChange(val: string) {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.searchTerm.set(val);
      this.currentPage.set(1);
    }, 500);
  }

  loadUsers(page: number, size: number, search: string, role: string) {
    this.loading.set(true);
    this.userService.getAllUsers(page, size, role, search).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.users.set(res.data.items);
          this.totalCount.set(res.data.totalCount);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  getRoleValue(roleString: string | number): number {
    if (roleString === 'Admin') return 1;
    if (roleString === 'Agent') return 2;
    if (roleString === 'Customer') return 3;
    if (roleString === 'ClaimsOfficer') return 4;
    return 3; // Default Customer
  }

  updateRole(userId: string | number, newRole: number) {
    this.userService.updateRole({ userId, newRole }).subscribe(res => {
      if (res.success) {
        // Refresh silently
        this.loadUsers(this.currentPage(), this.pageSize(), this.searchTerm(), this.roleFilter());
      }
    });
  }

  toggleStatus(userId: string | number) {
    this.userService.toggleStatus(userId).subscribe(res => {
      if (res.success) {
        // Refresh silently
        this.loadUsers(this.currentPage(), this.pageSize(), this.searchTerm(), this.roleFilter());
      }
    });
  }

  createStaff() {
    this.createLoading.set(true);
    this.createError.set('');
    this.authService.adminCreateUser({
      fullName: this.fullName(),
      email: this.email(),
      password: this.password(),
      role: Number(this.role())
    }).subscribe({
      next: (res) => {
        this.createLoading.set(false);
        if (res.success) {
          this.closeModal();
          this.loadUsers(this.currentPage(), this.pageSize(), this.searchTerm(), this.roleFilter());
        } else {
          this.createError.set(res.message || 'Error creating user');
        }
      },
      error: (err) => {
        this.createLoading.set(false);
        this.createError.set(err.error?.message || 'Server error');
      }
    });
  }

  closeModal() {
    this.showCreateModal.set(false);
    this.fullName.set('');
    this.email.set('');
    this.password.set('');
    this.role.set(2);
    this.createError.set('');
  }
}
