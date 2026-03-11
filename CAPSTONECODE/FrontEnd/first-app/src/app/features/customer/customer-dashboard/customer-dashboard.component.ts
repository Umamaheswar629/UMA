import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { CustomerDashboardDto } from '../../../core/models/analytics.model';
import { StatCardComponent } from '../../../shared/components/stat-card.component';
import { DataTableComponent } from '../../../shared/components/data-table.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent],
  templateUrl: './customer-dashboard.component.html'
})
export class CustomerDashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  dashData = signal<CustomerDashboardDto | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.loading.set(true);
    this.analyticsService.getCustomerDashboard().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.dashData.set(res.data);
        }
      },
      error: () => this.loading.set(false)
    });
  }
}
