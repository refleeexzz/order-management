package com.novashop.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.novashop.ui.viewmodel.CartViewModel
import com.novashop.ui.viewmodel.ProductsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    productId: Long,
    onNavigateBack: () -> Unit,
    onNavigateToCart: () -> Unit,
    productsViewModel: ProductsViewModel = hiltViewModel(),
    cartViewModel: CartViewModel = hiltViewModel()
) {
    val productsState by productsViewModel.uiState.collectAsState()
    val cartState by cartViewModel.uiState.collectAsState()
    var quantity by remember { mutableIntStateOf(1) }

    LaunchedEffect(productId) { productsViewModel.loadProduct(productId) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Detalhes") },
                navigationIcon = { IconButton(onClick = onNavigateBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Voltar") } },
                actions = {
                    BadgedBox(badge = { if (cartState.totalItems > 0) Badge { Text("${cartState.totalItems}") } }) {
                        IconButton(onClick = onNavigateToCart) { Icon(Icons.Default.ShoppingCart, "Carrinho") }
                    }
                    Spacer(Modifier.width(8.dp))
                }
            )
        }
    ) { padding ->
        val product = productsState.selectedProduct
        if (productsState.isLoading) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        } else if (product == null) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { Text("Produto nao encontrado") }
        } else {
            Column(Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState())) {
                if (!product.imageUrl.isNullOrBlank()) {
                    AsyncImage(model = product.imageUrl, contentDescription = product.name,
                        modifier = Modifier.fillMaxWidth().height(300.dp), contentScale = ContentScale.Crop)
                } else {
                    Box(Modifier.fillMaxWidth().height(300.dp).background(MaterialTheme.colorScheme.surfaceVariant), contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Image, null, Modifier.size(80.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
                Column(Modifier.fillMaxWidth().padding(16.dp)) {
                    product.category?.let {
                        SuggestionChip(onClick = {}, label = { Text(it.name) }, shape = RoundedCornerShape(8.dp))
                        Spacer(Modifier.height(8.dp))
                    }
                    Text(product.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    Text("R$ ${"%.2f".format(product.price)}", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Inventory2, null, Modifier.size(16.dp), tint = if (product.stockQuantity > 0) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error)
                        Spacer(Modifier.width(4.dp))
                        Text(if (product.stockQuantity > 0) "${product.stockQuantity} em estoque" else "Fora de estoque",
                            style = MaterialTheme.typography.bodyMedium, color = if (product.stockQuantity > 0) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error)
                    }
                    Spacer(Modifier.height(16.dp))
                    Text("Descricao", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(8.dp))
                    Text(product.description ?: "Sem descricao disponivel", style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(24.dp))

                    // Quantity selector
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("Quantidade:", style = MaterialTheme.typography.titleMedium)
                        Spacer(Modifier.width(16.dp))
                        IconButton(onClick = { if (quantity > 1) quantity-- },
                            modifier = Modifier.size(36.dp).clip(CircleShape).background(MaterialTheme.colorScheme.surfaceVariant)) {
                            Icon(Icons.Default.Remove, "Diminuir")
                        }
                        Text("$quantity", Modifier.padding(horizontal = 16.dp), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        IconButton(onClick = { if (quantity < product.stockQuantity) quantity++ },
                            modifier = Modifier.size(36.dp).clip(CircleShape).background(MaterialTheme.colorScheme.surfaceVariant)) {
                            Icon(Icons.Default.Add, "Aumentar")
                        }
                    }
                    Spacer(Modifier.height(24.dp))

                    Button(
                        onClick = { cartViewModel.addToCart(product, quantity); onNavigateToCart() },
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        enabled = product.stockQuantity > 0,
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.ShoppingCart, null)
                        Spacer(Modifier.width(8.dp))
                        Text("Adicionar ao carrinho", style = MaterialTheme.typography.titleMedium)
                    }
                }
            }
        }
    }
}
