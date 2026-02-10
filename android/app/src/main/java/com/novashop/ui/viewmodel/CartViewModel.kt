package com.novashop.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.novashop.data.model.*
import com.novashop.data.repository.AppRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CartUiState(
    val items: List<CartItem> = emptyList(),
    val isCheckingOut: Boolean = false,
    val checkoutSuccess: Boolean = false,
    val error: String? = null
) {
    val totalItems: Int get() = items.sumOf { it.quantity }
    val totalPrice: Double get() = items.sumOf { it.product.price * it.quantity }
}

@HiltViewModel
class CartViewModel @Inject constructor(
    private val repository: AppRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CartUiState())
    val uiState: StateFlow<CartUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            repository.cartItems.collect { items ->
                _uiState.update { it.copy(items = items) }
            }
        }
    }

    fun addToCart(product: Product, quantity: Int = 1) {
        viewModelScope.launch {
            repository.addToCart(product, quantity)
        }
    }

    fun removeFromCart(productId: Long) {
        viewModelScope.launch {
            repository.removeFromCart(productId)
        }
    }

    fun updateQuantity(productId: Long, quantity: Int) {
        viewModelScope.launch {
            repository.updateCartQuantity(productId, quantity)
        }
    }

    fun clearCart() {
        viewModelScope.launch {
            repository.clearCart()
        }
    }

    fun checkout(
        street: String,
        number: String,
        complement: String?,
        neighborhood: String,
        city: String,
        state: String,
        zipCode: String,
        paymentMethod: String
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isCheckingOut = true, error = null) }
            val request = CreateOrderRequest(
                items = _uiState.value.items.map {
                    OrderItemRequest(productId = it.product.id, quantity = it.quantity)
                },
                shippingAddress = AddressRequest(
                    street = street,
                    number = number,
                    complement = complement,
                    neighborhood = neighborhood,
                    city = city,
                    state = state,
                    zipCode = zipCode
                ),
                paymentMethod = paymentMethod
            )

            repository.createOrder(request)
                .onSuccess {
                    _uiState.update {
                        it.copy(isCheckingOut = false, checkoutSuccess = true, items = emptyList())
                    }
                }
                .onFailure { e ->
                    _uiState.update {
                        it.copy(isCheckingOut = false, error = e.message ?: "Erro ao finalizar pedido")
                    }
                }
        }
    }

    fun clearCheckoutSuccess() {
        _uiState.update { it.copy(checkoutSuccess = false) }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}
