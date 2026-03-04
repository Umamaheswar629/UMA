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
    <div class="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      <!-- Left: Visual/Trust Column (Hidden on mobile) -->
      <div class="hidden md:flex flex-col justify-between bg-slate-900 text-white p-12 relative overflow-hidden">
        <!-- Abstract flat shapes for background interest -->
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
            Managing commercial risk has never been easier.
          </h2>
          <p class="text-slate-300 text-lg mb-12 max-w-md">
            The platform built for modern enterprises and agencies to quote, bind, and issue policies in minutes.
          </p>

          <!-- Analytics/Growth Graphic Snippet -->
          <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm max-w-sm">
            <div class="flex justify-between items-end mb-4">
              <div>
                <p class="text-sm text-slate-400 font-medium mb-1">Active Policies</p>
                <h4 class="text-2xl font-bold text-white">45,291</h4>
              </div>
              <div class="flex items-center text-emerald-400 text-sm font-semibold">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                +24%
              </div>
            </div>
            <div class="w-full bg-slate-700 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full" style="width: 76%"></div>
            </div>
            <div class="flex justify-between mt-2 text-xs text-slate-500">
              <span>0</span>
              <span>Target: 60k</span>
            </div>
          </div>
        </div>

        <div class="relative z-10 text-sm text-slate-400 font-medium">
          &copy; 2026 Sure Inc. All rights reserved.
        </div>
      </div>

      <!-- Right: Form Column -->
      <div class="flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div class="w-full max-w-md space-y-8">
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
              Welcome back
            </h2>
            <p class="mt-2 text-sm text-slate-600">
              Please enter your details to sign in.
            </p>
          </div>

          <div *ngIf="errorMessage()" class="bg-red-50 border-l-4 border-red-500 p-4">
            <p class="text-sm text-red-700 font-medium">{{ errorMessage() }}</p>
          </div>

          <form class="space-y-6" (ngSubmit)="onSubmit()">
            <div class="space-y-5">
              <div>
                <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input id="email" name="email" type="email" autocomplete="email" required
                  class="block w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors sm:text-sm"
                  placeholder="Enter your email"
                  [ngModel]="email()"
                  (ngModelChange)="email.set($event)">
              </div>
              <div>
                <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div class="relative">
                  <input id="password" name="password" [type]="showPassword() ? 'text' : 'password'" autocomplete="current-password" required
                    class="block w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors sm:text-sm"
                    placeholder="••••••••"
                    [ngModel]="password()"
                    (ngModelChange)="password.set($event)">
                  <button type="button" class="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-medium text-slate-500 hover:text-slate-700"
                    (click)="showPassword.set(!showPassword())">
                    {{ showPassword() ? 'Hide' : 'Show' }}
                  </button>
                </div>
              </div>

              <!-- Math Captcha Field -->
              <div>
                <label for="captcha" class="block text-sm font-medium text-slate-700 mb-1">Verify you are human</label>
                <div class="flex items-center gap-3">
                  <div class="bg-slate-100 border border-slate-300 px-4 py-3 rounded-lg text-slate-900 font-bold select-none whitespace-nowrap">
                    {{ captchaNum1() }} + {{ captchaNum2() }} =
                  </div>
                  <input id="captcha" name="captcha" type="number" required
                    class="block w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors sm:text-sm"
                    placeholder="Result"
                    [ngModel]="captchaAnswer()"
                    (ngModelChange)="captchaAnswer.set($event)">
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-600 border-slate-300 rounded">
                <label for="remember-me" class="ml-2 block text-sm text-slate-700">Remember me</label>
              </div>
              <div class="text-sm">
                <a href="#" class="font-semibold text-blue-600 hover:text-blue-500">Forgot password?</a>
              </div>
            </div>

            <button type="submit" [disabled]="loading() || !email() || !password() || captchaAnswer() === null"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-all duration-200">
              <span *ngIf="loading()" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ loading() ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>

          <p class="text-center text-sm text-slate-600 mt-8">
            Don't have an account? 
            <a routerLink="/register" class="font-semibold text-blue-600 hover:text-blue-500">
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

  onSubmit(): void {
    if (!this.email() || !this.password() || this.captchaAnswer() === null) return;

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
