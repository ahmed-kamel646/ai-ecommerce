import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order, OrderStatus, PageResponse, PaymentMethod } from '../models/api';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  place(shippingAddress: string, paymentMethod: PaymentMethod): Observable<Order> {
    return this.http.post<Order>(`${environment.apiBase}/api/orders`, {
      shippingAddress,
      paymentMethod
    });
  }

  myOrders(page = 0, size = 10): Observable<PageResponse<Order>> {
    const p = new HttpParams().set('page', String(page)).set('size', String(size));
    return this.http.get<PageResponse<Order>>(`${environment.apiBase}/api/orders`, { params: p });
  }

  myOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${environment.apiBase}/api/orders/${id}`);
  }

  adminList(page = 0, size = 20, status?: OrderStatus): Observable<PageResponse<Order>> {
    let p = new HttpParams().set('page', String(page)).set('size', String(size));
    if (status) p = p.set('status', status);
    return this.http.get<PageResponse<Order>>(`${environment.apiBase}/api/admin/orders`, {
      params: p
    });
  }

  adminUpdateStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${environment.apiBase}/api/admin/orders/${id}`, { status });
  }
}
