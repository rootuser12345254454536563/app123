import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Banner,
  Order,
  CartItem,
  CartItemWithProduct,
  Address,
  StoreSettings,
  UserProfile,
  Review,
  AppLanguage,
  ScreenState
} from '../types';
import {
  initialCategories,
  initialProducts,
  initialBanners,
  initialSettings,
  initialAddresses,
  initialUserProfile,
  initialReviews
} from '../data/initialData';
import { db, auth } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { createOrderInFirestore, createProductInFirestore } from '../services/marketplaceService';
import { translations } from '../localization/translations';

interface StoreContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (typeof translations)['en'];
  products: Product[];
  categories: Category[];
  banners: Banner[];
  orders: Order[];
  cart: CartItem[];
  wishlistIds: number[];
  addresses: Address[];
  settings: StoreSettings;
  user: UserProfile;
  reviews: Review[];
  screen: ScreenState;
  setScreen: (screen: ScreenState) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  
  // Actions
  addToCart: (productId: number, quantity?: number, variant?: string) => void;
  updateCartQuantity: (cartItemId: number, delta: number) => void;
  removeFromCart: (cartItemId: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  
  // Checkout & Order
  createOrder: (orderData: Omit<Order, 'id' | 'orderId' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  
  // Admin Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  
  // Admin Settings & Store
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  deleteAddress: (id: number) => void;
  setDefaultAddress: (id: number) => void;
  
  // Admin Auth
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, pass: string) => boolean;
  adminLogout: () => void;

  // Computed helpers
  cartWithProducts: CartItemWithProduct[];
  cartSubtotal: number;
  cartTotalCount: number;
  cartDeliveryFee: number;
  cartGrandTotal: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persisted state from localStorage if available
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    return (localStorage.getItem('pukalavan_lang') as AppLanguage) || 'en';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pukalavan_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('pukalavan_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [banners, setBanners] = useState<Banner[]>(() => {
    const saved = localStorage.getItem('pukalavan_banners');
    return saved ? JSON.parse(saved) : initialBanners;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pukalavan_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pukalavan_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlistIds, setWishlistIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('pukalavan_wishlist');
    return saved ? JSON.parse(saved) : [1, 2];
  });

  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem('pukalavan_addresses');
    return saved ? JSON.parse(saved) : initialAddresses;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('pukalavan_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('pukalavan_user');
    return saved ? JSON.parse(saved) : initialUserProfile;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('buyjump_reviews') || localStorage.getItem('pukalavan_reviews');
    return saved ? JSON.parse(saved) : initialReviews;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('buyjump_admin_authenticated') === 'true';
  });

  const [screen, setScreenState] = useState<ScreenState>({ type: 'home' });

  const setScreen = (newScreen: ScreenState) => {
    const isAuthed = isAdminAuthenticated || sessionStorage.getItem('buyjump_admin_authenticated') === 'true';
    if ((newScreen.type === 'admin-dashboard' || newScreen.type === 'admin-edit-product') && !isAuthed) {
      setScreenState({ type: 'admin-login' });
      return;
    }
    setScreenState(newScreen);
  };

  const adminLogin = (email: string, pass: string): boolean => {
    if (email.trim().toLowerCase() === 'admin@buyjump.com' && pass === 'Vithusan2553&&') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('buyjump_admin_authenticated', 'true');
      setScreenState({ type: 'admin-dashboard' });
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('buyjump_admin_authenticated');
    setScreenState({ type: 'home' });
  };
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('pukalavan_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('pukalavan_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pukalavan_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pukalavan_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    localStorage.setItem('pukalavan_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pukalavan_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('pukalavan_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('pukalavan_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Synchronize Firestore products in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreList: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.status === 'active' || !data.status) {
            firestoreList.push({
              id: typeof data.id === 'number' ? data.id : Math.abs(hashCode(docSnap.id)),
              name: data.name || 'Product',
              description: data.description || '',
              price: Number(data.price) || 0,
              discountPrice: Number(data.discountPrice) || 0,
              stockQuantity: Number(data.stock ?? data.stockQuantity) || 0,
              category: data.category || 'General',
              brand: data.sellerName || data.brand || 'BUYJUMP',
              sku: data.id || `SKU-${docSnap.id.slice(0, 6)}`,
              specifications: data.specifications || 'Authentic marketplace item',
              variants: data.variants || 'Standard',
              weight: data.weight || 'Standard',
              images: data.imageUrl || data.images || '/images/buyjump_logo.jpg',
              rating: Number(data.rating) || 5.0,
              reviewCount: Number(data.reviewCount) || 10,
              isFeatured: Boolean(data.isFeatured),
              isBestSeller: Boolean(data.isBestSeller),
              isNewArrival: true,
              isVisible: true,
              createdAt: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now()
            });
          }
        });
        if (firestoreList.length > 0) {
          // Merge with initialProducts ensuring unique IDs
          const existingIds = new Set(firestoreList.map(p => p.id));
          const combined = [...firestoreList, ...initialProducts.filter(p => !existingIds.has(p.id))];
          setProducts(combined);
        }
      }
    }, (err) => {
      console.warn('Firestore products stream notice:', err);
    });

    return () => unsub();
  }, []);

  function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) || Date.now();
  }

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const t = translations[language] || translations.en;

  // Cart operations
  const addToCart = (productId: number, quantity: number = 1, variant: string = '') => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const defaultVariant = variant || (product.variants ? product.variants.split(',')[0].trim() : '');

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === productId && item.selectedVariant === defaultVariant
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      }
      return [
        ...prev,
        {
          id: Date.now(),
          productId,
          quantity,
          selectedVariant: defaultVariant,
          addedAt: Date.now()
        }
      ];
    });
  };

  const updateCartQuantity = (cartItemId: number, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (cartItemId: number) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => setCart([]);

  // Wishlist
  const toggleWishlist = (productId: number) => {
    setWishlistIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: number) => wishlistIds.includes(productId);

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'orderId' | 'createdAt'>): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const orderId = `BJ-${dateStr}-${randomSuffix}`;
    const newOrder: Order = {
      ...orderData,
      id: Date.now(),
      orderId,
      createdAt: Date.now()
    };
    setOrders(prev => [newOrder, ...prev]);

    // Save to real Firestore database
    const currentUserId = auth.currentUser?.uid || `guest_${Date.now()}`;
    createOrderInFirestore({
      userId: currentUserId,
      customerName: orderData.customerName,
      customerEmail: auth.currentUser?.email || `${orderData.customerName.toLowerCase().replace(/\s+/g, '')}@buyjump.com`,
      customerPhone: orderData.customerPhone,
      items: cartWithProducts.map(c => ({
        productId: String(c.product.id),
        name: c.product.name,
        price: c.product.discountPrice > 0 ? c.product.discountPrice : c.product.price,
        quantity: c.cartItem.quantity,
        selectedVariant: c.cartItem.selectedVariant,
        imageUrl: c.product.images.split(',')[0].trim()
      })),
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      totalAmount: orderData.totalAmount,
      shippingAddress: orderData.deliveryAddress,
      paymentMethod: orderData.paymentMethod,
      status: 'pending'
    }).catch(err => console.warn('Firestore order sync:', err));

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(ord => (ord.orderId === orderId ? { ...ord, status } : ord))
    );
  };

  // Admin Actions
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>): Product => {
    const newProd: Product = {
      ...productData,
      id: Date.now(),
      createdAt: Date.now(),
      rating: 5.0,
      reviewCount: 0
    };
    setProducts(prev => [newProd, ...prev]);
    return newProd;
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setReviews(prev => [newReview, ...prev]);

    // Recalculate product rating
    setProducts(prev =>
      prev.map(p => {
        if (p.id === reviewData.productId) {
          const currentReviews = reviews.filter(r => r.productId === p.id);
          const totalRating = currentReviews.reduce((sum, r) => sum + r.rating, 0) + reviewData.rating;
          const newCount = currentReviews.length + 1;
          return {
            ...p,
            rating: Math.round((totalRating / newCount) * 10) / 10,
            reviewCount: newCount
          };
        }
        return p;
      })
    );
  };

  const addAddress = (addressData: Omit<Address, 'id'>) => {
    const newAddr: Address = {
      ...addressData,
      id: Date.now(),
      isDefault: addresses.length === 0 || addressData.isDefault
    };
    if (newAddr.isDefault) {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAddr));
    } else {
      setAddresses(prev => [...prev, newAddr]);
    }
  };

  const deleteAddress = (id: number) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const setDefaultAddress = (id: number) => {
    setAddresses(prev =>
      prev.map(a => ({
        ...a,
        isDefault: a.id === id
      }))
    );
  };

  // Computed cart calculations
  const cartWithProducts: CartItemWithProduct[] = cart
    .map(cartItem => {
      const product = products.find(p => p.id === cartItem.productId);
      return product ? { cartItem, product } : null;
    })
    .filter((item): item is CartItemWithProduct => item !== null);

  const cartSubtotal = cartWithProducts.reduce((sum, { cartItem, product }) => {
    const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
    return sum + effectivePrice * cartItem.quantity;
  }, 0);

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartDeliveryFee = cartWithProducts.length > 0 ? settings.deliveryFee : 0;
  const cartGrandTotal = cartSubtotal + cartDeliveryFee;

  return (
    <StoreContext.Provider
      value={{
        language,
        setLanguage,
        t,
        products,
        categories,
        banners,
        orders,
        cart,
        wishlistIds,
        addresses,
        settings,
        user,
        reviews,
        screen,
        setScreen,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        createOrder,
        updateOrderStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        updateSettings,
        addReview,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        cartWithProducts,
        cartSubtotal,
        cartTotalCount,
        cartDeliveryFee,
        cartGrandTotal
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
