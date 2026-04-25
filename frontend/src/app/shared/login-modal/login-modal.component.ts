import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 z-[9000] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" (click)="closeModal.emit()"></div>

      <!-- Modal -->
      <div class="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]">

        <!-- Header -->
        <div class="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2.5 mb-1">
                <div class="w-7 h-7 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <span class="text-white font-bold text-lg">NovaShop</span>
              </div>
              <p class="text-slate-300 text-sm">{{ isRegisterMode ? 'Create an account' : 'Welcome back!' }}</p>
            </div>
            <button (click)="closeModal.emit()" class="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-slate-100">
          <button (click)="isRegisterMode = false"
            class="flex-1 py-3 text-sm font-semibold transition-all duration-200 relative"
            [class]="!isRegisterMode ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'">
            <span class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Sign In
            </span>
            @if (!isRegisterMode) {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></div>
            }
          </button>
          <button (click)="isRegisterMode = true"
            class="flex-1 py-3 text-sm font-semibold transition-all duration-200 relative"
            [class]="isRegisterMode ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'">
            <span class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
              Create Account
            </span>
            @if (isRegisterMode) {
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></div>
            }
          </button>
        </div>

        <!-- Form -->
        <div class="px-8 py-6">
          <div class="space-y-4">
            @if (!isRegisterMode) {
              <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm text-indigo-700">
                <strong>Demo:</strong> shopper&#64;demo.com or admin&#64;demo.com (password: <strong>password123</strong>)
              </div>
            }
            
            <div>
              <label class="form-label">Email Address</label>
              <input [(ngModel)]="email" type="email" class="form-input" placeholder="you@example.com" (keyup.enter)="submit()"/>
            </div>
            
            <div>
              <label class="form-label">Password</label>
              <div class="relative">
                <input [(ngModel)]="password" [type]="showPassword ? 'text' : 'password'" class="form-input pr-11" placeholder="••••••••" (keyup.enter)="submit()"/>
                <button type="button" (click)="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  @if (showPassword) {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  }
                </button>
              </div>
            </div>
            
            @if (isRegisterMode) {
              <div>
                <label class="form-label">Confirm Password</label>
                <input [(ngModel)]="confirmPassword" [type]="showPassword ? 'text' : 'password'" class="form-input" placeholder="••••••••" (keyup.enter)="submit()"/>
              </div>
            }

            <button (click)="submit()" [disabled]="loading()" class="btn-primary w-full py-3.5">
              @if (loading()) {
                <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                {{ isRegisterMode ? 'Creating account...' : 'Signing in...' }}
              } @else {
                {{ isRegisterMode ? 'Create Account' : 'Sign In' }}
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
  `]
})
export class LoginModalComponent {
  authService  = inject(AuthService);
  cartService  = inject(CartService);
  toastService = inject(ToastService);

  @Output() closeModal = new EventEmitter<void>();
  
  email           = '';
  password        = '';
  confirmPassword = '';
  isRegisterMode  = false;
  showPassword    = false;
  loading         = signal(false);

  submit() {
    if (!this.email || !this.password) {
      this.toastService.show('Please enter email and password', 'error');
      return;
    }
    
    if (this.isRegisterMode && this.password !== this.confirmPassword) {
      this.toastService.show('Passwords do not match', 'error');
      return;
    }

    this.loading.set(true);

    const authAction$ = this.isRegisterMode
      ? this.authService.register({ email: this.email, password: this.password })
      : this.authService.login({ email: this.email, password: this.password });

    authAction$.subscribe({
      next: (res) => {
        this.cartService.loadCart();
        const msg = res.role === 'ADMIN' ? 'Admin access granted' : (this.isRegisterMode ? 'Account created successfully!' : 'Welcome back!');
        this.toastService.show(msg, 'success');
        this.loading.set(false);
        this.closeModal.emit();
      },
      error: () => {
        this.loading.set(false);
        this.toastService.show(this.isRegisterMode ? 'Registration failed. Email might exist.' : 'Invalid credentials. Please try again.', 'error');
      }
    });
  }
}
