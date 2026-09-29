package com.example.ui.screens

import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.foundation.BorderStroke
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.*
import com.example.ui.components.AppProductImage
import com.example.ui.theme.*
import com.example.ui.viewmodel.Screen
import com.example.ui.viewmodel.StoreViewModel
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun getAdminFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedTextColor = Color(0xFF0F172A),
    unfocusedTextColor = Color(0xFF0F172A),
    disabledTextColor = Color(0xFF0F172A),
    focusedContainerColor = Color.White,
    unfocusedContainerColor = Color.White,
    disabledContainerColor = Color.White,
    cursorColor = Color(0xFF0F3E88),
    focusedBorderColor = Color(0xFF1E6FD9),
    unfocusedBorderColor = Color(0xFF94A3B8),
    disabledBorderColor = Color(0xFF94A3B8),
    focusedLabelColor = Color(0xFF0F3E88),
    unfocusedLabelColor = Color(0xFF334155),
    disabledLabelColor = Color(0xFF334155),
    focusedPlaceholderColor = Color(0xFF64748B),
    unfocusedPlaceholderColor = Color(0xFF64748B),
    disabledPlaceholderColor = Color(0xFF64748B),
    focusedLeadingIconColor = Color(0xFF0F3E88),
    unfocusedLeadingIconColor = Color(0xFF475569),
    disabledLeadingIconColor = Color(0xFF475569),
    focusedTrailingIconColor = Color(0xFF0F3E88),
    unfocusedTrailingIconColor = Color(0xFF475569),
    disabledTrailingIconColor = Color(0xFF475569)
)

