import { Component, OnInit, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsuranceService } from '../../../core/services/insurance.service';
import { QuoteService } from '../../../core/services/quote.service';
import { PolicyService } from '../../../core/services/policy.service';
import { BusinessProfileService } from '../../../core/services/business-profile.service';
import { InsuranceTypeDto, PlanDto } from '../../../core/models/insurance.model';
import { QuoteResponse } from '../../../core/models/quote.model';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { AlertComponent } from '../../../shared/components/alert.component';

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent, AlertComponent],
  templateUrl: './quotes.component.html'
})
export class QuotesComponent implements OnInit {
  private insuranceService = inject(InsuranceService);
  private quoteService = inject(QuoteService);
  private policyService = inject(PolicyService);
  private profileService = inject(BusinessProfileService);

  myProfileId = signal<number | string | null>(null);

  insuranceTypes = signal<InsuranceTypeDto[]>([]);
  selectedTypeId = signal<number | null>(null);
  plans = signal<PlanDto[]>([]);
  selectedPlanId = signal<number | null>(null);

  generatedQuote = signal<QuoteResponse | null>(null);
  myQuotes = signal<QuoteResponse[]>([]);

  generating = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // Policy Modal
  showPolicyModal = signal(false);
  selectedQuoteToConvert: QuoteResponse | null = null;
  policyStartDate = signal('');
  policyAgentId = signal<number | null>(null);
  creatingPolicy = signal(false);

  constructor() {
    effect(() => {
      const typeId = this.selectedTypeId();
      untracked(() => {
        if (typeId) {
          this.loadPlans(typeId);
        } else {
          this.plans.set([]);
          this.selectedPlanId.set(null);
        }
      });
    });
  }

  ngOnInit() {
    this.loadTypes();
    this.loadMyQuotes();
    this.profileService.getMyProfile().subscribe((res: any) => {
      if (res.success && res.data) {
        // assume the model has id or businessProfileId
        this.myProfileId.set(res.data.id || (res.data as any).businessProfileId);
      }
    });
  }

  loadTypes() {
    this.insuranceService.getAllTypes().subscribe(res => {
      if (res.success && res.data) {
        this.insuranceTypes.set(res.data.filter(t => t.isActive));
      }
    });
  }

  loadPlans(typeId: number) {
    this.insuranceService.getPlansByType(typeId).subscribe((res: any) => {
      if (res.success && res.data) {
        this.plans.set(res.data);
        this.selectedPlanId.set(null);
      }
    });
  }

  loadMyQuotes() {
    this.quoteService.getMyQuotes().subscribe(res => {
      if (res.success && res.data) {
        this.myQuotes.set(res.data);
      }
    });
  }

  generateQuote() {
    if (!this.selectedPlanId()) return;
    this.generating.set(true);
    this.errorMsg.set('');

    this.quoteService.generateQuote({ planId: this.selectedPlanId()!, businessProfileId: this.myProfileId()! }).subscribe({
      next: (res) => {
        this.generating.set(false);
        if (res.success && res.data) {
          this.generatedQuote.set(res.data);
          this.loadMyQuotes(); // refresh history
        } else {
          this.errorMsg.set(res.message || 'Error generating quote');
        }
      },
      error: (err) => {
        this.generating.set(false);
        this.errorMsg.set(err.error?.message || 'Server Error');
      }
    });
  }

  openPolicyModal(quote: QuoteResponse) {
    this.selectedQuoteToConvert = quote;
    // Set default start date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.policyStartDate.set(tomorrow.toISOString().split('T')[0]);
    this.policyAgentId.set(null);
    this.showPolicyModal.set(true);
  }

  convertToPolicy() {
    if (!this.selectedQuoteToConvert || !this.policyStartDate()) return;

    this.creatingPolicy.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    this.policyService.createPolicy({
      quoteId: this.selectedQuoteToConvert.quoteId,
      startDate: this.policyStartDate() + 'T00:00:00Z',
      agentId: this.policyAgentId() || undefined
    }).subscribe({
      next: (res) => {
        this.creatingPolicy.set(false);
        if (res.success) {
          this.showPolicyModal.set(false);
          this.generatedQuote.set(null);
          this.successMsg.set('Policy created successfully! Check your Policies tab.');
          this.loadMyQuotes(); // reflect 'Converted' status
        } else {
          this.errorMsg.set(res.message || 'Error converting policy');
        }
      },
      error: (err) => {
        this.creatingPolicy.set(false);
        this.errorMsg.set(err.error?.message || 'Server Error');
      }
    });
  }
}
