import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent),
    title: 'NovaShop — AI-Powered E-commerce'
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/public/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    title: 'Product Details — NovaShop'
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/public/cart/cart.component').then(m => m.CartComponent),
    canActivate: [authGuard],
    title: 'Shopping Cart — NovaShop'
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard],
    title: 'Admin Dashboard — NovaShop'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
