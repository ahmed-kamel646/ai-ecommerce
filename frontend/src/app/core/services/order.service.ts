import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface OrderDto {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  items: any[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  placeOrder(): Observable<OrderDto> {
    return this.http.post<OrderDto>(`${this.apiUrl}/orders`, {});
  }

  getUserOrders(): Observable<OrderDto[]> {
    return this.http.get<OrderDto[]>(`${this.apiUrl}/orders`);
  }

  getAllOrders(status?: string): Observable<OrderDto[]> {
    let url = `${this.apiUrl}/admin/orders`;
    if (status) url += `?status=${status}`;
    return this.http.get<OrderDto[]>(url);
  }

  updateOrderStatus(id: number, status: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/admin/orders/${id}/status`, { status });
  }
}
