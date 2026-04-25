import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../models/api';

const TOKEN_KEY = 'ai_ecom_token';
const USER_KEY = 'ai_ecom_user';

interface StoredUser {
  email: string;
  role: 'ADMIN' | 'SHOPPER';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private _user = signal<StoredUser | null>(this.loadUser());
  user = this._user.asReadonly();

  isAuthenticated = computed(() => this._user() !== null);
  isAdmin = computed(() => this._user()?.role === 'ADMIN');
  isShopper = computed(() => this._user()?.role === 'SHOPPER');

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBase}/api/auth/login`, { email, password })
      .pipe(tap(res => this.persist(res)));
  }

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBase}/api/auth/register`, { email, password })
      .pipe(tap(res => this.persist(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  private persist(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    const user: StoredUser = { email: res.email, role: res.role };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  private loadUser(): StoredUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as StoredUser) : null;
    } catch {
      return null;
    }
  }
}
