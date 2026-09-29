package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.components.ProductCard
import com.example.ui.theme.*
import com.example.ui.viewmodel.Screen
import com.example.ui.viewmodel.StoreViewModel

@Composable
fun CategoriesScreen(viewModel: StoreViewModel) {
    val strings by viewModel.strings.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val selectedCat by viewModel.selectedCategory.collectAsState()
    val products by viewModel.visibleProducts.collectAsState()
    val settings by viewModel.storeSettings.collectAsState()
    val wishlistIds by viewModel.wishlistIds.collectAsState()

    val currentCategory = selectedCat ?: categories.firstOrNull()?.name ?: "All"

    val filteredList = remember(currentCategory, products) {
        if (currentCategory == "All") {
            products
        } else {
            products.filter { it.category.equals(currentCategory, ignoreCase = true) }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
    ) {
        // Categories Horizontal Selector
        Surface(
            color = Color.White,
            tonalElevation = 2.dp
        ) {
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 10.dp),
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    val isAll = currentCategory == "All"
                    FilterChip(
                        selected = isAll,
                        onClick = { viewModel.selectedCategory.value = "All" },
                        label = { Text("All", fontWeight = if (isAll) FontWeight.Bold else FontWeight.Normal) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = NavyPrimary,
                            selectedLabelColor = Color.White
                        )
                    )
                }

                items(categories) { cat ->
                    val isSelected = currentCategory == cat.name
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.selectedCategory.value = cat.name },
                        label = { Text(cat.name, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = NavyPrimary,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
        }

        // Header for selected category
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = currentCategory,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "${filteredList.size} Items",
                fontSize = 13.sp,
                color = TextSecondary
            )
        }

        if (filteredList.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Inventory2,
                        contentDescription = null,
                        tint = TextTertiary,
                        modifier = Modifier.size(56.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No products found in this category",
                        fontWeight = FontWeight.Medium,
                        color = TextSecondary
                    )
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 24.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                val pairs = filteredList.chunked(2)
                items(pairs) { pair ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        pair.forEach { product ->
                            ProductCard(
                                product = product,
                                currency = settings.currency,
                                strings = strings,
                                isWishlisted = wishlistIds.contains(product.id),
                                onProductClick = { viewModel.navigateTo(Screen.ProductDetail(product.id)) },
                                onAddToCart = { viewModel.addToCart(product) },
                                onToggleWishlist = { viewModel.toggleWishlist(product.id) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                        if (pair.size == 1) {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }
        }
    }
}
