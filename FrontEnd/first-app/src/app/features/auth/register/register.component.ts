import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      <!-- Left: Visual/Trust Column (Hidden on mobile) -->
      <div class="hidden md:flex flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden">
        <!-- Abstract flat shapes -->
        <div class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-600 opacity-20"></div>
        <div class="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-indigo-500 opacity-20"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-2 mb-16">
            <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <span class="text-2xl font-bold tracking-tight">Sure</span>
          </div>

          <h2 class="text-4xl font-bold leading-tight mb-6">
            Join thousands of businesses securing their future.
          </h2>
          <p class="text-slate-300 text-lg mb-12 max-w-md">
            Create an account to browse tailored commercial policies, compare rates, and bind your business seamlessly.
          </p>

          <!-- Analytics/Trust Snippet -->
          <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm max-w-sm">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex -space-x-2">
                <div class="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-800"></div>
                <div class="w-8 h-8 rounded-full bg-slate-500 border-2 border-slate-800"></div>
                <div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-slate-800 flex items-center justify-center text-[10px] font-bold">+10k</div>
              </div>
              <div class="text-sm font-medium text-slate-300">New agencies joined this month.</div>
            </div>
          </div>
        </div>

        <div class="relative z-10 text-sm text-slate-400 font-medium">
          &copy; 2026 Sure Inc. All rights reserved.
        </div>
      </div>

      <!-- Right: Form Column -->
      <div class="flex items-center justify-center p-8 sm:p-12 lg:p-16 h-screen overflow-y-auto">
        <div class="w-full max-w-md space-y-8 my-auto py-8">
          <div>
            <!-- Mobile Logo -->
            <div class="md:hidden flex items-center gap-2 mb-8">
              <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <span class="text-2xl font-bold tracking-tight text-slate-900">Sure</span>
            </div>

            <h2 class="text-3xl font-bold text-slate-900 tracking-tight">
              Create an account
            </h2>
            <p class="mt-2 text-sm text-slate-600">
              Start your journey with Sure today.
            </p>
          </div>

          <div *ngIf="errorMessage()" class="bg-red-50 border-l-4 border-red-500 p-4">
            <p class="text-sm text-red-700 font-medium">{{ errorMessage() }}</p>
          </div>

          <form class="space-y-5" (ngSubmit)="onSubmit()">
            
            <div>
              <label for="fullName" class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input id="fullName" name="fullName" type="text" required
                class="block w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors sm:text-sm"
                placeholder="Jane Doe"
                [ngModel]="fullName()"
                (ngModelChange)="fullName.set($event)">
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input id="email" name="email" type="email" autocomplete="email" required
                class="block w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors sm:text-sm"
                placeholder="jane@company.com"
                [ngModel]="email()"
                (ngModelChange)="email.set($event)">
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input id="password" name="password" type="password" autocomplete="new-password" required
                class="block w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors sm:text-sm"
                placeholder="••••••••"
                [ngModel]="password()"
                (ngModelChange)="password.set($event)">
            </div>
            
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" required
                class="block w-full px-4 py-3 border rounded-lg text-slate-900 focus:ring-2 outline-none transition-colors sm:text-sm"
                [ngClass]="confirmPassword() && !passwordsMatch() ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-blue-600 focus:border-blue-600'"
                placeholder="••••••••"
                [ngModel]="confirmPassword()"
                (ngModelChange)="confirmPassword.set($event)">
              <p *ngIf="confirmPassword() && !passwordsMatch()" class="mt-1 text-xs text-red-500 font-medium">Passwords do not match.</p>
            </div>

            <div class="pt-2">
              <button type="submit" [disabled]="loading() || !fullName() || !email() || !password() || !passwordsMatch()"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-all duration-200">
                <span *ngIf="loading()" class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ loading() ? 'Creating account...' : 'Create account' }}
              </button>
            </div>
          </form>

          <p class="text-center text-sm text-slate-600 mt-8">
            Already have an account? 
            <a routerLink="/login" class="font-semibold text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  fullName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  loading = signal(false);
  errorMessage = signal('');

  passwordsMatch = computed(() => this.password() === this.confirmPassword());

  onSubmit(): void {
    if (!this.passwordsMatch() || !this.fullName() || !this.email() || !this.password()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.register({
      fullName: this.fullName(),
      email: this.email(),
      password: this.password()
      // `role` is intentionally omitted because backend defaults it to Customer (3)
    }).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res.success) {
          this.router.navigate(['/customer/dashboard']);
        } else {
          this.errorMessage.set(res.message || 'Registration failed.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'An error occurred during registration.');
      }
    });
  }
}
