import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProductSummary, ProductDraft } from '../../../shared/models/product.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DecimalPipe],
  template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Admin header -->
      <div class="bg-gradient-to-r from-slate-900 to-indigo-900 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold">Admin Dashboard</h1>
              <p class="text-slate-400 text-sm mt-1">Manage your AI-enhanced product catalog</p>
            </div>
            <button type="button" (click)="openForm()"
              class="btn-primary py-2.5 px-5 text-sm">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              New Product
            </button>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 mt-6">
            <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div class="text-3xl font-black">{{ products().length }}</div>
              <div class="text-slate-300 text-sm mt-1">Total Products</div>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div class="text-3xl font-black text-yellow-300">{{ draftCount() }}</div>
              <div class="text-slate-300 text-sm mt-1">Pending Review</div>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div class="text-3xl font-black text-emerald-300">\${{ totalValue() | number:'1.0-0' }}</div>
              <div class="text-slate-300 text-sm mt-1">Catalog Value</div>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <!-- ── Create / Edit Form (slide-in panel) ──────────── -->
        @if (showForm) {
          <div class="fixed inset-0 z-50 flex">
            <!-- Backdrop -->
            <div class="flex-1 bg-black/40 backdrop-blur-sm" (click)="cancelForm()"></div>

            <!-- Panel -->
            <div class="w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col">
              <!-- Panel header -->
              <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h2 class="text-lg font-bold text-slate-900">{{ isEditing ? 'Edit Product' : 'Create Product with AI' }}</h2>
                <button (click)="cancelForm()" class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="flex-1 px-6 py-6 space-y-5">

                <!-- Image upload -->
                <div>
                  <label class="form-label">Product Image</label>
                  <div
                    class="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                    (click)="fileInput.click()"
                  >
                    @if (imagePreview()) {
                      <img [src]="imagePreview()!" class="h-32 mx-auto rounded-xl object-cover"/>
                      <p class="text-xs text-slate-400 mt-2">Click to change</p>
                    } @else {
                      <svg class="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <p class="text-sm font-medium text-slate-500">Click to upload product image</p>
                      <p class="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
                    }
                    <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)"/>
                  </div>
                </div>

                <!-- Basic fields -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="col-span-2">
                    <label class="form-label">Product Name *</label>
                    <input type="text" formControlName="name" class="form-input" placeholder="e.g. Premium Leather Sneakers">
                  </div>
                  <div>
                    <label class="form-label">Price *</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                      <input type="number" formControlName="price" class="form-input pl-7" placeholder="0.00" min="0" step="0.01">
                    </div>
                  </div>
                  <div>
                    <label class="form-label">Stock *</label>
                    <input type="number" formControlName="stock" class="form-input" placeholder="100" min="0">
                  </div>
                  <div class="col-span-2">
                    <label class="form-label">Category ID</label>
                    <select formControlName="categoryId" class="form-input">
                      @for (cat of categories; track cat.id) {
                        <option [value]="cat.id">{{ cat.name }}</option>
                      }
                    </select>
                  </div>
                </div>

                <!-- AI Draft Result -->
                @if (aiDraft()) {
                  <div class="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-2xl p-5">
                    <div class="flex items-center gap-2 mb-4">
                      <div class="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                      </div>
                      <h4 class="text-sm font-bold text-indigo-900">AI-Generated Content</h4>
                      <span class="ml-auto badge-indigo text-[10px]">Review & Edit</span>
                    </div>

                    <div class="space-y-4">
                      <div>
                        <label class="form-label">Description</label>
                        <textarea formControlName="description" rows="4" class="form-input resize-none"></textarea>
                      </div>
                      <div>
                        <label class="form-label">SEO Tags <span class="text-slate-400 font-normal">(comma separated)</span></label>
                        <input type="text" formControlName="seoTags" class="form-input">
                      </div>
                    </div>

                    <div class="flex gap-2 mt-4">
                      <button type="button" (click)="regenerateContent()"
                        class="btn-secondary py-2 px-4 text-xs flex-1">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                        Regenerate
                      </button>
                      <button type="button" (click)="approveDraft()"
                        class="btn-primary py-2 px-4 text-xs flex-1">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        Approve & Publish
                      </button>
                    </div>
                  </div>
                }

                <!-- Actions -->
                <div class="flex gap-3 pt-2">
                  <button type="button" (click)="cancelForm()" class="btn-secondary flex-1 py-3">Cancel</button>
                  @if (!aiDraft()) {
                    <button type="submit" [disabled]="productForm.invalid || submitting()" class="btn-primary flex-1 py-3">
                      @if (submitting()) {
                        <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        {{ isEditing ? 'Saving…' : 'Generating with AI…' }}
                      } @else {
                        {{ isEditing ? 'Save Changes' : '✨ Generate AI Draft' }}
                      }
                    </button>
                  }
                </div>
              </form>
            </div>
          </div>
        }

        <!-- ── Products Table ─────────────────────────────── -->
        <div class="card">
          <!-- Table header -->
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-base font-bold text-slate-900">Products Catalog</h2>
            <input type="text" placeholder="Search products…" [(ngModel)]="tableSearch"
              class="form-input w-56 py-2 text-sm" [ngModelOptions]="{standalone: true}"/>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                  <th class="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                @for (product of filteredProducts(); track product.id) {
                  <tr class="hover:bg-slate-50 transition-colors duration-150">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          <img class="w-full h-full object-cover"
                            [src]="product.imageUrl || getPlaceholder(product.name)"
                            (error)="onImgError($event, product.name)"
                            [alt]="product.name">
                        </div>
                        <div>
                          <div class="text-sm font-semibold text-slate-800">{{ product.name }}</div>
                          <div class="text-xs text-slate-400">ID: {{ product.id }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="badge-indigo">{{ product.categoryName }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm font-bold text-indigo-600">\${{ product.price | number:'1.2-2' }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-end gap-2">
                        <button (click)="editProduct(product.id)"
                          class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button (click)="deleteProduct(product.id)"
                          class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            @if (filteredProducts().length === 0 && !loadingProducts()) {
              <div class="text-center py-16 text-slate-400">
                <svg class="w-12 h-12 mx-auto text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
                <p class="text-sm font-medium">No products found</p>
              </div>
            }
            @if (loadingProducts()) {
              <div class="p-8 space-y-3">
                @for (s of [1,2,3,4]; track s) {
                  <div class="flex items-center gap-3 animate-pulse">
                    <div class="w-12 h-12 skeleton rounded-xl"></div>
                    <div class="flex-1 h-4 skeleton rounded"></div>
                    <div class="w-20 h-4 skeleton rounded"></div>
                    <div class="w-16 h-4 skeleton rounded"></div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  // NgModel for standalone search field
  // we need FormsModule for [(ngModel)]
})
export class AdminDashboardComponent implements OnInit {
  productService = inject(ProductService);
  toastService   = inject(ToastService);
  fb             = inject(FormBuilder);

  products       = signal<ProductSummary[]>([]);
  loadingProducts = signal(true);
  showForm       = false;
  isEditing      = false;
  submitting     = signal(false);
  aiDraft        = signal<ProductDraft | null>(null);
  selectedFile: File | null = null;
  editingId: number | null  = null;
  imagePreview   = signal<string | null>(null);
  tableSearch    = '';

  categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Home & Garden' },
    { id: 4, name: 'Sports' },
    { id: 5, name: 'Books' },
  ];

  productForm: FormGroup = this.fb.group({
    name:        ['', Validators.required],
    price:       [0, [Validators.required, Validators.min(0)]],
    stock:       [0, [Validators.required, Validators.min(0)]],
    categoryId:  [1, Validators.required],
    description: [''],
    seoTags:     [''],
  });

  ngOnInit() { this.loadProducts(); }

  draftCount() { return 0; /* would come from product.draft flag */ }
  totalValue() { return this.products().reduce((s, p) => s + p.price, 0); }

  filteredProducts() {
    if (!this.tableSearch) return this.products();
    const q = this.tableSearch.toLowerCase();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(q) || (p.categoryName ?? '').toLowerCase().includes(q)
    );
  }

  loadProducts() {
    this.loadingProducts.set(true);
    this.productService.getProducts().subscribe({
      next: res => { this.products.set(res.content); this.loadingProducts.set(false); },
      error: () => {
        this.loadingProducts.set(false);
        this.toastService.show('Failed to load products. Is the backend running?', 'error');
      }
    });
  }

  openForm() { this.showForm = true; }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.imagePreview.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.productForm.invalid) return;
    this.submitting.set(true);
    const fd = this.buildFormData();

    if (this.isEditing && this.editingId) {
      this.productService.updateProduct(this.editingId, fd).subscribe({
        next: () => { this.submitting.set(false); this.cancelForm(); this.loadProducts(); this.toastService.show('Product updated!', 'success'); },
        error: () => { this.submitting.set(false); this.toastService.show('Update failed', 'error'); }
      });
    } else {
      this.productService.createProduct(fd).subscribe({
        next: res => {
          this.submitting.set(false);
          this.aiDraft.set(res);
          this.productForm.patchValue({
            description: res.description ?? '',
            seoTags: res.seoTags?.join(', ') ?? ''
          });
          this.toastService.show('AI draft generated! Review before publishing.', 'info');
        },
        error: () => { this.submitting.set(false); this.toastService.show('Creation failed', 'error'); }
      });
    }
  }

  buildFormData(): FormData {
    const fd = new FormData();
    if (this.selectedFile) fd.append('image', this.selectedFile);
    const v = this.productForm.value;
    fd.append('name', v.name);
    fd.append('price', v.price);
    fd.append('stock', v.stock);
    fd.append('categoryId', v.categoryId);
    fd.append('description', v.description || '');
    fd.append('seoTags', v.seoTags || '');
    return fd;
  }

  regenerateContent() {
    const draft = this.aiDraft();
    if (!draft?.id) return;
    this.productService.regenerateText(draft.id).subscribe(res => {
      this.productForm.patchValue({ description: res.description, seoTags: res.seoTags?.join(', ') ?? '' });
      this.toastService.show('Content regenerated!', 'success');
    });
  }

  approveDraft() {
    const draft = this.aiDraft();
    if (!draft?.id) return;
    this.productService.updateProduct(draft.id, this.buildFormData()).subscribe({
      next: () => { this.cancelForm(); this.loadProducts(); this.toastService.show('Product published!', 'success'); },
      error: () => this.toastService.show('Publish failed', 'error')
    });
  }

  editProduct(id: number) {
    this.productService.getProduct(id).subscribe(res => {
      this.isEditing = true; this.editingId = id; this.showForm = true; this.aiDraft.set(null);
      this.productForm.patchValue({
        name: res.name, price: res.price, stock: res.stock,
        description: res.description, seoTags: res.seoTags?.join(', ') ?? '', categoryId: 1
      });
      if (res.imageUrl) this.imagePreview.set(res.imageUrl);
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Delete this product?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => { this.loadProducts(); this.toastService.show('Product deleted', 'info'); },
      error: () => this.toastService.show('Delete failed', 'error')
    });
  }

  cancelForm() {
    this.showForm = false; this.isEditing = false; this.editingId = null;
    this.aiDraft.set(null); this.selectedFile = null; this.imagePreview.set(null);
    this.productForm.reset({ price: 0, stock: 0, categoryId: 1 });
  }

  getPlaceholder(name: string): string {
    const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const colors = ['6366f1','8b5cf6','ec4899','f59e0b','10b981','3b82f6'];
    const color = colors[seed % colors.length];
    const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    return `https://via.placeholder.com/400x300/${color}/ffffff?text=${encodeURIComponent(initials)}`;
  }

  onImgError(event: Event, name: string) {
    (event.target as HTMLImageElement).src = this.getPlaceholder(name);
  }
}
