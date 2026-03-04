import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { CommissionService } from '../../../core/services/commission.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommissionSummaryDto } from '../../../core/models/commission.model';
import { StatCardComponent } from '../../../shared/components/stat-card.component';
import { DataTableComponent } from '../../../shared/components/data-table.component';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, DataTableComponent],
  template: `
    <div class="space-y-6">
      <div *ngIf="loading()" class="flex justify-center items-center h-64">
        <svg class="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <ng-container *ngIf="!loading() && summary() as sum">
        <!-- Top row: 4 StatCards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-stat-card title="Total Commission Earned" [value]="'₹' + (sum.totalCommissionEarned.toLocaleString('en-IN'))" colorClass="bg-blue-500"></app-stat-card>
          <app-stat-card title="This Month" [value]="'₹' + (sum.thisMonthCommission.toLocaleString('en-IN'))" colorClass="bg-green-500"></app-stat-card>
          <app-stat-card title="Total Policies Created" [value]="sum.totalPoliciesCreated" colorClass="bg-purple-500"></app-stat-card>
          <app-stat-card title="Average Premium" [value]="'₹' + (sum.averagePremium.toLocaleString('en-IN'))" colorClass="bg-indigo-500"></app-stat-card>
        </div>

        <!-- Recent Commissions -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6 overflow-hidden">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Commissions</h3>
          <app-data-table 
            [columns]="recentColumns" 
            [data]="formattedRecentCommissions()" 
            emptyMessage="No recent commissions to show."
            [loading]="false">
          </app-data-table>
        </div>
      </ng-container>
    </div>
  `
})
export class AgentDashboardComponent implements OnInit {
  private titleService = inject(Title);
  private authService = inject(AuthService);
  private commissionService = inject(CommissionService);

  summary = signal<CommissionSummaryDto | null>(null);
  loading = signal(true);

  recentColumns = [
    { key: 'policyNumber', label: 'Policy Number' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'premiumFormatted', label: 'Premium (₹)' },
    { key: 'commissionRate', label: 'Rate (%)' },
    { key: 'commissionEarnedFormatted', label: 'Earned (₹)' },
    { key: 'dateFormatted', label: 'Date' }
  ];

  ngOnInit() {
    this.titleService.setTitle('CIPMS | Agent Dashboard');

    // In a real app authService.currentUser() might take a moment to load if it's from local storage,
    // assuming it's available synchronously here.
    const user = this.authService.currentUser();
    if (user && user.userId) {
      this.loadSummary(user.userId);
    } else {
      // Fallback if not ready immediately
      this.loading.set(false);
    }
  }

  loadSummary(agentId: string | number) {
    this.loading.set(true);
    // Passing agentId as string since JWT userId is usually string, adjust if needed
    this.commissionService.getAgentSummary(agentId.toString()).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.summary.set(res.data);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  formattedRecentCommissions() {
    if (!this.summary()?.commissions) return [];

    // Format the data for the data table
    return this.summary()!.commissions.map((c: any) => ({
      ...c,
      premiumFormatted: '₹' + c.premiumAmount.toLocaleString('en-IN'),
      commissionEarnedFormatted: '₹' + c.commissionAmount.toLocaleString('en-IN'),
      dateFormatted: new Intl.DateTimeFormat('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      }).format(new Date(c.earnedAt))
    }));
  }
}
