package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.components.ProductCard
import com.example.ui.theme.*
import com.example.ui.viewmodel.Screen
import com.example.ui.viewmodel.SortOption
import com.example.ui.viewmodel.StoreViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(viewModel: StoreViewModel) {
    val strings by viewModel.strings.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val sortOption by viewModel.sortOption.collectAsState()
    val inStockOnly by viewModel.inStockOnly.collectAsState()
    val filteredProducts by viewModel.filteredProducts.collectAsState()
    val settings by viewModel.storeSettings.collectAsState()
    val wishlistIds by viewModel.wishlistIds.collectAsState()

    var showSortMenu by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground)
    ) {
        // Search TextField Header
        Surface(
            color = Color.White,
            tonalElevation = 2.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { viewModel.searchQuery.value = it },
                    placeholder = { Text(strings.searchPlaceholder, fontSize = 14.sp) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = NavyPrimary) },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { viewModel.searchQuery.value = "" }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear")
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = NavyPrimary,
                        unfocusedBorderColor = BorderSubtle
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("search_input_field")
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Filter & Sort Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    // In-Stock Only Chip
                    FilterChip(
                        selected = inStockOnly,
                        onClick = { viewModel.inStockOnly.value = !inStockOnly },
                        label = { Text("In Stock Only", fontSize = 12.sp) },
                        leadingIcon = {
                            if (inStockOnly) Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = NavyContainer,
                            selectedLabelColor = NavyPrimary
                        )
                    )

                    // Sort Button & Menu
                    Box {
                        OutlinedButton(
                            onClick = { showSortMenu = true },
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Icon(Icons.Default.Sort, contentDescription = "Sort", modifier = Modifier.size(16.dp), tint = NavyPrimary)
                            Spacer(modifier = Modifier.width(4.dp))
                            val sortLabel = when (sortOption) {
                                SortOption.DEFAULT -> "Featured"
                                SortOption.PRICE_LOW_TO_HIGH -> "Price: Low-High"
                                SortOption.PRICE_HIGH_TO_LOW -> "Price: High-Low"
                                SortOption.NEWEST -> "Newest"
                            }
                            Text(sortLabel, fontSize = 12.sp, color = NavyPrimary)
                        }

                        DropdownMenu(
                            expanded = showSortMenu,
                            onDismissRequest = { showSortMenu = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Featured / Default") },
                                onClick = {
                                    viewModel.sortOption.value = SortOption.DEFAULT
                                    showSortMenu = false
                                }
                            )
                            DropdownMenuItem(
                                text = { Text(strings.priceLowToHigh) },
                                onClick = {
                                    viewModel.sortOption.value = SortOption.PRICE_LOW_TO_HIGH
                                    showSortMenu = false
                                }
                            )
                            DropdownMenuItem(
                                text = { Text(strings.priceHighToLow) },
                                onClick = {
                                    viewModel.sortOption.value = SortOption.PRICE_HIGH_TO_LOW
                                    showSortMenu = false
                                }
                            )
                            DropdownMenuItem(
                                text = { Text(strings.newestFirst) },
                                onClick = {
                                    viewModel.sortOption.value = SortOption.NEWEST
                                    showSortMenu = false
                                }
                            )
                        }
                    }
                }
            }
        }

        // Search Results Count
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "${filteredProducts.size} results found",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = TextSecondary
            )
        }

        // Product Grid or Empty State
        if (filteredProducts.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.SearchOff,
                        contentDescription = null,
                        tint = TextTertiary,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "No matching products found",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Try adjusting your search terms or filters",
                        fontSize = 13.sp,
                        color = TextSecondary
                    )
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 24.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                val pairs = filteredProducts.chunked(2)
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
