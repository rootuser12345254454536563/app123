package com.example.ui.viewmodel

import android.app.Application
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.database.AppDatabase
import com.example.data.model.*
import com.example.data.repository.StoreRepository
import com.example.localization.AppLanguage
import com.example.localization.LocalizationRepository
import com.example.localization.TranslationStrings
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.net.URLEncoder
import java.text.SimpleDateFormat
import java.util.*

enum class SortOption {
    DEFAULT,
    PRICE_LOW_TO_HIGH,
    PRICE_HIGH_TO_LOW,
    NEWEST
}

sealed class Screen {
    object Home : Screen()
    object Categories : Screen()
    object Search : Screen()
    object Cart : Screen()
    object Account : Screen()
    data class ProductDetail(val productId: Long) : Screen()
    object Checkout : Screen()
    data class OrderSuccess(val orderId: String) : Screen()
    object MyOrders : Screen()
    data class OrderDetail(val orderId: String) : Screen()
    object Wishlist : Screen()
    object SavedAddresses : Screen()
    object Auth : Screen()
    object AdminLogin : Screen()
    object AdminDashboard : Screen()
    data class AdminEditProduct(val productId: Long?) : Screen() // null for new
    object AdminOrders : Screen()
    object AdminBanners : Screen()
    object AdminCategories : Screen()
    object AdminSettings : Screen()
    object AdminAnalytics : Screen()
    object IntegrationGuide : Screen()
}

class StoreViewModel(application: Application) : AndroidViewModel(application) {
    private val database = AppDatabase.getDatabase(application)
    private val repository = StoreRepository(database)

    // Language state
    private val _currentLanguage = MutableStateFlow(AppLanguage.ENGLISH)
    val currentLanguage: StateFlow<AppLanguage> = _currentLanguage.asStateFlow()

    val strings: StateFlow<TranslationStrings> = _currentLanguage.map {
        LocalizationRepository.getStrings(it)
    }.stateIn(viewModelScope, SharingStarted.Eagerly, LocalizationRepository.getStrings(AppLanguage.ENGLISH))

    // Navigation state
    private val _currentScreen = MutableStateFlow<Screen>(Screen.Home)
    val currentScreen: StateFlow<Screen> = _currentScreen.asStateFlow()

    private val screenBackstack = mutableListOf<Screen>()

    fun navigateTo(screen: Screen) {
        if (_currentScreen.value != screen) {
            screenBackstack.add(_currentScreen.value)
            _currentScreen.value = screen
        }
    }

    fun navigateBack(): Boolean {
        if (screenBackstack.isNotEmpty()) {
            _currentScreen.value = screenBackstack.removeAt(screenBackstack.size - 1)
            return true
        }
        return false
    }

    // Admin Auth State
    private val _isAdminLoggedIn = MutableStateFlow(false)
    val isAdminLoggedIn: StateFlow<Boolean> = _isAdminLoggedIn.asStateFlow()

