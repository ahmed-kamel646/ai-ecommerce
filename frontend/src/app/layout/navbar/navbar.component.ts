import { Component, inject, signal, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductService } from '../../core/services/product.service';
import { LoginModalComponent } from '../../shared/login-modal/login-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoginModalComponent],
  template: `
    <!-- ── Primary Navbar ─────────────────────────────── -->
    <nav class="sticky top-0 z-50 bg-slate-800 text-white shadow-xl">
      <div class="max-w-[1400px] mx-auto px-3 sm:px-6">
        <div class="flex items-center gap-3 h-14">

          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2 flex-shrink-0 group">
            <div class="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/40 transition-shadow duration-300">
              <svg class="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <div class="hidden sm:block">
              <span class="text-white font-bold text-base leading-none">Nova</span><span class="text-indigo-400 font-black text-base">Shop</span>
              <div class="text-[9px] text-slate-500 leading-none tracking-widest uppercase">AI Powered</div>
            </div>
          </a>

          <!-- Delivery location -->
          <button class="hidden lg:flex flex-col items-start gap-0 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
            <span class="text-slate-400 text-[10px] leading-none">Deliver to</span>
            <div class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span class="text-white text-xs font-bold">Saudi Arabia</span>
            </div>
          </button>

          <!-- Search bar -->
          <div class="flex-1 flex items-center">
            <div class="flex w-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <!-- Category dropdown -->
              <select class="hidden md:block text-slate-800 text-xs font-semibold bg-slate-100 border-r border-slate-200 px-2 py-0 h-10 cursor-pointer hover:bg-slate-200 transition-colors flex-shrink-0 outline-none">
                <option>All</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Home & Garden</option>
                <option>Sports</option>
                <option>Books</option>
              </select>
              <!-- Input -->
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (keyup.enter)="doSearch()"
                placeholder="Search NovaShop..."
                class="flex-1 h-10 px-4 text-slate-800 text-sm bg-white placeholder-slate-400 outline-none"
              />
              <!-- Search button -->
              <button (click)="doSearch()" class="w-12 h-10 bg-amber-400 hover:bg-amber-500 flex items-center justify-center flex-shrink-0 transition-colors">
                <svg class="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Right actions -->
          <div class="flex items-center gap-1 flex-shrink-0">

            @if (authService.currentUser()) {
              <!-- Logged in user dropdown -->
              <div class="relative" (mouseenter)="showUserMenu = true" (mouseleave)="showUserMenu = false">
                <button class="flex flex-col items-start px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
                  <span class="text-slate-400 text-[10px] leading-none">Hello, {{ getFirstName() }}</span>
                  <span class="text-white text-xs font-bold flex items-center gap-1">
                    Account & Orders
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
                  </span>
                </button>
                @if (showUserMenu) {
                  <div class="absolute top-full right-0 mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-[scaleIn_0.15s_ease-out] origin-top-right">
                    <!-- User info -->
                    <div class="px-4 py-3 border-b border-slate-100">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold shadow">
                          {{ getUserInitial() }}
                        </div>
                        <div>
                          <div class="text-sm font-semibold text-slate-800">{{ authService.currentUser()?.email }}</div>
                          <div class="text-xs text-slate-400">{{ authService.currentUser()?.role }}</div>
                        </div>
                      </div>
                    </div>
                    <!-- Menu items -->
                    <div class="py-2">
                      <a routerLink="/cart" (click)="showUserMenu = false" class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                        My Orders
                      </a>
                      @if (authService.currentUser()?.role === 'ADMIN') {
                        <div class="border-t border-slate-100 mt-1 pt-1">
                          <a routerLink="/admin" (click)="showUserMenu = false" class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-900 hover:text-white transition-colors rounded-lg mx-2">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                            Admin Dashboard
                            <span class="ml-auto badge bg-slate-900 text-white text-[10px]">Admin</span>
                          </a>
                        </div>
                      }
                      <div class="border-t border-slate-100 mt-1 pt-1">
                        <button (click)="logout()" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <!-- Guest state -->
              <button (click)="showLogin = true" class="flex flex-col items-start px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
                <span class="text-slate-400 text-[10px] leading-none">Hello, Guest</span>
                <span class="text-white text-xs font-bold flex items-center gap-1">
                  Sign In
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></svg>
                </span>
              </button>
            }

            <!-- Returns & Orders -->
            <button class="hidden md:flex flex-col items-start px-2 py-1 rounded-lg hover:bg-white/10 transition-colors">
              <span class="text-slate-400 text-[10px] leading-none">Returns</span>
              <span class="text-white text-xs font-bold">& Orders</span>
            </button>

            <!-- Cart -->
            <a routerLink="/cart" class="flex items-end gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors relative">
              <div class="relative">
                <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span class="absolute -top-1.5 left-4 min-w-[20px] h-5 bg-amber-400 text-slate-900 text-[11px] font-black rounded-full flex items-center justify-center px-1">
                  {{ cartService.itemCount() }}
                </span>
              </div>
              <span class="text-white text-xs font-bold hidden sm:block">Cart</span>
            </a>

          </div>
        </div>
      </div>

      <!-- ── Secondary navigation bar ───────────────────── -->
      <div class="bg-slate-700 border-t border-slate-600">
        <div class="max-w-[1400px] mx-auto px-3 sm:px-6">
          <div class="flex items-center gap-1 overflow-x-auto scrollbar-hide h-10">
            <!-- Hamburger all departments -->
            <button class="flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg hover:bg-white/15 transition-colors whitespace-nowrap flex-shrink-0 border border-white/20">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
              All Departments
            </button>
            @for (cat of categories; track cat.name) {
              <a routerLink="/" [queryParams]="{category: cat.id}"
                class="px-3 py-1.5 text-white/80 hover:text-white text-xs font-medium rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap flex-shrink-0">
                {{ cat.name }}
              </a>
            }
            <a routerLink="/"
              class="px-3 py-1.5 text-amber-400 hover:text-amber-300 text-xs font-bold rounded-lg hover:bg-amber-400/10 transition-colors whitespace-nowrap flex-shrink-0">
              🔥 Today's Deals
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Login Modal -->
    @if (showLogin) {
      <app-login-modal (closeModal)="showLogin = false"></app-login-modal>
    }
  `,
  styles: [`
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }
  `]
})
export class NavbarComponent {
  authService  = inject(AuthService);
  cartService  = inject(CartService);
  toastService = inject(ToastService);
  router       = inject(Router);

  showLogin   = false;
  showUserMenu = false;
  searchQuery  = '';

  categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Home & Garden' },
    { id: 4, name: 'Sports' },
    { id: 5, name: 'Books' },
  ];

  getUserInitial() {
    return (this.authService.currentUser()?.email?.[0] ?? 'U').toUpperCase();
  }

  getFirstName() {
    const email = this.authService.currentUser()?.email ?? '';
    return email.split('@')[0].split('.')[0];
  }

  doSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/'], { queryParams: { q: this.searchQuery } });
    }
  }

  logout() {
    this.showUserMenu = false;
    this.authService.logout();
    this.cartService.clearCart();
    this.toastService.show('Signed out successfully', 'info');
  }
}
