package com.novashop.data.repository

import com.novashop.data.local.PreferencesManager
import com.novashop.data.model.*
import com.novashop.data.remote.ApiService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AppRepository @Inject constructor(
    private val api: ApiService,
    private val prefs: PreferencesManager
) {
    // ── Auth ──

    val currentUser: Flow<User?> = prefs.user
    val authToken: Flow<String?> = prefs.token

    suspend fun login(email: String, password: String): Result<User> {
        return try {
            val response = api.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body() != null) {
                val auth = response.body()!!
                val user = User(
                    name = auth.name,
                    email = auth.email,
                    role = auth.role,
                    token = auth.token
                )
                prefs.saveAuth(user)
                Result.success(user)
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Erro ao fazer login"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(name: String, email: String, password: String): Result<Unit> {
        return try {
            val response = api.register(RegisterRequest(name, email, password))
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Erro ao registrar"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout() {
        prefs.clearAuth()
        prefs.clearCart()
    }

    // ── Products ──

    suspend fun getProducts(): Result<List<Product>> {
        return try {
            val response = api.getProducts()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Erro ao carregar produtos"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getProduct(id: Long): Result<Product> {
        return try {
            val response = api.getProduct(id)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Produto não encontrado"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ── Categories ──

    suspend fun getCategories(): Result<List<Category>> {
        return try {
            val response = api.getCategories()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Erro ao carregar categorias"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ── Orders ──

    suspend fun getOrders(): Result<List<Order>> {
        return try {
            val response = api.getOrders()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Erro ao carregar pedidos"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createOrder(request: CreateOrderRequest): Result<Order> {
        return try {
            val response = api.createOrder(request)
            if (response.isSuccessful && response.body() != null) {
                prefs.clearCart()
                Result.success(response.body()!!)
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Erro ao criar pedido"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun cancelOrder(id: Long): Result<Unit> {
        return try {
            val response = api.cancelOrder(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Erro ao cancelar pedido"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ── Cart (local) ──

    val cartItems: Flow<List<CartItem>> = prefs.cartItems

    suspend fun addToCart(product: Product, quantity: Int = 1) {
        val current = prefs.cartItems.first().toMutableList()
        val existing = current.indexOfFirst { it.product.id == product.id }
        if (existing >= 0) {
            current[existing] = current[existing].copy(
                quantity = current[existing].quantity + quantity
            )
        } else {
            current.add(CartItem(product, quantity))
        }
        prefs.saveCart(current)
    }

    suspend fun removeFromCart(productId: Long) {
        val current = prefs.cartItems.first().toMutableList()
        current.removeAll { it.product.id == productId }
        prefs.saveCart(current)
    }

    suspend fun updateCartQuantity(productId: Long, quantity: Int) {
        val current = prefs.cartItems.first().toMutableList()
        if (quantity <= 0) {
            current.removeAll { it.product.id == productId }
        } else {
            val idx = current.indexOfFirst { it.product.id == productId }
            if (idx >= 0) {
                current[idx] = current[idx].copy(quantity = quantity)
            }
        }
        prefs.saveCart(current)
    }

    suspend fun clearCart() {
        prefs.clearCart()
    }
}
