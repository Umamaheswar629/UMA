import { Component, OnInit, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { PolicyService } from '../../../core/services/policy.service';
import { PolicyDto, PolicyDetailDto } from '../../../core/models/policy.model';
import { DataTableComponent } from '../../../shared/components/data-table.component';
import { PaginationComponent } from '../../../shared/components/pagination.component';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
  selector: 'app-agent-policies',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, BadgeComponent],
  templateUrl: './agent-policies.component.html'
})
export class AgentPoliciesComponent implements OnInit {
  private titleService = inject(Title);
  private policyService = inject(PolicyService);

  policies = signal<PolicyDto[]>([]);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);

  statusFilter = signal('');
  searchTerm = signal('');

  loading = signal(false);
  selectedPolicy = signal<PolicyDetailDto | null>(null);

  private searchTimeout: any;

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const status = this.statusFilter();
      const search = this.searchTerm();

      untracked(() => {
        this.loadPolicies(page, status, search);
      });
    });
  }

  ngOnInit() {
    this.titleService.setTitle('CIPMS | Managed Policies');
  }

  totalPages() {
    return Math.ceil(this.totalCount() / this.pageSize()) || 1;
  }

  onSearchChange(val: string) {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchTerm.set(val);
      this.currentPage.set(1);
    }, 500);
  }

  loadPolicies(page: number, status: string, search: string) {
    this.loading.set(true);
    // Note: ensure your backend policyService properly passes these arguments or modifies accordingly 
    // for agent scoping based on JWT payload.
    // The instructions say backend filters by agentId automatically.
    this.policyService.getPolicies({ page: page, pageSize: this.pageSize(), status, search }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.policies.set(res.data.items);
          this.totalCount.set(res.data.totalCount);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  selectPolicy(id: number | string) {
    this.policyService.getPolicyById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.selectedPolicy.set(res.data);
        }
      }
    });
  }

  approvePolicy(id: number | string) {
    this.policyService.approvePolicy(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.selectedPolicy.set(null);
          this.loadPolicies(this.currentPage(), this.statusFilter(), this.searchTerm());
        }
      },
      error: (err) => {
        alert('Failed to approve: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }
}
