export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductSummary {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  categoryName: string;
  stock: number;
  draft: boolean;
  soldCount: number;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  seoTags: string[];
  categoryId: number;
  createdAt: string;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'CARD';

export interface OrderItem {
  id: number;
  productId: number | null;
  productName: string;
  productImageUrl: string | null;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: number;
  total: number;
  status: OrderStatus;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface AuthResponse {
  accessToken: string;
  email: string;
  role: 'ADMIN' | 'SHOPPER';
}
