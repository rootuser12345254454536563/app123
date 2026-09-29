import { Product, Category, Banner, StoreSettings, Address, UserProfile, Review } from '../types';

export const initialCategories: Category[] = [
  { id: 1, name: "Electronics & Gadgets", iconName: "devices", isEnabled: true, displayOrder: 1 },
  { id: 2, name: "Ceylon Spices & Tea", iconName: "local_cafe", isEnabled: true, displayOrder: 2 },
  { id: 3, name: "Fashion & Apparel", iconName: "checkroom", isEnabled: true, displayOrder: 3 },
  { id: 4, name: "Home & Kitchen", iconName: "kitchen", isEnabled: true, displayOrder: 4 },
  { id: 5, name: "Health & Ayurvedic", iconName: "spa", isEnabled: true, displayOrder: 5 },
  { id: 6, name: "Fresh Groceries", iconName: "shopping_basket", isEnabled: true, displayOrder: 6 }
];

export const initialProducts: Product[] = [
  {
    id: 1,
    name: "Pure Ceylon BOPF Premium Black Tea (500g)",
    description: "Directly sourced from high-grown Nuwara Eliya estates. Single origin, full-bodied aromatic Ceylon black tea packaged fresh in an airtight tin canister.",
    price: 1450.0,
    discountPrice: 1250.0,
    stockQuantity: 45,
    category: "Ceylon Spices & Tea",
    brand: "BuyJump Premium",
    sku: "TEA-BOPF-500",
    specifications: "Origin: Nuwara Eliya\nGrade: BOPF\nShelf Life: 24 Months\nPackaging: Foil sealed tin",
    variants: "250g, 500g, 1kg",
    weight: "500g",
    images: "/images/buyjump_logo.jpg",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isVisible: true,
    rating: 4.9,
    reviewCount: 38,
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 2,
    name: "Smart Bluetooth Wireless ANC Earbuds Pro",
    description: "Active Noise Cancellation up to 35dB, 36 hours total battery life with wireless charging case, ultra-low latency gaming mode, and IPX5 water resistance.",
    price: 6800.0,
    discountPrice: 4990.0,
    stockQuantity: 22,
    category: "Electronics & Gadgets",
    brand: "SoundPulse",
    sku: "ELEC-EP-01",
    specifications: "Bluetooth: 5.3\nBattery: 36h Playtime\nWater Resistance: IPX5\nMic: Dual Beamforming ENC",
    variants: "Midnight Black, Pearl White, Royal Navy",
    weight: "45g",
    images: "/images/promo_banner_sale.jpg",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isVisible: true,
    rating: 4.8,
    reviewCount: 54,
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 3,
    name: "Authentic Organic Ceylon True Cinnamon Quills (100g)",
    description: "Grade C5 Special pure Ceylon cinnamon (Cinnamomum verum) with delicate sweet aroma and low coumarin levels. Handcrafted in Sri Lankan spice gardens.",
    price: 1100.0,
    discountPrice: 950.0,
    stockQuantity: 60,
    category: "Ceylon Spices & Tea",
    brand: "BuyJump Spices",
    sku: "SPICE-CIN-100",
    specifications: "Type: Alba & C5 True Cinnamon\nOrigin: Matara, Sri Lanka\nCoumarin: < 0.004%",
    variants: "100g, 250g, 500g",
    weight: "100g",
    images: "/images/buyjump_logo.jpg",
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isVisible: true,
    rating: 5.0,
    reviewCount: 19,
    createdAt: Date.now() - 86400000 * 1
  },
  {
    id: 4,
    name: "Handloomed Pure Cotton Casual Kurta Shirt",
    description: "Breathable 100% natural cotton handloom kurta shirt with mandarin collar, wooden buttons, and tailored comfort fit. Ideal for tropical weather and festivals.",
    price: 3800.0,
    discountPrice: 3200.0,
    stockQuantity: 18,
    category: "Fashion & Apparel",
    brand: "LoomCraft",
    sku: "FASH-KT-03",
    specifications: "Material: 100% Handloom Cotton\nCollar: Mandarin\nFit: Regular Comfort\nWash: Gentle Machine Wash",
    variants: "S, M, L, XL, XXL",
    weight: "220g",
    images: "/images/promo_banner_main.jpg",
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: true,
    isVisible: true,
    rating: 4.7,
    reviewCount: 27,
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 5,
    name: "Stainless Steel Double-Wall Thermal Travel Flask (750ml)",
    description: "Keeps hot beverages piping hot for 18 hours or ice cold for 24 hours. Food-grade 18/8 stainless steel, leakproof lid with carrying strap.",
    price: 2950.0,
    discountPrice: 2490.0,
    stockQuantity: 30,
    category: "Home & Kitchen",
    brand: "ThermoPro",
    sku: "HOME-FL-750",
    specifications: "Capacity: 750ml\nMaterial: SUS 304 Stainless Steel\nInsulation: Vacuum Insulated Double Wall",
    variants: "Matte Black, Forest Green, Sunset Coral",
    weight: "380g",
    images: "/images/buyjump_logo.jpg",
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isVisible: true,
    rating: 4.6,
    reviewCount: 14,
    createdAt: Date.now() - 86400000 * 7
  },
  {
    id: 6,
    name: "Organic Virgin Coconut Oil & Herbal Hair Elixir (200ml)",
    description: "Traditional Ayurvedic formula enriched with cold-pressed virgin coconut oil, gotu kola, amla, and fenugreek seeds for deep nourishment and scalp health.",
    price: 1650.0,
    discountPrice: 1390.0,
    stockQuantity: 40,
    category: "Health & Ayurvedic",
    brand: "AyurVeda Naturals",
    sku: "AYUR-OIL-200",
    specifications: "Volume: 200ml\nType: Cold Pressed Herbal Infusion\nFree from Mineral Oils and Parabens",
    variants: "100ml, 200ml",
    weight: "200ml",
    images: "/images/promo_banner_sale.jpg",
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isVisible: true,
    rating: 4.9,
    reviewCount: 42,
    createdAt: Date.now() - 86400000 * 10
  }
];