val adminTextStyle = TextStyle(
    color = Color(0xFF0F172A),
    fontSize = 14.sp,
    fontWeight = FontWeight.Medium
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminLoginScreen(viewModel: StoreViewModel) {
    BackHandler { viewModel.navigateBack() }

    val context = LocalContext.current
    val strings by viewModel.strings.collectAsState()
    var adminPass by remember { mutableStateOf("") }
    var adminUser by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // Full-screen vibrant premium blue gradient background
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.linearGradient(
                    colors = listOf(
                        Color(0xFF031433), // Deep Midnight Navy Blue
                        Color(0xFF07275E), // Deep Royal Blue
                        Color(0xFF0E4394), // Vibrant Sapphire Blue
                        Color(0xFF1967D2), // Bright Azure Blue
                        Color(0xFF0C3877)  // Rich Cobalt Blue
                    ),
                    start = Offset(0f, 0f),
                    end = Offset(1000f, 1800f)
                )
            )
    ) {
        // Subtle ambient blue glow & lighting effects
        Canvas(modifier = Modifier.fillMaxSize()) {
            // Top-right bright blue glow
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0x7038BDF8), Color(0x301D4ED8), Color.Transparent),
                    center = Offset(size.width * 0.88f, size.height * 0.12f),
                    radius = size.width * 0.75f
                )
            )
            // Bottom-left cyan / electric blue glow
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0x6000D2FF), Color(0x200369A1), Color.Transparent),
                    center = Offset(size.width * 0.12f, size.height * 0.88f),
                    radius = size.width * 0.7f
                )
            )
            // Central soft ambient halo
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0x2560A5FA), Color.Transparent),
                    center = Offset(size.width * 0.5f, size.height * 0.48f),
                    radius = size.width * 0.85f
                )
            )
        }

        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = strings.adminPortal,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    },
                    navigationIcon = {
                        IconButton(
                            onClick = { viewModel.navigateBack() },
                            modifier = Modifier
                                .padding(8.dp)
                                .clip(CircleShape)
                                .background(Color(0x26FFFFFF))
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = Color.White
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent,
                        titleContentColor = Color.White
                    )
                )
            }
        ) { paddingValues ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .imePadding()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 24.dp, vertical = 20.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    modifier = Modifier
                        .widthIn(max = 440.dp)
                        .fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Pukalavan Store Branding Header
                    Box(
                        modifier = Modifier
                            .size(68.dp)
                            .clip(CircleShape)
                            .background(Color(0x33FFFFFF))
                            .border(2.dp, Color(0x66FFFFFF), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Storefront,
                            contentDescription = "Pukalavan Store",
                            tint = AmberGold,
                            modifier = Modifier.size(38.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Pukalavan Store",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 24.sp,
                        color = Color.White,
                        letterSpacing = 0.5.sp
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Surface(
                        color = Color(0x26FFFFFF),
                        shape = RoundedCornerShape(20.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x40FFFFFF))
                    ) {
                        Text(
                            text = "OFFICIAL ADMIN CONSOLE",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFFBAE6FD),
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                            letterSpacing = 1.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(28.dp))

                    // Clean White Form Card in the center
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .shadow(elevation = 16.dp, shape = RoundedCornerShape(22.dp)),
                        shape = RoundedCornerShape(22.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(28.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(56.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFEEF2F6)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.AdminPanelSettings,
                                    contentDescription = null,
                                    tint = NavyPrimary,
                                    modifier = Modifier.size(32.dp)
                                )
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            Text(
                                text = "Store Administration Login",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = Color(0xFF0F172A)
                            )
                            Text(
                                text = "Authorized store managers only",
                                fontSize = 12.sp,
                                color = Color(0xFF475569)
                            )

                            Spacer(modifier = Modifier.height(22.dp))

                            // High-contrast, clear-visibility input field theme
                            val adminInputColors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color(0xFF0F172A),
                                unfocusedTextColor = Color(0xFF0F172A),
                                focusedContainerColor = Color.White,
                                unfocusedContainerColor = Color.White,
                                cursorColor = Color(0xFF0F3E88),
                                focusedBorderColor = Color(0xFF1E6FD9),
                                unfocusedBorderColor = Color(0xFF94A3B8),
                                focusedLabelColor = Color(0xFF0F3E88),
                                unfocusedLabelColor = Color(0xFF334155),
                                focusedPlaceholderColor = Color(0xFF64748B),
                                unfocusedPlaceholderColor = Color(0xFF64748B),
                                focusedLeadingIconColor = Color(0xFF0F3E88),
                                unfocusedLeadingIconColor = Color(0xFF475569),
                                focusedTrailingIconColor = Color(0xFF0F3E88),
                                unfocusedTrailingIconColor = Color(0xFF64748B)
                            )

                            // Admin Username / Email Input
                            OutlinedTextField(
                                value = adminUser,
                                onValueChange = { adminUser = it; errorMessage = null },
                                label = {
                                    Text(
                                        text = "Admin Username / Email",
                                        fontWeight = FontWeight.SemiBold
                                    )
                                },
                                placeholder = {
                                    Text(
                                        text = "admin@pukalavanstore.com",
                                        color = Color(0xFF64748B),
                                        fontSize = 14.sp
                                    )
                                },
                                leadingIcon = {
                                    Icon(
                                        imageVector = Icons.Default.Person,
                                        contentDescription = null
                                    )
                                },
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                colors = adminInputColors,
                                textStyle = androidx.compose.ui.text.TextStyle(
                                    color = Color(0xFF0F172A),
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Medium
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("admin_user_input")
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            // Admin Password Input with eye toggle
                            OutlinedTextField(
                                value = adminPass,
                                onValueChange = { adminPass = it; errorMessage = null },
                                label = {
                                    Text(
                                        text = "Admin Security Passcode",
                                        fontWeight = FontWeight.SemiBold
                                    )
                                },
                                placeholder = {
                                    Text(
                                        text = "Enter admin password",
                                        color = Color(0xFF64748B),
                                        fontSize = 14.sp
                                    )
                                },
                                leadingIcon = {
                                    Icon(
                                        imageVector = Icons.Default.Lock,
                                        contentDescription = null
                                    )
                                },
                                trailingIcon = {
                                    IconButton(
                                        onClick = { passwordVisible = !passwordVisible },
                                        modifier = Modifier.size(48.dp)
                                    ) {
                                        Icon(
                                            imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                            contentDescription = if (passwordVisible) "Hide password" else "Show password",
                                            tint = if (passwordVisible) Color(0xFF0F3E88) else Color(0xFF64748B)
                                        )
                                    }
                                },
                                singleLine = true,
                                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                shape = RoundedCornerShape(12.dp),
                                colors = adminInputColors,
                                textStyle = androidx.compose.ui.text.TextStyle(
                                    color = Color(0xFF0F172A),
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Medium
                                ),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("admin_pass_input")
                            )

                            if (errorMessage != null) {
                                Spacer(modifier = Modifier.height(10.dp))
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(Color(0xFFFEE2E2), RoundedCornerShape(8.dp))
                                        .padding(horizontal = 12.dp, vertical = 8.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.ErrorOutline,
                                        contentDescription = null,
                                        tint = DiscountRed,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = errorMessage!!,
                                        color = DiscountRed,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(22.dp))

                            Button(
                                onClick = {
                                    if (viewModel.loginAdmin(adminUser, adminPass)) {
                                        Toast.makeText(context, "Admin authenticated!", Toast.LENGTH_SHORT).show()
                                        viewModel.navigateTo(Screen.AdminDashboard)
                                    } else {
                                        errorMessage = "Invalid administrator credentials. Access denied."
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp)
                                    .testTag("admin_login_submit_btn")
                            ) {
                                Icon(Icons.Default.LockOpen, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Access Admin Dashboard",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp
                                )
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Shield,
                                    contentDescription = null,
                                    tint = Color(0xFF475569),
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "Secure 256-Bit Encrypted Portal",
                                    fontSize = 11.sp,
                                    color = Color(0xFF475569),
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboardScreen(viewModel: StoreViewModel) {
    BackHandler { viewModel.navigateBack() }

    val strings by viewModel.strings.collectAsState()
    val products by viewModel.allProducts.collectAsState()
    val orders by viewModel.orders.collectAsState()
    val settings by viewModel.storeSettings.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val banners by viewModel.allBanners.collectAsState()

    var selectedAdminTab by remember { mutableStateOf(0) }
    val tabs = listOf("Overview", "Products", "Orders", "Banners", "Categories", "Customers", "Settings")

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(strings.adminDashboard, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF0F172A))
                        Text(settings.storeName, fontSize = 11.sp, color = Color(0xFF475569), fontWeight = FontWeight.Medium)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { viewModel.navigateBack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color(0xFF0F172A))
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.logoutAdmin() }) {
                        Icon(Icons.Default.ExitToApp, contentDescription = strings.logout, tint = Color(0xFFDC2626))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = Color(0xFF0F172A)
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(SlateBackground)
        ) {
            // Scrollable Admin Tab Row with clear visibility & indicator
            ScrollableTabRow(
                selectedTabIndex = selectedAdminTab,
                containerColor = Color.White,
                contentColor = Color(0xFF1E6FD9),
                edgePadding = 16.dp,
                indicator = { tabPositions ->
                    if (selectedAdminTab < tabPositions.size) {
                        TabRowDefaults.SecondaryIndicator(
                            modifier = Modifier.tabIndicatorOffset(tabPositions[selectedAdminTab]),
                            color = Color(0xFF1E6FD9),
                            height = 3.dp
                        )
                    }
                }
            ) {
                tabs.forEachIndexed { index, title ->
                    val isSelected = selectedAdminTab == index
                    Tab(
                        selected = isSelected,
                        onClick = { selectedAdminTab = index },
                        text = {
                            Text(
                                text = title,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.SemiBold,
                                fontSize = 13.sp,
                                color = if (isSelected) Color(0xFF1E6FD9) else Color(0xFF475569)
                            )
                        }
                    )
                }
            }

            // Tab Content
            when (selectedAdminTab) {
                0 -> AdminOverviewTab(viewModel, products, orders, settings)
                1 -> AdminProductsTab(viewModel, products, settings, strings)
                2 -> AdminOrdersTab(viewModel, orders, settings)
                3 -> AdminBannersTab(viewModel, banners)
                4 -> AdminCategoriesTab(viewModel, categories)
                5 -> AdminCustomersTab(viewModel, orders, settings)
                6 -> AdminSettingsTab(viewModel, settings)
            }
        }
    }
}

@Composable
fun AdminOverviewTab(
    viewModel: StoreViewModel,
    products: List<ProductEntity>,
    orders: List<OrderEntity>,
    settings: StoreSettingsEntity
) {
    val totalSales = remember(orders) {
        orders.filter { it.status != "Cancelled" }.sumOf { it.totalAmount }
    }
    val pendingOrders = remember(orders) { orders.count { it.status == "Pending" } }
    val deliveredOrders = remember(orders) { orders.count { it.status == "Delivered" } }
    val lowStockCount = remember(products) { products.count { it.stockQuantity in 1..5 } }
    val outOfStockCount = remember(products) { products.count { it.stockQuantity <= 0 } }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text("Store Performance & Analytics", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextPrimary)
        }

        // Stats 2x2 Grid
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    StatCard(
                        title = "Total Sales",
                        value = "${settings.currency} ${totalSales.toInt()}",
                        color = SuccessGreen,
                        icon = Icons.Default.MonetizationOn,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Total Orders",
                        value = "${orders.size}",
                        color = NavyPrimary,
                        icon = Icons.Default.ShoppingBag,
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    StatCard(
                        title = "Pending Orders",
                        value = "$pendingOrders",
                        color = AmberGold,
                        icon = Icons.Default.HourglassTop,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Total Products",
                        value = "${products.size}",
                        color = AccentBlue,
                        icon = Icons.Default.Inventory2,
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    StatCard(
                        title = "Low Stock Alert",
                        value = "$lowStockCount",
                        color = AmberGold,
                        icon = Icons.Default.WarningAmber,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Out of Stock",
                        value = "$outOfStockCount",
                        color = DiscountRed,
                        icon = Icons.Default.RemoveCircleOutline,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Quick Actions
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Quick Inventory Management", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = { viewModel.navigateTo(Screen.AdminEditProduct(null)) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF0F3E88),
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth().testTag("admin_add_product_btn")
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, tint = Color.White)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Add New Product (with Device Photos)",
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    color: Color,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(color.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(value, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF0F172A))
            Text(title, fontSize = 12.sp, color = Color(0xFF475569), fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
fun AdminProductsTab(
    viewModel: StoreViewModel,
    products: List<ProductEntity>,
    settings: StoreSettingsEntity,
    strings: com.example.localization.TranslationStrings
) {
    var adminProductSearch by remember { mutableStateOf("") }
    val filtered = remember(products, adminProductSearch) {
        if (adminProductSearch.isBlank()) products else products.filter {
            it.name.contains(adminProductSearch, ignoreCase = true) ||
            it.sku.contains(adminProductSearch, ignoreCase = true) ||
            it.category.contains(adminProductSearch, ignoreCase = true)
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
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
                    text = "All Products (${products.size})",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = Color(0xFF0F172A)
                )
                Button(
                    onClick = { viewModel.navigateTo(Screen.AdminEditProduct(null)) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF0F3E88),
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(8.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp),
                    modifier = Modifier.height(36.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color.White)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Product", fontSize = 12.sp, color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }

        item {
            OutlinedTextField(
                value = adminProductSearch,
                onValueChange = { adminProductSearch = it },
                placeholder = {
                    Text(
                        text = "Filter products by name, SKU or category...",
                        color = Color(0xFF64748B),
                        fontSize = 13.sp
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = null,
                        tint = Color(0xFF0F3E88)
                    )
                },
                singleLine = true,
                shape = RoundedCornerShape(10.dp),
                colors = getAdminFieldColors(),
                textStyle = adminTextStyle,
                modifier = Modifier.fillMaxWidth()
            )
        }

        items(filtered, key = { it.id }) { product ->
            AdminProductItemCard(
                product = product,
                currency = settings.currency,
                onEdit = { viewModel.navigateTo(Screen.AdminEditProduct(product.id)) },
                onToggleVisibility = { viewModel.toggleProductVisibility(product.id, !product.isVisible) },
                onDelete = { viewModel.deleteProduct(product) },
                onUpdateStock = { newStock -> viewModel.updateProductStock(product.id, newStock) }
            )
        }
    }
}

@Composable
fun AdminProductItemCard(
    product: ProductEntity,
    currency: String,
    onEdit: () -> Unit,
    onToggleVisibility: () -> Unit,
    onDelete: () -> Unit,
    onUpdateStock: (Int) -> Unit
) {
    var showStockDialog by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(60.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(SurfaceMuted)
                        .border(1.dp, Color(0xFFCBD5E1), RoundedCornerShape(8.dp))
                ) {
                    AppProductImage(
                        imagePath = product.images.split(",").firstOrNull() ?: "",
                        contentDescription = product.name,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = product.name,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Color(0xFF0F172A),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "${product.category} • SKU: ${product.sku.ifBlank { "N/A" }}",
                        fontSize = 12.sp,
                        color = Color(0xFF475569)
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "$currency ${if (product.discountPrice > 0) product.discountPrice.toInt() else product.price.toInt()}",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 14.sp,
                        color = Color(0xFF0F2C59)
                    )
                }

                // Visibility status indicator
                IconButton(onClick = onToggleVisibility) {
                    Icon(
                        imageVector = if (product.isVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                        contentDescription = "Toggle Visibility",
                        tint = if (product.isVisible) Color(0xFF1E6FD9) else Color(0xFF64748B)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            HorizontalDivider(color = Color(0xFFE2E8F0), thickness = 1.dp)
            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable { showStockDialog = true }
                ) {
                    Text("Stock: ", fontSize = 12.sp, color = Color(0xFF475569))
                    Text(
                        text = "${product.stockQuantity} units",
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        color = if (product.stockQuantity <= 0) Color(0xFFDC2626) else Color(0xFF0F172A)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(Icons.Default.Edit, contentDescription = "Edit Stock", modifier = Modifier.size(14.dp), tint = Color(0xFF1E6FD9))
                }

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    TextButton(onClick = onEdit) {
                        Text("Edit", fontSize = 13.sp, color = Color(0xFF1E6FD9), fontWeight = FontWeight.Bold)
                    }
                    TextButton(onClick = onDelete) {
                        Text("Delete", fontSize = 13.sp, color = Color(0xFFDC2626), fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }

    if (showStockDialog) {
        var stockInput by remember { mutableStateOf(product.stockQuantity.toString()) }
        AlertDialog(
            onDismissRequest = { showStockDialog = false },
            title = { Text("Update Stock Quantity", fontWeight = FontWeight.Bold, color = Color(0xFF0F172A)) },
            text = {
                OutlinedTextField(
                    value = stockInput,
                    onValueChange = { stockInput = it.filter { ch -> ch.isDigit() } },
                    label = { Text("Available Units", fontWeight = FontWeight.SemiBold) },
                    singleLine = true,
                    colors = getAdminFieldColors(),
                    textStyle = adminTextStyle,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        val num = stockInput.toIntOrNull() ?: product.stockQuantity
                        onUpdateStock(num)
                        showStockDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF0F3E88),
                        contentColor = Color.White
                    )
                ) {
                    Text("Update", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showStockDialog = false }) {
                    Text("Cancel", color = Color(0xFF475569), fontWeight = FontWeight.Medium)
                }
            }
        )
    }
}

@Composable
fun AdminOrdersTab(
    viewModel: StoreViewModel,
    orders: List<OrderEntity>,
    settings: StoreSettingsEntity
) {
    val context = LocalContext.current
    var statusFilter by remember { mutableStateOf("All") }
    val filteredOrders = remember(orders, statusFilter) {
        if (statusFilter == "All") orders else orders.filter { it.status == statusFilter }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(
                text = "Order Pipeline Management",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = Color(0xFF0F172A)
            )
        }

        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                items(listOf("All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled")) { status ->
                    val isSelected = statusFilter == status
                    FilterChip(
                        selected = isSelected,
                        onClick = { statusFilter = status },
                        label = {
                            Text(
                                text = status,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                            )
                        },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color(0xFF0F3E88),
                            selectedLabelColor = Color.White,
                            containerColor = Color.White,
                            labelColor = Color(0xFF334155)
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = isSelected,
                            borderColor = if (isSelected) Color(0xFF0F3E88) else Color(0xFFCBD5E1)
                        )
                    )
                }
            }
        }

        items(filteredOrders, key = { it.id }) { order ->
            var showStatusDropdown by remember { mutableStateOf(false) }

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
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
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 15.sp,
                            color = Color(0xFF0F2C59)
                        )
                        Box {
                            OutlinedButton(
                                onClick = { showStatusDropdown = true },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.outlinedButtonColors(
                                    containerColor = Color(0xFFF1F5F9),
                                    contentColor = Color(0xFF0F172A)
                                ),
                                border = BorderStroke(1.dp, Color(0xFF94A3B8)),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                                modifier = Modifier.height(32.dp)
                            ) {
                                Text(
                                    text = order.status,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF0F172A)
                                )
                                Icon(
                                    imageVector = Icons.Default.ArrowDropDown,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp),
                                    tint = Color(0xFF0F172A)
                                )
                            }

                            DropdownMenu(
                                expanded = showStatusDropdown,
                                onDismissRequest = { showStatusDropdown = false },
                                modifier = Modifier.background(Color.White)
                            ) {
                                listOf("Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled").forEach { newStatus ->
                                    DropdownMenuItem(
                                        text = {
                                            Text(
                                                text = newStatus,
                                                color = Color(0xFF0F172A),
                                                fontWeight = FontWeight.Medium
                                            )
                                        },
                                        onClick = {
                                            viewModel.updateOrderStatus(order.orderId, newStatus)
                                            showStatusDropdown = false
                                        }
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "${order.customerName} • ${order.customerPhone}",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 13.sp,
                        color = Color(0xFF0F172A)
                    )
                    Text(
                        text = order.deliveryAddress,
                        fontSize = 12.sp,
                        color = Color(0xFF475569)
                    )

                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = order.itemsSummary,
                        fontSize = 12.sp,
                        color = Color(0xFF1E293B)
                    )

                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = Color(0xFFE2E8F0), thickness = 1.dp)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Total: ${settings.currency} ${order.totalAmount.toInt()}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = Color(0xFF0F172A)
                        )
                        IconButton(onClick = { viewModel.openWhatsAppOrder(context, order) }) {
                            Icon(
                                imageVector = Icons.Default.Send,
                                contentDescription = "Send WhatsApp",
                                tint = WhatsAppGreen
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AdminBannersTab(
    viewModel: StoreViewModel,
    banners: List<BannerEntity>
) {
    var showAddBannerDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
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
                    text = "Promotional Banners (${banners.size})",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = Color(0xFF0F172A)
                )
                Button(
                    onClick = { showAddBannerDialog = true },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF0F3E88),
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color.White)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Banner", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }

        items(banners, key = { it.id }) { banner ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(110.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(SurfaceMuted)
                            .border(1.dp, Color(0xFFCBD5E1), RoundedCornerShape(8.dp))
                    ) {
                        AppProductImage(
                            imagePath = banner.imageUri,
                            contentDescription = banner.title,
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = banner.title,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Color(0xFF0F172A)
                    )
                    Text(
                        text = banner.subtitle,
                        fontSize = 12.sp,
                        color = Color(0xFF475569)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Active: ${if (banner.isEnabled) "Yes" else "No"}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = if (banner.isEnabled) SuccessGreen else Color(0xFF64748B)
                        )
                        TextButton(onClick = { viewModel.deleteBanner(banner) }) {
                            Text("Delete", color = Color(0xFFDC2626), fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }

    if (showAddBannerDialog) {
        var bannerTitle by remember { mutableStateOf("") }
        var bannerSubtitle by remember { mutableStateOf("") }
        var bannerBtn by remember { mutableStateOf("Shop Now") }
        var bannerImageUri by remember { mutableStateOf("res:promo_banner_main") }

        val imagePickerLauncher = rememberLauncherForActivityResult(
            contract = ActivityResultContracts.GetContent()
        ) { uri: Uri? ->
            if (uri != null) {
                bannerImageUri = uri.toString()
            }
        }

        AlertDialog(
            onDismissRequest = { showAddBannerDialog = false },
            title = { Text("Add Promotion Banner", fontWeight = FontWeight.Bold, color = Color(0xFF0F172A)) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = bannerTitle,
                        onValueChange = { bannerTitle = it },
                        label = { Text("Banner Title", fontWeight = FontWeight.SemiBold) },
                        placeholder = { Text("e.g. Mega Summer Sale", color = Color(0xFF64748B)) },
                        colors = getAdminFieldColors(),
                        textStyle = adminTextStyle,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = bannerSubtitle,
                        onValueChange = { bannerSubtitle = it },
                        label = { Text("Subtitle / Promotion Offer", fontWeight = FontWeight.SemiBold) },
                        placeholder = { Text("e.g. Up to 50% Off On All Items", color = Color(0xFF64748B)) },
                        colors = getAdminFieldColors(),
                        textStyle = adminTextStyle,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = bannerBtn,
                        onValueChange = { bannerBtn = it },
                        label = { Text("Button Text", fontWeight = FontWeight.SemiBold) },
                        colors = getAdminFieldColors(),
                        textStyle = adminTextStyle,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedButton(
                        onClick = { imagePickerLauncher.launch("image/*") },
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = Color(0xFFF1F5F9),
                            contentColor = Color(0xFF0F3E88)
                        ),
                        border = BorderStroke(1.dp, Color(0xFF0F3E88)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.PhotoLibrary, contentDescription = null, tint = Color(0xFF0F3E88))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Select Banner from Device Gallery", color = Color(0xFF0F3E88), fontWeight = FontWeight.Bold)
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (bannerTitle.isNotBlank()) {
                            viewModel.saveBanner(
                                BannerEntity(
                                    title = bannerTitle,
                                    subtitle = bannerSubtitle,
                                    buttonText = bannerBtn,
                                    imageUri = bannerImageUri
                                )
                            )
                            showAddBannerDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF0F3E88),
                        contentColor = Color.White
                    )
                ) {
                    Text("Save Banner", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddBannerDialog = false }) {
                    Text("Cancel", color = Color(0xFF475569), fontWeight = FontWeight.Medium)
                }
            }
        )
    }
}

@Composable
fun AdminCategoriesTab(
    viewModel: StoreViewModel,
    categories: List<CategoryEntity>
) {
    var showAddCategoryDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
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
                    text = "Categories Management (${categories.size})",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = Color(0xFF0F172A)
                )
                Button(
                    onClick = { showAddCategoryDialog = true },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF0F3E88),
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color.White)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Category", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }

        items(categories, key = { it.id }) { cat ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(NavyContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Category, contentDescription = null, tint = NavyPrimary, modifier = Modifier.size(20.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = cat.name,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 14.sp,
                            color = Color(0xFF0F172A)
                        )
                    }

                    TextButton(onClick = { viewModel.deleteCategory(cat) }) {
                        Text("Delete", color = Color(0xFFDC2626), fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }

    if (showAddCategoryDialog) {
        var catName by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showAddCategoryDialog = false },
            title = { Text("Add New Category", fontWeight = FontWeight.Bold, color = Color(0xFF0F172A)) },
            text = {
                OutlinedTextField(
                    value = catName,
                    onValueChange = { catName = it },
                    label = { Text("Category Name", fontWeight = FontWeight.SemiBold) },
                    placeholder = { Text("e.g. Home & Kitchen", color = Color(0xFF64748B)) },
                    singleLine = true,
                    colors = getAdminFieldColors(),
                    textStyle = adminTextStyle,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (catName.isNotBlank()) {
                            viewModel.saveCategory(CategoryEntity(name = catName.trim()))
                            showAddCategoryDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF0F3E88),
                        contentColor = Color.White
                    )
                ) {
                    Text("Add", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showAddCategoryDialog = false }) {
                    Text("Cancel", color = Color(0xFF475569), fontWeight = FontWeight.Medium)
                }
            }
        )
    }
}

@Composable
fun AdminCustomersTab(
    viewModel: StoreViewModel,
    orders: List<OrderEntity>,
    settings: StoreSettingsEntity
) {
    val customers = remember(orders) {
        orders.groupBy { it.customerPhone }
            .map { (phone, custOrders) ->
                val name = custOrders.firstOrNull()?.customerName ?: "Customer"
                val address = custOrders.firstOrNull()?.deliveryAddress ?: ""
                val totalSpent = custOrders.sumOf { it.totalAmount }
                val orderCount = custOrders.size
                Triple(name, phone, Triple(address, totalSpent, orderCount))
            }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(
                text = "Registered Customers (${customers.size})",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = Color(0xFF0F172A)
            )
        }

        if (customers.isEmpty()) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                        Text("No customer records yet.", color = Color(0xFF475569))
                    }
                }
            }
        }

        items(customers) { (name, phone, details) ->
            val (address, totalSpent, orderCount) = details
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(NavyContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Person, contentDescription = null, tint = NavyPrimary)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(name, fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color(0xFF0F172A))
                        Text(phone, fontSize = 12.sp, color = Color(0xFF475569))
                        if (address.isNotBlank()) {
                            Text(address, fontSize = 11.sp, color = Color(0xFF64748B), maxLines = 1, overflow = TextOverflow.Ellipsis)
                        }
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text("$orderCount orders", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = Color(0xFF1E6FD9))
                        Text("${settings.currency} ${totalSpent.toInt()}", fontWeight = FontWeight.ExtraBold, fontSize = 13.sp, color = Color(0xFF0F2C59))
                    }
                }
            }
        }
    }
}

