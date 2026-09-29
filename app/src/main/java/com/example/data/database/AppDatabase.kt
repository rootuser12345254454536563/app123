package com.example.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.data.dao.*
import com.example.data.model.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        ProductEntity::class,
        CategoryEntity::class,
        BannerEntity::class,
        OrderEntity::class,
        CartItemEntity::class,
        WishlistItemEntity::class,
        AddressEntity::class,
        ReviewEntity::class,
        StoreSettingsEntity::class,
        UserProfileEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
    abstract fun categoryDao(): CategoryDao
    abstract fun bannerDao(): BannerDao
    abstract fun orderDao(): OrderDao
    abstract fun cartDao(): CartDao
    abstract fun wishlistDao(): WishlistDao
    abstract fun addressDao(): AddressDao
    abstract fun reviewDao(): ReviewDao
    abstract fun storeSettingsDao(): StoreSettingsDao
    abstract fun userDao(): UserDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "pukalavan_store.db"
                )
                .addCallback(object : Callback() {
                    override fun onCreate(db: SupportSQLiteDatabase) {
                        super.onCreate(db)
                        CoroutineScope(Dispatchers.IO).launch {
                            INSTANCE?.let { seedInitialData(it) }
                        }
                    }
                })
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }

        suspend fun seedInitialData(database: AppDatabase) {
            val categoryDao = database.categoryDao()
            val productDao = database.productDao()
            val bannerDao = database.bannerDao()
            val settingsDao = database.storeSettingsDao()
            val addressDao = database.addressDao()
            val userDao = database.userDao()

            // 1. Seed Categories
            if (categoryDao.getCategoryCount() == 0) {
                val categories = listOf(
                    CategoryEntity(name = "Electronics & Gadgets", iconName = "devices", displayOrder = 1),
                    CategoryEntity(name = "Ceylon Spices & Tea", iconName = "local_cafe", displayOrder = 2),
                    CategoryEntity(name = "Fashion & Apparel", iconName = "checkroom", displayOrder = 3),
                    CategoryEntity(name = "Home & Kitchen", iconName = "kitchen", displayOrder = 4),
                    CategoryEntity(name = "Health & Ayurvedic", iconName = "spa", displayOrder = 5),
                    CategoryEntity(name = "Fresh Groceries", iconName = "shopping_basket", displayOrder = 6)
                )
                categoryDao.insertCategories(categories)
            }

            // 2. Seed Initial Real Products
            if (productDao.getProductCount() == 0) {
                val products = listOf(
                    ProductEntity(
                        name = "Pure Ceylon BOPF Premium Black Tea (500g)",
                        description = "Directly sourced from high-grown Nuwara Eliya estates. Single origin, full-bodied aromatic Ceylon black tea packaged fresh in an airtight tin canister.",
                        price = 1450.0,
                        discountPrice = 1250.0,
                        stockQuantity = 45,
                        category = "Ceylon Spices & Tea",
                        brand = "Pukalavan Ceylon",
                        sku = "TEA-BOPF-500",
                        specifications = "Origin: Nuwara Eliya\nGrade: BOPF\nShelf Life: 24 Months\nPackaging: Foil sealed tin",
                        variants = "250g, 500g, 1kg",
                        weight = "500g",
                        images = "res:ic_store_logo",
                        isFeatured = true,
                        isBestSeller = true,
                        isNewArrival = false,
                        rating = 4.9f,
                        reviewCount = 38
                    ),
                    ProductEntity(
                        name = "Smart Bluetooth Wireless ANC Earbuds Pro",
                        description = "Active Noise Cancellation up to 35dB, 36 hours total battery life with wireless charging case, ultra-low latency gaming mode, and IPX5 water resistance.",
                        price = 6800.0,
                        discountPrice = 4990.0,
                        stockQuantity = 22,
                        category = "Electronics & Gadgets",
                        brand = "SoundPulse",
                        sku = "ELEC-EP-01",
                        specifications = "Bluetooth: 5.3\nBattery: 36h Playtime\nWater Resistance: IPX5\nMic: Dual Beamforming ENC",
                        variants = "Midnight Black, Pearl White, Royal Navy",
                        weight = "45g",
                        images = "res:promo_banner_sale",
                        isFeatured = true,
                        isBestSeller = true,
                        isNewArrival = true,
                        rating = 4.8f,
                        reviewCount = 54
                    ),
                    ProductEntity(
                        name = "Authentic Organic Ceylon True Cinnamon Quills (100g)",
                        description = "Grade C5 Special pure Ceylon cinnamon (Cinnamomum verum) with delicate sweet aroma and low coumarin levels. Handcrafted in Sri Lankan spice gardens.",
                        price = 1100.0,
                        discountPrice = 950.0,
                        stockQuantity = 60,
                        category = "Ceylon Spices & Tea",
                        brand = "Pukalavan Spices",
                        sku = "SPICE-CIN-100",
                        specifications = "Type: Alba & C5 True Cinnamon\nOrigin: Matara, Sri Lanka\nCoumarin: < 0.004%",
                        variants = "100g, 250g, 500g",
                        weight = "100g",
                        images = "res:ic_store_logo",
                        isFeatured = true,
                        isBestSeller = false,
                        isNewArrival = true,
                        rating = 5.0f,
                        reviewCount = 19
                    ),
                    ProductEntity(
                        name = "Handloomed Pure Cotton Casual Kurta Shirt",
                        description = "Breathable 100% natural cotton handloom kurta shirt with mandarin collar, wooden buttons, and tailored comfort fit. Ideal for tropical weather and festivals.",
                        price = 3800.0,
                        discountPrice = 3200.0,
                        stockQuantity = 18,
                        category = "Fashion & Apparel",
                        brand = "LoomCraft",
                        sku = "FASH-KT-03",
                        specifications = "Material: 100% Handloom Cotton\nCollar: Mandarin\nFit: Regular Comfort\nWash: Gentle Machine Wash",
                        variants = "S, M, L, XL, XXL",
                        weight = "220g",
                        images = "res:promo_banner_main",
                        isFeatured = false,
                        isBestSeller = true,
                        isNewArrival = true,
                        rating = 4.7f,
                        reviewCount = 27
                    ),
                    ProductEntity(
                        name = "Stainless Steel Double-Wall Thermal Travel Flask (750ml)",
                        description = "Keeps hot beverages piping hot for 18 hours or ice cold for 24 hours. Food-grade 18/8 stainless steel, leakproof lid with carrying strap.",
                        price = 2950.0,
                        discountPrice = 2490.0,
                        stockQuantity = 30,
                        category = "Home & Kitchen",
                        brand = "ThermoPro",
                        sku = "HOME-FL-750",
                        specifications = "Capacity: 750ml\nMaterial: SUS 304 Stainless Steel\nInsulation: Vacuum Insulated Double Wall",
                        variants = "Matte Black, Forest Green, Sunset Coral",
                        weight = "380g",
                        images = "res:ic_store_logo",
                        isFeatured = false,
                        isBestSeller = false,
                        isNewArrival = true,
                        rating = 4.6f,
                        reviewCount = 14
                    ),
                    ProductEntity(
                        name = "Organic Virgin Coconut Oil & Herbal Hair Elixir (200ml)",
                        description = "Traditional Ayurvedic formula enriched with cold-pressed virgin coconut oil, gotu kola, amla, and fenugreek seeds for deep nourishment and scalp health.",
                        price = 1650.0,
                        discountPrice = 1390.0,
                        stockQuantity = 40,
                        category = "Health & Ayurvedic",
                        brand = "AyurVeda Naturals",
                        sku = "AYUR-OIL-200",
                        specifications = "Volume: 200ml\nType: Cold Pressed Herbal Infusion\nFree from Mineral Oils and Parabens",
                        variants = "100ml, 200ml",
                        weight = "200ml",
                        images = "res:promo_banner_sale",
                        isFeatured = true,
                        isBestSeller = true,
                        isNewArrival = false,
                        rating = 4.9f,
                        reviewCount = 42
                    )
                )
                productDao.insertProducts(products)
            }

            // 3. Seed Promotional Banners
            if (bannerDao.getBannerCount() == 0) {
                val banners = listOf(
                    BannerEntity(
                        title = "Pukalavan Grand Shopping Festival",
                        subtitle = "Up to 50% OFF on Electronics, Spices & Fashion",
                        buttonText = "Shop Deals",
                        imageUri = "res:promo_banner_main",
                        destinationType = "all",
                        displayOrder = 1
                    ),
                    BannerEntity(
                        title = "Flash Mega Sale is Live!",
                        subtitle = "Exclusive discounts on ANC Earbuds & Smart Gadgets",
                        buttonText = "Grab Now",
                        imageUri = "res:promo_banner_sale",
                        destinationType = "category",
                        destinationValue = "Electronics & Gadgets",
                        displayOrder = 2
                    )
                )
                bannerDao.insertBanners(banners)
            }

            // 4. Seed Settings
            if (settingsDao.getSettingsDirect() == null) {
                settingsDao.saveSettings(
                    StoreSettingsEntity(
                        storeName = "Pukalavan Store",
                        appName = "Pukalavan Store",
                        storePhone = "+94 77 123 4567",
                        whatsappNumber = "+94771234567",
                        storeEmail = "sales@pukalavanstore.lk",
                        storeAddress = "128 Main Street, Jaffna, Sri Lanka",
                        deliveryFee = 350.0,
                        minOrderAmount = 500.0,
                        currency = "Rs.",
                        language = "en"
                    )
                )
            }

            // 5. Seed Default Address for smooth first order experience
            val addresses = listOf(
                AddressEntity(
                    fullName = "S. Pukalavan",
                    phone = "+94 77 123 4567",
                    streetAddress = "128 Main Street, Hospital Road Junction",
                    city = "Jaffna",
                    postalCode = "40000",
                    isDefault = true
                )
            )
            addressDao.insertAddress(addresses[0])

            // 6. User profile
            userDao.saveUserProfile(
                UserProfileEntity(
                    name = "Pukalavan Customer",
                    email = "customer@pukalavanstore.lk",
                    phone = "+94 77 123 4567",
                    avatarUri = "",
                    isLoggedIn = true
                )
            )
        }
    }
}
