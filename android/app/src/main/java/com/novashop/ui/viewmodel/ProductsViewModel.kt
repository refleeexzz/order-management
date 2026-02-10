package com.novashop.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.novashop.data.model.Category
import com.novashop.data.model.Product
import com.novashop.data.repository.AppRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProductsUiState(
    val isLoading: Boolean = false,
    val products: List<Product> = emptyList(),
    val categories: List<Category> = emptyList(),
    val selectedProduct: Product? = null,
    val searchQuery: String = "",
    val selectedCategoryId: Long? = null,
    val error: String? = null
)

@HiltViewModel
class ProductsViewModel @Inject constructor(
    private val repository: AppRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProductsUiState())
    val uiState: StateFlow<ProductsUiState> = _uiState.asStateFlow()

    val filteredProducts: StateFlow<List<Product>> = _uiState.map { state ->
        state.products.filter { product ->
            val matchesSearch = state.searchQuery.isBlank() ||
                product.name.contains(state.searchQuery, ignoreCase = true) ||
                (product.description?.contains(state.searchQuery, ignoreCase = true) == true)
            val matchesCategory = state.selectedCategoryId == null ||
                product.category?.id == state.selectedCategoryId
            val isActive = product.active
            matchesSearch && matchesCategory && isActive
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        loadData()
    }

    fun loadData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            val productsResult = repository.getProducts()
            val categoriesResult = repository.getCategories()

            productsResult.onSuccess { products ->
                _uiState.update { it.copy(products = products) }
            }.onFailure { e ->
                _uiState.update { it.copy(error = e.message) }
            }

            categoriesResult.onSuccess { categories ->
                _uiState.update { it.copy(categories = categories) }
            }

            _uiState.update { it.copy(isLoading = false) }
        }
    }

    fun loadProduct(id: Long) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            repository.getProduct(id)
                .onSuccess { product ->
                    _uiState.update { it.copy(selectedProduct = product, isLoading = false) }
                }
                .onFailure { e ->
                    _uiState.update { it.copy(error = e.message, isLoading = false) }
                }
        }
    }

    fun setSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }

    fun setSelectedCategory(categoryId: Long?) {
        _uiState.update { it.copy(selectedCategoryId = categoryId) }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}
