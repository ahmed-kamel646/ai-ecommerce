import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order, PageResponse } from '../../models/api';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h1 class="mb-4 text-2xl font-bold">My orders</h1>
    @if (loading()) {
      <div class="text-slate-500">Loading…</div>
    } @else if (page()?.content?.length === 0) {
      <div class="card text-center text-slate-500">You haven't placed any orders yet.</div>
    } @else {
      <div class="space-y-3">
        @for (o of page()!.content; track o.id) {
          <a [routerLink]="['/orders', o.id]" class="card block transition hover:shadow-md">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-semibold">Order #{{ o.id }}</div>
                <div class="text-sm text-slate-500">
                  {{ o.createdAt | date:'medium' }} · {{ o.items.length }} items
                </div>
              </div>
              <div class="text-right">
                <div class="text-lg font-bold text-brand-700">{{ o.total | currency }}</div>
                <span class="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{{ o.status }}</span>
              </div>
            </div>
          </a>
        }
      </div>
    }
  `
})
export class OrdersComponent implements OnInit {
  private orders = inject(OrderService);
  loading = signal(true);
  page = signal<PageResponse<Order> | null>(null);

  ngOnInit() {
    this.orders.myOrders(0, 20).subscribe({
      next: p => {
        this.page.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
