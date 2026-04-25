import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoginModalComponent } from '../../../shared/login-modal/login-modal.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe, LoginModalComponent],
  template: `
    <div class="bg-slate-50 min-h-screen">
      <div class="max-w-[1400px] mx-auto px-4 py-6">

        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
          <a routerLink="/" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </a>
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900">Shopping Cart</h1>
            <p class="text-sm text-slate-400">{{ cartService.cart()?.items?.length ?? 0 }} items in your cart</p>
          </div>
        </div>

        <!-- Guest notice -->
        @if (!authService.currentUser()) {
          <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-amber-800">You're shopping as a guest</p>
              <p class="text-xs text-amber-600 mt-0.5">Sign in to save your cart, track orders, and checkout securely</p>
            </div>
            <button (click)="showLogin = true" class="btn-primary py-2 px-4 text-sm flex-shrink-0">Sign In</button>
          </div>
        }

        @if ((cartService.cart()?.items?.length ?? 0) > 0) {
          <div class="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">

            <!-- Items -->
            <section class="lg:col-span-8 space-y-3">
              <!-- Select all header -->
              <div class="bg-white rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm border border-slate-100">
                <input type="checkbox" class="w-4 h-4 rounded accent-indigo-600"/>
                <span class="text-sm text-slate-600">Select all items</span>
                <span class="ml-auto text-sm text-slate-400">Price</span>
              </div>

              @for (item of cartService.cart()?.items; track item.id) {
                <div class="bg-white rounded-2xl p-5 flex gap-4 shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors fade-in-up">
                  <input type="checkbox" class="w-4 h-4 rounded accent-indigo-600 flex-shrink-0 mt-1"/>
                  <!-- Image -->
                  <a [routerLink]="['/product', item.productId]" class="flex-shrink-0">
                    <div class="w-28 h-28 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                      <img [src]="item.imageUrl || getPlaceholder(item.name)" [alt]="item.name"
                        class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        (error)="onImgError($event, item.name)"/>
                    </div>
                  </a>
                  <!-- Details -->
                  <div class="flex-1 min-w-0">
                    <a [routerLink]="['/product', item.productId]" class="text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-2">{{ item.name }}</a>
                    <div class="flex items-center gap-1 mt-1">
                      <span class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">✓ PRIME</span>
                      <span class="text-xs text-emerald-600 font-medium">In Stock</span>
                    </div>
                    <p class="text-xl font-black text-slate-900 mt-2">\${{ item.unitPrice | number:'1.2-2' }}</p>

                    <!-- Qty + remove -->
                    <div class="flex items-center gap-4 mt-3">
                      <div class="flex items-center bg-slate-100 rounded-xl overflow-hidden">
                        <button (click)="decrement(item.id, item.quantity)" class="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-indigo-600 font-bold text-lg transition-all">-</button>
                        <span class="w-8 text-center text-sm font-bold text-slate-800">{{ item.quantity }}</span>
                        <button (click)="increment(item.id, item.quantity)" class="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-indigo-600 font-bold text-lg transition-all">+</button>
                      </div>
                      <button (click)="removeItem(item.id)" class="text-sm text-red-500 hover:text-red-700 hover:underline transition-colors flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Delete
                      </button>
                      <button class="text-sm text-indigo-600 hover:underline transition-colors">Save for later</button>
                    </div>
                  </div>
                  <!-- Subtotal -->
                  <div class="flex-shrink-0 text-right">
                    <p class="text-sm text-slate-400 text-xs mb-1">Subtotal</p>
                    <p class="text-base font-bold text-slate-900">\${{ (item.unitPrice * item.quantity) | number:'1.2-2' }}</p>
                  </div>
                </div>
              }
            </section>

            <!-- Order Summary -->
            <aside class="lg:col-span-4 mt-6 lg:mt-0">
              <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-32">
                <h2 class="text-lg font-bold text-slate-900 mb-5">Order Summary</h2>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between text-slate-600">
                    <span>Items ({{ cartService.cart()?.items?.length }})</span>
                    <span class="font-semibold text-slate-800">\${{ cartService.cart()?.total | number:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between text-slate-600">
                    <span>Shipping & Handling</span>
                    <span class="font-semibold text-emerald-600">Free</span>
                  </div>
                  <div class="flex justify-between text-slate-600">
                    <span>Before Tax</span>
                    <span class="font-semibold text-slate-800">\${{ cartService.cart()?.total | number:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between text-slate-600">
                    <span>Estimated Tax (8%)</span>
                    <span class="font-semibold text-slate-800">\${{ ((cartService.cart()?.total ?? 0) * 0.08) | number:'1.2-2' }}</span>
                  </div>
                  <hr class="border-slate-100 my-2"/>
                  <div class="flex justify-between text-base font-black text-slate-900">
                    <span>Order Total</span>
                    <span class="text-red-600">\${{ ((cartService.cart()?.total ?? 0) * 1.08) | number:'1.2-2' }}</span>
                  </div>
                </div>

                @if (!authService.currentUser()) {
                  <!-- Guest checkout -->
                  <div class="mt-5 space-y-2">
                    <button (click)="showLogin = true" class="btn-primary w-full py-3.5 text-base">
                      Sign In to Checkout
                    </button>
                    <button (click)="guestCheckout()" class="btn-secondary w-full py-3 text-sm">
                      Continue as Guest
                    </button>
                  </div>
                  <p class="text-xs text-center text-slate-400 mt-3">Sign in for faster checkout & order tracking</p>
                } @else {
                  <button (click)="checkout()" [disabled]="checkingOut()" class="btn-primary w-full mt-5 py-4 text-base">
                    @if (checkingOut()) {
                      <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                      Processing…
                    } @else {
                      🔒 Proceed to Checkout
                    }
                  </button>
                }

                <!-- Trust badges -->
                <div class="mt-5 grid grid-cols-3 gap-2">
                  @for (b of ['🔒 Secure','🚚 Fast','↩️ Easy Return']; track b) {
                    <div class="bg-slate-50 rounded-xl p-2 text-center text-[10px] font-semibold text-slate-500">{{ b }}</div>
                  }
                </div>
              </div>
            </aside>
          </div>
        }

        <!-- Empty cart -->
        @if ((cartService.cart()?.items?.length ?? 0) === 0) {
          <div class="text-center py-24 fade-in-up">
            <div class="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-12 h-12 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <h3 class="text-2xl font-bold text-slate-700 mb-2">Your cart is empty</h3>
            <p class="text-slate-400 mb-8">No items yet — browse our products and add them to your cart!</p>
            <a routerLink="/" class="btn-primary py-3 px-8 text-base">Continue Shopping</a>
          </div>
        }
      </div>
    </div>

    @if (showLogin) {
      <app-login-modal (closeModal)="showLogin = false"></app-login-modal>
    }
  `
})
export class CartComponent implements OnInit {
  cartService  = inject(CartService);
  orderService = inject(OrderService);
  toastService = inject(ToastService);
  authService  = inject(AuthService);

