import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductSummary } from '../../../shared/models/product.model';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DecimalPipe],
  template: `
  <!-- ── Hero Deals Banner ─────────────────────────── -->
  <section class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-10 px-4">
    <div class="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Main banner -->
      <div class="md:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 flex items-center justify-between overflow-hidden relative">
        <div class="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full"></div>
        <div class="absolute -right-4 bottom-0 w-32 h-32 bg-white/5 rounded-full"></div>
        <div class="relative z-10">
          <span class="inline-flex items-center gap-1.5 bg-amber-400 text-slate-900 text-[11px] font-black px-3 py-1 rounded-full mb-3">
            🔥 HOT DEAL
          </span>
          <h2 class="text-3xl font-black leading-tight mb-2">AI-Curated<br/>Products Just For You</h2>
          <p class="text-indigo-200 text-sm mb-5">Our AI analyzes your preferences and recommends the perfect products</p>
          <button class="bg-amber-400 text-slate-900 font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-amber-300 transition-colors">
            Shop Now →
          </button>
        </div>
        <div class="relative z-10 hidden md:flex flex-col items-center gap-2">
          <div class="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center text-5xl">🛍️</div>
        </div>
      </div>
      <!-- Side banners -->
      <div class="flex flex-col gap-4">
        <div class="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 flex items-center gap-4">
          <div class="text-4xl">🚚</div>
          <div>
            <div class="font-bold text-sm">Free Delivery</div>
            <div class="text-emerald-200 text-xs">On orders over $50</div>
          </div>
        </div>
        <div class="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-5 flex items-center gap-4">
          <div class="text-4xl">🔒</div>
          <div>
            <div class="font-bold text-sm">Secure Payments</div>
            <div class="text-amber-200 text-xs">256-bit SSL encryption</div>
          </div>
        </div>
        <div class="bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl p-5 flex items-center gap-4">
          <div class="text-4xl">↩️</div>
          <div>
            <div class="font-bold text-sm">30-Day Returns</div>
            <div class="text-pink-200 text-xs">Hassle-free policy</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Category Shortcuts ────────────────────────── -->
  <section class="bg-white border-b border-slate-100 py-4 px-4">
    <div class="max-w-[1400px] mx-auto flex gap-2 overflow-x-auto scrollbar-hide">
      @for (cat of categories; track cat.id) {
        <button (click)="filterByCategory(cat.id)"
          class="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-200 min-w-[80px]"
          [class]="selectedCategory() === cat.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'">
          <span class="text-2xl">{{ cat.icon }}</span>
          <span class="text-[11px] font-semibold whitespace-nowrap">{{ cat.name }}</span>
        </button>
      }
      @if (selectedCategory()) {
        <button (click)="clearFilter()" class="flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-red-400 hover:text-red-500 transition-all min-w-[80px]">
          <span class="text-2xl">✕</span>
          <span class="text-[11px] font-semibold">Clear</span>
        </button>
      }
    </div>
  </section>

  <!-- ── Products Area ─────────────────────────────── -->
  <div class="max-w-[1400px] mx-auto px-4 py-6">
    <!-- Toolbar -->
    <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
      <div>
        <h2 class="text-lg font-bold text-slate-900">
          {{ getCategoryLabel() }}
        </h2>
        @if (!loading()) {
          <p class="text-sm text-slate-400">{{ totalElements() }} products</p>
        }
      </div>
      <div class="flex items-center gap-3">
        <!-- Sort -->
        <select class="form-input py-2 text-sm w-auto" (change)="onSort($event)">
          <option value="">Sort: Featured</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        <!-- View toggle -->
        <div class="flex bg-slate-100 rounded-xl p-1">
          <button (click)="setView('grid')" class="p-1.5 rounded-lg transition-colors" [class]="view() === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
          </button>
          <button (click)="setView('list')" class="p-1.5 rounded-lg transition-colors" [class]="view() === 'list' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Skeletons -->
    @if (loading()) {
      <div [class]="view() === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'flex flex-col gap-3'">
        @for (s of skeletons; track s) {
          <div class="card"><div class="skeleton h-48 rounded-t-2xl rounded-b-none"></div><div class="p-4 space-y-2"><div class="skeleton h-4 w-3/4 rounded"></div><div class="skeleton h-3 w-1/2 rounded"></div><div class="skeleton h-5 w-1/3 rounded"></div></div></div>
        }
      </div>
    }

    <!-- Empty State -->
    @if (!loading() && products().length === 0) {
      <div class="text-center py-24 fade-in-up">
        <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <h3 class="text-xl font-bold text-slate-700 mb-2">No products found</h3>
        <p class="text-slate-400 text-sm mb-6">Try a different search or category</p>
        <button (click)="clearFilter()" class="btn-primary">Browse All Products</button>
      </div>
    }

    <!-- Grid View -->
    @if (!loading() && products().length > 0 && view() === 'grid') {
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 fade-in-up">
        @for (product of displayedProducts(); track product.id) {
          <div class="card group relative cursor-pointer" [routerLink]="['/product', product.id]">
            <!-- Badge -->
            @if (getDiscountPct(product) > 0) {
              <div class="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                -{{ getDiscountPct(product) }}%
              </div>
            }
            <!-- Wishlist -->
            <button (click)="toggleWishlist($event, product.id)" class="absolute top-2 right-2 z-10 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
              <svg class="w-4 h-4" [class]="wishlist().has(product.id) ? 'text-red-500 fill-current' : 'text-slate-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            </button>
            <!-- Image -->
            <div class="h-48 overflow-hidden bg-slate-50">
              <img [src]="product.imageUrl || getPlaceholder(product.name)" [alt]="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                (error)="onImgError($event, product.name)"/>
            </div>
            <!-- Info -->
            <div class="p-3">
              <span class="badge-indigo text-[9px] mb-1 inline-block">{{ product.categoryName }}</span>
              <h3 class="text-xs font-semibold text-slate-800 line-clamp-2 min-h-[2.5rem] leading-snug">{{ product.name }}</h3>
              <!-- Stars -->
              <div class="flex items-center gap-1 mt-1">
                <div class="flex gap-px">
                  @for (s of [1,2,3,4,5]; track s) {
                    <svg class="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  }
                </div>
                <span class="text-[10px] text-slate-400">({{ 100 + (product.id * 37 % 900) }})</span>
              </div>
              <!-- Price -->
              <div class="flex items-baseline gap-1.5 mt-1.5">
                <span class="text-base font-black text-red-600">\${{ product.price | number:'1.2-2' }}</span>
                <span class="text-[11px] text-slate-400 line-through">\${{ (product.price * 1.2) | number:'1.2-2' }}</span>
              </div>
              <!-- Prime badge -->
              <div class="flex items-center gap-1 mt-1">
                <span class="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">✓ PRIME</span>
                <span class="text-[10px] text-slate-400">Free delivery</span>
              </div>
            </div>
            <!-- Add to cart overlay -->
            <div class="px-3 pb-3">
              <button (click)="quickAdd($event, product)"
                class="w-full py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0">
                Add to Cart
              </button>
            </div>
          </div>
        }
      </div>
    }

    <!-- List View -->
    @if (!loading() && products().length > 0 && view() === 'list') {
      <div class="flex flex-col gap-3 fade-in-up">
        @for (product of displayedProducts(); track product.id) {
          <div class="card flex gap-4 p-4 group cursor-pointer hover:shadow-md" [routerLink]="['/product', product.id]">
            <div class="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-slate-50">
              <img [src]="product.imageUrl || getPlaceholder(product.name)" [alt]="product.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" (error)="onImgError($event, product.name)"/>
            </div>
            <div class="flex-1 min-w-0">
              <span class="badge-indigo text-[10px]">{{ product.categoryName }}</span>
              <h3 class="text-sm font-semibold text-slate-800 mt-1">{{ product.name }}</h3>
              <div class="flex items-center gap-1 mt-1">
                <div class="flex gap-px">@for (s of [1,2,3,4,5]; track s) { <svg class="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg> }</div>
                <span class="text-xs text-slate-400">{{ 100 + (product.id * 37 % 900) }} reviews</span>
              </div>
              <div class="flex items-baseline gap-2 mt-2">
                <span class="text-xl font-black text-red-600">\${{ product.price | number:'1.2-2' }}</span>
                <span class="text-sm text-slate-400 line-through">\${{ (product.price * 1.2) | number:'1.2-2' }}</span>
                <span class="text-xs text-red-500 font-semibold">Save {{ getDiscountPct(product) }}%</span>
              </div>
              <div class="flex items-center gap-1 mt-1">
                <span class="text-xs text-emerald-600 font-semibold">✓ In Stock</span>
                <span class="text-slate-300">•</span>
                <span class="text-xs text-indigo-600 font-bold">✓ PRIME</span>
                <span class="text-xs text-slate-400">Free delivery tomorrow</span>
              </div>
            </div>
            <div class="flex flex-col gap-2 justify-center flex-shrink-0">
              <button (click)="quickAdd($event, product)" class="btn-primary py-2 px-5 text-sm">Add to Cart</button>
              <button (click)="toggleWishlist($event, product.id)" class="btn-secondary py-2 px-5 text-sm">♡ Wishlist</button>
            </div>
          </div>
        }
      </div>
    }

    <!-- Pagination -->
    @if (!loading() && totalPages() > 1) {
      <div class="flex justify-center gap-2 mt-10">
        <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() === 0" class="btn-secondary py-2 px-4 text-sm disabled:opacity-40">← Prev</button>
        @for (p of pageNumbers(); track p) {
          <button (click)="goToPage(p)" class="w-10 h-10 rounded-xl text-sm font-semibold transition-all"
            [class]="p === currentPage() ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-400'">{{ p + 1 }}</button>
        }
        <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() === totalPages() - 1" class="btn-secondary py-2 px-4 text-sm disabled:opacity-40">Next →</button>
      </div>
    }
  </div>
  `,
})
export class HomeComponent implements OnInit {
  productService = inject(ProductService);
  cartService    = inject(CartService);
  toastService   = inject(ToastService);
  authService    = inject(AuthService);

