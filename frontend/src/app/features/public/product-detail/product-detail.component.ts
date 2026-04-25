import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductDetail, ProductSummary } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  template: `
    <!-- Breadcrumb -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      <nav class="flex items-center gap-2 text-sm text-slate-400">
        <a routerLink="/" class="hover:text-indigo-600 transition-colors">Store</a>
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <span class="text-slate-700 font-medium line-clamp-1">{{ product()?.name ?? '...' }}</span>
      </nav>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Loading skeleton -->
      @if (!product() && !loadError()) {
        <div class="lg:grid lg:grid-cols-2 lg:gap-12 animate-pulse">
          <div class="skeleton h-[480px] rounded-3xl"></div>
          <div class="mt-10 lg:mt-0 space-y-4">
            <div class="skeleton h-8 w-3/4 rounded"></div>
            <div class="skeleton h-6 w-1/3 rounded"></div>
            <div class="skeleton h-24 w-full rounded"></div>
            <div class="skeleton h-12 w-full rounded-xl"></div>
          </div>
        </div>
      }

      <!-- Error state -->
      @if (loadError()) {
        <div class="text-center py-24 fade-in-up">
          <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.27 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-700 mb-2">Could not load product</h3>
          <p class="text-slate-400 text-sm mb-8">The server might be offline. Please try again later.</p>
          <a routerLink="/" class="btn-primary">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Store
          </a>
        </div>
      }

      <!-- Product Detail -->
      @if (product()) {
        <div class="lg:grid lg:grid-cols-2 lg:gap-14 lg:items-start fade-in-up">

          <!-- Left: Image -->
          <div class="relative">
            <div class="overflow-hidden rounded-3xl bg-slate-100 shadow-xl">
              <img
                [src]="product()?.imageUrl || getPlaceholder(product()?.name!)"
                [alt]="product()?.name"
                class="w-full h-[420px] object-cover"
                (error)="onImgError($event)"
              />
            </div>
            <!-- AI badge -->
            <div class="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md border border-indigo-100">
              <svg class="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              AI-Enhanced
            </div>
          </div>

          <!-- Right: Info -->
          <div class="mt-10 lg:mt-0">
            <!-- Category -->
            <span class="badge-indigo">{{ product()?.categoryName }}</span>

            <!-- Title -->
            <h1 class="text-3xl font-extrabold text-slate-900 mt-3 leading-tight">{{ product()?.name }}</h1>

            <!-- Price -->
            <div class="mt-4 flex items-baseline gap-3">
              <span class="text-4xl font-black text-indigo-600">\${{ product()?.price | number:'1.2-2' }}</span>
              <span class="text-slate-400 text-sm line-through">\${{ ((product()?.price ?? 0) * 1.2) | number:'1.2-2' }}</span>
              <span class="badge-green text-xs">17% off</span>
            </div>

            <!-- Rating (decorative) -->
            <div class="flex items-center gap-2 mt-3">
              <div class="flex gap-0.5">
                @for (s of [1,2,3,4,5]; track s) {
                  <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                }
              </div>
              <span class="text-sm text-slate-500">4.8 (247 reviews)</span>
            </div>

            <!-- Divider -->
            <hr class="my-5 border-slate-100"/>

            <!-- Description -->
            <div class="text-slate-600 text-sm leading-relaxed" [innerHTML]="product()?.description || 'No description available.'"></div>

            <!-- SEO Tags -->
            @if ((product()?.seoTags?.length ?? 0) > 0) {
              <div class="flex flex-wrap gap-2 mt-5">
                @for (tag of product()?.seoTags; track tag) {
                  <span class="badge bg-slate-100 text-slate-600 text-[11px]"># {{ tag }}</span>
                }
              </div>
            }

            <!-- Stock indicator -->
            <div class="mt-5 flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span class="text-sm text-slate-600 font-medium">{{ product()?.stock }} in stock</span>
            </div>

            <!-- Actions -->
            <div class="mt-7 flex gap-3">
              <button
                (click)="addToCart()"
                [disabled]="addingToCart()"
                class="btn-primary flex-1 py-3.5 text-base">
                @if (addingToCart()) {
                  <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Adding…
                } @else {
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  Add to Cart
                }
              </button>
              <button class="btn-secondary py-3.5 px-5">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            </div>

            <!-- Trust badges -->
            <div class="mt-6 grid grid-cols-3 gap-3">
              @for (badge of trustBadges; track badge.icon) {
                <div class="text-center p-3 bg-slate-50 rounded-2xl">
                  <div class="text-2xl mb-1">{{ badge.icon }}</div>
                  <div class="text-[11px] font-semibold text-slate-600">{{ badge.text }}</div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- ── Similar Products ─────────────────────────────── -->
        @if (similarProducts().length > 0) {
          <div class="mt-20">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-2xl font-bold text-slate-900">You Might Also Like</h2>
                <p class="text-sm text-slate-400 mt-1">AI-curated picks based on this product</p>
              </div>
              <span class="badge bg-indigo-100 text-indigo-600">
                <svg class="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                AI Powered
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              @for (similar of similarProducts(); track similar.id) {
                <div class="card group cursor-pointer" [routerLink]="['/product', similar.id]">
                  <div class="h-36 overflow-hidden bg-slate-100">
                    <img [src]="similar.imageUrl || getPlaceholderFor(similar.name)" [alt]="similar.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" (error)="onImgErrorSimilar($event, similar.name)"/>
                  </div>
                  <div class="p-3">
                    <h3 class="text-xs font-semibold text-slate-700 line-clamp-2">{{ similar.name }}</h3>
                    <p class="text-sm font-bold text-indigo-600 mt-1.5">\${{ similar.price | number:'1.2-2' }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  route          = inject(ActivatedRoute);
  productService = inject(ProductService);
  cartService    = inject(CartService);
  toastService   = inject(ToastService);
  authService    = inject(AuthService);

  product        = signal<ProductDetail | null>(null);
  similarProducts = signal<ProductSummary[]>([]);
  addingToCart   = signal(false);
  loadError      = signal(false);

  trustBadges = [
    { icon: '🚚', text: 'Free Shipping' },
    { icon: '🔄', text: '30-Day Return' },
    { icon: '🔒', text: 'Secure Pay' },
  ];

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) this.loadProduct(id);
    });
  }

  loadProduct(id: number) {
    this.product.set(null);
    this.similarProducts.set([]);
    this.loadError.set(false);
    this.productService.getProduct(id).subscribe({
      next: res => {
        this.product.set(res);
        this.productService.getSimilarProducts(id).subscribe({
          next: s => this.similarProducts.set(s),
          error: () => this.similarProducts.set([])
        });
      },
      error: () => {
        this.loadError.set(true);
        this.toastService.show('Failed to load product', 'error');
      }
    });
  }

  addToCart() {
    const p = this.product();
    if (!p) return;
    this.addingToCart.set(true);
    // Build a minimal ProductSummary from ProductDetail
    const summary = { id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, categoryName: p.categoryName };
    this.cartService.addItem(summary as any, 1).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.toastService.show(`"${p.name}" added to cart!`, 'success');
      },
      error: () => {
        this.addingToCart.set(false);
        this.toastService.show('Failed to add item to cart', 'error');
      }
    });
  }

  getPlaceholder(name: string): string { return this.getPlaceholderFor(name); }
  getPlaceholderFor(name: string): string {
    const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const colors = ['6366f1','8b5cf6','ec4899','f59e0b','10b981','3b82f6'];
    const color = colors[seed % colors.length];
    const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    return `https://via.placeholder.com/400x300/${color}/ffffff?text=${encodeURIComponent(initials)}`;
  }
  onImgError(event: Event) {
    (event.target as HTMLImageElement).src = this.getPlaceholder(this.product()?.name ?? 'Product');
  }
  onImgErrorSimilar(event: Event, name: string) {
    (event.target as HTMLImageElement).src = this.getPlaceholderFor(name);
  }
}
