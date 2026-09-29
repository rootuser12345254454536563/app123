package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.OrderEntity
import com.example.ui.theme.*
import com.example.ui.viewmodel.Screen
import com.example.ui.viewmodel.StoreViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersListScreen(viewModel: StoreViewModel) {
    BackHandler { viewModel.navigateBack() }

    val strings by viewModel.strings.collectAsState()
    val orders by viewModel.orders.collectAsState()
    val settings by viewModel.storeSettings.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(strings.myOrders, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { viewModel.navigateBack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = TextPrimary
                )
            )
        }
    ) { paddingValues ->
        if (orders.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(SlateBackground)
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.ReceiptLong,
                        contentDescription = null,
                        tint = TextTertiary,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = strings.emptyOrders,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = TextPrimary
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(SlateBackground),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(orders, key = { it.id }) { order ->
                    OrderSummaryCard(
                        order = order,
                        currency = settings.currency,
                        strings = strings,
                        onClick = { viewModel.navigateTo(Screen.OrderDetail(order.orderId)) }
                    )
                }
            }
        }
    }
}

@Composable
fun OrderSummaryCard(
    order: OrderEntity,
    currency: String,
    strings: com.example.localization.TranslationStrings,
    onClick: () -> Unit
) {
    val dateStr = remember(order.createdAt) {
        SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault()).format(Date(order.createdAt))
    }

    val statusColor = when (order.status) {
        "Delivered" -> SuccessGreen
        "Shipped" -> AccentBlue
        "Processing", "Confirmed" -> AmberGold
        "Cancelled" -> DiscountRed
        else -> NavyPrimary
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = order.orderId,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = NavyPrimary
                )
                Surface(
                    color = statusColor.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = order.status,
                        color = statusColor,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(dateStr, fontSize = 11.sp, color = TextTertiary)

            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = order.itemsSummary,
                fontSize = 12.sp,
                color = TextSecondary,
                maxLines = 2
            )

            Divider(modifier = Modifier.padding(vertical = 8.dp), color = BorderSubtle)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${strings.total}: $currency ${order.totalAmount.toInt()}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = TextPrimary
                )
                Text(
                    text = "View Details →",
                    color = AccentBlue,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderDetailScreen(
    orderId: String,
    viewModel: StoreViewModel
) {
    BackHandler { viewModel.navigateBack() }

    val context = LocalContext.current
    val strings by viewModel.strings.collectAsState()
    val settings by viewModel.storeSettings.collectAsState()
    val orders by viewModel.orders.collectAsState()
    val order = remember(orders, orderId) { orders.firstOrNull { it.orderId == orderId } }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Order $orderId", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { viewModel.navigateBack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = TextPrimary
                )
            )
        }
    ) { paddingValues ->
        if (order == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Order not found")
            }
            return@Scaffold
        }

        val dateStr = SimpleDateFormat("dd MMMM yyyy, hh:mm a", Locale.getDefault()).format(Date(order.createdAt))

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(SlateBackground),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Status Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Current Status", color = TextSecondary, fontSize = 12.sp)
                            Surface(
                                color = NavyContainer,
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = order.status,
                                    color = NavyPrimary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 12.sp,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Placed on $dateStr", fontSize = 12.sp, color = TextTertiary)
                    }
                }
            }

            // Customer and Delivery Details
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Delivery Information", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(order.customerName, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                        Text(order.customerPhone, fontSize = 12.sp, color = TextSecondary)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(order.deliveryAddress, fontSize = 12.sp, color = TextSecondary)
                    }
                }
            }

            // Items breakdown
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Ordered Products", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = order.itemsSummary,
                            fontSize = 13.sp,
                            lineHeight = 20.sp,
                            color = TextPrimary
                        )

                        Divider(modifier = Modifier.padding(vertical = 12.dp), color = BorderSubtle)

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(strings.subtotal, color = TextSecondary, fontSize = 13.sp)
                            Text("${settings.currency} ${order.subtotal.toInt()}", fontSize = 13.sp)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(strings.deliveryFee, color = TextSecondary, fontSize = 13.sp)
                            Text("${settings.currency} ${order.deliveryFee.toInt()}", fontSize = 13.sp)
                        }
                        Divider(modifier = Modifier.padding(vertical = 8.dp), color = BorderSubtle)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(strings.total, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                            Text("${settings.currency} ${order.totalAmount.toInt()}", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = NavyPrimary)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(strings.paymentMethod, color = TextSecondary, fontSize = 12.sp)
                            Text(order.paymentMethod, fontWeight = FontWeight.Medium, fontSize = 12.sp)
                        }
                    }
                }
            }

            // WhatsApp update button
            item {
                Button(
                    onClick = { viewModel.openWhatsAppOrder(context, order) },
                    colors = ButtonDefaults.buttonColors(containerColor = WhatsAppGreen),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    Icon(Icons.Default.Send, contentDescription = null, tint = Color.White)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Chat with Store on WhatsApp", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
