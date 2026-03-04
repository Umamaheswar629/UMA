import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { StatCardComponent } from '../../../shared/components/stat-card.component';
import { DataTableComponent } from '../../../shared/components/data-table.component';
import { DashboardStatsDto, PoliciesByTypeDto, ClaimsRatioDto } from '../../../core/models/analytics.model';
import { AgentPerformanceDto } from '../../../core/models/commission.model';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, StatCardComponent, DataTableComponent],
    template: `
    <div class="space-y-6">
      <div *ngIf="loading()" class="flex justify-center items-center h-64">
        <svg class="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <ng-container *ngIf="!loading()">
        <!-- Top row: 6 StatCards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <app-stat-card title="Total Users" [value]="stats()?.totalUsers || 0" colorClass="bg-blue-500"></app-stat-card>
          <app-stat-card title="Active Policies" [value]="stats()?.activePolicies || 0" colorClass="bg-green-500"></app-stat-card>
          <app-stat-card title="Open Claims" [value]="stats()?.openClaims || 0" colorClass="bg-red-500"></app-stat-card>
          <app-stat-card title="Monthly Revenue" [value]="'₹' + (stats()?.monthlyRevenue || 0)" colorClass="bg-purple-500"></app-stat-card>
          <app-stat-card title="Total Agents" [value]="stats()?.totalAgents || 0" colorClass="bg-amber-500"></app-stat-card>
          <app-stat-card title="New Users (Month)" [value]="stats()?.newUsersThisMonth || 0" colorClass="bg-indigo-500"></app-stat-card>
        </div>

        <!-- Middle Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Policies by Type -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Policies by Type</h3>
            <div class="space-y-4">
              <div *ngIf="policiesByType().length === 0" class="text-sm text-gray-500 text-center py-4">No data available</div>
              <div *ngFor="let p of policiesByType()">
                <div class="flex justify-between text-sm mb-1">
                  <span class="font-medium text-gray-700">{{ p.insuranceTypeName }}</span>
                  <span class="text-gray-500">{{ p.count }} ({{ p.percentage | number:'1.0-1' }}%)</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full" [style.width.%]="p.percentage"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Claims Ratio -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Claims Ratio</h3>
            <div *ngIf="claimsRatio() as ratio; else noClaimsData" class="space-y-4">
              <div class="flex items-center justify-between mb-4">
                <span class="text-gray-500">Approval Rate</span>
                <span class="text-2xl font-bold text-green-600">{{ ratio.approvalRate | number:'1.0-1' }}%</span>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 p-3 rounded">
                  <div class="text-xs text-gray-500 mb-1">Total Claims</div>
                  <div class="font-semibold">{{ ratio.totalClaims }}</div>
                </div>
                <div class="bg-yellow-50 p-3 rounded">
                  <div class="text-xs text-yellow-600 mb-1">Submitted</div>
                  <div class="font-semibold text-yellow-700">{{ ratio.submitted }}</div>
                </div>
                <div class="bg-blue-50 p-3 rounded">
                  <div class="text-xs text-blue-600 mb-1">Under Review</div>
                  <div class="font-semibold text-blue-700">{{ ratio.underReview }}</div>
                </div>
                <div class="bg-green-50 p-3 rounded">
                  <div class="text-xs text-green-600 mb-1">Approved/Settled</div>
                  <div class="font-semibold text-green-700">{{ ratio.approved + ratio.settled }}</div>
                </div>
              </div>
            </div>
            <ng-template #noClaimsData>
              <div class="text-sm text-gray-500 text-center py-4">No data available</div>
            </ng-template>
          </div>
        </div>

        <!-- Bottom Row: Agent Performance -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Agent Performance</h3>
          <app-data-table 
            [columns]="agentColumns" 
            [data]="agentPerformance()" 
            [loading]="false">
          </app-data-table>
        </div>
      </ng-container>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
    private analyticsService = inject(AnalyticsService);

    stats = signal<DashboardStatsDto | null>(null);
    policiesByType = signal<PoliciesByTypeDto[]>([]);
    claimsRatio = signal<ClaimsRatioDto | null>(null);
    agentPerformance = signal<AgentPerformanceDto[]>([]);
    loading = signal(true);

    agentColumns = [
        { key: 'agentName', label: 'Agent Name' },
        { key: 'totalPolicies', label: 'Total Policies' },
        { key: 'totalCommission', label: 'Total Commission (₹)' },
        { key: 'averagePremium', label: 'Avg Premium (₹)' }
    ];

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.loading.set(true);
        let completed = 0;
        const checkComplete = () => {
            completed++;
            if (completed === 4) this.loading.set(false);
        };

        this.analyticsService.getAdminDashboard().subscribe({
            next: (res) => { if (res.success) this.stats.set(res.data); checkComplete(); },
            error: () => checkComplete()
        });

        this.analyticsService.getPoliciesByType().subscribe({
            next: (res) => { if (res.success) this.policiesByType.set(res.data); checkComplete(); },
            error: () => checkComplete()
        });

        this.analyticsService.getClaimsRatio().subscribe({
            next: (res) => { if (res.success) this.claimsRatio.set(res.data); checkComplete(); },
            error: () => checkComplete()
        });

        this.analyticsService.getAgentPerformance().subscribe({
            next: (res) => { if (res.success) this.agentPerformance.set(res.data); checkComplete(); },
            error: () => checkComplete()
        });
    }
}
