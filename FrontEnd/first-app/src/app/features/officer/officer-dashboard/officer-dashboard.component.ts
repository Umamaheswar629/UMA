import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { RouterModule, Router } from '@angular/router';
import { ClaimsService } from '../../../core/services/claims.service';
import { ClaimDto } from '../../../core/models/claims.model';
import { StatCardComponent } from '../../../shared/components/stat-card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent, BadgeComponent],
  templateUrl: './officer-dashboard.component.html'
})
export class OfficerDashboardComponent implements OnInit {
  private titleService = inject(Title);
  private claimsService = inject(ClaimsService);
  private router = inject(Router);

  claims = signal<ClaimDto[]>([]);
  loading = signal(true);

  totalAssigned = computed(() => this.claims().length);
  pendingReview = computed(() => this.claims().filter(c => c.status === 'Filed' || c.status === 'UnderReview').length);
  approvedCount = computed(() => this.claims().filter(c => c.status === 'Approved' || c.status === 'Settled').length);
  rejectedCount = computed(() => this.claims().filter(c => c.status === 'Rejected').length);

  // Computed signal to sort claims oldest first
  sortedClaims = computed(() => {
    return [...this.claims()].sort((a, b) => new Date(a.filedAt).getTime() - new Date(b.filedAt).getTime());
  });

  ngOnInit() {
    this.titleService.setTitle('CIPMS | Officer Dashboard');
    this.loadClaims();
  }

  loadClaims() {
    this.loading.set(true);
    // Note: API might need to properly scope this to assigned claims exclusively.
    // The instructions say the backend filters it automatically based on auth context.
    this.claimsService.getClaims({ page: 1, pageSize: 100 }).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.claims.set(res.data.items);
        }
      },
      error: (err: any) => {
        this.loading.set(false);
      }
    });
  }

  goToClaims() {
    this.router.navigate(['/officer/claims']);
  }
}