  products      = signal<ProductSummary[]>([]);
  loading       = signal(true);
  totalElements = signal(0);
  totalPages    = signal(0);
  currentPage   = signal(0);
  selectedCategory = signal<number | null>(null);
  view          = signal<'grid'|'list'>('grid');
  wishlist      = signal<Set<number>>(new Set());
  sortBy        = signal('');

  searchQuery = '';
  private search$ = new Subject<string>();
  skeletons = Array(10).fill(0);

  categories = [
    { id: 0,  name: 'All',         icon: '🏪' },
    { id: 1,  name: 'Electronics', icon: '📱' },
    { id: 2,  name: 'Clothing',    icon: '👗' },
    { id: 3,  name: 'Home',        icon: '🏠' },
    { id: 4,  name: 'Sports',      icon: '⚽' },
    { id: 5,  name: 'Books',       icon: '📚' },
  ];

  getCategoryLabel(): string {
    const id = this.selectedCategory();
    if (!id) return this.searchQuery ? `Results for "${this.searchQuery}"` : 'All Products';
    return this.categories.find(c => c.id === id)?.name ?? 'Products';
  }

  displayedProducts() {
    const prods = [...this.products()];
    if (this.sortBy() === 'price_asc') prods.sort((a,b) => a.price - b.price);
    if (this.sortBy() === 'price_desc') prods.sort((a,b) => b.price - a.price);
    return prods;
  }

