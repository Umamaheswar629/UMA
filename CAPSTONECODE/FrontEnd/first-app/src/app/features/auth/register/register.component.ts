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
    <div class="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-slate-50 to-blue-50">
      <!-- Left: Visual/Trust Column (Hidden on mobile) -->
      <div class="hidden md:flex flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden animate-fade-in">
        <!-- Abstract flat shapes -->
        <div class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-600/20 blur-xl"></div>
        <div class="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-indigo-500/20 blur-xl"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-16 hover:-translate-y-1 transition-transform">
            <div class="w-10 h-10 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <span class="text-3xl font-extrabold tracking-tight">Sure</span>
          </div>

          <h2 class="text-5xl font-extrabold leading-tight mb-8">
            Join thousands of businesses securing their future.
          </h2>
          <p class="text-slate-300 text-xl mb-12 max-w-md leading-relaxed">
            Create an account to browse tailored commercial policies, compare rates, and bind your business seamlessly.
          </p>

          <!-- Analytics/Trust Snippet -->
          <div class="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-md max-w-sm hover:bg-slate-800/80 transition-colors shadow-2xl">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex -space-x-2">
                <div class="w-10 h-10 rounded-full bg-slate-600 border-2 border-slate-800 shadow-sm"></div>
                <div class="w-10 h-10 rounded-full bg-slate-500 border-2 border-slate-800 shadow-sm"></div>
                <div class="w-10 h-10 rounded-full bg-blue-500 border-2 border-slate-800 flex items-center justify-center text-xs font-bold shadow-sm">+10k</div>
              </div>
              <div class="text-sm font-semibold text-slate-300 leading-tight">New agencies joined <br><span class="text-emerald-400">this month.</span></div>
            </div>
          </div>
        </div>

        <div class="relative z-10 text-sm text-slate-500 font-medium">
          &copy; 2026 Sure Inc. All rights reserved.
        </div>
      </div>

      <!-- Right: Form Column -->
      <div class="flex items-center justify-center p-8 sm:p-12 lg:p-16 h-screen overflow-y-auto animate-slide-up delay-100">
        <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 my-auto py-8">
          <div>
            <!-- Mobile Logo -->
            <div class="md:hidden flex items-center gap-2 mb-8">
              <div class="w-10 h-10 bg-blue-600 rounded-xl shadow-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <span class="text-3xl font-extrabold tracking-tight text-slate-900">Sure</span>
            </div>

            <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
              Create an account
            </h2>
            <p class="mt-2 text-base text-slate-500">
              Start your journey with Sure today.
            </p>
          </div>

          <div *ngIf="errorMessage()" class="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-fade-in">
            <p class="text-sm text-red-700 font-medium flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {{ errorMessage() }}
            </p>
          </div>

          <form class="mt-8 space-y-5" (ngSubmit)="onSubmit()">
            
            <div>
               <label for="fullName" class="block text-sm font-bold text-slate-700 mb-1">Full Name <span class="text-red-500">*</span></label>
               <input id="fullName" name="fullName" type="text" required
                class="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all sm:text-sm"
                placeholder="Jane Doe"
                [ngModel]="fullName()"
                (ngModelChange)="fullName.set($event)">
            </div>
            
            <div>
               <label for="email" class="block text-sm font-bold text-slate-700 mb-1">Email <span class="text-red-500">*</span></label>
               <input id="email" name="email" type="email" autocomplete="email" required
                class="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all sm:text-sm"
                placeholder="jane@company.com"
                [ngModel]="email()"
                (ngModelChange)="onEmailChange($event)"
                [ngClass]="{'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50': emailError()}">
               <p *ngIf="emailError()" class="mt-1 text-xs text-red-500 font-medium">{{ emailError() }}</p>
            </div>
            
            <div>
               <label for="password" class="block text-sm font-bold text-slate-700 mb-1">Password <span class="text-red-500">*</span></label>
               <input id="password" name="password" type="password" autocomplete="new-password" required
                class="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all sm:text-sm"
                placeholder="••••••••"
                [ngModel]="password()"
                (ngModelChange)="onPasswordChange($event)"
                [ngClass]="{'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50': passwordError()}">
               <p *ngIf="passwordError()" class="mt-1 text-xs text-red-500 font-medium">{{ passwordError() }}</p>
            </div>
            
            <div>
               <label for="confirmPassword" class="block text-sm font-bold text-slate-700 mb-1">Confirm Password <span class="text-red-500">*</span></label>
               <input id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" required
                class="block w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:ring-2 outline-none transition-all sm:text-sm"
                [ngClass]="confirmPassword() && !passwordsMatch() ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'"
                placeholder="••••••••"
                [ngModel]="confirmPassword()"
                (ngModelChange)="confirmPassword.set($event)">
               <p *ngIf="confirmPassword() && !passwordsMatch()" class="mt-1 text-xs text-red-500 font-medium">Passwords do not match.</p>
            </div>

            <div class="pt-4">
              <button type="submit" [disabled]="!isFormValid() || loading()"
                class="relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed transition-all duration-300">
                <span *ngIf="loading()" class="absolute left-0 inset-y-0 flex items-center pl-4">
                  <svg class="animate-spin h-5 w-5 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                {{ loading() ? 'Creating account...' : 'Create account' }}
              </button>
            </div>
          </form>

          <p class="text-center text-sm text-slate-600 mt-8 font-medium">
            Already have an account? 
            <a routerLink="/login" class="font-bold text-blue-600 hover:text-blue-500 transition-colors">
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

  // Validation Signals
  emailError = signal('');
  passwordError = signal('');

  passwordsMatch = computed(() => this.password() === this.confirmPassword());

  onEmailChange(val: string) {
    this.email.set(val);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val && !emailRegex.test(val)) {
      this.emailError.set('Please enter a valid email address.');
    } else {
      this.emailError.set('');
    }
  }

  onPasswordChange(val: string) {
    this.password.set(val);
    if (val && val.length < 6) {
      this.passwordError.set('Password must be at least 6 characters.');
    } else {
      this.passwordError.set('');
    }
  }

  isFormValid(): boolean {
    return !!this.fullName() && 
           !!this.email() && !this.emailError() && 
           !!this.password() && !this.passwordError() && 
           this.passwordsMatch();
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
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