export const initialBanners: Banner[] = [
  {
    id: 1,
    title: "BuyJump Mega Shopping Festival",
    subtitle: "Up to 50% OFF on Electronics, Spices & Fashion",
    buttonText: "Shop Deals",
    imageUri: "/images/promo_banner_main.jpg",
    destinationType: "all",
    destinationValue: "",
    isEnabled: true,
    displayOrder: 1
  },
  {
    id: 2,
    title: "Flash Mega Sale is Live!",
    subtitle: "Exclusive discounts on ANC Earbuds & Smart Gadgets",
    buttonText: "Grab Now",
    imageUri: "/images/promo_banner_sale.jpg",
    destinationType: "category",
    destinationValue: "Electronics & Gadgets",
    isEnabled: true,
    displayOrder: 2
  }
];

export const initialSettings: StoreSettings = {
  id: 1,
  storeName: "BuyJump",
  appName: "BuyJump",
  storePhone: "+94 77 123 4567",
  whatsappNumber: "+94771234567",
  storeEmail: "support@buyjump.com",
  storeAddress: "BuyJump Tower, Main Street, Jaffna, Sri Lanka",
  deliveryFee: 350.0,
  minOrderAmount: 500.0,
  currency: "Rs.",
  language: "en"
};

export const initialAddresses: Address[] = [
  {
    id: 1,
    fullName: "BuyJump Customer",
    phone: "+94 77 123 4567",
    streetAddress: "128 Main Street, Hospital Road Junction",
    city: "Jaffna",
    postalCode: "40000",
    isDefault: true
  }
];

export const initialUserProfile: UserProfile = {
  id: 1,
  name: "BuyJump User",
  email: "customer@buyjump.com",
  phone: "+94 77 123 4567",
  avatarUri: "",
  isLoggedIn: true
};

export const initialReviews: Review[] = [
  {
    id: 1,
    productId: 1,
    customerName: "Kandeepan R.",
    rating: 5,
    reviewText: "Outstanding tea quality! Authentic Ceylon aroma and rich color. Fresh packaging.",
    date: "Sep 20, 2026"
  },
  {
    id: 2,
    productId: 2,
    customerName: "Niroshan P.",
    rating: 5,
    reviewText: "The active noise cancellation works very well and battery lasts easily all day.",
    date: "Sep 25, 2026"
  }
];
