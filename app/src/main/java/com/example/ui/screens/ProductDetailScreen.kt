package com.example.ui.screens

import android.content.Intent
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ProductEntity
import com.example.data.model.ReviewEntity
import com.example.ui.components.AppProductImage
import com.example.ui.theme.*
import com.example.ui.viewmodel.Screen
import com.example.ui.viewmodel.StoreViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    productId: Long,
    viewModel: StoreViewModel
) {
    BackHandler { viewModel.navigateBack() }

    val context = LocalContext.current
    val strings by viewModel.strings.collectAsState()
    val settings by viewModel.storeSettings.collectAsState()
    val wishlistIds by viewModel.wishlistIds.collectAsState()
    val productFlow = remember(productId) { viewModel.getProductFlow(productId) }
    val product by productFlow.collectAsState(initial = null)
    val reviewsFlow = remember(productId) { viewModel.getReviews(productId) }
    val reviews by reviewsFlow.collectAsState(initial = emptyList())

    var selectedQuantity by remember { mutableStateOf(1) }
    var selectedVariant by remember { mutableStateOf("") }
    var showReviewDialog by remember { mutableStateOf(false) }
    var showAddedSnackbar by remember { mutableStateOf(false) }

    if (product == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = NavyPrimary)
        }
        return
    }

    val prod = product!!
    val isWishlisted = wishlistIds.contains(prod.id)
    val hasDiscount = prod.discountPrice > 0 && prod.discountPrice < prod.price
    val discountPercent = if (hasDiscount) (((prod.price - prod.discountPrice) / prod.price) * 100).toInt() else 0
    val effectivePrice = if (hasDiscount) prod.discountPrice else prod.price

    val imageList = remember(prod.images) {
        val list = prod.images.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        if (list.isEmpty()) listOf("res:ic_store_logo") else list
    }

    val variantsList = remember(prod.variants) {
        prod.variants.split(",").map { it.trim() }.filter { it.isNotEmpty() }
    }

    LaunchedEffect(variantsList) {
        if (variantsList.isNotEmpty() && selectedVariant.isEmpty()) {
            selectedVariant = variantsList.first()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(prod.name, maxLines = 1, fontSize = 16.sp, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { viewModel.navigateBack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    // Share product
                    IconButton(
                        onClick = {
                            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_SUBJECT, prod.name)
                                putExtra(Intent.EXTRA_TEXT, "Check out ${prod.name} on Pukalavan Store! Price: ${settings.currency} ${effectivePrice.toInt()}\n${prod.description}")
                            }
                            context.startActivity(Intent.createChooser(shareIntent, "Share Product"))
                        }
                    ) {
                        Icon(Icons.Default.Share, contentDescription = strings.shareProduct)
                    }

                    // Wishlist
                    IconButton(onClick = { viewModel.toggleWishlist(prod.id) }) {
                        Icon(
                            imageVector = if (isWishlisted) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                            contentDescription = strings.wishlist,
                            tint = if (isWishlisted) DiscountRed else NavyPrimary
                        )
                    }

                    // Cart
                    IconButton(onClick = { viewModel.navigateTo(Screen.Cart) }) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = strings.cart)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = TextPrimary
                )
            )
        },
        bottomBar = {
            // Sticky Bottom Action Bar (Buy Now + Add to Cart)
            Surface(
                color = Color.White,
                tonalElevation = 8.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .windowInsetsPadding(WindowInsets.navigationBars)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Add to Cart
                    OutlinedButton(
                        onClick = {
                            viewModel.addToCart(prod, selectedQuantity, selectedVariant)
                            showAddedSnackbar = true
                        },
                        enabled = prod.stockQuantity > 0,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .testTag("detail_add_cart_btn"),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = NavyPrimary
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.5.dp, NavyPrimary)
                    ) {
                        Icon(Icons.Default.AddShoppingCart, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(strings.addToCart, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }

                    // Buy Now
                    Button(
                        onClick = {
                            viewModel.addToCart(prod, selectedQuantity, selectedVariant)
                            viewModel.navigateTo(Screen.Checkout)
                        },
                        enabled = prod.stockQuantity > 0,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .testTag("detail_buy_now_btn"),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = NavyPrimary,
                            contentColor = Color.White
                        )
                    ) {
                        Text(strings.buyNow, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                }
            }
        },
        snackbarHost = {
            if (showAddedSnackbar) {
                Snackbar(
                    modifier = Modifier.padding(16.dp),
                    action = {
                        TextButton(onClick = {
                            showAddedSnackbar = false
                            viewModel.navigateTo(Screen.Cart)
                        }) {
                            Text("VIEW CART", color = AmberGold, fontWeight = FontWeight.Bold)
                        }
                    }
                ) {
                    Text(strings.addedToCart, color = Color.White)
                }
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(SlateBackground)
        ) {
            // 1. Large Image Gallery Pager
            item {
                val pagerState = rememberPagerState(pageCount = { imageList.size })
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(300.dp)
                        .background(SurfaceMuted)
                ) {
                    HorizontalPager(
                        state = pagerState,
                        modifier = Modifier.fillMaxSize()
                    ) { page ->
                        AppProductImage(
                            imagePath = imageList[page],
                            contentDescription = prod.name,
                            modifier = Modifier.fillMaxSize()
                        )
                    }

                    // Pager Indicators
                    if (imageList.size > 1) {
                        Row(
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.Center
                        ) {
                            imageList.indices.forEach { index ->
                                Box(
                                    modifier = Modifier
                                        .padding(horizontal = 3.dp)
                                        .size(if (pagerState.currentPage == index) 16.dp else 6.dp, 6.dp)
                                        .clip(CircleShape)
                                        .background(if (pagerState.currentPage == index) NavyPrimary else Color.Gray.copy(alpha = 0.5f))
                                )
                            }
                        }
                    }

                    // Discount Tag
                    if (hasDiscount) {
                        Surface(
                            color = DiscountRed,
                            shape = RoundedCornerShape(topEnd = 8.dp, bottomEnd = 8.dp),
                            modifier = Modifier
                                .align(Alignment.TopStart)
                                .padding(top = 16.dp)
                        ) {
                            Text(
                                text = "$discountPercent% OFF",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }

            // 2. Price & Title Section
            item {
                Surface(
                    color = Color.White,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.Bottom) {
                                Text(
                                    text = "${settings.currency} ${effectivePrice.toInt()}",
                                    color = NavyPrimary,
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                if (hasDiscount) {
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "${settings.currency} ${prod.price.toInt()}",
                                        color = TextTertiary,
                                        fontSize = 15.sp,
                                        textDecoration = TextDecoration.LineThrough
                                    )
                                }
                            }

                            // Stock status badge
                            Surface(
                                color = if (prod.stockQuantity > 0) SuccessGreen.copy(alpha = 0.15f) else DiscountRed.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(8.dp)
                            ) {
                                Text(
                                    text = if (prod.stockQuantity > 0) "${strings.inStock} (${prod.stockQuantity})" else strings.outOfStock,
                                    color = if (prod.stockQuantity > 0) SuccessGreen else DiscountRed,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = prod.name,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = TextPrimary,
                            lineHeight = 24.sp
                        )

                        Spacer(modifier = Modifier.height(8.dp))
                        // Rating & Reviews row
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Star, contentDescription = null, tint = StarGold, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(3.dp))
                                Text(
                                    text = String.format("%.1f", prod.rating),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = TextPrimary
                                )
                            }
                            Text("•", color = Color.Gray)
                            Text(
                                text = "${prod.reviewCount} ${strings.reviews}",
                                fontSize = 12.sp,
                                color = AccentBlue
                            )
                            if (prod.brand.isNotBlank()) {
                                Text("•", color = Color.Gray)
                                Text("Brand: ${prod.brand}", fontSize = 12.sp, color = TextSecondary)
                            }
                            if (prod.sku.isNotBlank()) {
                                Text("•", color = Color.Gray)
                                Text("SKU: ${prod.sku}", fontSize = 11.sp, color = TextTertiary)
                            }
                        }
                    }
                }
            }

            // 3. Variant & Quantity Selection
            item {
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    color = Color.White,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        // Variants
                        if (variantsList.isNotEmpty()) {
                            Text(
                                text = strings.variants,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = TextPrimary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                items(variantsList) { variant ->
                                    val isSelected = selectedVariant == variant
                                    Surface(
                                        shape = RoundedCornerShape(8.dp),
                                        color = if (isSelected) NavyContainer else SurfaceMuted,
                                        border = if (isSelected) androidx.compose.foundation.BorderStroke(1.5.dp, NavyPrimary) else null,
                                        modifier = Modifier.clickable { selectedVariant = variant }
                                    ) {
                                        Text(
                                            text = variant,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                            color = if (isSelected) NavyPrimary else TextPrimary,
                                            fontSize = 13.sp,
                                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                                        )
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(16.dp))
                        }

                        // Quantity Selector
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = strings.quantity,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = TextPrimary
                            )

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                IconButton(
                                    onClick = { if (selectedQuantity > 1) selectedQuantity-- },
                                    enabled = selectedQuantity > 1,
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(SurfaceMuted)
                                ) {
                                    Icon(Icons.Default.Remove, contentDescription = "Decrease", modifier = Modifier.size(16.dp))
                                }

                                Text(
                                    text = selectedQuantity.toString(),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    modifier = Modifier.padding(horizontal = 8.dp)
                                )

                                IconButton(
                                    onClick = { if (selectedQuantity < prod.stockQuantity) selectedQuantity++ },
                                    enabled = selectedQuantity < prod.stockQuantity,
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(SurfaceMuted)
                                ) {
                                    Icon(Icons.Default.Add, contentDescription = "Increase", modifier = Modifier.size(16.dp))
                                }
                            }
                        }
                    }
                }
            }

            // 4. Specifications
            if (prod.specifications.isNotBlank()) {
                item {
                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        color = Color.White,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = strings.specifications,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = TextPrimary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            prod.specifications.lines().forEach { line ->
                                if (line.isNotBlank()) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 4.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        val parts = line.split(":")
                                        if (parts.size >= 2) {
                                            Text(parts[0].trim(), color = TextSecondary, fontSize = 13.sp, modifier = Modifier.weight(1f))
                                            Text(parts.drop(1).joinToString(":").trim(), fontWeight = FontWeight.Medium, fontSize = 13.sp, modifier = Modifier.weight(1.5f))
                                        } else {
                                            Text(line, fontSize = 13.sp, color = TextPrimary)
                                        }
                                    }
                                    Divider(color = BorderSubtle, thickness = 0.5.dp)
                                }
                            }
                        }
                    }
                }
            }

            // 5. Description
            item {
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    color = Color.White,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = strings.description,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = TextPrimary
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = prod.description,
                            color = TextSecondary,
                            fontSize = 13.sp,
                            lineHeight = 20.sp
                        )
                    }
                }
            }

            // 6. Reviews & Ratings Section
            item {
                Spacer(modifier = Modifier.height(10.dp))
                Surface(
                    color = Color.White,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = strings.reviewRating,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = TextPrimary
                            )
                            TextButton(onClick = { showReviewDialog = true }) {
                                Text(strings.writeReview, color = AccentBlue, fontWeight = FontWeight.Bold)
                            }
                        }

                        if (reviews.isEmpty()) {
                            Text(
                                text = "Be the first to review this product from Pukalavan Store!",
                                fontSize = 13.sp,
                                color = TextSecondary,
                                modifier = Modifier.padding(vertical = 8.dp)
                            )
                        } else {
                            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                reviews.forEach { review ->
                                    ReviewItem(review)
                                }
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(30.dp))
            }
        }
    }

    // Customer Review Submission Dialog
    if (showReviewDialog) {
        var reviewRatingInput by remember { mutableStateOf(5) }
        var reviewTextInput by remember { mutableStateOf("") }
        var reviewerNameInput by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { showReviewDialog = false },
            title = { Text(strings.writeReview, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Select Rating:")
                    Row {
                        (1..5).forEach { star ->
                            IconButton(onClick = { reviewRatingInput = star }) {
                                Icon(
                                    imageVector = if (star <= reviewRatingInput) Icons.Filled.Star else Icons.Outlined.StarBorder,
                                    contentDescription = "$star Stars",
                                    tint = StarGold
                                )
                            }
                        }
                    }
                    OutlinedTextField(
                        value = reviewerNameInput,
                        onValueChange = { reviewerNameInput = it },
                        label = { Text("Your Name") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = reviewTextInput,
                        onValueChange = { reviewTextInput = it },
                        label = { Text("Your Review Comment") },
                        minLines = 3,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (reviewTextInput.isNotBlank()) {
                            viewModel.addProductReview(
                                productId = prod.id,
                                rating = reviewRatingInput,
                                comment = reviewTextInput,
                                customerName = reviewerNameInput
                            )
                            showReviewDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary)
                ) {
                    Text(strings.submitReview)
                }
            },
            dismissButton = {
                TextButton(onClick = { showReviewDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun ReviewItem(review: ReviewEntity) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(SurfaceMuted)
            .padding(10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(review.customerName, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = TextPrimary)
            Row {
                (1..5).forEach { star ->
                    Icon(
                        imageVector = if (star <= review.rating) Icons.Filled.Star else Icons.Outlined.StarBorder,
                        contentDescription = null,
                        tint = StarGold,
                        modifier = Modifier.size(12.dp)
                    )
                }
            }
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(review.reviewText, fontSize = 12.sp, color = TextSecondary)
        Spacer(modifier = Modifier.height(4.dp))
        Text(review.date, fontSize = 10.sp, color = TextTertiary)
    }
}
