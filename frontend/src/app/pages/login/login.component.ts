import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-md">
      <h1 class="mb-6 text-2xl font-bold">Sign in</h1>
      <form (ngSubmit)="submit()" class="card space-y-4">
        @if (error()) {
          <div class="error">{{ error() }}</div>
        }
        <div>
          <label class="label" for="email">Email</label>
          <input id="email" name="email" type="email" class="input"
                 [(ngModel)]="email" required autocomplete="email" />
        </div>
        <div>
          <label class="label" for="password">Password</label>
          <input id="password" name="password" type="password" class="input"
                 [(ngModel)]="password" required autocomplete="current-password" />
        </div>
        <button type="submit" class="btn-primary w-full" [disabled]="loading()">
          {{ loading() ? 'Signing in…' : 'Sign in' }}
        </button>
        <p class="text-center text-sm text-slate-500">
          New here? <a routerLink="/register" class="font-medium text-brand-700">Create an account</a>
        </p>
      </form>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  submit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        if (this.auth.isShopper()) {
          this.cart.refresh().subscribe({ error: () => undefined });
        }
        this.notify.push('success', 'Signed in.');
        const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/catalog';
        this.router.navigateByUrl(redirect);
      },
      error: err => {
        this.loading.set(false);
        const msg = err?.error?.message || 'Invalid email or password.';
        this.error.set(msg);
      }
    });
  }
}
