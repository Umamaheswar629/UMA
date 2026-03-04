import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyService } from '../../../core/services/policy.service';
import { PolicyDto, PolicyDetailDto } from '../../../core/models/policy.model';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { PaginationComponent } from '../../../shared/components/pagination.component';
import { AlertComponent } from '../../../shared/components/alert.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal.component';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, PaginationComponent, AlertComponent, ConfirmModalComponent],
  templateUrl: './policies.component.html'
})
export class PoliciesComponent implements OnInit {
  private policyService = inject(PolicyService);

  policies = signal<PolicyDto[]>([]);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  selectedPolicy = signal<PolicyDetailDto | null>(null);

  loading = signal(false);
  detailLoading = signal(false);

  showCancelModal = signal(false);
  showRenewModal = signal(false);
  cancelReason = signal('');
  actionLoading = signal(false);

  successMessage = signal('');
  errorMessage = signal('');

  totalPages() {
    return Math.ceil(this.totalCount() / this.pageSize());
  }

  ngOnInit() {
    this.loadPolicies(1);
  }

  loadPolicies(page: number) {
    this.loading.set(true);
    this.policyService.getPolicies({ page: page, pageSize: this.pageSize() }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.policies.set(res.data.items);
          this.totalCount.set(res.data.totalCount);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadPolicies(page);
  }

  loadPolicyDetail(id: number | string) {
    this.detailLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
    this.policyService.getPolicyById(id).subscribe({
      next: (res) => {
        this.detailLoading.set(false);
        if (res.success && res.data) {
          this.selectedPolicy.set(res.data);
        }
      },
      error: () => {
        this.detailLoading.set(false);
        this.errorMessage.set('Failed to load policy details.');
      }
    });
  }

  cancelPolicy() {
    if (!this.selectedPolicy() || !this.cancelReason()) return;
    this.actionLoading.set(true);
    this.policyService.cancelPolicy({ policyId: this.selectedPolicy()!.policyId, reason: this.cancelReason() }).subscribe({
      next: (res) => {
        this.actionLoading.set(false);
        if (res.success) {
          this.showCancelModal.set(false);
          this.cancelReason.set('');
          this.successMessage.set('Policy cancellation requested successfully.');
          this.loadPolicyDetail(this.selectedPolicy()!.policyId); // reload detail
          this.loadPolicies(this.currentPage()); // reload list
        } else {
          this.errorMessage.set(res.message || 'Error cancelling policy');
        }
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Server error');
      }
    });
  }

  renewPolicy() {
    if (!this.selectedPolicy()) return;
    this.showRenewModal.set(false);
    this.detailLoading.set(true);
    this.policyService.renewPolicy({ policyId: this.selectedPolicy()!.policyId }).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage.set('Policy renewed successfully!');
          this.loadPolicyDetail(this.selectedPolicy()!.policyId);
          this.loadPolicies(this.currentPage());
        } else {
          this.detailLoading.set(false);
          this.errorMessage.set(res.message || 'Error renewing policy');
        }
      },
      error: (err) => {
        this.detailLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Server error');
      }
    });
  }
}