@Composable
fun AdminSettingsTab(
    viewModel: StoreViewModel,
    settings: StoreSettingsEntity
) {
    val context = LocalContext.current
    var storeName by remember { mutableStateOf(settings.storeName) }
    var storePhone by remember { mutableStateOf(settings.storePhone) }
    var whatsappNumber by remember { mutableStateOf(settings.whatsappNumber) }
    var storeEmail by remember { mutableStateOf(settings.storeEmail) }
    var storeAddress by remember { mutableStateOf(settings.storeAddress) }
    var deliveryFee by remember { mutableStateOf(settings.deliveryFee.toInt().toString()) }
    var currency by remember { mutableStateOf(settings.currency) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(
                text = "Store & System Settings",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = Color(0xFF0F172A)
            )
        }

        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = storeName,
                        onValueChange = { storeName = it },
                        label = { Text("Store Name", fontWeight = FontWeight.SemiBold) },
                        placeholder = { Text("Pukalavan Store", color = Color(0xFF64748B)) },
                        singleLine = true,
                        colors = getAdminFieldColors(),
                        textStyle = adminTextStyle,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = storePhone,
                        onValueChange = { storePhone = it },
                        label = { Text("Store Phone", fontWeight = FontWeight.SemiBold) },
                        placeholder = { Text("+94 77 123 4567", color = Color(0xFF64748B)) },
                        singleLine = true,
                        colors = getAdminFieldColors(),
                        textStyle = adminTextStyle,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = whatsappNumber,
                        onValueChange = { whatsappNumber = it },
                        label = { Text("Official WhatsApp Number (for orders)", fontWeight = FontWeight.SemiBold) },
                        placeholder = { Text("94771234567", color = Color(0xFF64748B)) },
                        singleLine = true,
                        colors = getAdminFieldColors(),
                        textStyle = adminTextStyle,
                        modifier = Modifier.fillMaxWidth().testTag("admin_settings_whatsapp")
                    )
                    OutlinedTextField(
                        value = storeEmail,
                        onValueChange = { storeEmail = it },
                        label = { Text("Store Email", fontWeight = FontWeight.SemiBold) },
                        placeholder = { Text("support@pukalavanstore.com", color = Color(0xFF64748B)) },
                        singleLine = true,
                        colors = getAdminFieldColors(),
                        textStyle = adminTextStyle,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = storeAddress,
                        onValueChange = { storeAddress = it },
                        label = { Text("Store Physical Address", fontWeight = FontWeight.SemiBold) },
                        placeholder = { Text("Main Street, Jaffna, Sri Lanka", color = Color(0xFF64748B)) },
                        minLines = 2,
                        colors = getAdminFieldColors(),
                        textStyle = adminTextStyle,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OutlinedTextField(
                            value = deliveryFee,
                            onValueChange = { deliveryFee = it.filter { ch -> ch.isDigit() } },
                            label = { Text("Delivery Fee", fontWeight = FontWeight.SemiBold) },
                            singleLine = true,
                            colors = getAdminFieldColors(),
                            textStyle = adminTextStyle,
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = currency,
                            onValueChange = { currency = it },
                            label = { Text("Currency Symbol", fontWeight = FontWeight.SemiBold) },
                            singleLine = true,
                            colors = getAdminFieldColors(),
                            textStyle = adminTextStyle,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Button(
                        onClick = {
                            viewModel.saveStoreSettings(
                                settings.copy(
                                    storeName = storeName,
                                    storePhone = storePhone,
                                    whatsappNumber = whatsappNumber,
                                    storeEmail = storeEmail,
                                    storeAddress = storeAddress,
                                    deliveryFee = deliveryFee.toDoubleOrNull() ?: 350.0,
                                    currency = currency
                                )
                            )
                            Toast.makeText(context, "Settings saved successfully!", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF0F3E88),
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth().height(48.dp)
                    ) {
                        Text(
                            text = "Save Store Settings",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }
                }
            }
        }
    }
}
