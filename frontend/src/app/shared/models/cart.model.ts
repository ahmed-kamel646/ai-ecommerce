export interface CartItem {
  id: number;
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
