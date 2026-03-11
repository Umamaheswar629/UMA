import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { RouterModule, Router } from '@angular/router';
import { ClaimsService } from '../../../core/services/claims.service';
import { ClaimDto } from '../../../core/models/claims.model';

import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
  selector: 'app-officer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BadgeComponent],
  templateUrl: './officer-dashboard.component.html',
  styles: [`
    :host { display: block; }

    .dashboard-stat-card {
      position: relative;
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1rem;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: 1rem;
      box-shadow: 0 4px 24px rgba(100, 116, 139, 0.08), 0 1px 4px rgba(0,0,0,0.04);
      overflow: hidden;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
    }
    .dashboard-stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(100, 116, 139, 0.14), 0 4px 12px rgba(0,0,0,0.06);
    }
    .stat-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      border-radius: 0.75rem;
      flex-shrink: 0;
    }
    .stat-content { display: flex; flex-direction: column; min-width: 0; }
    .stat-label { font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: #1f2937; line-height: 1.2; }
    .stat-accent { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; opacity: 0; transition: opacity 0.3s ease; }
    .dashboard-stat-card:hover .stat-accent { opacity: 1; }

    .dashboard-glass-card {
      background: rgba(255, 255, 255, 0.80);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 1.25rem;
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(100, 116, 139, 0.08), 0 2px 8px rgba(0,0,0,0.03);
      transition: box-shadow 0.3s ease;
    }
    .dashboard-glass-card:hover {
      box-shadow: 0 16px 48px rgba(100, 116, 139, 0.12), 0 4px 16px rgba(0,0,0,0.04);
    }

    .dashboard-card-entrance {
      opacity: 0;
      transform: translateY(20px);
      animation: dashboardCardIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    @keyframes dashboardCardIn { to { opacity: 1; transform: translateY(0); } }
    .dashboard-float { animation: dashFloat 6s ease-in-out infinite; }
    @keyframes dashFloat { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(3deg); } }
  `]
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

  // Computed signal to sort claims newest first
  sortedClaims = computed(() => {
    return [...this.claims()].sort((a, b) => new Date(b.filedAt).getTime() - new Date(a.filedAt).getTime());
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
