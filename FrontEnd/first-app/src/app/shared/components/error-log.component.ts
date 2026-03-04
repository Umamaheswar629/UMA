import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorLogService, ErrorLogEntry } from '../../core/services/error-log.service';

@Component({
    selector: 'app-error-log',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="max-w-5xl mx-auto space-y-6">
      <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h2 class="text-xl font-semibold text-gray-800">Error Log</h2>
          <p class="text-sm text-gray-500 mt-1">API errors captured during this session</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500">{{ errorService.errors().length }} errors</span>
          <button
            (click)="errorService.clearErrors()"
            [disabled]="errorService.errors().length === 0"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Clear All
          </button>
        </div>
      </div>

      @if (errorService.errors().length === 0) {
        <div class="bg-white rounded-lg p-10 text-center border border-gray-100">
          <svg class="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No errors</h3>
          <p class="mt-1 text-sm text-gray-500">Everything is running smoothly!</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (err of errorService.errors(); track err.id) {
            <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div class="flex items-center justify-between p-4 border-b border-gray-50">
                <div class="flex items-center gap-3">
                  <span class="inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold"
                    [class]="getStatusClass(err.status)">
                    {{ err.status }}
                  </span>
                  <div>
                    <span class="text-sm font-semibold text-gray-900 uppercase">{{ err.method }}</span>
                    <span class="text-sm text-gray-600 ml-2 font-mono break-all">{{ err.url }}</span>
                  </div>
                </div>
                <span class="text-xs text-gray-400 whitespace-nowrap ml-4">{{ err.timestamp | date:'HH:mm:ss' }}</span>
              </div>
              <div class="p-4">
                <p class="text-sm text-red-700 font-medium">{{ err.message }}</p>
                @if (err.detail) {
                  <p class="mt-1 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">{{ err.detail }}</p>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ErrorLogComponent {
    errorService = inject(ErrorLogService);

    getStatusClass(status: number): string {
        if (status >= 500) return 'bg-red-100 text-red-800';
        if (status >= 400) return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
    }
}