    // Store Settings
    val storeSettings: StateFlow<StoreSettingsEntity> = repository.settingsFlow
        .map { it ?: StoreSettingsEntity() }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), StoreSettingsEntity())

    // User Profile
    val userProfile: StateFlow<UserProfileEntity> = repository.userProfile
        .map { it ?: UserProfileEntity() }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), UserProfileEntity())

    // Categories & Banners
    val categories: StateFlow<List<CategoryEntity>> = repository.allCategories
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val activeBanners: StateFlow<List<BannerEntity>> = repository.activeBanners
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allBanners: StateFlow<List<BannerEntity>> = repository.allBanners
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Products
    val visibleProducts: StateFlow<List<ProductEntity>> = repository.visibleProducts
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allProducts: StateFlow<List<ProductEntity>> = repository.allProducts
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Search and Filters
    val searchQuery = MutableStateFlow("")
    val selectedCategory = MutableStateFlow<String?>(null)
    val sortOption = MutableStateFlow(SortOption.DEFAULT)
    val inStockOnly = MutableStateFlow(false)

    val filteredProducts: StateFlow<List<ProductEntity>> = combine(
        visibleProducts,
        searchQuery,
        selectedCategory,
        sortOption,
        inStockOnly
    ) { products, query, cat, sort, stockOnly ->
        var list = products

        if (cat != null && cat.isNotBlank() && cat != "All") {
            list = list.filter { it.category.equals(cat, ignoreCase = true) }
        }

        if (query.isNotBlank()) {
            val q = query.trim().lowercase()
            list = list.filter {
                it.name.lowercase().contains(q) ||
                it.brand.lowercase().contains(q) ||
                it.category.lowercase().contains(q) ||
                it.sku.lowercase().contains(q) ||
                it.description.lowercase().contains(q)
            }
        }

        if (stockOnly) {
            list = list.filter { it.stockQuantity > 0 }
        }

        when (sort) {
            SortOption.DEFAULT -> list
            SortOption.PRICE_LOW_TO_HIGH -> list.sortedBy { if (it.discountPrice > 0) it.discountPrice else it.price }
            SortOption.PRICE_HIGH_TO_LOW -> list.sortedByDescending { if (it.discountPrice > 0) it.discountPrice else it.price }
            SortOption.NEWEST -> list.sortedByDescending { it.createdAt }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Cart Items with Products joined
    val cartItemsWithProducts: StateFlow<List<CartItemWithProduct>> = combine(
        repository.cartItems,
        allProducts
    ) { cartItems, products ->
        val productMap = products.associateBy { it.id }
        cartItems.mapNotNull { item ->
            productMap[item.productId]?.let { product ->
                CartItemWithProduct(cartItem = item, product = product)
            }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val cartSubtotal: StateFlow<Double> = cartItemsWithProducts.map { items ->
        items.sumOf {
            val effectivePrice = if (it.product.discountPrice > 0) it.product.discountPrice else it.product.price
            effectivePrice * it.cartItem.quantity
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val cartTotal: StateFlow<Double> = combine(
        cartSubtotal,
        storeSettings
    ) { subtotal, settings ->
        if (subtotal > 0) subtotal + settings.deliveryFee else 0.0
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    // Wishlist
    val wishlistIds: StateFlow<Set<Long>> = repository.wishlistItems.map { items ->
        items.map { it.productId }.toSet()
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptySet())

    val wishlistProducts: StateFlow<List<ProductEntity>> = combine(
        wishlistIds,
        visibleProducts
    ) { ids, products ->
        products.filter { ids.contains(it.id) }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Orders
    val orders: StateFlow<List<OrderEntity>> = repository.allOrders
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Saved Addresses
    val addresses: StateFlow<List<AddressEntity>> = repository.addresses
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        // Observe language preference from store settings if available
        viewModelScope.launch {
            repository.settingsFlow.collect { settings ->
                if (settings != null) {
                    when (settings.language) {
                        "ta" -> _currentLanguage.value = AppLanguage.TAMIL
                        "si" -> _currentLanguage.value = AppLanguage.SINHALA
                        else -> _currentLanguage.value = AppLanguage.ENGLISH
                    }
                }
            }
        }
    }

    // Language management
    fun setLanguage(language: AppLanguage) {
        _currentLanguage.value = language
        viewModelScope.launch {
            val current = repository.getSettingsDirect() ?: StoreSettingsEntity()
            repository.saveSettings(current.copy(language = language.code))
        }
    }

    // Cart actions
    fun addToCart(product: ProductEntity, quantity: Int = 1, variant: String = "") {
        viewModelScope.launch {
            repository.addToCart(product.id, quantity, variant)
        }
    }

    fun updateCartQuantity(cartItemId: Long, newQuantity: Int) {
        viewModelScope.launch {
            if (newQuantity <= 0) {
                database.cartDao().deleteCartItemById(cartItemId)
            } else {
                val current = cartItemsWithProducts.value.firstOrNull { it.cartItem.id == cartItemId }
                if (current != null) {
                    repository.updateCartItem(current.cartItem.copy(quantity = newQuantity))
                }
            }
        }
    }

    fun removeCartItem(cartItem: CartItemEntity) {
        viewModelScope.launch {
            repository.removeCartItem(cartItem)
        }
    }

    fun clearCart() {
        viewModelScope.launch {
            repository.clearCart()
        }
    }

    // Wishlist actions
    fun toggleWishlist(productId: Long) {
        viewModelScope.launch {
            val isWishlisted = wishlistIds.value.contains(productId)
            repository.toggleWishlist(productId, isWishlisted)
        }
    }

    // Product detail lookup
    fun getProductFlow(id: Long): Flow<ProductEntity?> = repository.getProductById(id)

    // Order Checkout
    fun placeOrder(
        customerName: String,
        customerPhone: String,
        deliveryAddress: String,
        paymentMethod: String,
        context: Context,
        onSuccess: (OrderEntity) -> Unit
    ) {
        viewModelScope.launch(Dispatchers.IO) {
            val currentCart = cartItemsWithProducts.value
            if (currentCart.isEmpty()) return@launch

            val settings = repository.getSettingsDirect() ?: StoreSettingsEntity()
            val subtotal = currentCart.sumOf {
                val effectivePrice = if (it.product.discountPrice > 0) it.product.discountPrice else it.product.price
                effectivePrice * it.cartItem.quantity
            }
            val deliveryFee = settings.deliveryFee
            val total = subtotal + deliveryFee

            val randomSuffix = (100000..999999).random()
            val orderId = "PS-$randomSuffix"

            val itemsSummary = currentCart.joinToString("\n") {
                val effectivePrice = if (it.product.discountPrice > 0) it.product.discountPrice else it.product.price
                "- ${it.product.name}${if (it.cartItem.selectedVariant.isNotEmpty()) " (${it.cartItem.selectedVariant})" else ""} x ${it.cartItem.quantity} (${settings.currency} ${(effectivePrice * it.cartItem.quantity).toInt()})"
            }

            val order = OrderEntity(
                orderId = orderId,
                customerName = customerName,
                customerPhone = customerPhone,
                deliveryAddress = deliveryAddress,
                itemsSummary = itemsSummary,
                subtotal = subtotal,
                deliveryFee = deliveryFee,
                totalAmount = total,
                paymentMethod = paymentMethod,
                status = "Pending",
                createdAt = System.currentTimeMillis()
            )

            repository.insertOrder(order)

            // Reduce stock for products
            currentCart.forEach { item ->
                val newStock = (item.product.stockQuantity - item.cartItem.quantity).coerceAtLeast(0)
                repository.updateStock(item.product.id, newStock)
            }

            // Clear the cart
            repository.clearCart()

            launch(Dispatchers.Main) {
                onSuccess(order)
            }
        }
    }

    // WhatsApp Message Helper per user requirement
    fun openWhatsAppOrder(context: Context, order: OrderEntity) {
        val settings = storeSettings.value
        val rawPhone = settings.whatsappNumber.replace("+", "").replace(" ", "").replace("-", "")

        val message = """
Pukalavan Store
New Order Received

Order ID: ${order.orderId}
Customer Name: ${order.customerName}
Phone: ${order.customerPhone}
Delivery Address: ${order.deliveryAddress}

Products:
${order.itemsSummary}

Subtotal: ${settings.currency} ${order.subtotal.toInt()}
Delivery Fee: ${settings.currency} ${order.deliveryFee.toInt()}
Total: ${settings.currency} ${order.totalAmount.toInt()}
Payment Method: ${order.paymentMethod}
        """.trimIndent()

        try {
            val encodedMessage = URLEncoder.encode(message, "UTF-8")
            val uri = Uri.parse("https://api.whatsapp.com/send?phone=$rawPhone&text=$encodedMessage")
            val intent = Intent(Intent.ACTION_VIEW, uri)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "Could not launch WhatsApp: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    // Admin Auth
    fun loginAdmin(user: String, pass: String): Boolean {
        val cleanUser = user.trim().lowercase()
        val cleanPass = pass.trim()
        val validUser = cleanUser == "admin@pukalavanstore.com" || cleanUser == "admin"
        val validPass = cleanPass == "admin 123" || cleanPass == "admin123"
        if (validUser && validPass) {
            _isAdminLoggedIn.value = true
            return true
        }
        return false
    }

    fun loginAdmin(pass: String): Boolean {
        return loginAdmin("admin@pukalavanstore.com", pass)
    }

    fun logoutAdmin() {
        _isAdminLoggedIn.value = false
        _currentScreen.value = Screen.Home
    }

    // Admin Product Management
    fun saveProduct(product: ProductEntity) {
        viewModelScope.launch {
            if (product.id == 0L) {
                repository.insertProduct(product)
            } else {
                repository.updateProduct(product)
            }
        }
    }

    fun deleteProduct(product: ProductEntity) {
        viewModelScope.launch {
            repository.deleteProduct(product)
        }
    }

    fun toggleProductVisibility(id: Long, isVisible: Boolean) {
        viewModelScope.launch {
            repository.setProductVisibility(id, isVisible)
        }
    }

    fun updateProductStock(id: Long, stock: Int) {
        viewModelScope.launch {
            repository.updateStock(id, stock)
        }
    }

    // Admin Category Management
    fun saveCategory(category: CategoryEntity) {
        viewModelScope.launch {
            if (category.id == 0L) {
                repository.insertCategory(category)
            } else {
                repository.updateCategory(category)
            }
        }
    }

    fun deleteCategory(category: CategoryEntity) {
        viewModelScope.launch {
            repository.deleteCategory(category)
        }
    }

    // Admin Banner Management
    fun saveBanner(banner: BannerEntity) {
        viewModelScope.launch {
            if (banner.id == 0L) {
                repository.insertBanner(banner)
            } else {
                repository.updateBanner(banner)
            }
        }
    }

    fun deleteBanner(banner: BannerEntity) {
        viewModelScope.launch {
            repository.deleteBanner(banner)
        }
    }

    // Admin Order Management
    fun updateOrderStatus(orderId: String, newStatus: String) {
        viewModelScope.launch {
            repository.updateOrderStatus(orderId, newStatus)
        }
    }

    // Admin Settings Management
    fun saveStoreSettings(settings: StoreSettingsEntity) {
        viewModelScope.launch {
            repository.saveSettings(settings)
        }
    }

    // Address Management
    fun saveAddress(address: AddressEntity) {
        viewModelScope.launch {
            repository.insertAddress(address)
        }
    }

    fun setDefaultAddress(id: Long) {
        viewModelScope.launch {
            repository.setDefaultAddress(id)
        }
    }

    fun deleteAddress(address: AddressEntity) {
        viewModelScope.launch {
            repository.deleteAddress(address)
        }
    }

    // User Profile
    fun saveUserProfile(name: String, email: String, phone: String, avatarUri: String) {
        viewModelScope.launch {
            repository.saveUserProfile(
                UserProfileEntity(
                    id = 1,
                    name = name,
                    email = email,
                    phone = phone,
                    avatarUri = avatarUri,
                    isLoggedIn = true
                )
            )
        }
    }

    // Product Review
    fun addProductReview(productId: Long, rating: Int, comment: String, customerName: String) {
        viewModelScope.launch {
            val dateStr = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(Date())
            repository.insertReview(
                ReviewEntity(
                    productId = productId,
                    customerName = customerName.ifBlank { "Verified Buyer" },
                    rating = rating,
                    reviewText = comment,
                    date = dateStr
                )
            )
        }
    }

    fun getReviews(productId: Long): Flow<List<ReviewEntity>> = repository.getReviewsForProduct(productId)
}
