import { Component, OnInit, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { CommissionService } from '../../../core/services/commission.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommissionSummaryDto, CommissionDto } from '../../../core/models/commission.model';
import { StatCardComponent } from '../../../shared/components/stat-card.component';
import { DataTableComponent } from '../../../shared/components/data-table.component';
import { PaginationComponent } from '../../../shared/components/pagination.component';

@Component({
  selector: 'app-agent-commissions',
  standalone: true,
  imports: [CommonModule, StatCardComponent, DataTableComponent, PaginationComponent],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex-shrink-0">
        <h2 class="text-xl font-semibold text-gray-800">My Commissions</h2>
      </div>

      <div *ngIf="loading() && !summary()" class="flex justify-center items-center h-48">
        <svg class="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <ng-container *ngIf="summary() as sum">
        <!-- Top row: 4 StatCards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-stat-card title="Total Commission Earned" [value]="'₹' + (sum.totalCommissionEarned.toLocaleString('en-IN'))" colorClass="bg-blue-500"></app-stat-card>
          <app-stat-card title="This Month" [value]="'₹' + (sum.thisMonthCommission.toLocaleString('en-IN'))" colorClass="bg-green-500"></app-stat-card>
          <app-stat-card title="Total Policies Created" [value]="sum.totalPoliciesCreated" colorClass="bg-purple-500"></app-stat-card>
          <app-stat-card title="Average Premium" [value]="'₹' + (sum.averagePremium.toLocaleString('en-IN'))" colorClass="bg-indigo-500"></app-stat-card>
        </div>

        <!-- Commissions Ledger -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div class="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
             <h3 class="text-lg font-medium text-gray-900">Commission Ledger</h3>
             <div class="text-sm text-gray-500">Total Records: <span class="font-bold text-gray-900">{{ totalCount() }}</span></div>
          </div>
          <div class="overflow-x-auto">
            <app-data-table 
              [columns]="columns" 
              [data]="formattedCommissions()" 
              emptyMessage="No commissions found."
              [loading]="loading()">
            </app-data-table>
          </div>
          <div class="p-2 border-t border-gray-100 bg-gray-50">
            <app-pagination *ngIf="totalPages() > 1"
              [currentPage]="currentPage()"
              [totalPages]="totalPages()"
              (pageChange)="currentPage.set($event)">
            </app-pagination>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class AgentCommissionsComponent implements OnInit {
  private titleService = inject(Title);
  private authService = inject(AuthService);
  private commissionService = inject(CommissionService);

  summary = signal<CommissionSummaryDto | null>(null);
  commissions = signal<CommissionDto[]>([]);

  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  loading = signal(false);

  columns = [
    { key: 'policyNumber', label: 'Policy Number' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'insuranceTypeName', label: 'Insurance Type' },
    { key: 'planTier', label: 'Plan Tier' },
    { key: 'premiumFormatted', label: 'Premium (₹)' },
    { key: 'commissionRate', label: 'Rate (%)' },
    { key: 'commissionEarnedFormatted', label: 'Commission (₹)' },
    { key: 'dateFormatted', label: 'Earned Date' }
  ];

  constructor() {
    effect(() => {
      const page = this.currentPage();
      untracked(() => {
        this.loadCommissions(page);
      });
    });
  }

  ngOnInit() {
    this.titleService.setTitle('CIPMS | Agent Commissions');

    const user = this.authService.currentUser();
    if (user && user.userId) {
      this.loadSummary(user.userId);
    }
  }

  totalPages() {
    return Math.ceil(this.totalCount() / this.pageSize()) || 1;
  }

  loadSummary(agentId: string | number) {
    this.loading.set(true);
    this.commissionService.getAgentSummary(agentId.toString()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.summary.set(res.data);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  loadCommissions(page: number) {
    this.loading.set(true);
    this.commissionService.getCommissions(page, this.pageSize()).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.commissions.set(res.data.items);
          this.totalCount.set(res.data.totalCount);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  formattedCommissions() {
    return this.commissions().map(c => ({
      ...c,
      premiumFormatted: '₹' + c.premiumAmount.toLocaleString('en-IN'),
      commissionEarnedFormatted: '₹' + c.commissionAmount.toLocaleString('en-IN'),
      dateFormatted: new Intl.DateTimeFormat('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      }).format(new Date(c.earnedAt))
    }));
  }
}
