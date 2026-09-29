package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.BannerEntity
import com.example.data.model.CategoryEntity
import com.example.data.model.ProductEntity
import com.example.ui.components.AppProductImage
import com.example.ui.components.ProductCard
import com.example.ui.components.SectionHeader
import com.example.ui.theme.*
import com.example.ui.viewmodel.Screen
import com.example.ui.viewmodel.StoreViewModel
import kotlinx.coroutines.delay

@Composable
fun HomeScreen(viewModel: StoreViewModel) {
    val strings by viewModel.strings.collectAsState()
    val banners by viewModel.activeBanners.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val products by viewModel.visibleProducts.collectAsState()
    val settings by viewModel.storeSettings.collectAsState()
    val wishlistIds by viewModel.wishlistIds.collectAsState()

    val flashDeals = remember(products) {
        products.filter { it.discountPrice > 0 && it.discountPrice < it.price }
    }
    val featuredProducts = remember(products) {
        products.filter { it.isFeatured }
    }
    val newArrivals = remember(products) {
        products.filter { it.isNewArrival }
    }
    val bestSellers = remember(products) {
        products.filter { it.isBestSeller }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(SlateBackground),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        // 1. Promotional Banners Carousel
        if (banners.isNotEmpty()) {
            item {
                BannerCarousel(
                    banners = banners,
                    onBannerClick = { banner ->
                        when (banner.destinationType) {
                            "category" -> {
                                viewModel.selectedCategory.value = banner.destinationValue
                                viewModel.navigateTo(Screen.Categories)
                            }
                            else -> viewModel.navigateTo(Screen.Search)
                        }
                    }
                )
            }
        }

        // 2. Quick Categories
        item {
            Column(modifier = Modifier.padding(vertical = 12.dp)) {
                SectionHeader(
                    title = strings.categories,
                    actionText = strings.viewAll,
                    onActionClick = { viewModel.navigateTo(Screen.Categories) }
                )
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(categories) { cat ->
                        CategoryCard(
                            category = cat,
                            onClick = {
                                viewModel.selectedCategory.value = cat.name
                                viewModel.navigateTo(Screen.Categories)
                            }
                        )
                    }
                }
            }
        }

        // 3. Flash Deals Row
        if (flashDeals.isNotEmpty()) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(DiscountRedContainer.copy(alpha = 0.5f), SlateBackground)
                            )
                        )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Bolt,
                                contentDescription = null,
                                tint = DiscountRed,
                                modifier = Modifier.size(22.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = strings.flashDeals,
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = DiscountRed
                            )
                        }
                        Text(
                            text = strings.viewAll,
                            color = AccentBlue,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.clickable { viewModel.navigateTo(Screen.Search) }
                        )
                    }

                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(flashDeals) { product ->
                            ProductCard(
                                product = product,
                                currency = settings.currency,
                                strings = strings,
                                isWishlisted = wishlistIds.contains(product.id),
                                onProductClick = { viewModel.navigateTo(Screen.ProductDetail(product.id)) },
                                onAddToCart = { viewModel.addToCart(product) },
                                onToggleWishlist = { viewModel.toggleWishlist(product.id) },
                                modifier = Modifier.width(170.dp)
                            )
                        }
                    }
                }
            }
        }

        // 4. Featured Products
        if (featuredProducts.isNotEmpty()) {
            item {
                Column(modifier = Modifier.padding(top = 12.dp)) {
                    SectionHeader(
                        title = strings.featuredProducts,
                        actionText = strings.viewAll,
                        onActionClick = { viewModel.navigateTo(Screen.Search) }
                    )
                }
            }
            item {
                ProductGridSection(
                    products = featuredProducts.take(4),
                    settings = settings,
                    strings = strings,
                    wishlistIds = wishlistIds,
                    viewModel = viewModel
                )
            }
        }

        // 5. New Arrivals
        if (newArrivals.isNotEmpty()) {
            item {
                Column(modifier = Modifier.padding(top = 16.dp)) {
                    SectionHeader(
                        title = strings.newArrivals,
                        actionText = strings.viewAll,
                        onActionClick = { viewModel.navigateTo(Screen.Search) }
                    )
                }
            }
            item {
                ProductGridSection(
                    products = newArrivals.take(4),
                    settings = settings,
                    strings = strings,
                    wishlistIds = wishlistIds,
                    viewModel = viewModel
                )
            }
        }

        // 6. Best Sellers
        if (bestSellers.isNotEmpty()) {
            item {
                Column(modifier = Modifier.padding(top = 16.dp)) {
                    SectionHeader(
                        title = strings.bestSellers,
                        actionText = strings.viewAll,
                        onActionClick = { viewModel.navigateTo(Screen.Search) }
                    )
                }
            }
            item {
                ProductGridSection(
                    products = bestSellers.take(4),
                    settings = settings,
                    strings = strings,
                    wishlistIds = wishlistIds,
                    viewModel = viewModel
                )
            }
        }
    }
}

