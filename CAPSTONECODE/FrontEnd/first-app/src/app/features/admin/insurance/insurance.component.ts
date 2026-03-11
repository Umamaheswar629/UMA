import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsuranceService } from '../../../core/services/insurance.service';
import { InsuranceTypeDto, PlanComparisonDto } from '../../../core/models/insurance.model';
import { BadgeComponent } from '../../../shared/components/badge.component';

@Component({
  selector: 'app-insurance',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeComponent],
  template: `
    <div class="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h2 class="text-xl font-semibold text-gray-800">Insurance Management</h2>
        <button (click)="showTypeForm.set(true)" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
          + New Insurance Type
        </button>
      </div>

      <div class="flex-1 flex gap-6 min-h-0">
        <!-- Left Panel: Insurance Types List -->
        <div class="w-1/3 bg-white rounded-lg shadow-sm border border-gray-100 overflow-y-auto flex flex-col">
          <div class="p-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
            <h3 class="text-sm font-medium text-gray-700 uppercase tracking-wider">Insurance Types</h3>
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-2">
            <div *ngIf="loading()" class="text-center p-4 text-sm text-gray-500">Loading...</div>
            <div *ngIf="!loading() && types().length === 0" class="text-center p-4 text-sm text-gray-500 italic">No types found.</div>
            
            <div *ngFor="let type of types()" 
              (click)="selectType(type)"
              [class.bg-blue-50]="selectedType()?.id === type.id"
              [class.border-blue-200]="selectedType()?.id === type.id"
              class="p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-gray-50 cursor-pointer transition-colors">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="text-base font-semibold text-gray-900">{{ type.name }}</h4>
                  <p class="text-xs text-gray-500 mt-1">{{ type.category }} • {{ type.planCount }} plans</p>
                </div>
                <app-badge [status]="type.isActive ? 'Active' : 'Cancelled'"></app-badge>
              </div>
              <div class="mt-3 flex justify-end">
                <button (click)="toggleTypeStatus(type, $event)" 
                  class="text-xs font-medium px-2 py-1 rounded"
                  [ngClass]="type.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'">
                  {{ type.isActive ? 'Deactivate' : 'Activate' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Plans Comparison -->
        <div class="w-2/3 bg-white rounded-lg shadow-sm border border-gray-100 overflow-y-auto flex flex-col">
          <div *ngIf="!selectedType()" class="flex-1 flex items-center justify-center text-gray-500">
            Select an insurance type to view and manage plans.
          </div>

          <ng-container *ngIf="selectedType()">
            <div class="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center flex-shrink-0">
              <div>
                <h3 class="text-lg font-bold text-gray-900">{{ selectedType()?.name }} Plans</h3>
                <p class="text-sm text-gray-500 mt-1">{{ selectedType()?.description }}</p>
              </div>
              <button (click)="showPlanForm.set(true)" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm focus:outline-none">
                + Add Plan
              </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-6">
              <div *ngIf="!comparison()" class="text-center py-10 text-gray-500">Loading plans...</div>
              
              <div *ngIf="comparison()" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Plan Cards Generator -->
                <ng-container *ngFor="let plan of [comparison()?.basicPlan, comparison()?.standardPlan, comparison()?.premiumPlan]">
                  <div *ngIf="plan" class="border rounded-xl p-5 shadow-sm" [ngClass]="{'border-gray-200': plan?.tierName === 'Basic', 'border-blue-400 bg-blue-50 bg-opacity-30 relative shadow-md scale-105': plan?.tierName === 'Standard', 'border-amber-400 bg-amber-50 bg-opacity-30': plan?.tierName === 'Premium'}">
                    <div *ngIf="plan?.tierName === 'Standard'" class="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider">Popular</div>
                    
                    <h4 class="text-xl font-bold text-gray-900 mb-1">{{ plan?.tierName }}</h4>
                    <div class="text-3xl font-extrabold text-gray-900 mb-4">₹{{ plan?.basePremium }}<span class="text-sm font-normal text-gray-500">/yr</span></div>
                    
                    <div class="space-y-4 text-sm mt-6">
                      <div class="flex justify-between border-b border-gray-100 pb-2">
                        <span class="text-gray-500">Coverage Limit</span>
                        <span class="font-semibold text-gray-900">₹{{ plan?.coverageLimit }}</span>
                      </div>
                      <div class="flex justify-between border-b border-gray-100 pb-2">
                        <span class="text-gray-500">Commission Rate</span>
                        <span class="font-semibold text-gray-900">{{ plan?.commissionRate }}%</span>
                      </div>
                      
                      <div>
                        <span class="text-gray-900 font-medium block mb-2">Features</span>
                        <ul class="space-y-2">
                          <li *ngFor="let f of plan?.features || []" class="flex gap-2 text-gray-600">
                            <svg class="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            <span>{{ f }}</span>
                          </li>
                        </ul>
                      </div>

                      <div *ngIf="plan?.exclusions && plan!.exclusions!.length > 0">
                        <span class="text-gray-900 font-medium block mb-2 mt-4">Exclusions</span>
                        <ul class="space-y-2">
                          <li *ngFor="let e of plan?.exclusions || []" class="flex gap-2 text-gray-500">
                            <svg class="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            <span>{{ e }}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </ng-container>
              </div>
            </div>
          </ng-container>
        </div>
      </div>

      <!-- New Type Modal -->
      <div *ngIf="showTypeForm()" class="relative z-50">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity"></div>
        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
              <div class="bg-white px-4 pb-4 pt-5 sm:p-6">
                <h3 class="text-lg font-semibold mb-4">New Insurance Type</h3>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" [ngModel]="name()" (ngModelChange)="name.set($event)" class="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Category</label>
                    <input type="text" [ngModel]="category()" (ngModelChange)="category.set($event)" class="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Description</label>
                    <textarea [ngModel]="description()" (ngModelChange)="description.set($event)" rows="3" class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button type="button" (click)="saveType()" class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto">Save</button>
                <button type="button" (click)="showTypeForm.set(false)" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- New Plan Modal -->
      <div *ngIf="showPlanForm()" class="relative z-50">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity"></div>
        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div class="bg-white px-4 pb-4 pt-5 sm:p-6">
                <h3 class="text-lg font-semibold mb-4">Add Plan for {{ selectedType()?.name }}</h3>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Tier Name</label>
                      <select [ngModel]="tierName()" (ngModelChange)="tierName.set($event)" class="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                        <option value="Basic">Basic</option>
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Base Premium (₹)</label>
                      <input type="number" [ngModel]="basePremium()" (ngModelChange)="basePremium.set($event)" class="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Coverage Limit (₹)</label>
                      <input type="number" [ngModel]="coverageLimit()" (ngModelChange)="coverageLimit.set($event)" class="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Commission Rate (%)</label>
                      <input type="number" [ngModel]="commissionRate()" (ngModelChange)="commissionRate.set($event)" class="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Features (comma separated)</label>
                    <textarea [ngModel]="featuresText()" (ngModelChange)="featuresText.set($event)" rows="2" class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g. Free consultation, 24/7 Support"></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Exclusions (comma separated)</label>
                    <textarea [ngModel]="exclusionsText()" (ngModelChange)="exclusionsText.set($event)" rows="2" class="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="e.g. Pre-existing damages"></textarea>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button type="button" (click)="savePlan()" class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto">Save Plan</button>
                <button type="button" (click)="showPlanForm.set(false)" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class InsuranceComponent implements OnInit {
  private insuranceService = inject(InsuranceService);

  types = signal<InsuranceTypeDto[]>([]);
  selectedType = signal<InsuranceTypeDto | null>(null);
  comparison = signal<PlanComparisonDto | null>(null);
  loading = signal(false);

  // Type Form
  showTypeForm = signal(false);
  name = signal('');
  description = signal('');
  category = signal('');

  // Plan Form
  showPlanForm = signal(false);
  tierName = signal('Basic');
  basePremium = signal(0);
  coverageLimit = signal(0);
  commissionRate = signal(0);
  featuresText = signal('');
  exclusionsText = signal('');

  ngOnInit() {
    this.loadTypes();
  }

  loadTypes() {
    this.loading.set(true);
    this.insuranceService.getAllTypes().subscribe(res => {
      this.loading.set(false);
      if (res.success && res.data) {
        this.types.set(res.data);
      }
    });
  }

  selectType(type: InsuranceTypeDto) {
    this.selectedType.set(type);
    this.comparison.set(null);
    this.insuranceService.comparePlans(type.id).subscribe(res => {
      if (res.success && res.data) {
        this.comparison.set(res.data);
      }
    });
  }

  toggleTypeStatus(type: InsuranceTypeDto, event: Event) {
    event.stopPropagation();
    this.insuranceService.toggleTypeStatus(type.id).subscribe(res => {
      if (res.success) {
        this.loadTypes();
        if (this.selectedType()?.id === type.id) {
          this.selectedType.set(null);
        }
      }
    });
  }

  saveType() {
    this.insuranceService.createType({
      name: this.name(),
      description: this.description(),
      category: this.category()
    }).subscribe(res => {
      if (res.success) {
        this.showTypeForm.set(false);
        this.name.set('');
        this.description.set('');
        this.category.set('');
        this.loadTypes();
      }
    });
  }

  savePlan() {
    if (!this.selectedType()) return;

    this.insuranceService.createPlan({
      insuranceTypeId: Number(this.selectedType()!.id),
      tierName: this.tierName(),
      basePremium: Number(this.basePremium()),
      coverageLimit: Number(this.coverageLimit()),
      commissionRate: Number(this.commissionRate()),
      features: this.featuresText() ? this.featuresText().split(',').map(s => s.trim()).filter(s => s) : [],
      exclusions: this.exclusionsText() ? this.exclusionsText().split(',').map(s => s.trim()).filter(s => s) : []
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.showPlanForm.set(false);
          this.tierName.set('Basic');
          this.basePremium.set(0);
          this.coverageLimit.set(0);
          this.commissionRate.set(0);
          this.featuresText.set('');
          this.exclusionsText.set('');
          this.selectType(this.selectedType()!); // refresh plans
        }
      },
      error: (err) => {
        console.error("Failed to add plan", err);
        alert("Failed to add plan: " + (err.error?.message || "Bad Request. Make sure all numbers are valid."));
      }
    });
  }
}
