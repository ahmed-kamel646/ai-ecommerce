import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-full">
      <header class="bg-white border-b border-slate-200">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <a routerLink="/" class="text-xl font-bold text-brand-700">AI Ecommerce</a>
          <nav class="flex items-center gap-4 text-sm">
            <a routerLink="/catalog" routerLinkActive="text-brand-700 font-semibold"
               class="text-slate-700 hover:text-brand-700">Catalog</a>
            @if (auth.isShopper()) {
              <a routerLink="/orders" routerLinkActive="text-brand-700 font-semibold"
                 class="text-slate-700 hover:text-brand-700">My Orders</a>
            }
            @if (auth.isAdmin()) {
              <a routerLink="/admin/orders" routerLinkActive="text-brand-700 font-semibold"
                 class="text-slate-700 hover:text-brand-700">Admin Orders</a>
              <a routerLink="/admin/products/new" routerLinkActive="text-brand-700 font-semibold"
                 class="text-slate-700 hover:text-brand-700">New Product</a>
            }
            <a routerLink="/cart" class="relative text-slate-700 hover:text-brand-700">
              Cart
              @if (cart.count() > 0) {
                <span class="ml-1 rounded-full bg-brand-700 px-2 py-0.5 text-xs text-white">{{ cart.count() }}</span>
              }
            </a>
            @if (auth.isAuthenticated()) {
              <span class="text-slate-500">{{ auth.user()?.email }}</span>
              <button (click)="logout()" class="btn-secondary">Logout</button>
            } @else {
              <a routerLink="/login" class="btn-secondary">Login</a>
              <a routerLink="/register" class="btn-primary">Register</a>
            }
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-7xl px-4 py-6">
        <router-outlet></router-outlet>
      </main>

      <div class="fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
        @for (n of notify.notices(); track n.id) {
          <div class="rounded-md px-4 py-3 text-sm shadow-lg"
               [class.bg-red-600]="n.level === 'error'"
               [class.bg-emerald-600]="n.level === 'success'"
               [class.bg-slate-700]="n.level === 'info'"
               [class.text-white]="true">
            {{ n.message }}
          </div>
        }
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  auth = inject(AuthService);
  cart = inject(CartService);
  notify = inject(NotificationService);
  private router = inject(Router);

  ngOnInit() {
    if (this.auth.isShopper()) {
      this.cart.refresh().subscribe({ error: () => undefined });
    }
  }

  logout() {
    this.auth.logout();
    this.cart.reset();
    this.router.navigate(['/login']);
  }
}
