import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { DataTableComponent } from '../../../shared/components/data-table.component';
import { MonthlyRevenueDto, ClaimsRatioDto, PlanDistributionDto } from '../../../core/models/analytics.model';
import { AgentPerformanceDto } from '../../../core/models/commission.model';

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [CommonModule, DataTableComponent],
    template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h2 class="text-xl font-semibold text-gray-800">Advanced Analytics</h2>
      </div>

      <div *ngIf="loading()" class="flex justify-center items-center h-64">
        <svg class="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <ng-container *ngIf="!loading()">
        
        <!-- Claims Ratio -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-6">Claims Processing Metrics</h3>
          <div *ngIf="claimsRatio() as ratio" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm flex flex-col justify-center items-center text-center">
              <span class="text-blue-800 text-sm font-semibold uppercase tracking-wider mb-2">Approval Rate</span>
              <span class="text-4xl font-black text-blue-600">{{ ratio.approvalRate | number:'1.0-1' }}%</span>
            </div>
            
            <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm flex flex-col justify-center items-center text-center">
              <span class="text-green-800 text-sm font-semibold uppercase tracking-wider mb-2">Avg Settlement</span>
              <span class="text-3xl font-bold text-green-600">₹{{ ratio.averageSettlementAmount | number:'1.0-0' }}</span>
            </div>

            <div class="col-span-1 lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div class="bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                <div class="text-2xl font-bold text-gray-800">{{ ratio.totalClaims }}</div>
                <div class="text-xs text-gray-500 uppercase mt-1">Total Claims</div>
              </div>
              <div class="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-100">
                <div class="text-2xl font-bold text-yellow-700">{{ ratio.submitted }}</div>
                <div class="text-xs text-yellow-600 uppercase mt-1">Submitted</div>
              </div>
              <div class="bg-indigo-50 p-4 rounded-lg text-center border border-indigo-100">
                <div class="text-2xl font-bold text-indigo-700">{{ ratio.underReview }}</div>
                <div class="text-xs text-indigo-600 uppercase mt-1">Under Review</div>
              </div>
              <div class="bg-green-50 p-4 rounded-lg text-center border border-green-100">
                <div class="text-2xl font-bold text-green-700">{{ ratio.approved }}</div>
                <div class="text-xs text-green-600 uppercase mt-1">Approved</div>
              </div>
              <div class="bg-emerald-50 p-4 rounded-lg text-center border border-emerald-100">
                <div class="text-2xl font-bold text-emerald-700">{{ ratio.settled }}</div>
                <div class="text-xs text-emerald-600 uppercase mt-1">Settled</div>
              </div>
              <div class="bg-red-50 p-4 rounded-lg text-center border border-red-100">
                <div class="text-2xl font-bold text-red-700">{{ ratio.rejected }}</div>
                <div class="text-xs text-red-600 uppercase mt-1">Rejected</div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Plan Distribution -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-6">Plan Tier Distribution</h3>
            <div class="space-y-6">
              <div *ngIf="planDistribution().length === 0" class="text-sm text-gray-500 text-center py-4">No data available</div>
              <div *ngFor="let dist of planDistribution()">
                <div class="flex justify-between items-end mb-2">
                  <div>
                    <span class="text-base font-semibold text-gray-800 block">{{ dist.tierName }}</span>
                    <span class="text-sm text-gray-500">{{ dist.count }} policies</span>
                  </div>
                  <span class="text-lg font-bold" [ngClass]="{'text-gray-600': dist.tierName === 'Basic', 'text-blue-600': dist.tierName === 'Standard', 'text-amber-600': dist.tierName === 'Premium'}">
                    {{ dist.percentage | number:'1.0-1' }}%
                  </span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-3">
                  <div class="h-3 rounded-full" 
                    [ngClass]="{'bg-gray-400': dist.tierName === 'Basic', 'bg-blue-500': dist.tierName === 'Standard', 'bg-amber-500': dist.tierName === 'Premium'}"
                    [style.width.%]="dist.percentage"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Monthly Revenue -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-0 overflow-hidden flex flex-col">
            <div class="p-6 border-b border-gray-100">
              <h3 class="text-lg font-medium text-gray-900">Monthly Revenue</h3>
            </div>
            <div class="overflow-y-auto flex-1 p-0">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue (₹)</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policies</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngIf="monthlyRevenue().length === 0">
                    <td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500 italic">No data available</td>
                  </tr>
                  <tr *ngFor="let m of monthlyRevenue()" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ m.month }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">₹{{ m.revenue | number:'1.0-2' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ m.policyCount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Agent Performance Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Agent Performance Leaderboard</h3>
          <app-data-table 
            [columns]="agentColumns" 
            [data]="agentPerf()" 
            [loading]="false">
          </app-data-table>
        </div>

      </ng-container>
    </div>
  `
})
export class AnalyticsComponent implements OnInit {
    private analyticsService = inject(AnalyticsService);

    monthlyRevenue = signal<MonthlyRevenueDto[]>([]);
    claimsRatio = signal<ClaimsRatioDto | null>(null);
    planDistribution = signal<PlanDistributionDto[]>([]);
    agentPerf = signal<AgentPerformanceDto[]>([]);
    loading = signal(true);

    agentColumns = [
        { key: 'agentName', label: 'Agent Name' },
        { key: 'totalPolicies', label: 'Policies Created' },
        { key: 'totalCommission', label: 'Total Commission (₹)' },
        { key: 'averagePremium', label: 'Avg Premium (₹)' }
    ];

    ngOnInit() {
        this.loading.set(true);
        let completed = 0;
        const checkComplete = () => {
            completed++;
            if (completed === 4) this.loading.set(false);
        };

        this.analyticsService.getMonthlyRevenue(12).subscribe({
            next: (res) => { if (res.success && res.data) this.monthlyRevenue.set(res.data); checkComplete(); },
            error: () => checkComplete()
        });

        this.analyticsService.getClaimsRatio().subscribe({
            next: (res) => { if (res.success && res.data) this.claimsRatio.set(res.data); checkComplete(); },
            error: () => checkComplete()
        });

        this.analyticsService.getPlanDistribution().subscribe({
            next: (res) => { if (res.success && res.data) this.planDistribution.set(res.data); checkComplete(); },
            error: () => checkComplete()
        });

        this.analyticsService.getAgentPerformance().subscribe({
            next: (res) => { if (res.success && res.data) this.agentPerf.set(res.data); checkComplete(); },
            error: () => checkComplete()
        });
    }
}