  ngOnInit() {
    this.search$.pipe(
      debounceTime(350), distinctUntilChanged(),
      switchMap(q => { this.loading.set(true); return this.productService.getProducts(q, this.selectedCategory() || undefined, this.currentPage()); })
    ).subscribe({
      next: res => { this.products.set(res.content); this.totalElements.set(res.totalElements); this.totalPages.set(res.totalPages); this.loading.set(false); },
      error: () => { this.products.set([]); this.loading.set(false); }
    });
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    const catId = this.selectedCategory();
    this.productService.getProducts(this.searchQuery, catId && catId > 0 ? catId : undefined, this.currentPage())
      .subscribe({
        next: res => { this.products.set(res.content); this.totalElements.set(res.totalElements); this.totalPages.set(res.totalPages); this.loading.set(false); },
        error: () => { this.products.set([]); this.totalElements.set(0); this.totalPages.set(0); this.loading.set(false); }
      });
  }

  onSearch() { this.currentPage.set(0); this.search$.next(this.searchQuery); }
  filterByCategory(id: number) { this.selectedCategory.set(this.selectedCategory() === id ? null : id); this.currentPage.set(0); this.loadProducts(); }
  clearFilter() { this.selectedCategory.set(null); this.loadProducts(); }
  setView(v: 'grid'|'list') { this.view.set(v); }
  onSort(e: any) { this.sortBy.set(e.target.value); }
  goToPage(p: number) { this.currentPage.set(p); this.loadProducts(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  pageNumbers() { return Array.from({ length: this.totalPages() }, (_, i) => i); }

  getDiscountPct(p: ProductSummary) { return 17; }

  toggleWishlist(event: Event, id: number) {
    event.preventDefault(); event.stopPropagation();
    const s = new Set(this.wishlist());
    s.has(id) ? s.delete(id) : s.add(id);
    this.wishlist.set(s);
    this.toastService.show(s.has(id) ? 'Added to wishlist ♡' : 'Removed from wishlist', 'info');
  }

  quickAdd(event: Event, product: ProductSummary) {
    event.preventDefault(); event.stopPropagation();
    this.cartService.addItem(product, 1).subscribe({
      next: () => this.toastService.show(`"${product.name}" added to cart!`, 'success'),
      error: () => this.toastService.show('Failed to add item', 'error')
    });
  }

  getPlaceholder(name: string): string {
    const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const colors = ['6366f1','8b5cf6','ec4899','f59e0b','10b981','3b82f6'];
    const initials = name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
    return `https://placehold.co/400x300/${colors[seed % colors.length]}/ffffff?text=${encodeURIComponent(initials)}`;
  }
  onImgError(e: Event, name: string) { (e.target as HTMLImageElement).src = this.getPlaceholder(name); }
}
