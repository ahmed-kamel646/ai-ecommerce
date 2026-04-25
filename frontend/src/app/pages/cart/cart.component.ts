import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h1 class="mb-4 text-2xl font-bold">Your cart</h1>

    @if (cart.cart().items.length === 0) {
      <div class="card text-center text-slate-500">
        Your cart is empty. <a routerLink="/catalog" class="font-medium text-brand-700">Browse products</a>.
      </div>
    } @else {
      <div class="space-y-3">
        @for (item of cart.cart().items; track item.id) {
          <div class="card flex items-center gap-4">
            <img [src]="imageSrc(item.productImageUrl)" alt="{{ item.productName }}"
                 class="h-20 w-20 rounded object-cover"
                 onerror="this.src='https://placehold.co/200x200?text=No+Image'" />
            <a [routerLink]="['/products', item.productId]" class="flex-1">
              <div class="font-semibold">{{ item.productName }}</div>
              <div class="text-sm text-slate-500">{{ item.unitPrice | currency }} each</div>
            </a>
            <input type="number" min="0" class="input w-20"
                   [value]="item.quantity"
                   (change)="changeQty(item.id, $any($event.target).value)" />
            <div class="w-24 text-right font-semibold">{{ item.lineTotal | currency }}</div>
            <button class="btn-secondary" (click)="remove(item.id)">Remove</button>
          </div>
        }
      </div>

      <div class="mt-6 flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
        <div>
          <button class="btn-secondary" (click)="clear()">Clear cart</button>
        </div>
        <div class="text-right">
          <div class="text-sm text-slate-500">Total</div>
          <div class="text-2xl font-bold text-brand-700">{{ cart.cart().total | currency }}</div>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button class="btn-primary" (click)="checkout()">Proceed to checkout</button>
      </div>
    }
  `
})
export class CartComponent implements OnInit {
  cart = inject(CartService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  ngOnInit() {
    this.cart.refresh().subscribe({ error: () => undefined });
  }

  imageSrc(url: string | null | undefined): string {
    if (!url) return 'https://placehold.co/200x200?text=No+Image';
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
  }

  changeQty(id: number, raw: string) {
    const qty = Math.max(0, Math.floor(Number(raw) || 0));
    this.cart.update(id, qty).subscribe({
      next: () => undefined,
      error: () => undefined
    });
  }

  remove(id: number) {
    this.cart.remove(id).subscribe({
      next: () => this.notify.push('info', 'Item removed.'),
      error: () => undefined
    });
  }

  clear() {
    this.cart.clear().subscribe({
      next: () => this.notify.push('info', 'Cart cleared.'),
      error: () => undefined
    });
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }
}
