import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="mx-auto max-w-md">
      <h1 class="mb-6 text-2xl font-bold">Create your account</h1>
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
          <label class="label" for="password">Password (min 8 chars)</label>
          <input id="password" name="password" type="password" class="input"
                 [(ngModel)]="password" required minlength="8" autocomplete="new-password" />
        </div>
        <button type="submit" class="btn-primary w-full" [disabled]="loading()">
          {{ loading() ? 'Creating…' : 'Create account' }}
        </button>
        <p class="text-center text-sm text-slate-500">
          Already a member? <a routerLink="/login" class="font-medium text-brand-700">Sign in</a>
        </p>
      </form>
    </div>
  `
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  submit() {
    if (!this.email || !this.password || this.password.length < 8) {
      this.error.set('Password must be at least 8 characters.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.register(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.cart.refresh().subscribe({ error: () => undefined });
        this.notify.push('success', 'Welcome!');
        this.router.navigate(['/catalog']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Registration failed.');
      }
    });
  }
}
