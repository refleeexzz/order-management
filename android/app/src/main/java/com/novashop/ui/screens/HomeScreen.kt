package com.novashop.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.novashop.data.model.Product
import com.novashop.ui.viewmodel.CartViewModel
import com.novashop.ui.viewmodel.ProductsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToProducts: () -> Unit,
    onNavigateToProduct: (Long) -> Unit,
    onNavigateToCart: () -> Unit,
    onNavigateToOrders: () -> Unit,
    onNavigateToProfile: () -> Unit,
    productsViewModel: ProductsViewModel = hiltViewModel(),
    cartViewModel: CartViewModel = hiltViewModel()
) {
    val productsState by productsViewModel.uiState.collectAsState()
    val cartState by cartViewModel.uiState.collectAsState()
    val filteredProducts by productsViewModel.filteredProducts.collectAsState()
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.ShoppingBag, null, Modifier.size(28.dp), tint = MaterialTheme.colorScheme.primary)
                        Spacer(Modifier.width(8.dp))
                        Text("NovaShop", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    }
                },
                actions = {
                    BadgedBox(badge = {
                        if (cartState.totalItems > 0) Badge { Text("${cartState.totalItems}") }
                    }) {
                        IconButton(onClick = onNavigateToCart) { Icon(Icons.Default.ShoppingCart, "Carrinho") }
                    }
                    Spacer(Modifier.width(8.dp))
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(selected = selectedTab == 0, onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Home, null) }, label = { Text("Inicio") })
                NavigationBarItem(selected = selectedTab == 1, onClick = { selectedTab = 1; onNavigateToProducts() },
                    icon = { Icon(Icons.Default.Search, null) }, label = { Text("Produtos") })
                NavigationBarItem(selected = false, onClick = onNavigateToCart,
                    icon = { BadgedBox(badge = { if (cartState.totalItems > 0) Badge { Text("${cartState.totalItems}") } }) { Icon(Icons.Default.ShoppingCart, null) } },
                    label = { Text("Carrinho") })
                NavigationBarItem(selected = false, onClick = onNavigateToOrders,
                    icon = { Icon(Icons.Default.Receipt, null) }, label = { Text("Pedidos") })
                NavigationBarItem(selected = false, onClick = onNavigateToProfile,
                    icon = { Icon(Icons.Default.Person, null) }, label = { Text("Perfil") })
            }
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            // Search bar
            OutlinedTextField(
                value = productsState.searchQuery, onValueChange = { productsViewModel.setSearchQuery(it) },
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                placeholder = { Text("Buscar produtos...") },
                leadingIcon = { Icon(Icons.Default.Search, null) },
                trailingIcon = { if (productsState.searchQuery.isNotBlank()) IconButton(onClick = { productsViewModel.setSearchQuery("") }) { Icon(Icons.Default.Clear, null) } },
                singleLine = true, shape = RoundedCornerShape(12.dp)
            )
            // Categories
            LazyRow(Modifier.fillMaxWidth(), contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    FilterChip(selected = productsState.selectedCategory == null,
                        onClick = { productsViewModel.setSelectedCategory(null) },
                        label = { Text("Todos") })
                }
                items(productsState.categories) { cat ->
                    FilterChip(selected = productsState.selectedCategory?.id == cat.id,
                        onClick = { productsViewModel.setSelectedCategory(cat) },
                        label = { Text(cat.name) })
                }
            }
            Spacer(Modifier.height(8.dp))

            if (productsState.isLoading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            } else if (filteredProducts.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.SearchOff, null, Modifier.size(64.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(Modifier.height(16.dp))
                        Text("Nenhum produto encontrado", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2), contentPadding = PaddingValues(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(filteredProducts) { product ->
                        ProductGridItem(product = product, onProductClick = { onNavigateToProduct(product.id) })
                    }
                }
            }
        }
    }
}

@Composable
private fun ProductGridItem(product: Product, onProductClick: () -> Unit) {
    Card(Modifier.fillMaxWidth().clickable(onClick = onProductClick), shape = RoundedCornerShape(12.dp), elevation = CardDefaults.cardElevation(2.dp)) {
        Column {
            if (!product.imageUrl.isNullOrBlank()) {
                AsyncImage(model = product.imageUrl, contentDescription = product.name,
                    modifier = Modifier.fillMaxWidth().height(140.dp).clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp)),
                    contentScale = ContentScale.Crop)
            } else {
                Box(Modifier.fillMaxWidth().height(140.dp).background(MaterialTheme.colorScheme.surfaceVariant), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Image, null, Modifier.size(48.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Column(Modifier.padding(12.dp)) {
                product.category?.let {
                    SuggestionChip(onClick = {}, label = { Text(it.name, style = MaterialTheme.typography.labelSmall) },
                        modifier = Modifier.height(24.dp), shape = RoundedCornerShape(4.dp))
                    Spacer(Modifier.height(4.dp))
                }
                Text(product.name, style = MaterialTheme.typography.titleSmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
                Spacer(Modifier.height(4.dp))
                Text("R$ ${"%.2f".format(product.price)}", style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            }
        }
    }
}
