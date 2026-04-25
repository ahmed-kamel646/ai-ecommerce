import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category, PageResponse, ProductDetail, ProductSummary } from '../models/api';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  list(params: {
    search?: string;
    categoryId?: number | null;
    sort?: string;
    page?: number;
    size?: number;
  }): Observable<PageResponse<ProductSummary>> {
    let p = new HttpParams();
    if (params.search) p = p.set('search', params.search);
    if (params.categoryId != null) p = p.set('categoryId', String(params.categoryId));
    if (params.sort) p = p.set('sort', params.sort);
    p = p.set('page', String(params.page ?? 0));
    p = p.set('size', String(params.size ?? 12));
    return this.http.get<PageResponse<ProductSummary>>(`${environment.apiBase}/api/products`, {
      params: p
    });
  }

  detail(id: number): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${environment.apiBase}/api/products/${id}`);
  }

  similar(id: number, limit = 8): Observable<ProductSummary[]> {
    return this.http.get<ProductSummary[]>(
      `${environment.apiBase}/api/products/${id}/similar?limit=${limit}`
    );
  }

  categories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiBase}/api/categories`);
  }
}