@Composable
fun BannerCarousel(
    banners: List<BannerEntity>,
    onBannerClick: (BannerEntity) -> Unit
) {
    val pagerState = rememberPagerState(pageCount = { banners.size })

    // Auto-advance banner carousel
    LaunchedEffect(banners.size) {
        if (banners.size > 1) {
            while (true) {
                delay(4000)
                val nextPage = (pagerState.currentPage + 1) % banners.size
                pagerState.animateScrollToPage(nextPage)
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 12.dp)
    ) {
        HorizontalPager(
            state = pagerState,
            contentPadding = PaddingValues(horizontal = 16.dp),
            pageSpacing = 12.dp,
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp)
        ) { page ->
            val banner = banners[page]
            Card(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(16.dp))
                    .clickable { onBannerClick(banner) },
                elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    AppProductImage(
                        imagePath = banner.imageUri,
                        contentDescription = banner.title,
                        modifier = Modifier.fillMaxSize()
                    )

                    // Gradient overlay
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.horizontalGradient(
                                    colors = listOf(
                                        NavyPrimary.copy(alpha = 0.85f),
                                        NavyPrimary.copy(alpha = 0.4f),
                                        Color.Transparent
                                    )
                                )
                            )
                    )

                    // Banner Text & Button
                    Column(
                        modifier = Modifier
                            .align(Alignment.CenterStart)
                            .padding(16.dp)
                            .fillMaxWidth(0.7f)
                    ) {
                        Text(
                            text = banner.title,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            maxLines = 2,
                            lineHeight = 20.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = banner.subtitle,
                            color = Color.White.copy(alpha = 0.85f),
                            fontSize = 12.sp,
                            maxLines = 2
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Button(
                            onClick = { onBannerClick(banner) },
                            colors = ButtonDefaults.buttonColors(containerColor = AmberGold),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.height(32.dp)
                        ) {
                            Text(
                                text = banner.buttonText,
                                color = NavyPrimaryDark,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp
                            )
                        }
                    }
                }
            }
        }

        // Pager Indicators
        if (banners.size > 1) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                horizontalArrangement = Arrangement.Center
            ) {
                banners.forEachIndexed { index, _ ->
                    Box(
                        modifier = Modifier
                            .padding(horizontal = 3.dp)
                            .size(if (pagerState.currentPage == index) 16.dp else 6.dp, 6.dp)
                            .clip(CircleShape)
                            .background(
                                if (pagerState.currentPage == index) NavyPrimary else Color.LightGray
                            )
                    )
                }
            }
        }
    }
}

@Composable
fun CategoryCard(
    category: CategoryEntity,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .width(86.dp)
            .clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .size(62.dp)
                .clip(CircleShape)
                .background(NavyContainer),
            contentAlignment = Alignment.Center
        ) {
            val icon = when (category.iconName) {
                "devices" -> Icons.Default.Devices
                "local_cafe" -> Icons.Default.LocalCafe
                "checkroom" -> Icons.Default.Checkroom
                "kitchen" -> Icons.Default.Kitchen
                "spa" -> Icons.Default.Spa
                else -> Icons.Default.ShoppingBag
            }
            Icon(
                imageVector = icon,
                contentDescription = category.name,
                tint = NavyPrimary,
                modifier = Modifier.size(28.dp)
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = category.name,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = TextPrimary,
            maxLines = 2,
            lineHeight = 14.sp,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
    }
}

@Composable
fun ProductGridSection(
    products: List<ProductEntity>,
    settings: com.example.data.model.StoreSettingsEntity,
    strings: com.example.localization.TranslationStrings,
    wishlistIds: Set<Long>,
    viewModel: StoreViewModel
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        val pairs = products.chunked(2)
        pairs.forEach { pair ->
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
