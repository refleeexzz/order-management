import type { Customer } from './customer';
import type { Product } from './product';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  price: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  customerId: number;
  items: OrderItemRequest[];
  notes?: string;
}
