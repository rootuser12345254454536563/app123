package com.example.ui.screens

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import com.example.ui.viewmodel.Screen
import com.example.ui.viewmodel.StoreViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(viewModel: StoreViewModel) {
    BackHandler { viewModel.navigateBack() }

    val context = LocalContext.current
    val strings by viewModel.strings.collectAsState()
    val settings by viewModel.storeSettings.collectAsState()
    val userProfile by viewModel.userProfile.collectAsState()
    val addresses by viewModel.addresses.collectAsState()
    val cartItems by viewModel.cartItemsWithProducts.collectAsState()
    val subtotal by viewModel.cartSubtotal.collectAsState()
    val total by viewModel.cartTotal.collectAsState()

    var name by remember { mutableStateOf(userProfile.name) }
    var phone by remember { mutableStateOf(userProfile.phone) }
    var addressText by remember {
        mutableStateOf(addresses.firstOrNull { it.isDefault }?.let { "${it.streetAddress}, ${it.city}" } ?: "128 Main Street, Jaffna")
    }
    var paymentMethod by remember { mutableStateOf("Cash on Delivery") }
    var isPlacingOrder by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(strings.checkout, fontWeight = FontWeight.Bold) },
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
        },
        bottomBar = {
            Surface(
                color = Color.White,
                tonalElevation = 8.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .windowInsetsPadding(WindowInsets.navigationBars)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(strings.total, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextPrimary)
                        Text("${settings.currency} ${total.toInt()}", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = NavyPrimary)
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = {
                            if (name.isBlank() || phone.isBlank() || addressText.isBlank()) {
                                Toast.makeText(context, "Please fill in all customer delivery details", Toast.LENGTH_SHORT).show()
                                return@Button
                            }
                            isPlacingOrder = true
                            viewModel.placeOrder(
                                customerName = name.trim(),
                                customerPhone = phone.trim(),
                                deliveryAddress = addressText.trim(),
                                paymentMethod = paymentMethod,
                                context = context
                            ) { placedOrder ->
                                isPlacingOrder = false
                                viewModel.navigateTo(Screen.OrderSuccess(placedOrder.orderId))
                            }
                        },
                        enabled = !isPlacingOrder && cartItems.isNotEmpty(),
                        colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .testTag("place_order_submit_btn")
                    ) {
                        if (isPlacingOrder) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(22.dp))
                        } else {
                            Text(strings.placeOrder, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        }
                    }
                }
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(SlateBackground),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Customer Details Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Person, contentDescription = null, tint = NavyPrimary)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(strings.customerName, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it },
                            label = { Text(strings.customerName) },
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("checkout_name_input")
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            label = { Text(strings.phone) },
                            singleLine = true,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("checkout_phone_input")
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        OutlinedTextField(
                            value = addressText,
                            onValueChange = { addressText = it },
                            label = { Text(strings.deliveryAddress) },
                            minLines = 2,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("checkout_address_input")
                        )
                    }
                }
            }

            // Payment Method Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Payment, contentDescription = null, tint = NavyPrimary)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(strings.paymentMethod, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        }
                        Spacer(modifier = Modifier.height(12.dp))

                        // Cash on Delivery
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (paymentMethod == "Cash on Delivery") NavyContainer else SurfaceMuted,
                            border = if (paymentMethod == "Cash on Delivery") androidx.compose.foundation.BorderStroke(1.5.dp, NavyPrimary) else null,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { paymentMethod = "Cash on Delivery" }
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = paymentMethod == "Cash on Delivery",
                                    onClick = { paymentMethod = "Cash on Delivery" }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(strings.cashOnDelivery, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    Text("Pay with cash when package arrives at your doorstep", fontSize = 11.sp, color = TextSecondary)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Online Payment (Placeholder / Integration-Ready)
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (paymentMethod == "Online Payment") NavyContainer else SurfaceMuted,
                            border = if (paymentMethod == "Online Payment") androidx.compose.foundation.BorderStroke(1.5.dp, NavyPrimary) else null,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { paymentMethod = "Online Payment" }
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = paymentMethod == "Online Payment",
                                    onClick = { paymentMethod = "Online Payment" }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(strings.onlinePayment, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    Text("Visa, Mastercard, Genie & FriMi gateway ready", fontSize = 11.sp, color = TextSecondary)
                                }
                            }
                        }
                    }
                }
            }

            // Order Summary Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Order Summary (${cartItems.size} items)", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        Spacer(modifier = Modifier.height(10.dp))
                        cartItems.forEach { item ->
                            val effectivePrice = if (item.product.discountPrice > 0) item.product.discountPrice else item.product.price
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "${item.product.name} x ${item.cartItem.quantity}",
                                    fontSize = 13.sp,
                                    color = TextPrimary,
                                    modifier = Modifier.weight(1f)
                                )
                                Text(
                                    text = "${settings.currency} ${(effectivePrice * item.cartItem.quantity).toInt()}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                        Divider(modifier = Modifier.padding(vertical = 8.dp), color = BorderSubtle)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(strings.subtotal, color = TextSecondary, fontSize = 13.sp)
                            Text("${settings.currency} ${subtotal.toInt()}", fontSize = 13.sp)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(strings.deliveryFee, color = TextSecondary, fontSize = 13.sp)
                            Text("${settings.currency} ${settings.deliveryFee.toInt()}", fontSize = 13.sp)
                        }
                        Divider(modifier = Modifier.padding(vertical = 8.dp), color = BorderSubtle)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(strings.total, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextPrimary)
                            Text("${settings.currency} ${total.toInt()}", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = NavyPrimary)
                        }
                    }
                }
            }
        }
    }
}
