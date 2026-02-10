package com.novashop.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.novashop.data.model.Order
import com.novashop.ui.viewmodel.OrdersViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(
    onNavigateBack: () -> Unit,
    ordersViewModel: OrdersViewModel = hiltViewModel()
) {
    val ordersState by ordersViewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Meus pedidos") },
                navigationIcon = { IconButton(onClick = onNavigateBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Voltar") } }
            )
        }
    ) { padding ->
        if (ordersState.isLoading) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        } else if (ordersState.orders.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.Receipt, null, Modifier.size(80.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(16.dp))
                    Text("Nenhum pedido ainda", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(8.dp))
                    Text("Seus pedidos aparecerão aqui", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(ordersState.orders, key = { it.id }) { order ->
                    OrderCard(order = order, onCancel = { ordersViewModel.cancelOrder(order.id) })
                }
            }
        }
    }
}

@Composable
private fun OrderCard(order: Order, onCancel: () -> Unit) {
    var showCancel by remember { mutableStateOf(false) }
    val statusColor = when (order.status) {
        "PENDING" -> MaterialTheme.colorScheme.tertiary
        "CONFIRMED", "PROCESSING" -> MaterialTheme.colorScheme.primary
        "SHIPPED" -> MaterialTheme.colorScheme.secondary
        "DELIVERED" -> MaterialTheme.colorScheme.primary
        "CANCELLED" -> MaterialTheme.colorScheme.error
        else -> MaterialTheme.colorScheme.onSurfaceVariant
    }
    val statusText = when (order.status) {
        "PENDING" -> "Pendente"
        "CONFIRMED" -> "Confirmado"
        "PROCESSING" -> "Processando"
        "SHIPPED" -> "Enviado"
        "DELIVERED" -> "Entregue"
        "CANCELLED" -> "Cancelado"
        else -> order.status
    }

    Card(Modifier.fillMaxWidth(), shape = RoundedCornerShape(12.dp), elevation = CardDefaults.cardElevation(2.dp)) {
        Column(Modifier.fillMaxWidth().padding(16.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Pedido #${order.id}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                SuggestionChip(onClick = {}, label = { Text(statusText, style = MaterialTheme.typography.labelMedium) },
                    colors = SuggestionChipDefaults.suggestionChipColors(containerColor = statusColor.copy(alpha = 0.15f), labelColor = statusColor),
                    shape = RoundedCornerShape(8.dp))
            }
            Spacer(Modifier.height(8.dp))
            order.items.forEach { item ->
                Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("${item.productName ?: "Produto"} x${item.quantity}", style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                    Text("R$ ${"%.2f".format(item.price * item.quantity)}", style = MaterialTheme.typography.bodyMedium)
                }
            }
            HorizontalDivider(Modifier.padding(vertical = 8.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Total", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text("R$ ${"%.2f".format(order.totalAmount)}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
            }
            if (order.status == "PENDING") {
                Spacer(Modifier.height(12.dp))
                if (showCancel) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedButton(onClick = { showCancel = false }, modifier = Modifier.weight(1f)) { Text("Voltar") }
                        Button(onClick = { onCancel(); showCancel = false }, modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)) { Text("Confirmar") }
                    }
                } else {
                    OutlinedButton(onClick = { showCancel = true }, modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error)) {
                        Icon(Icons.Default.Cancel, null, Modifier.size(16.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("Cancelar pedido")
                    }
                }
            }
        }
    }
}
