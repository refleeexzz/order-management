/**
 * Tipos do contrato da API (SPEC §4).
 * Nomes de campos batem EXATAMENTE com o JSON do backend (camelCase).
 */

// ---------- Enums ----------

export type UserRole = "ADMIN" | "SELLER" | "CUSTOMER";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "PIX"
  | "BANK_SLIP"
  | "BANK_TRANSFER";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";

// ---------- Erros ----------

export interface FieldError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

/** ErrorResponse do GlobalExceptionHandler (§5.8) */
export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path?: string;
  timestamp?: string;
  fieldErrors?: FieldError[] | null;
}

// ---------- Auth ----------

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string; // "Bearer"
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}

// ---------- Categorias ----------

export interface Category {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  productCount: number;
  createdAt: string;
}

export interface CategoryRequest {
  name: string;
  description?: string;
}

// ---------- Produtos ----------

/** ProductResponse — categoria é FLAT (categoryId/categoryName), nunca aninhada (§8). */
export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  sku: string | null;
  imageUrl: string | null;
  active: boolean;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  sku?: string;
  imageUrl?: string;
  categoryId: number;
}

/** Update parcial: apenas campos não-nulos são aplicados; SKU não é atualizável. */
export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  imageUrl?: string;
  categoryId?: number;
  active?: boolean;
}

// ---------- Clientes ----------

export interface Address {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Customer {
  id: number;
  userId: number;
  name: string;
  email: string;
  cpf: string;
  phone: string | null;
  address: Address | null;
  totalOrders: number;
  createdAt: string;
}

export interface CustomerRequest {
  cpf: string;
  phone?: string;
  address?: Address;
}

// ---------- Pedidos ----------

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  shippingAddress: Address | null;
  notes: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
  shippingAddress?: Address;
  notes?: string;
  couponCode?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  reason?: string;
}

export interface OrderStats {
  pendingPayment: number;
  paid: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

// ---------- Pagamentos ----------

export interface ProcessPaymentRequest {
  orderId: number;
  method: PaymentMethod;
  installments?: number;
  cardToken?: string;
}

export interface Payment {
  id: number;
  orderId: number;
  orderNumber: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId: string | null;
  installments: number;
  paidAt: string | null;
  createdAt: string;
}

// ---------- Paginação ----------

/** PageResponse customizado do backend: produtos e pedidos (§4). */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/** Spring Page: usado APENAS pela listagem de clientes (§4.4). */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
