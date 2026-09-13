import { api } from "./api";
import type {
  AuthResponse,
  Category,
  CategoryRequest,
  CreateOrderRequest,
  CreateProductRequest,
  Customer,
  CustomerRequest,
  LoginRequest,
  Order,
  OrderStats,
  PageResponse,
  Payment,
  ProcessPaymentRequest,
  Product,
  RegisterRequest,
  SpringPage,
  UpdateOrderStatusRequest,
  UpdateProductRequest,
  OrderStatus,
} from "./types";

// ---------- Auth ----------

export const authApi = {
  register: (body: RegisterRequest) => api.post<AuthResponse>("/api/auth/register", body),
  login: (body: LoginRequest) => api.post<AuthResponse>("/api/auth/login", body),
};

// ---------- Categorias ----------

export const categoriesApi = {
  /** Apenas categorias ativas (público). */
  listActive: () => api.get<Category[]>("/api/categories"),
  /** Inclui inativas — somente ADMIN (§4.2). */
  listAll: () => api.get<Category[]>("/api/categories/all"),
  get: (id: number) => api.get<Category>(`/api/categories/${id}`),
  create: (body: CategoryRequest) => api.post<Category>("/api/categories", body),
  update: (id: number, body: CategoryRequest) =>
    api.put<Category>(`/api/categories/${id}`, body),
  /** Soft delete → 204. */
  deactivate: (id: number) => api.delete<void>(`/api/categories/${id}`),
};

// ---------- Produtos ----------

export const productsApi = {
  /** Ativos, ordenados por nome (sort fixo no servidor). */
  list: (page = 0, size = 20) =>
    api.get<PageResponse<Product>>("/api/products", { page, size }),
  search: (query: string, page = 0, size = 20) =>
    api.get<PageResponse<Product>>("/api/products/search", { query, page, size }),
  byCategory: (categoryId: number, page = 0, size = 20) =>
    api.get<PageResponse<Product>>(`/api/products/category/${categoryId}`, {
      page,
      size,
    }),
  get: (id: number) => api.get<Product>(`/api/products/${id}`),
  create: (body: CreateProductRequest) => api.post<Product>("/api/products", body),
  update: (id: number, body: UpdateProductRequest) =>
    api.put<Product>(`/api/products/${id}`, body),
  /** Soft delete → 204. */
  deactivate: (id: number) => api.delete<void>(`/api/products/${id}`),
};

// ---------- Clientes ----------

export const customersApi = {
  create: (body: CustomerRequest) => api.post<Customer>("/api/customers", body),
  me: () => api.get<Customer>("/api/customers/me"),
  updateMe: (body: CustomerRequest) => api.put<Customer>("/api/customers/me", body),
  /** ADMIN — Spring Page (§4.4). */
  list: (page = 0, size = 20) =>
    api.get<SpringPage<Customer>>("/api/customers", { page, size }),
};

// ---------- Pedidos ----------

export const ordersApi = {
  create: (body: CreateOrderRequest) => api.post<Order>("/api/orders", body),
  myOrders: (page = 0, size = 10) =>
    api.get<PageResponse<Order>>("/api/orders/my-orders", { page, size }),
  get: (id: number) => api.get<Order>(`/api/orders/${id}`),
  /** Cancelamento é POST com ?reason= (§4.5 — nunca PATCH). */
  cancel: (id: number, reason: string) =>
    api.post<Order>(`/api/orders/${id}/cancel`, undefined, { reason }),
  // ADMIN:
  list: (page = 0, size = 20) => api.get<PageResponse<Order>>("/api/orders", { page, size }),
  byStatus: (status: OrderStatus, page = 0, size = 20) =>
    api.get<PageResponse<Order>>(`/api/orders/status/${status}`, { page, size }),
  updateStatus: (id: number, body: UpdateOrderStatusRequest) =>
    api.patch<Order>(`/api/orders/${id}/status`, body),
  stats: () => api.get<OrderStats>("/api/orders/stats"),
};

// ---------- Pagamentos ----------

export const paymentsApi = {
  process: (body: ProcessPaymentRequest) => api.post<Payment>("/api/payments", body),
  byOrder: (orderId: number) => api.get<Payment>(`/api/payments/order/${orderId}`),
};
