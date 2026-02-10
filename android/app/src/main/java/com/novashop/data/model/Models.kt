package com.novashop.data.model

// ── Auth ──

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val role: String = "CUSTOMER"
)

data class AuthResponse(
    val token: String,
    val name: String,
    val email: String,
    val role: String
)

data class User(
    val name: String,
    val email: String,
    val role: String,
    val token: String
)

// ── Product ──

data class Product(
    val id: Long,
    val name: String,
    val description: String?,
    val price: Double,
    val stockQuantity: Int,
    val imageUrl: String?,
    val category: Category?,
    val seller: SellerInfo?,
    val createdAt: String?,
    val updatedAt: String?,
    val active: Boolean = true
)

data class SellerInfo(
    val id: Long,
    val name: String,
    val email: String
)

data class CreateProductRequest(
    val name: String,
    val description: String?,
    val price: Double,
    val stockQuantity: Int,
    val imageUrl: String?,
    val categoryId: Long?,
    val sellerId: Long?
)

// ── Category ──

data class Category(
    val id: Long,
    val name: String,
    val description: String?
)

// ── Order ──

data class Order(
    val id: Long,
    val customer: CustomerInfo?,
    val items: List<OrderItem>,
    val totalAmount: Double,
    val status: String,
    val shippingAddress: Address?,
    val paymentMethod: String?,
    val createdAt: String?,
    val updatedAt: String?
)

data class CustomerInfo(
    val id: Long,
    val name: String,
    val email: String
)

data class OrderItem(
    val id: Long?,
    val product: Product?,
    val productId: Long?,
    val quantity: Int,
    val unitPrice: Double?,
    val totalPrice: Double?
)

data class CreateOrderRequest(
    val items: List<OrderItemRequest>,
    val shippingAddress: AddressRequest,
    val paymentMethod: String
)

data class OrderItemRequest(
    val productId: Long,
    val quantity: Int
)

data class AddressRequest(
    val street: String,
    val number: String,
    val complement: String?,
    val neighborhood: String,
    val city: String,
    val state: String,
    val zipCode: String
)

data class Address(
    val street: String?,
    val number: String?,
    val complement: String?,
    val neighborhood: String?,
    val city: String?,
    val state: String?,
    val zipCode: String?
)

// ── Customer ──

data class Customer(
    val id: Long,
    val name: String,
    val email: String,
    val phone: String?,
    val address: String?,
    val city: String?,
    val state: String?,
    val createdAt: String?
)

// ── Cart (local) ──

data class CartItem(
    val product: Product,
    val quantity: Int
)
