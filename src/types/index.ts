export type AppLanguage = 'en' | 'ta' | 'si';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  stockQuantity: number;
  category: string;
  brand: string;
  sku: string;
  specifications: string;
  variants: string; // e.g. "250g, 500g, 1kg" or "S, M, L"
  weight: string;
  images: string; // comma-separated URLs or image paths
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isVisible: boolean;
  rating: number;
  reviewCount: number;
  createdAt: number;
}

export interface Category {
  id: number;
  name: string;
  iconName: string;
  imageUri?: string;
  isEnabled: boolean;
  displayOrder: number;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  imageUri: string;
  destinationType: 'category' | 'product' | 'all';
  destinationValue: string;
  isEnabled: boolean;
  displayOrder: number;
}

export interface Order {
  id: number;
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  itemsSummary: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: number;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  selectedVariant: string;
  addedAt: number;
}

export interface CartItemWithProduct {
  cartItem: CartItem;
  product: Product;
}

export interface Address {
  id: number;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Review {
  id: number;
  productId: number;
  customerName: string;
  rating: number;
  reviewText: string;
  date: string;
  imageUri?: string;
}

export interface StoreSettings {
  id: number;
  storeName: string;
  appName: string;
  storePhone: string;
  whatsappNumber: string;
  storeEmail: string;
  storeAddress: string;
  deliveryFee: number;
  minOrderAmount: number;
  currency: string;
  language: AppLanguage;
  facebookUrl?: string;
  twitterUrl?: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatarUri: string;
  isLoggedIn: boolean;
}

export type SortOption = 'DEFAULT' | 'PRICE_LOW_TO_HIGH' | 'PRICE_HIGH_TO_LOW' | 'NEWEST';

export type ScreenType =
  | 'home'
  | 'categories'
  | 'search'
  | 'cart'
  | 'account'
  | 'product-detail'
  | 'checkout'
  | 'order-success'
  | 'my-orders'
  | 'order-detail'
  | 'wishlist'
  | 'saved-addresses'
  | 'login'
  | 'register-user'
  | 'register-seller'
  | 'user-dashboard'
  | 'seller-dashboard'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-edit-product'
  | 'integration-guide';

export interface ScreenState {
  type: ScreenType;
  productId?: number;
  orderId?: string;
}

export interface TranslationStrings {
  appName: string;
  storeSlogan: string;
  searchPlaceholder: string;
  home: string;
  categories: string;
  search: string;
  cart: string;
  account: string;
  flashDeals: string;
  featuredProducts: string;
  newArrivals: string;
  bestSellers: string;
  recommended: string;
  viewAll: string;
  addToCart: string;
  buyNow: string;
  addedToCart: string;
  outOfStock: string;
  inStock: string;
  offPercent: string;
  originalPrice: string;
  specifications: string;
  description: string;
  variants: string;
  selectSize: string;
  selectColor: string;
  quantity: string;
  subtotal: string;
  deliveryFee: string;
  discount: string;
  total: string;
  checkout: string;
  placeOrder: string;
  orderSuccess: string;
  orderId: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  paymentMethod: string;
  cashOnDelivery: string;
  onlinePayment: string;
  sendWhatsAppOrder: string;
  trackOrder: string;
  myOrders: string;
  wishlist: string;
  myWishlist: string;
  emptyCart: string;
  emptyWishlist: string;
  emptyOrders: string;
  orderStatus: string;
  statusPending: string;
  statusConfirmed: string;
  statusProcessing: string;
  statusShipped: string;
  statusDelivered: string;
  statusCancelled: string;
  login: string;
  register: string;
  logout: string;
  email: string;
  password: string;
  confirmPassword: string;
  forgotPassword: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  orContinueWith: string;
  adminPortal: string;
  adminDashboard: string;
  manageProducts: string;
  addProduct: string;
  editProduct: string;
  deleteProduct: string;
  ordersManagement: string;
  analytics: string;
  storeSettings: string;
  bannersManagement: string;
  language: string;
  selectLanguage: string;
  reviewRating: string;
  writeReview: string;
  submitReview: string;
  saveChanges: string;
  filter: string;
  sortBy: string;
  priceLowToHigh: string;
  priceHighToLow: string;
  newestFirst: string;
  reviews: string;
  shareProduct: string;
  savedAddresses: string;
  addNewAddress: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  notifications: string;
}
