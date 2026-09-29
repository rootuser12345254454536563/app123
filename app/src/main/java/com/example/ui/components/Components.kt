package com.example.ui.components

import android.net.Uri
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.R
import com.example.data.model.ProductEntity
import com.example.localization.AppLanguage
import com.example.localization.TranslationStrings
import com.example.ui.theme.*
import com.example.ui.viewmodel.Screen
import com.example.ui.viewmodel.StoreViewModel

@Composable
fun AppProductImage(
    imagePath: String,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    contentScale: ContentScale = ContentScale.Crop
) {
    val context = LocalContext.current
    val imageModel: Any = remember(imagePath) {
        when {
            imagePath.startsWith("res:promo_banner_main") -> R.drawable.promo_banner_main_1790586848395
            imagePath.startsWith("res:promo_banner_sale") -> R.drawable.promo_banner_sale_1790586863059
            imagePath.startsWith("res:ic_store_logo") -> R.drawable.ic_store_logo_1790586835004
            imagePath.isNotBlank() -> Uri.parse(imagePath)
            else -> R.drawable.ic_store_logo_1790586835004
        }
    }

    AsyncImage(
        model = ImageRequest.Builder(context)
            .data(imageModel)
            .crossfade(true)
            .error(R.drawable.ic_store_logo_1790586835004)
            .placeholder(R.drawable.ic_store_logo_1790586835004)
            .build(),
        contentDescription = contentDescription,
        modifier = modifier,
        contentScale = contentScale
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StoreTopAppBar(
    viewModel: StoreViewModel,
    strings: TranslationStrings,
    cartCount: Int,
    onOpenCart: () -> Unit,
    onOpenWishlist: () -> Unit,
    onSearchClick: () -> Unit
) {
    var showLanguageMenu by remember { mutableStateOf(false) }
    var showNotificationDialog by remember { mutableStateOf(false) }
    val currentLang by viewModel.currentLanguage.collectAsState()

    Surface(
        color = NavyPrimary,
        tonalElevation = 4.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Store Brand & Icon
                Row(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { viewModel.navigateTo(Screen.Home) },
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color.White.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.ShoppingBag,
                            contentDescription = "Pukalavan Store Logo",
                            tint = AmberGold,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = strings.appName,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = strings.storeSlogan,
                            color = Color.White.copy(alpha = 0.75f),
                            fontSize = 11.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                // Language Selector Button
                Box {
                    IconButton(
                        onClick = { showLanguageMenu = true },
                        modifier = Modifier.testTag("language_selector_button")
                    ) {
                        Badge(containerColor = AmberGold) {
                            Text(
                                text = currentLang.code.uppercase(),
                                color = NavyPrimaryDark,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp
                            )
                        }
                    }

                    DropdownMenu(
                        expanded = showLanguageMenu,
                        onDismissRequest = { showLanguageMenu = false }
                    ) {
                        AppLanguage.values().forEach { lang ->
                            DropdownMenuItem(
                                text = {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(lang.nativeName, fontWeight = if (lang == currentLang) FontWeight.Bold else FontWeight.Normal)
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text("(${lang.displayName})", color = Color.Gray, fontSize = 12.sp)
                                    }
                                },
                                onClick = {
                                    viewModel.setLanguage(lang)
                                    showLanguageMenu = false
                                },
                                leadingIcon = {
                                    if (lang == currentLang) {
                                        Icon(Icons.Default.Check, contentDescription = "Active", tint = NavyPrimary)
                                    }
                                }
                            )
                        }
                    }
                }

                // Notifications Button
                IconButton(
                    onClick = { showNotificationDialog = true },
                    modifier = Modifier.testTag("notification_button")
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Notifications,
                        contentDescription = "Notifications",
                        tint = Color.White
                    )
                }

                // Wishlist shortcut
                IconButton(
                    onClick = onOpenWishlist,
                    modifier = Modifier.testTag("wishlist_button")
                ) {
                    Icon(
                        imageVector = Icons.Outlined.FavoriteBorder,
                        contentDescription = "Wishlist",
                        tint = Color.White
                    )
                }

                // Cart with badge
                IconButton(
                    onClick = onOpenCart,
                    modifier = Modifier.testTag("cart_top_button")
                ) {
                    BadgedBox(
                        badge = {
                            if (cartCount > 0) {
                                Badge(
                                    containerColor = DiscountRed,
                                    contentColor = Color.White
                                ) {
                                    Text(cartCount.toString(), fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Default.ShoppingCart,
                            contentDescription = "Shopping Cart",
                            tint = Color.White
                        )
                    }
                }
            }

            // Quick Search Bar below Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 16.dp, end = 16.dp, bottom = 12.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.White)
                    .clickable { onSearchClick() }
                    .padding(horizontal = 14.dp, vertical = 10.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = NavyPrimary
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = strings.searchPlaceholder,
                        color = Color.Gray,
                        fontSize = 14.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }

    if (showNotificationDialog) {
        AlertDialog(
            onDismissRequest = { showNotificationDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Notifications, contentDescription = null, tint = NavyPrimary)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(strings.notifications, fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Surface(
                        color = AccentBlueContainer,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("Welcome to Pukalavan Store! 🎉", fontWeight = FontWeight.Bold, color = OnAccentBlueContainer, fontSize = 13.sp)
                            Text("Explore our authentic Ceylon products, spices, and electronics.", fontSize = 12.sp, color = TextPrimary)
                        }
                    }
                    Surface(
                        color = AmberGoldContainer,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text("Fast Island-wide Delivery 🚚", fontWeight = FontWeight.Bold, color = OnAmberGoldContainer, fontSize = 13.sp)
                            Text("Cash on Delivery available on all orders across Sri Lanka.", fontSize = 12.sp, color = TextPrimary)
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showNotificationDialog = false }) {
                    Text("OK", fontWeight = FontWeight.Bold, color = NavyPrimary)
                }
            }
        )
    }
}

@Composable
fun StoreBottomBar(
    currentScreen: Screen,
    cartItemCount: Int,
    strings: TranslationStrings,
    onNavigate: (Screen) -> Unit
) {
    NavigationBar(
        containerColor = Color.White,
        tonalElevation = 8.dp,
        modifier = Modifier.windowInsetsPadding(WindowInsets.navigationBars)
    ) {
        val isHome = currentScreen is Screen.Home
        val isCategories = currentScreen is Screen.Categories
        val isSearch = currentScreen is Screen.Search
        val isCart = currentScreen is Screen.Cart
        val isAccount = currentScreen is Screen.Account || currentScreen is Screen.AdminDashboard || currentScreen is Screen.AdminLogin

        NavigationBarItem(
            selected = isHome,
            onClick = { onNavigate(Screen.Home) },
            icon = {
                Icon(
                    imageVector = if (isHome) Icons.Filled.Home else Icons.Outlined.Home,
                    contentDescription = strings.home
                )
            },
            label = { Text(strings.home, fontSize = 11.sp, maxLines = 1) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = NavyPrimary,
                selectedTextColor = NavyPrimary,
                indicatorColor = NavyContainer
            ),
            modifier = Modifier.testTag("nav_home")
        )

        NavigationBarItem(
            selected = isCategories,
            onClick = { onNavigate(Screen.Categories) },
            icon = {
                Icon(
                    imageVector = if (isCategories) Icons.Filled.GridView else Icons.Outlined.GridView,
                    contentDescription = strings.categories
                )
            },
            label = { Text(strings.categories, fontSize = 11.sp, maxLines = 1) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = NavyPrimary,
                selectedTextColor = NavyPrimary,
                indicatorColor = NavyContainer
            ),
            modifier = Modifier.testTag("nav_categories")
        )

        NavigationBarItem(
            selected = isSearch,
            onClick = { onNavigate(Screen.Search) },
            icon = {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = strings.search
                )
            },
            label = { Text(strings.search, fontSize = 11.sp, maxLines = 1) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = NavyPrimary,
                selectedTextColor = NavyPrimary,
                indicatorColor = NavyContainer
            ),
            modifier = Modifier.testTag("nav_search")
        )

        NavigationBarItem(
            selected = isCart,
            onClick = { onNavigate(Screen.Cart) },
            icon = {
                BadgedBox(
                    badge = {
                        if (cartItemCount > 0) {
                            Badge(containerColor = DiscountRed) {
                                Text(cartItemCount.toString(), fontWeight = FontWeight.Bold, color = Color.White)
                            }
                        }
                    }
                ) {
                    Icon(
                        imageVector = if (isCart) Icons.Filled.ShoppingCart else Icons.Outlined.ShoppingCart,
                        contentDescription = strings.cart
                    )
                }
            },
            label = { Text(strings.cart, fontSize = 11.sp, maxLines = 1) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = NavyPrimary,
                selectedTextColor = NavyPrimary,
                indicatorColor = NavyContainer
            ),
            modifier = Modifier.testTag("nav_cart")
        )

        NavigationBarItem(
            selected = isAccount,
            onClick = { onNavigate(Screen.Account) },
            icon = {
                Icon(
                    imageVector = if (isAccount) Icons.Filled.Person else Icons.Outlined.Person,
                    contentDescription = strings.account
                )
            },
            label = { Text(strings.account, fontSize = 11.sp, maxLines = 1) },
            colors = NavigationBarItemDefaults.colors(
                selectedIconColor = NavyPrimary,
                selectedTextColor = NavyPrimary,
                indicatorColor = NavyContainer
            ),
            modifier = Modifier.testTag("nav_account")
        )
    }
}

@Composable
fun ProductCard(
    product: ProductEntity,
    currency: String,
    strings: TranslationStrings,
    isWishlisted: Boolean,
    onProductClick: () -> Unit,
    onAddToCart: () -> Unit,
    onToggleWishlist: () -> Unit,
    modifier: Modifier = Modifier
) {
    val hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price
    val discountPercent = if (hasDiscount) {
        (((product.price - product.discountPrice) / product.price) * 100).toInt()
    } else 0
    val effectivePrice = if (hasDiscount) product.discountPrice else product.price

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .clickable { onProductClick() }
            .testTag("product_card_${product.id}"),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            // Product Image & Badges
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(150.dp)
                    .background(SurfaceMuted)
            ) {
                AppProductImage(
                    imagePath = product.images.split(",").firstOrNull() ?: "",
                    contentDescription = product.name,
                    modifier = Modifier.fillMaxSize()
                )

                // Badges top-left
                Column(
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    if (hasDiscount) {
                        Surface(
                            color = DiscountRed,
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "-$discountPercent%",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                    if (product.isBestSeller) {
                        Surface(
                            color = AmberGold,
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "BEST SELLER",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.sp,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    } else if (product.isNewArrival) {
                        Surface(
                            color = AccentBlue,
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "NEW",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 9.sp,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }

                // Wishlist Icon top-right
                IconButton(
                    onClick = onToggleWishlist,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(4.dp)
                        .size(34.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.85f))
                        .testTag("wishlist_btn_${product.id}")
                ) {
                    Icon(
                        imageVector = if (isWishlisted) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                        contentDescription = "Wishlist",
                        tint = if (isWishlisted) DiscountRed else Color.Gray,
                        modifier = Modifier.size(18.dp)
                    )
                }

                // Out of stock overlay
                if (product.stockQuantity <= 0) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color.Black.copy(alpha = 0.6f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = strings.outOfStock,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Info Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(10.dp)
            ) {
                // Category & Brand
                Text(
                    text = product.category,
                    color = TextTertiary,
                    fontSize = 11.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                // Title
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = product.name,
                    color = TextPrimary,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 13.sp,
                    maxLines = 2,
                    minLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 17.sp
                )

                // Rating
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Star,
                        contentDescription = "Rating",
                        tint = StarGold,
                        modifier = Modifier.size(13.dp)
                    )
                    Text(
                        text = String.format("%.1f", product.rating),
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        color = TextPrimary
                    )
                    Text(
                        text = "(${product.reviewCount})",
                        fontSize = 10.sp,
                        color = TextTertiary
                    )
                }

                // Price and Add Button
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "$currency ${effectivePrice.toInt()}",
                            color = NavyPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                        if (hasDiscount) {
                            Text(
                                text = "$currency ${product.price.toInt()}",
                                color = TextTertiary,
                                fontSize = 11.sp,
                                textDecoration = TextDecoration.LineThrough
                            )
                        }
                    }

                    // Quick Add to Cart FAB
                    FilledIconButton(
                        onClick = onAddToCart,
                        enabled = product.stockQuantity > 0,
                        colors = IconButtonDefaults.filledIconButtonColors(
                            containerColor = NavyPrimary,
                            contentColor = Color.White
                        ),
                        modifier = Modifier
                            .size(34.dp)
                            .testTag("add_cart_btn_${product.id}")
                    ) {
                        Icon(
                            imageVector = Icons.Default.AddShoppingCart,
                            contentDescription = strings.addToCart,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SectionHeader(
    title: String,
    actionText: String? = null,
    onActionClick: (() -> Unit)? = null
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
            fontSize = 18.sp
        )
        if (actionText != null && onActionClick != null) {
            Text(
                text = actionText,
                color = AccentBlue,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier
                    .clickable { onActionClick() }
                    .padding(4.dp)
            )
        }
    }
}
