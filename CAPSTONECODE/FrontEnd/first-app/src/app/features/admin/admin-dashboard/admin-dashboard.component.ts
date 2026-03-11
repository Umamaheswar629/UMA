import { Component, OnInit, OnDestroy, AfterViewInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { DashboardStatsDto, PoliciesByTypeDto, ClaimsRatioDto, MonthlyRevenueDto } from '../../../core/models/analytics.model';
import { AgentPerformanceDto } from '../../../core/models/commission.model';

import {
    Chart,
    LineController, BarController, DoughnutController,
    LineElement, BarElement, ArcElement, PointElement,
    CategoryScale, LinearScale,
    Filler, Tooltip, Legend
} from 'chart.js';

// Register Chart.js components
Chart.register(
    LineController, BarController, DoughnutController,
    LineElement, BarElement, ArcElement, PointElement,
    CategoryScale, LinearScale,
    Filler, Tooltip, Legend
);

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-dashboard.component.html',
    styles: [`
        :host { display: block; }

        /* ── Stat Cards ──────────────────────────────────────────── */
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
            box-shadow: 0 4px 24px rgba(99, 102, 241, 0.06), 0 1px 4px rgba(0,0,0,0.04);
            overflow: hidden;
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
        .dashboard-stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(99, 102, 241, 0.12), 0 4px 12px rgba(0,0,0,0.06);
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
        .stat-content {
            display: flex;
            flex-direction: column;
            min-width: 0;
        }
        .stat-label {
            font-size: 0.75rem;
            font-weight: 500;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            line-height: 1.2;
        }
        .stat-accent {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .dashboard-stat-card:hover .stat-accent {
            opacity: 1;
        }

        /* ── Glass Card ──────────────────────────────────────────── */
        .dashboard-glass-card {
            background: rgba(255, 255, 255, 0.80);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 1.25rem;
            padding: 1.5rem;
            box-shadow: 0 8px 32px rgba(99, 102, 241, 0.06), 0 2px 8px rgba(0,0,0,0.03);
            transition: box-shadow 0.3s ease, transform 0.3s ease;
        }
        .dashboard-glass-card:hover {
            box-shadow: 0 16px 48px rgba(99, 102, 241, 0.1), 0 4px 16px rgba(0,0,0,0.04);
        }

        /* ── Claims Mini Cards ───────────────────────────────────── */
        .claims-mini-card {
            display: flex;
            flex-direction: column;
            padding: 1rem 1.25rem;
            border-radius: 0.75rem;
            backdrop-filter: blur(8px);
            transition: transform 0.25s ease;
        }
        .claims-mini-card:hover {
            transform: translateY(-2px);
        }

        /* ── Animations ──────────────────────────────────────────── */
        .dashboard-card-entrance {
            opacity: 0;
            transform: translateY(20px);
            animation: dashboardCardIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes dashboardCardIn {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .dashboard-float {
            animation: dashFloat 6s ease-in-out infinite;
        }

        @keyframes dashFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(3deg); }
        }
    `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
    private analyticsService = inject(AnalyticsService);

    // Data signals
    stats = signal<DashboardStatsDto | null>(null);
    policiesByType = signal<PoliciesByTypeDto[]>([]);
    claimsRatio = signal<ClaimsRatioDto | null>(null);
    agentPerformance = signal<AgentPerformanceDto[]>([]);
    monthlyRevenue = signal<MonthlyRevenueDto[]>([]);
    loading = signal(true);

    // Chart refs
    @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('policiesChart') policiesChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('claimsChart') claimsChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('agentChart') agentChartRef!: ElementRef<HTMLCanvasElement>;

    // Chart instances
    private revenueChartInstance?: Chart;
    private policiesChartInstance?: Chart;
    private claimsChartInstance?: Chart;
    private agentChartInstance?: Chart;
    private chartsInitialized = false;

    // Color palette for charts
    chartColors = [
        '#6366f1', // indigo
        '#8b5cf6', // violet
        '#3b82f6', // blue
        '#06b6d4', // cyan
        '#10b981', // emerald
        '#f59e0b', // amber
        '#ef4444', // red
        '#ec4899', // pink
        '#14b8a6', // teal
        '#f97316', // orange
    ];

    ngOnInit() {
        this.loadData();
    }

    ngAfterViewInit() {
        // Charts will be initialized after data loads
    }

    ngOnDestroy() {
        this.destroyCharts();
    }

    loadData() {
        this.loading.set(true);
        let completed = 0;
        const total = 5; // 5 API calls now
        const checkComplete = () => {
            completed++;
            if (completed === total) {
                this.loading.set(false);
                // Give Angular a tick to render the canvases
                setTimeout(() => this.initCharts(), 100);
            }
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

        this.analyticsService.getMonthlyRevenue(12).subscribe({
            next: (res) => { if (res.success) this.monthlyRevenue.set(res.data); checkComplete(); },
            error: () => checkComplete()
        });
    }

    // ── Chart Initialization ─────────────────────────────────────
    private initCharts(): void {
        if (this.chartsInitialized) return;
        this.chartsInitialized = true;

        this.createRevenueChart();
        this.createPoliciesChart();
        this.createClaimsChart();
        this.createAgentChart();
    }

    private createRevenueChart(): void {
        const canvas = this.revenueChartRef?.nativeElement;
        if (!canvas) return;

        const data = this.monthlyRevenue();
        const labels = data.map(d => d.month);
        const revenues = data.map(d => d.revenue);
        const policyCounts = data.map(d => d.policyCount);

        this.revenueChartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Revenue (₹)',
                        data: revenues,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.08)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Policies',
                        data: policyCounts,
                        borderColor: '#a78bfa',
                        backgroundColor: 'rgba(167, 139, 250, 0.06)',
                        borderWidth: 2,
                        borderDash: [6, 4],
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#a78bfa',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 7,
                        yAxisID: 'y1',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(30, 27, 75, 0.9)',
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#9ca3af', font: { size: 11 } }
                    },
                    y: {
                        position: 'left',
                        grid: { color: 'rgba(0,0,0,0.04)' },
                        ticks: {
                            color: '#9ca3af',
                            font: { size: 11 },
                            callback: (v: any) => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v)
                        }
                    },
                    y1: {
                        position: 'right',
                        grid: { display: false },
                        ticks: { color: '#c4b5fd', font: { size: 11 } },
                    }
                },
                animation: {
                    duration: 1200,
                    easing: 'easeOutQuart',
                }
            }
        });
    }

    private createPoliciesChart(): void {
        const canvas = this.policiesChartRef?.nativeElement;
        if (!canvas) return;

        const data = this.policiesByType();
        if (data.length === 0) return;

        this.policiesChartInstance = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.insuranceTypeName),
                datasets: [{
                    data: data.map(d => d.count),
                    backgroundColor: this.chartColors.slice(0, data.length),
                    borderWidth: 3,
                    borderColor: '#ffffff',
                    hoverBorderWidth: 0,
                    hoverOffset: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(30, 27, 75, 0.9)',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} (${data[ctx.dataIndex]?.percentage?.toFixed(1)}%)`
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1400,
                    easing: 'easeOutQuart',
                }
            }
        });
    }

    private createClaimsChart(): void {
        const canvas = this.claimsChartRef?.nativeElement;
        if (!canvas) return;

        const ratio = this.claimsRatio();
        if (!ratio) return;

        const labels = ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Settled'];
        const values = [ratio.submitted, ratio.underReview, ratio.approved, ratio.rejected, ratio.settled];
        const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#14b8a6'];
        const bgColors = colors.map(c => c + '20');

        this.claimsChartInstance = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Claims',
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 0,
                    borderRadius: 8,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(30, 27, 75, 0.9)',
                        padding: 12,
                        cornerRadius: 8,
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(0,0,0,0.04)' },
                        ticks: { color: '#9ca3af', font: { size: 11 } }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#374151', font: { size: 12, weight: 'bold' } }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart',
                }
            }
        });
    }

    private createAgentChart(): void {
        const canvas = this.agentChartRef?.nativeElement;
        if (!canvas) return;

        const agents = this.agentPerformance().slice(0, 7); // top 7
        if (agents.length === 0) return;

        const labels = agents.map(a => a.agentName.split(' ')[0]); // first name only for compact display

        this.agentChartInstance = new Chart(canvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Policies',
                        data: agents.map(a => a.totalPolicies),
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderColor: '#6366f1',
                        borderWidth: 0,
                        borderRadius: 6,
                        barPercentage: 0.7,
                    },
                    {
                        label: 'Commission (₹)',
                        data: agents.map(a => a.totalCommission),
                        backgroundColor: 'rgba(139, 92, 246, 0.6)',
                        borderColor: '#8b5cf6',
                        borderWidth: 0,
                        borderRadius: 6,
                        barPercentage: 0.7,
                        yAxisID: 'y1',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'rectRounded',
                            padding: 20,
                            font: { size: 11 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 27, 75, 0.9)',
                        padding: 12,
                        cornerRadius: 8,
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#6b7280', font: { size: 11 } }
                    },
                    y: {
                        position: 'left',
                        grid: { color: 'rgba(0,0,0,0.04)' },
                        ticks: { color: '#9ca3af', font: { size: 11 } },
                        title: { display: true, text: 'Policies', color: '#9ca3af', font: { size: 11 } }
                    },
                    y1: {
                        position: 'right',
                        grid: { display: false },
                        ticks: {
                            color: '#c4b5fd',
                            font: { size: 11 },
                            callback: (v: any) => '₹' + (v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v)
                        },
                        title: { display: true, text: 'Commission', color: '#c4b5fd', font: { size: 11 } }
                    }
                },
                animation: {
                    duration: 1200,
                    easing: 'easeOutQuart',
                }
            }
        });
    }

    private destroyCharts(): void {
        this.revenueChartInstance?.destroy();
        this.policiesChartInstance?.destroy();
        this.claimsChartInstance?.destroy();
        this.agentChartInstance?.destroy();
    }

    // ── Helpers ───────────────────────────────────────────────────
    getAgentPerformancePercent(agent: AgentPerformanceDto): number {
        const agents = this.agentPerformance();
        if (agents.length === 0) return 0;
        const max = Math.max(...agents.map(a => a.totalPolicies));
        return max > 0 ? (agent.totalPolicies / max) * 100 : 0;
    }
}
