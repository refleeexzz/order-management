package com.novashop.data.remote

import com.novashop.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ── Auth ──
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<Unit>

    // ── Products ──
    @GET("products")
    suspend fun getProducts(): Response<List<Product>>

    @GET("products/{id}")
    suspend fun getProduct(@Path("id") id: Long): Response<Product>

    @POST("products")
    suspend fun createProduct(@Body request: CreateProductRequest): Response<Product>

    @PUT("products/{id}")
    suspend fun updateProduct(@Path("id") id: Long, @Body request: CreateProductRequest): Response<Product>

    @DELETE("products/{id}")
    suspend fun deleteProduct(@Path("id") id: Long): Response<Unit>

    // ── Categories ──
    @GET("categories")
    suspend fun getCategories(): Response<List<Category>>

    // ── Orders ──
    @GET("orders")
    suspend fun getOrders(): Response<List<Order>>

    @POST("orders")
    suspend fun createOrder(@Body request: CreateOrderRequest): Response<Order>

    @PATCH("orders/{id}/cancel")
    suspend fun cancelOrder(@Path("id") id: Long): Response<Unit>

    // ── Customers ──
    @GET("customers")
    suspend fun getCustomers(): Response<List<Customer>>
}
