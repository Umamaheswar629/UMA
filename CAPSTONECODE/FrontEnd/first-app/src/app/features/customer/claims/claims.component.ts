import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimsService } from '../../../core/services/claims.service';
import { PolicyService } from '../../../core/services/policy.service';
import { ClaimDto } from '../../../core/models/claims.model';
import { PolicyDto } from '../../../core/models/policy.model';
import { DataTableComponent } from '../../../shared/components/data-table.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { AlertComponent } from '../../../shared/components/alert.component';

@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, AlertComponent],
  templateUrl: './claims.component.html'
})
export class ClaimsComponent implements OnInit {
  private claimsService = inject(ClaimsService);
  private policyService = inject(PolicyService);

  activeTab = signal<'list' | 'new'>('list');
  claims = signal<ClaimDto[]>([]);
  totalCount = signal(0);
  currentPage = signal(1);
  policies = signal<PolicyDto[]>([]); // active policies for dropdown

  selectedClaim = signal<ClaimDto | null>(null);

  loading = signal(false);
  submitting = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // Form signals
  policyId = signal<number>(0);
  incidentDate = signal('');
  incidentType = signal('');
  description = signal('');
  estimatedAmount = signal<number>(0);
  selectedFile = signal<File | null>(null);

  maxDate = new Date().toISOString().split('T')[0];

  ngOnInit() {
    this.loadClaims();
    this.loadActivePolicies();
  }

  loadClaims() {
    this.loading.set(true);
    this.claimsService.getClaims({ page: this.currentPage(), pageSize: 50 }).subscribe({
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

  loadActivePolicies() {
    this.policyService.getPolicies({ page: 1, pageSize: 100 }).subscribe((res: any) => {
      if (res.success && res.data) {
        // filter purely active policies usually, but leaving it open to whatever API returns for now
        this.policies.set(res.data.items.filter((p: any) => p.status === 'Active'));
      }
    });
  }

  selectClaim(claim: ClaimDto) {
    this.selectedClaim.set(claim);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
    }
  }

  submitClaim() {
    this.submitting.set(true);
    this.errorMsg.set('');

    this.claimsService.createClaim({
      policyId: this.policyId(),
      incidentDate: this.incidentDate() + 'T00:00:00Z',
      incidentType: this.incidentType(),
      description: this.description(),
      estimatedAmount: this.estimatedAmount()
    }).subscribe({
      next: (res) => {
        if (res.success && res.data?.claimId) {
          // If a file was selected, upload it now
          if (this.selectedFile()) {
            this.claimsService.uploadClaimDocument(Number(res.data.claimId), this.selectedFile()!).subscribe({
              next: () => this.finalizeSubmission(),
              error: () => {
                this.errorMsg.set('Claim filed, but document upload failed.');
                this.finalizeSubmission();
              }
            });
          } else {
            this.finalizeSubmission();
          }
        } else {
          this.submitting.set(false);
          this.errorMsg.set(res.message || 'Error filing claim');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err.error?.message || 'Server error');
      }
    });
  }

  private finalizeSubmission() {
    this.submitting.set(false);
    this.successMsg.set('Claim filed successfully! Tracking number assigned.');

    // Reset form
    this.policyId.set(0);
    this.incidentDate.set('');
    this.incidentType.set('');
    this.description.set('');
    this.estimatedAmount.set(0);
    this.selectedFile.set(null);

    // Clear file input DOM element if present
    const fileInput = document.getElementById('claim-document') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    // Switch tab & reload with slight delay for backend commit
    this.activeTab.set('list');
    setTimeout(() => {
      this.loadClaims();
    }, 400);
  }
}
