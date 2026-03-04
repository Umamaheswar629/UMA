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
    <div class="space-y-6">
      <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h2 class="text-xl font-semibold text-gray-800">Billing & Payments</h2>
      </div>

      <app-alert *ngIf="successMsg()" type="success" [message]="successMsg()" [visible]="true" (dismissed)="successMsg.set('')"></app-alert>
      
      <div *ngIf="loading()" class="flex justify-center items-center h-48">
        <svg class="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      </div>

      <ng-container *ngIf="!loading() && dashboard() as dash">
        <!-- Top 4 Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-stat-card title="Total Paid" [value]="'₹' + (dash.totalPaid | number:'1.0-0')" colorClass="bg-green-500"></app-stat-card>
          <app-stat-card title="Pending" [value]="'₹' + (dash.pendingAmount | number:'1.0-0')" colorClass="bg-yellow-500"></app-stat-card>
          <app-stat-card title="Overdue" [value]="'₹' + (dash.overdueAmount | number:'1.0-0')" colorClass="bg-red-500"></app-stat-card>
          <app-stat-card 
            title="Next Due Date" 
            [value]="(dash.nextDueDate | date:'MMM d, y') || 'None'" 
            [subtitle]="(dash.nextDueAmount || 0) > 0 ? '₹' + (dash.nextDueAmount | number:'1.0-0') : undefined"
            colorClass="bg-blue-500">
          </app-stat-card>
        </div>

        <!-- Invoices Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div class="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-3 w-full sm:w-auto">
              <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Policy:</label>
              <select [ngModel]="selectedPolicyId()" (ngModelChange)="selectedPolicyId.set(+$event || null)" class="block w-full sm:w-64 rounded-md border-gray-300 border py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500">
                <option [ngValue]="null">All Policies</option>
                <option *ngFor="let p of policies()" [value]="p.policyId">{{ p.policyNumber }} ({{ p.insuranceTypeName }})</option>
              </select>
            </div>
            
            <button *ngIf="hasNonEmiPending()" (click)="showEmiModal.set(true)" class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
              Convert to EMI
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-white">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Date</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngIf="invoices().length === 0">
                  <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500 italic">No invoices found for selected criteria.</td>
                </tr>
                <tr *ngFor="let inv of invoices()" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ inv.invoiceNumber }}</div>
                    <div *ngIf="inv.isEmi" class="text-xs text-blue-600 bg-blue-50 inline-block px-1 rounded mt-1">EMI Payment</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{{ inv.amount | number:'1.0-2' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm" [ngClass]="isOverdue(inv) ? 'text-red-600 font-medium' : 'text-gray-500'">{{ inv.dueDate | date }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ inv.paidDate ? (inv.paidDate | date) : '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <app-badge [status]="inv.status"></app-badge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button *ngIf="inv.status === 'Pending' || inv.status === 'Overdue'" 
                      (click)="openPayModal(inv)"
                      class="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md transition-colors shadow-sm">
                      Pay Now
                    </button>
                    <span *ngIf="inv.status === 'Paid'" class="text-gray-400">Complete</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pay Modal -->
        <div *ngIf="showPayModal()" class="relative z-50">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity"></div>
          <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                <div class="bg-white px-4 pb-4 pt-5 sm:p-6">
                  <h3 class="text-lg font-semibold leading-6 text-gray-900 mb-4">Complete Payment</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Amount to Pay</label>
                      <input type="text" [value]="'₹' + payForm.amountPaid()" disabled class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 border p-2 text-gray-500 sm:text-sm">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Payment Method</label>
                      <select [ngModel]="payForm.paymentMethod()" (ngModelChange)="payForm.paymentMethod.set($event)" class="mt-1 block w-full rounded-md border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        <option value="Online">Credit/Debit Card (Online)</option>
                        <option value="BankTransfer">Bank Transfer</option>
                        <option value="Cash">Cash / Cheque</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Transaction Reference</label>
                      <input type="text" [ngModel]="payForm.transactionReference()" (ngModelChange)="payForm.transactionReference.set($event)" placeholder="e.g. TXN12345678" class="mt-1 block w-full rounded-md border-gray-300 border p-2 focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="button" (click)="processPayment()" [disabled]="actionLoading() || !payForm.transactionReference()" class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto disabled:opacity-50">
                    {{ actionLoading() ? 'Processing...' : 'Confirm Payment' }}
                  </button>
                  <button type="button" (click)="showPayModal.set(false)" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- EMI Modal -->
        <div *ngIf="showEmiModal()" class="relative z-50">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity"></div>
          <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                <div class="bg-white px-4 pb-4 pt-5 sm:p-6">
                  <h3 class="text-lg font-semibold leading-6 text-gray-900 mb-4">Convert to EMI</h3>
                  <p class="text-sm text-gray-500 mb-4">You can convert your single pending invoice into multiple EMI payments. Please select the duration.</p>
                  
                  <div class="space-y-3">
                    <label class="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none" [ngClass]="emiMonths() === 3 ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'">
                      <input type="radio" name="emi" [value]="3" [ngModel]="emiMonths()" (ngModelChange)="emiMonths.set($event)" class="sr-only">
                      <span class="flex flex-1">
                        <span class="flex flex-col">
                          <span class="block text-sm font-medium text-gray-900">3 Months Options</span>
                          <span class="mt-1 flex items-center text-sm text-gray-500">Spread payment over 3 months</span>
                        </span>
                      </span>
                      <svg *ngIf="emiMonths() === 3" class="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>
                    </label>
                    <label class="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none" [ngClass]="emiMonths() === 6 ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'">
                      <input type="radio" name="emi" [value]="6" [ngModel]="emiMonths()" (ngModelChange)="emiMonths.set($event)" class="sr-only">
                      <span class="flex flex-1">
                        <span class="flex flex-col">
                          <span class="block text-sm font-medium text-gray-900">6 Months Options</span>
                          <span class="mt-1 flex items-center text-sm text-gray-500">Spread payment over 6 months</span>
                        </span>
                      </span>
                      <svg *ngIf="emiMonths() === 6" class="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>
                    </label>
                    <label class="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none" [ngClass]="emiMonths() === 12 ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'">
                      <input type="radio" name="emi" [value]="12" [ngModel]="emiMonths()" (ngModelChange)="emiMonths.set($event)" class="sr-only">
                      <span class="flex flex-1">
                        <span class="flex flex-col">
                          <span class="block text-sm font-medium text-gray-900">12 Months Options</span>
                          <span class="mt-1 flex items-center text-sm text-gray-500">Spread payment over 12 months</span>
                        </span>
                      </span>
                      <svg *ngIf="emiMonths() === 12" class="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>
                    </label>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button type="button" (click)="generateEmi()" [disabled]="actionLoading()" class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50">
                    {{ actionLoading() ? 'Generating...' : 'Confirm EMI' }}
                  </button>
                  <button type="button" (click)="showEmiModal.set(false)" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
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
          // Refresh data
          this.billingService.getBillingDashboard().subscribe((d: any) => { if (d.success) this.dashboard.set(d.data!); });
          this.loadInvoices(this.selectedPolicyId());
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
          this.loadInvoices(this.selectedPolicyId()); // Refresh list to see EMI breakdown
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
