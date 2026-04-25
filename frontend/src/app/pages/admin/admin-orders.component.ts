import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Order, OrderStatus, PageResponse } from '../../models/api';
import { NotificationService } from '../../services/notification.service';
import { OrderService } from '../../services/order.service';

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: []
};

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="mb-4 text-2xl font-bold">Admin · Orders</h1>

    <div class="mb-4 flex gap-2">
      <select class="input w-48" [(ngModel)]="statusFilter" (change)="reload(0)">
        <option [ngValue]="null">All statuses</option>
        @for (s of allStatuses; track s) {
          <option [ngValue]="s">{{ s }}</option>
        }
      </select>
    </div>

    @if (loading()) {
      <div class="text-slate-500">Loading…</div>
    } @else if (!page() || page()!.content.length === 0) {
      <div class="card text-center text-slate-500">No orders match.</div>
    } @else {
      <div class="space-y-3">
        @for (o of page()!.content; track o.id) {
          <div class="card flex flex-wrap items-center gap-3">
            <div class="flex-1">
              <div class="font-semibold">#{{ o.id }} — {{ o.total | currency }}</div>
              <div class="text-sm text-slate-500">{{ o.createdAt | date:'medium' }} · {{ o.items.length }} items</div>
              <div class="text-sm text-slate-500">{{ o.shippingAddress }}</div>
            </div>
            <span class="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{{ o.status }}</span>
            <select class="input w-40"
                    [disabled]="!nextStates(o).length"
                    (change)="advance(o, $any($event.target).value); $any($event.target).value=''">
              <option value="">{{ nextStates(o).length ? 'Move to…' : 'Final' }}</option>
              @for (s of nextStates(o); track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
          </div>
        }
      </div>
    }
  `
})
export class AdminOrdersComponent implements OnInit {
  private orders = inject(OrderService);
  private notify = inject(NotificationService);

  loading = signal(true);
  page = signal<PageResponse<Order> | null>(null);
  statusFilter: OrderStatus | null = null;

  allStatuses: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  ngOnInit() {
    this.reload(0);
  }

  nextStates(o: Order): OrderStatus[] {
    return STATUS_FLOW[o.status] ?? [];
  }

  reload(page: number) {
    this.loading.set(true);
    this.orders.adminList(page, 20, this.statusFilter ?? undefined).subscribe({
      next: p => {
        this.page.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  advance(o: Order, status: string) {
    if (!status) return;
    this.orders.adminUpdateStatus(o.id, status as OrderStatus).subscribe({
      next: updated => {
        const cur = this.page();
        if (cur) {
          this.page.set({
            ...cur,
            content: cur.content.map(x => (x.id === updated.id ? updated : x))
          });
        }
        this.notify.push('success', `Order #${o.id} → ${status}`);
      },
      error: () => undefined
    });
  }
}
