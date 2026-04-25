import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '../../models/api';
import { OrderService } from '../../services/order.service';
import { resolveImageUrl } from '../../shared/image-url';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a routerLink="/orders" class="text-sm text-brand-700">← All orders</a>
    @if (loading()) {
      <div class="mt-4 text-slate-500">Loading…</div>
    } @else if (notFound()) {
      <div class="card mt-4 text-center text-slate-500">Order not found.</div>
    } @else if (order()) {
      <h1 class="mt-2 mb-4 text-2xl font-bold">Order #{{ order()!.id }}</h1>
      <div class="card mb-4 grid gap-2 md:grid-cols-2">
        <div>
          <div class="text-sm text-slate-500">Status</div>
          <div class="font-semibold">{{ order()!.status }}</div>
        </div>
        <div>
          <div class="text-sm text-slate-500">Total</div>
          <div class="font-semibold">{{ order()!.total | currency }}</div>
        </div>
        <div>
          <div class="text-sm text-slate-500">Placed</div>
          <div>{{ order()!.createdAt | date:'medium' }}</div>
        </div>
        <div>
          <div class="text-sm text-slate-500">Payment</div>
          <div>{{ order()!.paymentMethod }}</div>
        </div>
        <div class="md:col-span-2">
          <div class="text-sm text-slate-500">Shipping address</div>
          <div class="whitespace-pre-line">{{ order()!.shippingAddress }}</div>
        </div>
      </div>

      <h2 class="mb-2 text-lg font-semibold">Items</h2>
      <div class="space-y-3">
        @for (it of order()!.items; track it.id) {
          <div class="card flex items-center gap-4">
            <img [src]="imageSrc(it.productImageUrl)" alt="{{ it.productName }}"
                 class="h-16 w-16 rounded object-cover"
                 onerror="this.src='https://placehold.co/200x200?text=No+Image'" />
            <div class="flex-1">
              <div class="font-semibold">{{ it.productName }}</div>
              <div class="text-sm text-slate-500">{{ it.unitPrice | currency }} × {{ it.quantity }}</div>
            </div>
            <div class="font-semibold">{{ (it.unitPrice * it.quantity) | currency }}</div>
          </div>
        }
      </div>
    }
  `
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orders = inject(OrderService);

  order = signal<Order | null>(null);
  loading = signal(true);
  notFound = signal(false);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orders.myOrder(id).subscribe({
      next: o => {
        this.order.set(o);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        if (err?.status === 404) this.notFound.set(true);
      }
    });
  }

  imageSrc(url: string | null | undefined): string {
    return resolveImageUrl(url, 'https://placehold.co/200x200?text=No+Image');
  }
}
