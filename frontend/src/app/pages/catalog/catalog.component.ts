import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Category, PageResponse, ProductSummary } from '../../models/api';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <h1 class="mb-4 text-2xl font-bold">Catalog</h1>

    <div class="mb-6 grid gap-3 md:grid-cols-4">
      <input class="input md:col-span-2" placeholder="Search products…"
             [(ngModel)]="search" (keyup.enter)="reload(0)" />
      <select class="input" [(ngModel)]="categoryId" (change)="reload(0)">
        <option [ngValue]="null">All categories</option>
        @for (c of categories(); track c.id) {
          <option [ngValue]="c.id">{{ c.name }}</option>
        }
      </select>
      <select class="input" [(ngModel)]="sort" (change)="reload(0)">
        <option value="newest">Newest</option>
        <option value="priceAsc">Price low → high</option>
        <option value="priceDesc">Price high → low</option>
        <option value="popular">Most popular</option>
      </select>
    </div>

    @if (loading()) {
      <div class="text-slate-500">Loading…</div>
    } @else if (page()?.content?.length === 0) {
      <div class="card text-center text-slate-500">No products match your filter.</div>
    } @else {
      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        @for (p of page()!.content; track p.id) {
          <a [routerLink]="['/products', p.id]" class="card flex flex-col gap-2 transition hover:shadow-md">
            <img [src]="imageSrc(p)" alt="{{ p.name }}"
                 class="h-40 w-full rounded object-cover" loading="lazy"
                 onerror="this.src='https://placehold.co/400x300?text=No+Image'" />
            <div class="text-sm text-slate-500">{{ p.categoryName }}</div>
            <div class="font-semibold">{{ p.name }}</div>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold text-brand-700">{{ p.price | currency }}</span>
              <button class="btn-primary text-xs"
                      (click)="addToCart($event, p)"
                      [disabled]="p.stock === 0">
                {{ p.stock === 0 ? 'Out of stock' : 'Add to cart' }}
              </button>
            </div>
          </a>
        }
      </div>

      <div class="mt-6 flex items-center justify-between">
        <button class="btn-secondary" (click)="reload(page()!.page - 1)" [disabled]="page()!.page === 0">
          Previous
        </button>
        <span class="text-sm text-slate-600">
          Page {{ page()!.page + 1 }} of {{ page()!.totalPages || 1 }}
          ({{ page()!.totalElements }} products)
        </span>
        <button class="btn-secondary" (click)="reload(page()!.page + 1)" [disabled]="page()!.last">
          Next
        </button>
      </div>
    }
  `
})
export class CatalogComponent implements OnInit {
  private products = inject(ProductService);
  private cart = inject(CartService);
  private auth = inject(AuthService);
  private notify = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  search = '';
  categoryId: number | null = null;
  sort = 'newest';
  loading = signal(false);
  page = signal<PageResponse<ProductSummary> | null>(null);
  categories = signal<Category[]>([]);

  ngOnInit() {
    this.products.categories().subscribe({
      next: cs => this.categories.set(cs),
      error: () => undefined
    });
    const q = this.route.snapshot.queryParamMap;
    this.search = q.get('q') || '';
    this.sort = q.get('sort') || 'newest';
    const cid = q.get('categoryId');
    this.categoryId = cid ? Number(cid) : null;
    this.reload(Number(q.get('page') || 0));
  }

  reload(page: number) {
    this.loading.set(true);
    this.products
      .list({
        search: this.search,
        categoryId: this.categoryId,
        sort: this.sort,
        page,
        size: 12
      })
      .subscribe({
        next: res => {
          this.page.set(res);
          this.loading.set(false);
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              q: this.search || null,
              categoryId: this.categoryId,
              sort: this.sort,
              page
            },
            queryParamsHandling: 'merge'
          });
        },
        error: () => this.loading.set(false)
      });
  }

  imageSrc(p: ProductSummary): string {
    if (!p.imageUrl) return 'https://placehold.co/400x300?text=No+Image';
    if (p.imageUrl.startsWith('http')) return p.imageUrl;
    return `http://localhost:8080${p.imageUrl}`;
  }

  addToCart(ev: Event, p: ProductSummary) {
    ev.preventDefault();
    ev.stopPropagation();
    if (!this.auth.isShopper()) {
      this.router.navigate(['/login'], { queryParams: { redirect: '/catalog' } });
      return;
    }
    this.cart.add(p.id, 1).subscribe({
      next: () => this.notify.push('success', `Added ${p.name} to cart.`),
      error: () => undefined
    });
  }
}
