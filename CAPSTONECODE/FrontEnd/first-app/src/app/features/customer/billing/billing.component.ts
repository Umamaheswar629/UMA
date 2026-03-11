import { Component, OnInit, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingService } from '../../../core/services/billing.service';
import { PolicyService } from '../../../core/services/policy.service';
import { BillingDashboardDto, InvoiceDto } from '../../../core/models/billing.model';
import { PolicyDto } from '../../../core/models/policy.model';
import { StatCardComponent } from '../../../shared/components/stat-card.component';
import { BadgeComponent } from '../../../shared/components/badge.component';
import { AlertComponent } from '../../../shared/components/alert.component';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, StatCardComponent, BadgeComponent, AlertComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-center bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-slate-100">
        <h2 class="text-2xl font-bold tracking-tight text-slate-900">Billing & Payments</h2>
      </div>

      <app-alert *ngIf="successMsg()" type="success" [message]="successMsg()" [visible]="true" (dismissed)="successMsg.set('')"></app-alert>
      
      <div *ngIf="loading()" class="flex justify-center items-center h-48">
        <svg class="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <ng-container *ngIf="!loading() && dashboard() as dash">
        <!-- Top 4 Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          <app-stat-card title="Total Paid" [value]="'₹' + (dash.totalPaid | number:'1.0-0')" colorClass="bg-emerald-500"></app-stat-card>
          <app-stat-card title="Pending" [value]="'₹' + (dash.pendingAmount | number:'1.0-0')" colorClass="bg-amber-500"></app-stat-card>
          <app-stat-card title="Overdue" [value]="'₹' + (dash.overdueAmount | number:'1.0-0')" colorClass="bg-rose-500"></app-stat-card>
          <app-stat-card 
            title="Next Due Date" 
            [value]="(dash.nextDueDate | date:'MMM d, y') || 'None'" 
            [subtitle]="(dash.nextDueAmount || 0) > 0 ? '₹' + (dash.nextDueAmount | number:'1.0-0') : undefined"
            colorClass="bg-indigo-500">
          </app-stat-card>
        </div>

        <!-- Invoices Section -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden animate-slide-up delay-100">
          <div class="p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-3 w-full sm:w-auto">
              <label class="text-sm font-bold text-slate-700 whitespace-nowrap">Filter by Policy:</label>
              <select [ngModel]="selectedPolicyId()" (ngModelChange)="selectedPolicyId.set(+$event || null)" class="block w-full sm:w-72 rounded-xl bg-white border-slate-200 border py-2.5 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium">
                <option [ngValue]="null">All Policies</option>
                <option *ngFor="let p of policies()" [value]="p.policyId">{{ p.policyNumber }} ({{ p.insuranceTypeName }})</option>
              </select>
            </div>
            
            <button *ngIf="hasNonEmiPending()" (click)="showEmiModal.set(true)" class="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-indigo-200 text-sm font-bold rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all shadow-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Convert to EMI
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-100">
              <thead class="bg-white">
                <tr>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice #</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Paid Date</th>
                  <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-slate-50 text-sm">
                <tr *ngIf="invoices().length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-sm text-slate-500 italic">No invoices found for selected criteria.</td>
                </tr>
                <tr *ngFor="let inv of invoices()" class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="font-bold text-slate-900">{{ inv.invoiceNumber }}</div>
                    <div *ngIf="inv.isEmi" class="text-xs font-semibold text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded-md mt-1 border border-indigo-100">EMI Payment</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap font-extrabold text-slate-900">₹{{ inv.amount | number:'1.0-2' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap font-medium" [ngClass]="isOverdue(inv) ? 'text-rose-600' : 'text-slate-600'">{{ inv.dueDate | date:'mediumDate' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">{{ inv.paidDate ? (inv.paidDate | date:'mediumDate') : '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <app-badge [status]="inv.status"></app-badge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right font-bold">
                    <button *ngIf="inv.status === 'Pending' || inv.status === 'Overdue'" 
                      (click)="openPayModal(inv)"
                      class="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5">
                      Pay Now
                    </button>
                    <span *ngIf="inv.status === 'Paid'" class="text-slate-400 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Complete</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pay Modal -->
        <div *ngIf="showPayModal()" class="relative z-50">
          <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>
          <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-100 animate-slide-up">
                <div class="bg-white px-6 pt-6 pb-6">
                  <div class="flex justify-between items-center mb-5">
                    <h3 class="text-xl font-extrabold text-slate-900 tracking-tight">Complete Payment</h3>
                    <button (click)="showPayModal.set(false)" class="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                  
                  <div class="space-y-5">
                    <div>
                      <label class="block text-sm font-bold text-slate-700 mb-1">Amount to Pay</label>
                      <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span class="text-slate-500 font-bold">₹</span>
                        </div>
                        <input type="text" [value]="payForm.amountPaid() | number:'1.0-2'" disabled class="block w-full pl-8 rounded-xl bg-slate-100 border-none p-3 text-slate-700 font-black sm:text-lg">
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-slate-700 mb-1">Payment Method <span class="text-red-500">*</span></label>
                      <select [ngModel]="payForm.paymentMethod()" (ngModelChange)="payForm.paymentMethod.set($event)" class="block w-full rounded-xl bg-slate-50 border border-slate-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all sm:text-sm font-medium">
                        <option value="Online">Credit/Debit Card (Online)</option>
                        <option value="BankTransfer">Bank Transfer</option>
                        <option value="Cash">Cash / Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-bold text-slate-700 mb-1">Transaction Reference <span class="text-red-500">*</span></label>
                      <input type="text" [ngModel]="payForm.transactionReference()" (ngModelChange)="payForm.transactionReference.set($event)" 
                        placeholder="e.g. TXN12345678" 
                        class="block w-full rounded-xl bg-slate-50 border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm font-medium"
                        [ngClass]="!payForm.transactionReference() ? 'border-slate-300' : 'border-blue-300'">
                      <p *ngIf="!payForm.transactionReference()" class="mt-1 text-xs text-slate-500 font-medium">Please enter a valid receipt or transaction number.</p>
                    </div>
                  </div>
                </div>
                <div class="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-100">
                  <button type="button" (click)="showPayModal.set(false)" class="inline-flex w-full sm:w-auto justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="button" (click)="processPayment()" [disabled]="actionLoading() || !payForm.transactionReference()" class="inline-flex w-full sm:w-auto justify-center items-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:shadow-none transition-all">
                    <span *ngIf="actionLoading()" class="mr-2">
                      <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </span>
                    {{ actionLoading() ? 'Processing...' : 'Confirm Payment' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- EMI Modal -->
        <div *ngIf="showEmiModal()" class="relative z-50">
          <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>
          <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-100 animate-slide-up">
                <div class="bg-white px-6 pt-6 pb-6">
                  <div class="flex justify-between items-center mb-3">
                    <h3 class="text-xl font-extrabold text-slate-900 tracking-tight">Convert to EMI</h3>
                    <button (click)="showEmiModal.set(false)" class="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                  <p class="text-sm font-medium text-slate-500 mb-5 leading-relaxed">You can convert your single pending invoice into multiple EMI payments. Please select the duration.</p>
                  
                  <div class="space-y-3">
                    <label class="relative flex cursor-pointer rounded-xl border bg-slate-50 p-4 shadow-sm hover:bg-white transition-all focus:outline-none" [ngClass]="emiMonths() === 3 ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30' : 'border-slate-200'">
                      <input type="radio" name="emi" [value]="3" [ngModel]="emiMonths()" (ngModelChange)="emiMonths.set($event)" class="sr-only">
                      <span class="flex flex-1">
                        <span class="flex flex-col">
                          <span class="block text-sm font-bold" [ngClass]="emiMonths() === 3 ? 'text-indigo-900' : 'text-slate-900'">3 Months Option</span>
                          <span class="mt-1 flex items-center text-sm font-medium" [ngClass]="emiMonths() === 3 ? 'text-indigo-700' : 'text-slate-500'">Spread payment over 3 months</span>
                        </span>
                      </span>
                      <svg *ngIf="emiMonths() === 3" class="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>
                    </label>
                    <label class="relative flex cursor-pointer rounded-xl border bg-slate-50 p-4 shadow-sm hover:bg-white transition-all focus:outline-none" [ngClass]="emiMonths() === 6 ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30' : 'border-slate-200'">
                      <input type="radio" name="emi" [value]="6" [ngModel]="emiMonths()" (ngModelChange)="emiMonths.set($event)" class="sr-only">
                      <span class="flex flex-1">
                        <span class="flex flex-col">
                          <span class="block text-sm font-bold" [ngClass]="emiMonths() === 6 ? 'text-indigo-900' : 'text-slate-900'">6 Months Option</span>
                          <span class="mt-1 flex items-center text-sm font-medium" [ngClass]="emiMonths() === 6 ? 'text-indigo-700' : 'text-slate-500'">Spread payment over 6 months</span>
                        </span>
                      </span>
                      <svg *ngIf="emiMonths() === 6" class="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>
                    </label>
                    <label class="relative flex cursor-pointer rounded-xl border bg-slate-50 p-4 shadow-sm hover:bg-white transition-all focus:outline-none" [ngClass]="emiMonths() === 12 ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30' : 'border-slate-200'">
                      <input type="radio" name="emi" [value]="12" [ngModel]="emiMonths()" (ngModelChange)="emiMonths.set($event)" class="sr-only">
                      <span class="flex flex-1">
                        <span class="flex flex-col">
                          <span class="block text-sm font-bold" [ngClass]="emiMonths() === 12 ? 'text-indigo-900' : 'text-slate-900'">12 Months Option</span>
                          <span class="mt-1 flex items-center text-sm font-medium" [ngClass]="emiMonths() === 12 ? 'text-indigo-700' : 'text-slate-500'">Spread payment over 12 months</span>
                        </span>
                      </span>
                      <svg *ngIf="emiMonths() === 12" class="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>
                    </label>
                  </div>
                </div>
                <div class="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-100">
                  <button type="button" (click)="showEmiModal.set(false)" class="inline-flex w-full sm:w-auto justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="button" (click)="generateEmi()" [disabled]="actionLoading()" class="inline-flex w-full sm:w-auto justify-center items-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:shadow-none transition-all">
                    <span *ngIf="actionLoading()" class="mr-2">
                      <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </span>
                    {{ actionLoading() ? 'Processing...' : 'Confirm EMI Generation' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </ng-container>
    </div>
  `
})
export class BillingComponent implements OnInit {
  private billingService = inject(BillingService);
  private policyService = inject(PolicyService);

  dashboard = signal<BillingDashboardDto | null>(null);
  policies = signal<PolicyDto[]>([]);
  selectedPolicyId = signal<number | null>(null);
  invoices = signal<InvoiceDto[]>([]);

  loading = signal(false);
  actionLoading = signal(false);
  successMsg = signal('');

  // Pay Modal
  showPayModal = signal(false);
  payForm = {
    invoiceId: signal<number>(0),
    amountPaid: signal<number>(0),
    paymentMethod: signal('Online'),
    transactionReference: signal('')
  };

  // EMI Modal
  showEmiModal = signal(false);
  emiMonths = signal(6);

  constructor() {
    effect(() => {
      const pid = this.selectedPolicyId();
      untracked(() => {
        this.loadInvoices(pid);
      });
    });
  }

  ngOnInit() {
    this.loading.set(true);
    let done = 0;
    const checkDone = () => { done++; if (done === 2) this.loading.set(false); };

    this.billingService.getBillingDashboard().subscribe((res: any) => {
      if (res.success && res.data) {
        this.dashboard.set(res.data);
        if (!this.selectedPolicyId()) {
          this.invoices.set(res.data.recentInvoices || []);
        }
      }
      checkDone();
    });

    // We only need active/all policies for the dropdown filter. Getting first 50.
    this.policyService.getPolicies({ page: 1, pageSize: 50 }).subscribe((res: any) => {
      if (res.success && res.data) this.policies.set(res.data.items);
      checkDone();
    });
  }

  loadInvoices(policyId: number | null) {
    if (policyId) {
      this.billingService.getInvoicesByPolicy(policyId).subscribe(res => {
        if (res.success && res.data) this.invoices.set(res.data);
      });
    } else {
      const dash = this.dashboard();
      if (dash && dash.recentInvoices) {
        this.invoices.set(dash.recentInvoices);
      }
    }
  }

  isOverdue(inv: InvoiceDto): boolean {
    return inv.status === 'Overdue' || (inv.status === 'Pending' && new Date(inv.dueDate) < new Date());
  }

  hasNonEmiPending(): boolean {
    // Only single original invoices map to EMI. If they have a pending invoice that IS NOT an EMI
    return this.invoices().some(i => (i.status === 'Pending' || i.status === 'Overdue') && !i.isEmi);
  }

  openPayModal(inv: InvoiceDto) {
    this.payForm.invoiceId.set(inv.invoiceId as number);
    this.payForm.amountPaid.set(inv.amount);
    this.payForm.paymentMethod.set('Online');
    this.payForm.transactionReference.set('');
    this.showPayModal.set(true);
  }

  processPayment() {
    if (!this.payForm.transactionReference()) return;
    this.actionLoading.set(true);

    this.billingService.recordPayment({
      invoiceId: this.payForm.invoiceId(),
      amountPaid: this.payForm.amountPaid(),
      paymentMethod: this.payForm.paymentMethod(),
      transactionReference: this.payForm.transactionReference()
    }).subscribe({
      next: (res: any) => {
        this.actionLoading.set(false);
        if (res.success) {
          this.showPayModal.set(false);
          this.successMsg.set('Payment processed successfully. Thank you!');
          // Add slight delay to allow backend DB transactions to commit before fetching refresh
          setTimeout(() => {
            this.billingService.getBillingDashboard().subscribe((d: any) => { 
              if (d.success) this.dashboard.set(d.data!); 
              this.loadInvoices(this.selectedPolicyId());
            });
          }, 400);
        }
      },
      error: () => this.actionLoading.set(false)
    });
  }

  generateEmi() {
    // Find a pending non-EMI invoice to convert
    const eligibleInvoice = this.invoices().find(i => (i.status === 'Pending' || i.status === 'Overdue') && !i.isEmi);
    if (!eligibleInvoice) return;

    this.actionLoading.set(true);
    this.billingService.generateEmi({
      policyId: eligibleInvoice.policyId ? Number(eligibleInvoice.policyId) : 0,
      invoiceId: eligibleInvoice.invoiceId ? Number(eligibleInvoice.invoiceId) : 0,
      numberOfMonths: Number(this.emiMonths())
    }).subscribe({
      next: (res) => {
        this.actionLoading.set(false);
        if (res.success) {
          this.showEmiModal.set(false);
          this.successMsg.set('Invoice successfully converted to EMI instalments.');
          // Add slight delay to allow backend DB transactions to commit before fetching refresh
          setTimeout(() => {
            this.billingService.getBillingDashboard().subscribe((d: any) => { 
              if (d.success) this.dashboard.set(d.data!); 
              this.loadInvoices(this.selectedPolicyId());
            });
          }, 400);
        } else {
          console.error('Backend returned 200 but success=false:', res);
          this.successMsg.set('');
          alert('EMI Generation Failed: ' + (res.message || 'Unknown backend logic error'));
        }
      },
      error: (err) => {
        this.actionLoading.set(false);
        console.error('EMI HTTP Error:', err);

        let errorTxt = 'Server error. ';
        if (err.error) {
          if (typeof err.error === 'string') errorTxt += err.error;
          else if (err.error.message) errorTxt += err.error.message;
          else errorTxt += JSON.stringify(err.error);
        }

        alert('HTTP 400 Failed: ' + errorTxt);
      }
    });
  }
}
