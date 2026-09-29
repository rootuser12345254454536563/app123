package com.example.data.repository

import com.example.data.database.AppDatabase
import com.example.data.model.*
import kotlinx.coroutines.flow.Flow

class StoreRepository(private val database: AppDatabase) {
    private val productDao = database.productDao()
    private val categoryDao = database.categoryDao()
    private val bannerDao = database.bannerDao()
    private val orderDao = database.orderDao()
    private val cartDao = database.cartDao()
    private val wishlistDao = database.wishlistDao()
    private val addressDao = database.addressDao()
    private val reviewDao = database.reviewDao()
    private val storeSettingsDao = database.storeSettingsDao()
    private val userDao = database.userDao()

    // Products
    val allProducts: Flow<List<ProductEntity>> = productDao.getAllProducts()
    val visibleProducts: Flow<List<ProductEntity>> = productDao.getVisibleProducts()
    fun getProductById(id: Long): Flow<ProductEntity?> = productDao.getProductById(id)
    suspend fun getProductByIdDirect(id: Long): ProductEntity? = productDao.getProductByIdDirect(id)
    fun searchProducts(query: String): Flow<List<ProductEntity>> = productDao.searchProducts(query)
    suspend fun insertProduct(product: ProductEntity): Long = productDao.insertProduct(product)
    suspend fun updateProduct(product: ProductEntity) = productDao.updateProduct(product)
    suspend fun deleteProduct(product: ProductEntity) = productDao.deleteProduct(product)
    suspend fun updateStock(id: Long, stock: Int) = productDao.updateStock(id, stock)
    suspend fun setProductVisibility(id: Long, isVisible: Boolean) = productDao.setVisibility(id, isVisible)

    // Categories
    val allCategories: Flow<List<CategoryEntity>> = categoryDao.getAllCategories()
    suspend fun insertCategory(category: CategoryEntity) = categoryDao.insertCategory(category)
    suspend fun updateCategory(category: CategoryEntity) = categoryDao.updateCategory(category)
    suspend fun deleteCategory(category: CategoryEntity) = categoryDao.deleteCategory(category)

    // Banners
    val activeBanners: Flow<List<BannerEntity>> = bannerDao.getActiveBanners()
    val allBanners: Flow<List<BannerEntity>> = bannerDao.getAllBanners()
    suspend fun insertBanner(banner: BannerEntity) = bannerDao.insertBanner(banner)
    suspend fun updateBanner(banner: BannerEntity) = bannerDao.updateBanner(banner)
    suspend fun deleteBanner(banner: BannerEntity) = bannerDao.deleteBanner(banner)

    // Orders
    val allOrders: Flow<List<OrderEntity>> = orderDao.getAllOrders()
    fun getOrderByOrderId(orderId: String): Flow<OrderEntity?> = orderDao.getOrderByOrderId(orderId)
    suspend fun insertOrder(order: OrderEntity): Long = orderDao.insertOrder(order)
    suspend fun updateOrderStatus(orderId: String, status: String) = orderDao.updateOrderStatus(orderId, status)

    // Cart
    val cartItems: Flow<List<CartItemEntity>> = cartDao.getAllCartItems()
    suspend fun addToCart(productId: Long, quantity: Int = 1, variant: String = "") {
        val existing = cartDao.getCartItemByProductId(productId)
        if (existing != null) {
            cartDao.updateCartItem(existing.copy(quantity = existing.quantity + quantity, selectedVariant = if (variant.isNotEmpty()) variant else existing.selectedVariant))
        } else {
            cartDao.insertCartItem(CartItemEntity(productId = productId, quantity = quantity, selectedVariant = variant))
        }
    }
    suspend fun updateCartQuantity(cartItemId: Long, newQuantity: Int) {
        if (newQuantity <= 0) {
            cartDao.deleteCartItemById(cartItemId)
        } else {
            val item = cartDao.getAllCartItems()
            // We can update directly by query or fetch
        }
    }
    suspend fun updateCartItem(cartItem: CartItemEntity) {
        if (cartItem.quantity <= 0) {
            cartDao.deleteCartItem(cartItem)
        } else {
            cartDao.updateCartItem(cartItem)
        }
    }
    suspend fun removeCartItem(cartItem: CartItemEntity) = cartDao.deleteCartItem(cartItem)
    suspend fun clearCart() = cartDao.clearCart()

    // Wishlist
    val wishlistItems: Flow<List<WishlistItemEntity>> = wishlistDao.getAllWishlistItems()
    fun isInWishlist(productId: Long): Flow<Boolean> = wishlistDao.isInWishlist(productId)
    suspend fun toggleWishlist(productId: Long, isCurrentlyInWishlist: Boolean) {
        if (isCurrentlyInWishlist) {
            wishlistDao.deleteWishlistByProductId(productId)
        } else {
            wishlistDao.insertWishlist(WishlistItemEntity(productId = productId))
        }
    }
    suspend fun clearWishlist() = wishlistDao.clearWishlist()

    // Addresses
    val addresses: Flow<List<AddressEntity>> = addressDao.getAllAddresses()
    suspend fun insertAddress(address: AddressEntity) {
        if (address.isDefault) {
            addressDao.clearDefaultAddresses()
        }
        val id = addressDao.insertAddress(address)
        if (address.isDefault) {
            addressDao.setDefaultAddress(id)
        }
    }
    suspend fun setDefaultAddress(id: Long) {
        addressDao.clearDefaultAddresses()
        addressDao.setDefaultAddress(id)
    }
    suspend fun deleteAddress(address: AddressEntity) = addressDao.deleteAddress(address)

    // Reviews
    fun getReviewsForProduct(productId: Long): Flow<List<ReviewEntity>> = reviewDao.getReviewsForProduct(productId)
    suspend fun insertReview(review: ReviewEntity) = reviewDao.insertReview(review)

    // Settings
    val settingsFlow: Flow<StoreSettingsEntity?> = storeSettingsDao.getSettings()
    suspend fun getSettingsDirect(): StoreSettingsEntity? = storeSettingsDao.getSettingsDirect()
    suspend fun saveSettings(settings: StoreSettingsEntity) = storeSettingsDao.saveSettings(settings)

    // User Profile
    val userProfile: Flow<UserProfileEntity?> = userDao.getUserProfile()
    suspend fun saveUserProfile(profile: UserProfileEntity) = userDao.saveUserProfile(profile)
}
