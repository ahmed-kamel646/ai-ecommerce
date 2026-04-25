import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Category } from '../../models/api';
import { NotificationService } from '../../services/notification.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-product-new',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="mb-4 text-2xl font-bold">Admin · New product</h1>
    <form (ngSubmit)="submit()" class="card max-w-xl space-y-4" enctype="multipart/form-data">
      @if (error()) {
        <div class="error">{{ error() }}</div>
      }
      <div>
        <label class="label" for="name">Name</label>
        <input id="name" name="name" class="input" [(ngModel)]="name" required maxlength="255" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="label" for="price">Price</label>
          <input id="price" name="price" type="number" min="0" step="0.01"
                 class="input" [(ngModel)]="price" required />
        </div>
        <div>
          <label class="label" for="stock">Stock</label>
          <input id="stock" name="stock" type="number" min="0" step="1"
                 class="input" [(ngModel)]="stock" required />
        </div>
      </div>
      <div>
        <label class="label" for="cat">Category</label>
        <select id="cat" name="cat" class="input" [(ngModel)]="categoryId" required>
          <option [ngValue]="null">Select…</option>
          @for (c of categories(); track c.id) {
            <option [ngValue]="c.id">{{ c.name }}</option>
          }
        </select>
      </div>
      <div>
        <label class="label" for="img">Product image (PNG/JPG/WebP, ≤ 5MB)</label>
        <input id="img" name="img" type="file" accept="image/png,image/jpeg,image/webp"
               (change)="onFile($event)" required />
      </div>
      <p class="rounded bg-slate-50 p-3 text-xs text-slate-600">
        On submit, the backend stores the image, calls the configured AI provider
        (mock by default), generates a description + SEO tags, and computes a
        1408-dimensional image embedding for similar-product recommendations.
      </p>
      <button type="submit" class="btn-primary w-full" [disabled]="loading()">
        {{ loading() ? 'Creating…' : 'Create with AI assist' }}
      </button>
    </form>
  `
})
export class AdminProductNewComponent implements OnInit {
  private http = inject(HttpClient);
  private products = inject(ProductService);
  private router = inject(Router);
  private notify = inject(NotificationService);

  name = '';
  price = 0;
  stock = 0;
  categoryId: number | null = null;
  file: File | null = null;
  categories = signal<Category[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.products.categories().subscribe({
      next: cs => this.categories.set(cs),
      error: () => undefined
    });
  }

  onFile(ev: Event) {
    const target = ev.target as HTMLInputElement;
    this.file = target.files && target.files[0] ? target.files[0] : null;
  }

  submit() {
    if (!this.file) {
      this.error.set('Please choose an image.');
      return;
    }
    if (this.categoryId == null) {
      this.error.set('Please choose a category.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const data = new Blob(
      [
        JSON.stringify({
          name: this.name,
          price: this.price,
          stock: this.stock,
          categoryId: this.categoryId
        })
      ],
      { type: 'application/json' }
    );
    const fd = new FormData();
    fd.append('data', data);
    fd.append('image', this.file);
    this.http.post<{ id: number; draft: boolean }>(`${environment.apiBase}/api/admin/products`, fd).subscribe({
      next: created => {
        this.loading.set(false);
        // The backend returns the product even when AI generation fails — in
        // that case `draft` stays true and `/products/:id` (public) 404s,
        // because draft products aren't published. Surface that to the admin
        // instead of dumping them on a 404 page.
        if (created.draft) {
          this.notify.push(
            'info',
            'Product created as draft — AI generation did not produce a description. ' +
              'It will not appear in the public catalog until edited.'
          );
          this.router.navigate(['/admin/orders']);
        } else {
          this.notify.push('success', 'Product created.');
          this.router.navigate(['/products', created.id]);
        }
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Failed to create product.');
      }
    });
  }
}
