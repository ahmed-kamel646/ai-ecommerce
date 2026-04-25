import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cart } from '../models/api';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);

  private _cart = signal<Cart>({ items: [], total: 0 });
  cart = this._cart.asReadonly();
  count = computed(() => this._cart().items.reduce((s, i) => s + i.quantity, 0));

  refresh() {
    return this.http.get<Cart>(`${environment.apiBase}/api/cart`).pipe(tap(c => this._cart.set(c)));
  }

  add(productId: number, quantity = 1) {
    return this.http
      .post<Cart>(`${environment.apiBase}/api/cart/items`, { productId, quantity })
      .pipe(tap(c => this._cart.set(c)));
  }

  update(itemId: number, quantity: number) {
    return this.http
      .patch<Cart>(`${environment.apiBase}/api/cart/items/${itemId}`, { quantity })
      .pipe(tap(c => this._cart.set(c)));
  }

  remove(itemId: number) {
    return this.http
      .delete<Cart>(`${environment.apiBase}/api/cart/items/${itemId}`)
      .pipe(tap(c => this._cart.set(c)));
  }

  clear() {
    return this.http
      .delete<void>(`${environment.apiBase}/api/cart`)
      .pipe(tap(() => this._cart.set({ items: [], total: 0 })));
  }

  reset() {
    this._cart.set({ items: [], total: 0 });
  }
}