  checkingOut = signal(false);
  showLogin   = false;

  ngOnInit() { this.cartService.loadCart(); }

  increment(id: number, q: number) { this.cartService.updateItem(id, q + 1).subscribe(); }
  decrement(id: number, q: number) { q <= 1 ? this.removeItem(id) : this.cartService.updateItem(id, q - 1).subscribe(); }

  removeItem(id: number) {
    this.cartService.removeItem(id).subscribe({ next: () => this.toastService.show('Item removed', 'info') });
  }

  checkout() {
    this.checkingOut.set(true);
    this.orderService.placeOrder().subscribe({
      next: () => { this.checkingOut.set(false); this.toastService.show('🎉 Order placed! Thank you!', 'success'); this.cartService.loadCart(); },
      error: () => { this.checkingOut.set(false); this.toastService.show('Failed to place order. Try again.', 'error'); }
    });
  }

  guestCheckout() {
    this.toastService.show('Please sign in to complete your purchase', 'info');
    this.showLogin = true;
  }

  getPlaceholder(name: string): string {
    const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const colors = ['6366f1','8b5cf6','ec4899','f59e0b','10b981','3b82f6'];
    const initials = name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
    return `https://placehold.co/400x300/${colors[seed % colors.length]}/ffffff?text=${encodeURIComponent(initials)}`;
  }
  onImgError(e: Event, name: string) { (e.target as HTMLImageElement).src = this.getPlaceholder(name); }
}
