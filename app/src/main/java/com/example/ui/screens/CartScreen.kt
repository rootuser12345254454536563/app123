package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.CartItemWithProduct
import com.example.ui.components.AppProductImage
import com.example.ui.theme.*
import com.example.ui.viewmodel.Screen
import com.example.ui.viewmodel.StoreViewModel

@Composable
fun CartScreen(viewModel: StoreViewModel) {
    val strings by viewModel.strings.collectAsState()
    val settings by viewModel.storeSettings.collectAsState()
    val cartItems by viewModel.cartItemsWithProducts.collectAsState()
    val subtotal by viewModel.cartSubtotal.collectAsState()
    val total by viewModel.cartTotal.collectAsState()

    if (cartItems.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(SlateBackground)
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                        .background(NavyContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.RemoveShoppingCart,
                        contentDescription = null,
                        tint = NavyPrimary,
                        modifier = Modifier.size(48.dp)
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = strings.emptyCart,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Explore our exciting collection and add your favorite items!",
                    fontSize = 13.sp,
                    color = TextSecondary,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
                Spacer(modifier = Modifier.height(20.dp))
                Button(
                    onClick = { viewModel.navigateTo(Screen.Home) },
                    colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Start Shopping", fontWeight = FontWeight.Bold)
                }
            }
        }
        return
    }

    Scaffold(
        bottomBar = {
            Surface(
                color = Color.White,
                tonalElevation = 8.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .windowInsetsPadding(WindowInsets.navigationBars)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    // Price Breakdown
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(strings.subtotal, color = TextSecondary, fontSize = 13.sp)
                        Text("${settings.currency} ${subtotal.toInt()}", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(strings.deliveryFee, color = TextSecondary, fontSize = 13.sp)
                        Text("${settings.currency} ${settings.deliveryFee.toInt()}", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    }
                    Divider(modifier = Modifier.padding(vertical = 8.dp), color = BorderSubtle)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(strings.total, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextPrimary)
                        Text("${settings.currency} ${total.toInt()}", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = NavyPrimary)
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = { viewModel.navigateTo(Screen.Checkout) },
                        colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .testTag("cart_proceed_checkout_btn")
                    ) {
                        Text(strings.checkout, fontWeight = FontWeight.Bold, fontSize = 15.sp)
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
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "${strings.cart} (${cartItems.size})",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = TextPrimary
                    )
                    TextButton(onClick = { viewModel.clearCart() }) {
                        Text("Clear All", color = DiscountRed, fontSize = 12.sp)
                    }
                }
            }

            items(cartItems, key = { it.cartItem.id }) { item ->
                CartItemRow(
                    item = item,
                    currency = settings.currency,
                    onIncrease = { viewModel.updateCartQuantity(item.cartItem.id, item.cartItem.quantity + 1) },
                    onDecrease = { viewModel.updateCartQuantity(item.cartItem.id, item.cartItem.quantity - 1) },
                    onRemove = { viewModel.removeCartItem(item.cartItem) }
                )
            }
        }
    }
}

@Composable
fun CartItemRow(
    item: CartItemWithProduct,
    currency: String,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit,
    onRemove: () -> Unit
) {
    val product = item.product
    val effectivePrice = if (product.discountPrice > 0) product.discountPrice else product.price

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Product image
            Box(
                modifier = Modifier
                    .size(76.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(SurfaceMuted)
            ) {
                AppProductImage(
                    imagePath = product.images.split(",").firstOrNull() ?: "",
                    contentDescription = product.name,
                    modifier = Modifier.fillMaxSize()
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Details
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = product.name,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 13.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    color = TextPrimary
                )
                if (item.cartItem.selectedVariant.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Variant: ${item.cartItem.selectedVariant}",
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "$currency ${effectivePrice.toInt()}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = NavyPrimary
                )
            }

            // Quantity controls & Delete
            Column(horizontalAlignment = Alignment.End) {
                IconButton(onClick = onRemove, modifier = Modifier.size(28.dp)) {
                    Icon(Icons.Default.DeleteOutline, contentDescription = "Remove", tint = Color.Gray, modifier = Modifier.size(18.dp))
                }

                Spacer(modifier = Modifier.height(6.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    IconButton(
                        onClick = onDecrease,
                        modifier = Modifier
                            .size(28.dp)
                            .clip(CircleShape)
                            .background(SurfaceMuted)
                    ) {
                        Icon(Icons.Default.Remove, contentDescription = "Minus", modifier = Modifier.size(14.dp))
                    }

                    Text(
                        text = item.cartItem.quantity.toString(),
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(horizontal = 4.dp)
                    )

                    IconButton(
                        onClick = onIncrease,
                        modifier = Modifier
                            .size(28.dp)
                            .clip(CircleShape)
                            .background(SurfaceMuted)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Plus", modifier = Modifier.size(14.dp))
                    }
                }
            }
        }
    }
}
