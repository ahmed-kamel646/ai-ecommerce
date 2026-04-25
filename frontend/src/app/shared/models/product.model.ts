export interface ProductSummary {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  categoryName: string;
}

export interface ProductDetail {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  seoTags: string[];
  categoryName: string;
}

export interface ProductDraft {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  seoTags: string[];
  categoryId: number;
  draft: boolean;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}
