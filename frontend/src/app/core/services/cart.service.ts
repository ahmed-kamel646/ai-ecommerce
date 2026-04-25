import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cart, CartItem } from '../../shared/models/cart.model';
import { ProductSummary } from '../../shared/models/product.model';
import { Observable, of, tap } from 'rxjs';
import { AuthService } from './auth.service';

const GUEST_CART_KEY = 'nova_guest_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http        = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl      = `${environment.apiUrl}/api/cart`;

  /** Unified reactive cart — works for guests AND logged-in users */
  cart = signal<Cart | null>(null);

  itemCount = computed(() => {
    return this.cart()?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  });

  constructor() {
    // On startup, restore guest cart if user is not logged in
    if (!this.authService.currentUser()) {
      const saved = this.loadGuestCart();
      if (saved) this.cart.set(saved);
    }
  }

  // ─── Server cart (authenticated) ─────────────────────────────────────────

  loadCart() {
    if (!this.authService.currentUser()) return;
    this.http.get<Cart>(this.apiUrl).pipe(
      tap(c => this.cart.set(c))
    ).subscribe({ error: () => {} });
  }

  addItem(product: ProductSummary, quantity = 1): Observable<Cart> {
    if (!this.authService.currentUser()) {
      // Guest mode — add to localStorage
      return of(this.guestAddItem(product, quantity));
    }
    return this.http.post<Cart>(`${this.apiUrl}/items`, { productId: product.id, quantity }).pipe(
      tap(c => this.cart.set(c))
    );
  }

  addItemById(productId: number, productName: string, price: number, imageUrl: string, quantity = 1): Observable<Cart> {
    if (!this.authService.currentUser()) {
      const fakeProduct: ProductSummary = { id: productId, name: productName, price, imageUrl, categoryName: '' };
      return of(this.guestAddItem(fakeProduct, quantity));
    }
    return this.http.post<Cart>(`${this.apiUrl}/items`, { productId, quantity }).pipe(
      tap(c => this.cart.set(c))
    );
  }

  updateItem(itemId: number, quantity: number): Observable<Cart> {
    if (!this.authService.currentUser()) {
      return of(this.guestUpdateItem(itemId, quantity));
    }
    return this.http.patch<Cart>(`${this.apiUrl}/items/${itemId}`, { quantity }).pipe(
      tap(c => this.cart.set(c))
    );
  }

  removeItem(itemId: number): Observable<any> {
    if (!this.authService.currentUser()) {
      this.guestRemoveItem(itemId);
      return of(null);
    }
    return this.http.delete<void>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap(() => this.loadCart())
    );
  }

  clearCart() {
    if (!this.authService.currentUser()) {
      localStorage.removeItem(GUEST_CART_KEY);
      this.cart.set(null);
    } else {
      this.cart.set(null);
    }
  }

  // ─── Guest cart helpers (localStorage) ──────────────────────────────────

  private loadGuestCart(): Cart | null {
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private saveGuestCart(cart: Cart) {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    this.cart.set({ ...cart });
  }

  private guestAddItem(product: ProductSummary, quantity: number): Cart {
    const current = this.cart() ?? { items: [], total: 0 };
    const existing = current.items.find(i => i.productId === product.id);
    let items: CartItem[];
    if (existing) {
      items = current.items.map(i =>
        i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      const newItem: CartItem = {
        id: Date.now(),         // temporary local ID
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity,
        imageUrl: product.imageUrl
      };
      items = [...current.items, newItem];
    }
    const cart: Cart = { items, total: this.calcTotal(items) };
    this.saveGuestCart(cart);
    return cart;
  }

  private guestUpdateItem(itemId: number, quantity: number): Cart {
    const current = this.cart() ?? { items: [], total: 0 };
    const items = current.items.map(i => i.id === itemId ? { ...i, quantity } : i);
    const cart: Cart = { items, total: this.calcTotal(items) };
    this.saveGuestCart(cart);
    return cart;
  }

  private guestRemoveItem(itemId: number) {
    const current = this.cart() ?? { items: [], total: 0 };
    const items = current.items.filter(i => i.id !== itemId);
    const cart: Cart = { items, total: this.calcTotal(items) };
    this.saveGuestCart(cart);
  }

  private calcTotal(items: CartItem[]): number {
    return items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  }
}
