import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { CommissionService } from '../../../core/services/commission.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommissionSummaryDto } from '../../../core/models/commission.model';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-dashboard.component.html',
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
      box-shadow: 0 4px 24px rgba(16, 185, 129, 0.06), 0 1px 4px rgba(0,0,0,0.04);
      overflow: hidden;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
    }
    .dashboard-stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(16, 185, 129, 0.12), 0 4px 12px rgba(0,0,0,0.06);
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
      box-shadow: 0 8px 32px rgba(16, 185, 129, 0.06), 0 2px 8px rgba(0,0,0,0.03);
      transition: box-shadow 0.3s ease;
    }
    .dashboard-glass-card:hover {
      box-shadow: 0 16px 48px rgba(16, 185, 129, 0.1), 0 4px 16px rgba(0,0,0,0.04);
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
export class AgentDashboardComponent implements OnInit {
  private titleService = inject(Title);
  private authService = inject(AuthService);
  private commissionService = inject(CommissionService);

  summary = signal<CommissionSummaryDto | null>(null);
  loading = signal(true);

  agentName = computed(() => {
    const user = this.authService.currentUser();
    if (user?.fullName) {
      return user.fullName.split(' ')[0];
    }
    return 'Agent';
  });

  ngOnInit() {
    this.titleService.setTitle('CIPMS | Agent Dashboard');
    const user = this.authService.currentUser();
    if (user && user.userId) {
      this.loadSummary(user.userId);
    } else {
      this.loading.set(false);
    }
  }

  loadSummary(agentId: string | number) {
    this.loading.set(true);
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
}
