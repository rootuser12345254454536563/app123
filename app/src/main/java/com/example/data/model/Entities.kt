package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "products")
data class ProductEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val description: String,
    val price: Double,
    val discountPrice: Double = 0.0,
    val stockQuantity: Int = 10,
    val category: String,
    val brand: String = "",
    val sku: String = "",
    val specifications: String = "",
    val variants: String = "", // e.g. "S, M, L, XL"
    val weight: String = "",
    val images: String = "", // comma-separated URIs or drawable resources
    val isFeatured: Boolean = false,
    val isBestSeller: Boolean = false,
    val isNewArrival: Boolean = false,
    val isVisible: Boolean = true,
    val rating: Float = 4.8f,
    val reviewCount: Int = 12,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "categories")
data class CategoryEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val iconName: String = "category",
    val imageUri: String = "",
    val isEnabled: Boolean = true,
    val displayOrder: Int = 0
)

@Entity(tableName = "banners")
data class BannerEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val subtitle: String,
    val buttonText: String = "Shop Now",
    val imageUri: String,
    val destinationType: String = "all", // "category", "product", "all"
    val destinationValue: String = "",
    val isEnabled: Boolean = true,
    val displayOrder: Int = 0
)

@Entity(tableName = "orders")
data class OrderEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val orderId: String,
    val customerName: String,
    val customerPhone: String,
    val deliveryAddress: String,
    val itemsSummary: String, // Readable product breakdown
    val subtotal: Double,
    val deliveryFee: Double,
    val totalAmount: Double,
    val paymentMethod: String,
    val status: String = "Pending", // "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "cart_items")
data class CartItemEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val productId: Long,
    val quantity: Int = 1,
    val selectedVariant: String = "",
    val addedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "wishlist_items")
data class WishlistItemEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val productId: Long,
    val addedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "addresses")
data class AddressEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val fullName: String,
    val phone: String,
    val streetAddress: String,
    val city: String,
    val postalCode: String,
    val isDefault: Boolean = false
)

@Entity(tableName = "reviews")
data class ReviewEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val productId: Long,
    val customerName: String,
    val rating: Int,
    val reviewText: String,
    val date: String,
    val imageUri: String = ""
)

@Entity(tableName = "store_settings")
data class StoreSettingsEntity(
    @PrimaryKey val id: Int = 1,
    val storeName: String = "Pukalavan Store",
    val appName: String = "Pukalavan Store",
    val storePhone: String = "+94 77 123 4567",
    val whatsappNumber: String = "+94771234567",
    val storeEmail: String = "info@pukalavanstore.lk",
    val storeAddress: String = "128 Main Street, Jaffna, Sri Lanka",
    val deliveryFee: Double = 350.0,
    val minOrderAmount: Double = 500.0,
    val currency: String = "Rs.",
    val language: String = "en",
    val facebookUrl: String = "https://facebook.com",
    val twitterUrl: String = "https://x.com"
)

@Entity(tableName = "user_profile")
data class UserProfileEntity(
    @PrimaryKey val id: Int = 1,
    val name: String = "Guest Shopper",
    val email: String = "guest@pukalavanstore.lk",
    val phone: String = "+94 77 000 0000",
    val avatarUri: String = "",
    val isLoggedIn: Boolean = false
)

// In-memory UI view models
data class CartItemWithProduct(
    val cartItem: CartItemEntity,
    val product: ProductEntity
)
