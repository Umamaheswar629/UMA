import { Component, OnInit, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ClaimsService } from '../../../core/services/claims.service';
import { ClaimDto } from '../../../core/models/claims.model';
import { DataTableComponent } from '../../../shared/components/data-table.component';
import { PaginationComponent } from '../../../shared/components/pagination.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { AlertComponent } from '../../../shared/components/alert.component';

@Component({
  selector: 'app-officer-claims',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, BadgeComponent, AlertComponent],
  templateUrl: './claims.component.html'
})
export class OfficerClaimsComponent implements OnInit {
  private titleService = inject(Title);
  private claimsService = inject(ClaimsService);

  claims = signal<ClaimDto[]>([]);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  statusFilter = signal('');

  loading = signal(false);

  // Modal State
  selectedClaim = signal<ClaimDto | null>(null);
  showDecisionModal = signal(false);

  // Form State
  decision = signal<'Approved' | 'Rejected'>('Approved');
  settlementAmount = signal<number>(0);
  notes = signal('');
  decisionLoading = signal(false);

  successMsg = signal('');
  errorMsg = signal('');

  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Filed', value: 'Filed' },
    { label: 'Under Review', value: 'UnderReview' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Settled', value: 'Settled' }
  ];

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const status = this.statusFilter();
      untracked(() => {
        this.loadClaims(page, status);
      });
    });
  }

  ngOnInit() {
    this.titleService.setTitle('CIPMS | Claims Processing');
  }

  totalPages() {
    return Math.ceil(this.totalCount() / this.pageSize()) || 1;
  }

  // Helper purely for UI
  sortedClaims() {
    // Ensuring oldest first if backend didn't sort correctly
    return [...this.claims()].sort((a, b) => new Date(a.filedAt).getTime() - new Date(b.filedAt).getTime());
  }

  loadClaims(page: number, status: string) {
    this.loading.set(true);
    this.claimsService.getClaims({ page: page, pageSize: this.pageSize(), status }).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.claims.set(res.data.items);
          this.totalCount.set(res.data.totalCount);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  openDecisionModal(claim: ClaimDto) {
    this.selectedClaim.set(claim);
    // Determine if claim is in a processable state
    if (this.isProcessable(claim.status)) {
      // By opening detail, we might call back to immediately switch status from 'Submitted' to 'UnderReview'
      // That depends on business logic, here we just show the form.
      this.decision.set('Approved');
      this.settlementAmount.set(claim.estimatedAmount || 0); // Pre-fill with estimated
      this.notes.set('');
    }
    this.showDecisionModal.set(true);
  }

  closeModal() {
    this.showDecisionModal.set(false);
    this.selectedClaim.set(null);
  }

  isProcessable(status: string) {
    return status === 'Filed' || status === 'UnderReview';
  }

  isFormValid() {
    if (!this.notes().trim()) return false;
    if (this.decision() === 'Approved') {
      const maxLimit = (this.selectedClaim() as any)?.coverageLimit || 99999999;
      if (this.settlementAmount() <= 0 || this.settlementAmount() > maxLimit) {
        return false;
      }
    }
    return true;
  }

  submitDecision() {
    if (!this.selectedClaim()) return;

    this.decisionLoading.set(true);

    const currentClaim = this.selectedClaim()!;

    this.claimsService.processDecision({
      claimId: Number(currentClaim.claimId),
      decision: this.decision(),
      notes: this.notes() || 'Decision submitted',
      settlementAmount: this.decision() === 'Approved' ? Number(this.settlementAmount()) || 0 : undefined
    }).subscribe({
      next: (res: any) => {
        this.decisionLoading.set(false);
        if (res.success) {
          this.successMsg.set(`Claim ${this.selectedClaim()!.claimNumber} successfully ${this.decision().toLowerCase()}.`);
          this.closeModal();
          this.loadClaims(this.currentPage(), this.statusFilter());
        } else {
          this.errorMsg.set(res.message || 'Error processing decision');
        }
      },
      error: (err: any) => {
        this.decisionLoading.set(false);
        this.errorMsg.set(err.error?.message || 'Server error occurred');
      }
    });
  }
}
