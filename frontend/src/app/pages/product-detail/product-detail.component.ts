import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductDetail, ProductSummary } from '../../models/api';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (loading()) {
      <div class="text-slate-500">Loading…</div>
    } @else if (notFound()) {
      <div class="card text-center">
        <p class="mb-3 text-slate-700">Product not found.</p>
        <a routerLink="/catalog" class="btn-primary">Back to catalog</a>
      </div>
    } @else if (product()) {
      <div class="grid gap-8 lg:grid-cols-2">
        <img [src]="imageSrc(product()!.imageUrl)" alt="{{ product()!.name }}"
             class="aspect-square w-full rounded-lg object-cover"
             onerror="this.src='https://placehold.co/600x600?text=No+Image'" />
        <div class="space-y-4">
          <div class="text-sm text-slate-500">{{ product()!.categoryName }}</div>
          <h1 class="text-3xl font-bold">{{ product()!.name }}</h1>
          <div class="text-2xl font-bold text-brand-700">{{ product()!.price | currency }}</div>
          <p class="leading-relaxed text-slate-700 whitespace-pre-line">{{ product()!.description }}</p>
          <div class="flex flex-wrap gap-2">
            @for (t of product()!.seoTags; track t) {
              <span class="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{{ t }}</span>
            }
          </div>
          <div class="text-sm text-slate-500">
            Stock: {{ product()!.stock }} · Sold: {{ product()!.soldCount }}
          </div>
          <button class="btn-primary"
                  [disabled]="product()!.stock === 0"
                  (click)="add()">
            {{ product()!.stock === 0 ? 'Out of stock' : 'Add to cart' }}
          </button>
        </div>
      </div>

      @if (similar().length > 0) {
        <h2 class="mt-10 mb-4 text-xl font-semibold">Similar products</h2>
        <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          @for (s of similar(); track s.id) {
            <a [routerLink]="['/products', s.id]" class="card flex flex-col gap-2 transition hover:shadow-md">
              <img [src]="imageSrc(s.imageUrl)" alt="{{ s.name }}"
                   class="h-32 w-full rounded object-cover"
                   onerror="this.src='https://placehold.co/400x300?text=No+Image'" />
              <div class="text-sm font-semibold">{{ s.name }}</div>
              <div class="text-brand-700">{{ s.price | currency }}</div>
            </a>
          }
        </div>
      }
    }
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private products = inject(ProductService);
  private cart = inject(CartService);
  private auth = inject(AuthService);
  private notify = inject(NotificationService);

  product = signal<ProductDetail | null>(null);
  similar = signal<ProductSummary[]>([]);
  loading = signal(true);
  notFound = signal(false);

  ngOnInit() {
    this.route.params.subscribe(params => this.load(Number(params['id'])));
  }

  private load(id: number) {
    this.loading.set(true);
    this.notFound.set(false);
    this.product.set(null);
    this.similar.set([]);
    this.products.detail(id).subscribe({
      next: p => {
        this.product.set(p);
        this.loading.set(false);
        this.products.similar(id, 8).subscribe({
          next: s => this.similar.set(s),
          error: () => undefined
        });
      },
      error: err => {
        this.loading.set(false);
        if (err?.status === 404) this.notFound.set(true);
      }
    });
  }

  imageSrc(url: string | null | undefined): string {
    if (!url) return 'https://placehold.co/600x600?text=No+Image';
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
  }

  add() {
    if (!this.auth.isShopper()) {
      this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
      return;
    }
    const p = this.product();
    if (!p) return;
    this.cart.add(p.id, 1).subscribe({
      next: () => this.notify.push('success', `Added ${p.name} to cart.`),
      error: () => undefined
    });
  }
}
