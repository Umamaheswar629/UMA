import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-slate-50 to-blue-50">
      <!-- Left: Visual/Trust Column (Hidden on mobile) -->
      <div class="hidden md:flex flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden animate-fade-in">
        <!-- Abstract flat shapes for background interest -->
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
            Managing commercial risk has never been easier.
          </h2>
          <p class="text-slate-300 text-xl mb-12 max-w-md leading-relaxed">
            The premium platform built for modern enterprises and agencies to quote, bind, and issue policies in minutes.
          </p>

          <!-- Analytics/Growth Graphic Snippet -->
          <div class="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-md max-w-sm hover:bg-slate-800/80 transition-colors shadow-2xl">
            <div class="flex justify-between items-end mb-4">
              <div>
                <p class="text-sm text-slate-400 font-medium mb-1 tracking-wide">Active Policies</p>
                <h4 class="text-3xl font-bold text-white tracking-tight">45,291</h4>
              </div>
              <div class="flex items-center text-emerald-400 text-sm font-bold bg-emerald-400/10 px-2 py-1 rounded-md">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                +24%
              </div>
            </div>
            <div class="w-full bg-slate-700 rounded-full h-2 mb-2 overflow-hidden">
              <div class="bg-blue-500 h-2 rounded-full w-[76%]"></div>
            </div>
            <div class="flex justify-between text-xs font-semibold text-slate-500">
              <span>0</span>
              <span>Target: 60k</span>
            </div>
          </div>
        </div>

        <div class="relative z-10 text-sm text-slate-500 font-medium">
          &copy; 2026 Sure Inc. All rights reserved.
        </div>
      </div>

      <!-- Right: Form Column -->
      <div class="flex items-center justify-center p-8 sm:p-12 lg:p-16 animate-slide-up delay-100">
        <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
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
              Welcome back
            </h2>
            <p class="mt-2 text-base text-slate-500">
              Please enter your details to sign in securely.
            </p>
          </div>

          <div *ngIf="errorMessage()" class="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-fade-in">
            <p class="text-sm text-red-700 font-medium flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {{ errorMessage() }}
            </p>
          </div>

          <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()">
            <div class="space-y-5">
              <div>
                <label for="email" class="block text-sm font-bold text-slate-700 mb-1">Email <span class="text-red-500">*</span></label>
                <input id="email" name="email" type="email" autocomplete="email" required
                  class="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all sm:text-sm"
                  placeholder="name@company.com"
                  [ngModel]="email()"
                  (ngModelChange)="onEmailChange($event)"
                  [ngClass]="{'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50': emailError()}">
                <p *ngIf="emailError()" class="mt-1 text-xs text-red-500 font-medium">{{ emailError() }}</p>
              </div>
              <div>
                <label for="password" class="block text-sm font-bold text-slate-700 mb-1">Password <span class="text-red-500">*</span></label>
                <div class="relative">
                  <input id="password" name="password" [type]="showPassword() ? 'text' : 'password'" autocomplete="current-password" required
                    class="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all sm:text-sm"
                    placeholder="••••••••"
                    [ngModel]="password()"
                    (ngModelChange)="onPasswordChange($event)"
                    [ngClass]="{'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50': passwordError()}">
                  <button type="button" class="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    (click)="showPassword.set(!showPassword())">
                    {{ showPassword() ? 'Hide' : 'Show' }}
                  </button>
                </div>
                <p *ngIf="passwordError()" class="mt-1 text-xs text-red-500 font-medium">{{ passwordError() }}</p>
              </div>

              <!-- Math Captcha Field -->
              <div>
                <label for="captcha" class="block text-sm font-bold text-slate-700 mb-1">Verify you are human <span class="text-red-500">*</span></label>
                <div class="flex items-center gap-3">
                  <div class="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-3 rounded-xl font-bold select-none whitespace-nowrap shadow-sm">
                    {{ captchaNum1() }} + {{ captchaNum2() }} =
                  </div>
                  <input id="captcha" name="captcha" type="number" required
                    class="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all sm:text-sm"
                    placeholder="Result"
                    [ngModel]="captchaAnswer()"
                    (ngModelChange)="captchaAnswer.set($event)">
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between mt-6">
              <div class="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded transition-colors">
                <label for="remember-me" class="ml-2 block text-sm font-medium text-slate-600">Remember me</label>
              </div>
              <a href="#" class="text-sm font-bold text-blue-600 hover:text-blue-500 transition-colors">Forgot password?</a>
            </div>

            <button type="submit" [disabled]="!isFormValid() || loading()"
              class="relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed transition-all duration-300 mt-8">
              <span *ngIf="loading()" class="absolute left-0 inset-y-0 flex items-center pl-4">
                <svg class="animate-spin h-5 w-5 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ loading() ? 'Authenticating...' : 'Sign in to account' }}
            </button>
          </form>

          <p class="text-center text-sm text-slate-600 mt-8 font-medium">
            Don't have an account? 
            <a routerLink="/register" class="font-bold text-blue-600 hover:text-blue-500 transition-colors">
              Sign up for free
            </a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  showPassword = signal(false);
  loading = signal(false);
  errorMessage = signal('');

  // Validation Signals
  emailError = signal('');
  passwordError = signal('');

  // Math Captcha Logic
  captchaNum1 = signal(0);
  captchaNum2 = signal(0);
  captchaAnswer = signal<number | null>(null);

  ngOnInit() {
    this.generateCaptcha();
  }

  generateCaptcha() {
    this.captchaNum1.set(Math.floor(Math.random() * 10) + 1);
    this.captchaNum2.set(Math.floor(Math.random() * 10) + 1);
    this.captchaAnswer.set(null);
  }

  isCaptchaValid() {
    return this.captchaAnswer() === (this.captchaNum1() + this.captchaNum2());
  }

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
    return !!this.email() && !this.emailError() && 
           !!this.password() && !this.passwordError() && 
           this.captchaAnswer() !== null;
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    if (!this.isCaptchaValid()) {
      this.errorMessage.set('Incorrect math verification. Please verify you are human.');
      this.generateCaptcha();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login({ email: this.email(), password: this.password() }).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res.success && res.data) {
          const role = res.data.role;

          if (role === 'Admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'Agent') {
            this.router.navigate(['/agent/dashboard']);
          } else if (role === 'ClaimsOfficer') {
            this.router.navigate(['/officer/dashboard']);
          } else {
            this.router.navigate(['/customer/dashboard']);
          }
        } else {
          this.errorMessage.set(res.message || 'Login failed.');
          this.generateCaptcha();
        }
      },
      error: (err: any) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'An error occurred during login.');
        this.generateCaptcha();
      }
    });
  }
}

