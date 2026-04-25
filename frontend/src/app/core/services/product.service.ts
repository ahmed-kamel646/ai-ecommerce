import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PageResponse, ProductDetail, ProductDraft, ProductSummary } from '../../shared/models/product.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  getProducts(search?: string, categoryId?: number, page: number = 0, size: number = 12): Observable<PageResponse<ProductSummary>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) params = params.set('search', search);
    if (categoryId) params = params.set('categoryId', categoryId.toString());

    return this.http.get<PageResponse<ProductSummary>>(`${this.apiUrl}/products`, { params });
  }

  getProduct(id: number): Observable<ProductDetail> {
    return this.http.get<ProductDetail>((`${this.apiUrl}/products/${id}`));
  }

  getSimilarProducts(id: number, limit: number = 6): Observable<ProductSummary[]> {
    return this.http.get<ProductSummary[]>(`${this.apiUrl}/products/${id}/similar?limit=${limit}`);
  }

  createProduct(formData: FormData): Observable<ProductDraft> {
    return this.http.post<ProductDraft>(`${this.apiUrl}/admin/products`, formData);
  }

  updateProduct(id: number, formData: FormData): Observable<ProductDraft> {
    return this.http.put<ProductDraft>(`${this.apiUrl}/admin/products/${id}`, formData);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/products/${id}`);
  }

  regenerateText(id: number): Observable<{ description: string, seoTags: string[] }> {
    return this.http.post<{ description: string, seoTags: string[] }>(`${this.apiUrl}/admin/products/${id}/regenerate-text`, {});
  }
}
