import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PaymentMethod } from '../../models/api';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h1 class="mb-4 text-2xl font-bold">Checkout</h1>

    @if (cart.cart().items.length === 0) {
      <div class="card text-center text-slate-500">
        Cart is empty. <a routerLink="/catalog" class="font-medium text-brand-700">Browse products</a>.
      </div>
    } @else {
      <div class="grid gap-6 lg:grid-cols-3">
        <form (ngSubmit)="submit()" class="card space-y-4 lg:col-span-2">
          @if (error()) {
            <div class="error">{{ error() }}</div>
          }
          <div>
            <label class="label" for="addr">Shipping address</label>
            <textarea id="addr" name="addr" rows="3" class="input"
                      [(ngModel)]="address" required maxlength="500"></textarea>
          </div>
          <fieldset>
            <legend class="label">Payment method</legend>
            <div class="flex gap-4">
              <label class="flex items-center gap-2">
                <input type="radio" name="pm" value="COD" [(ngModel)]="paymentMethod" />
                Cash on delivery
              </label>
              <label class="flex items-center gap-2">
                <input type="radio" name="pm" value="MOCK_CARD" [(ngModel)]="paymentMethod" />
                Card (mock)
              </label>
            </div>
          </fieldset>
          <button type="submit" class="btn-primary w-full" [disabled]="loading()">
            {{ loading() ? 'Placing order…' : 'Place order' }}
          </button>
        </form>

        <div class="card space-y-2">
          <h2 class="text-lg font-semibold">Order summary</h2>
          @for (item of cart.cart().items; track item.id) {
            <div class="flex justify-between text-sm">
              <span>{{ item.productName }} × {{ item.quantity }}</span>
              <span>{{ item.lineTotal | currency }}</span>
            </div>
          }
          <hr class="my-2" />
          <div class="flex justify-between font-bold">
            <span>Total</span>
            <span class="text-brand-700">{{ cart.cart().total | currency }}</span>
          </div>
        </div>
      </div>
    }
  `
})
export class CheckoutComponent implements OnInit {
  cart = inject(CartService);
  private orders = inject(OrderService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  address = '';
  paymentMethod: PaymentMethod = 'COD';
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.cart.refresh().subscribe({ error: () => undefined });
  }

  submit() {
    if (!this.address.trim()) {
      this.error.set('Shipping address is required.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.orders.place(this.address, this.paymentMethod).subscribe({
      next: order => {
        this.loading.set(false);
        this.cart.reset();
        this.notify.push('success', 'Order placed.');
        this.router.navigate(['/orders', order.id]);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Could not place order.');
      }
    });
  }
}
