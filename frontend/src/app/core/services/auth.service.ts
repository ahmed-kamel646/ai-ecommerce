import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../../shared/models/auth.model';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  
  currentUser = signal<AuthResponse | null>(null);

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    if (token) {
      this.loadUserFromToken(token);
    }
  }

  private loadUserFromToken(token: string) {
    try {
      const decoded: any = jwtDecode(token);
      this.currentUser.set({
        accessToken: token,
        email: decoded.sub,
        role: decoded.role || 'SHOPPER'
      });
    } catch {
      this.logout();
    }
  }

  login(credentials: any) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('token', res.accessToken);
        this.loadUserFromToken(res.accessToken);
      })
    );
  }

  register(credentials: any) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials).pipe(
      tap(res => {
        localStorage.setItem('token', res.accessToken);
        this.loadUserFromToken(res.accessToken);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUser.set(null);
  }
}
