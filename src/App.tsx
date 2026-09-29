import React from 'react';
import { useStore } from './context/StoreContext';
import { useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './screens/HomeScreen';
import { CategoriesScreen } from './screens/CategoriesScreen';
import { SearchScreen } from './screens/SearchScreen';
import { CartScreen } from './screens/CartScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { OrderSuccessScreen } from './screens/OrderSuccessScreen';
import { OrdersScreen } from './screens/OrdersScreen';
import { WishlistScreen } from './screens/WishlistScreen';
import { SavedAddressesScreen } from './screens/SavedAddressesScreen';
import { AccountScreen } from './screens/AccountScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterUserScreen } from './screens/RegisterUserScreen';
import { RegisterSellerScreen } from './screens/RegisterSellerScreen';
import { UserDashboard } from './screens/UserDashboard';
import { SellerDashboard } from './screens/SellerDashboard';
import { AdminPortalScreen } from './screens/AdminPortalScreen';
import { IntegrationGuideScreen } from './screens/IntegrationGuideScreen';
import {
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Store,
  User,
  LogIn
} from 'lucide-react';

export const AppContent: React.FC = () => {
  const { screen, setScreen, settings, t } = useStore();
  const { currentUser, role } = useAuth();

  const renderScreen = () => {
    switch (screen.type) {
      case 'home':
        return <HomeScreen />;
      case 'categories':
        return <CategoriesScreen />;
      case 'search':
        return <SearchScreen />;
      case 'cart':
        return <CartScreen />;
      case 'product-detail':
        return <ProductDetailScreen />;
      case 'checkout':
        return <CheckoutScreen />;
      case 'order-success':
        return <OrderSuccessScreen />;
      case 'my-orders':
        return currentUser ? <UserDashboard /> : <OrdersScreen />;
      case 'wishlist':
        return <WishlistScreen />;
      case 'saved-addresses':
        return <SavedAddressesScreen />;
      case 'account':
        if (!currentUser) return <AccountScreen />;
        if (role === 'admin') return <AdminPortalScreen />;
        if (role === 'seller') return <SellerDashboard />;
        return <UserDashboard />;
      case 'login':
      case 'admin-login':
        return <LoginScreen />;
      case 'register-user':
        return <RegisterUserScreen />;
      case 'register-seller':
        return <RegisterSellerScreen />;
      case 'user-dashboard':
        return <UserDashboard />;
      case 'seller-dashboard':
        return <SellerDashboard />;
      case 'admin-dashboard':
        return <AdminPortalScreen />;
      case 'integration-guide':
        return <IntegrationGuideScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderScreen()}
      </main>

      {/* Web Footer */}
      <footer className="bg-[#091A36] text-slate-300 border-t border-slate-800 text-xs py-10 pb-24 md:pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white p-0.5 ring-2 ring-emerald-400 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src="/images/buyjump_logo.jpg"
                  alt="BUYJUMP Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-black text-lg text-white">BuyJump</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {t.storeSlogan}. Modern digital marketplace connecting verified local sellers with buyers across Sri Lanka.
            </p>
          </div>

          {/* Col 2: Marketplace Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Marketplace</h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>
                <button onClick={() => setScreen({ type: 'home' })} className="hover:text-white cursor-pointer">
                  {t.home}
                </button>
              </li>
              <li>
                <button onClick={() => setScreen({ type: 'categories' })} className="hover:text-white cursor-pointer">
                  {t.categories}
                </button>
              </li>
              <li>
                <button onClick={() => setScreen({ type: 'register-seller' })} className="hover:text-emerald-400 cursor-pointer font-semibold">
                  Sell on BUYJUMP
                </button>
              </li>
              <li>
                <button onClick={() => setScreen({ type: 'cart' })} className="hover:text-white cursor-pointer">
                  {t.cart}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Portals & Support */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Account & Portals</h4>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>
                {currentUser ? (
                  <button
                    onClick={() => {
                      if (role === 'admin') setScreen({ type: 'admin-dashboard' });
                      else if (role === 'seller') setScreen({ type: 'seller-dashboard' });
                      else setScreen({ type: 'user-dashboard' });
                    }}
                    className="hover:text-white cursor-pointer font-semibold"
                  >
                    My Dashboard ({role || 'User'})
                  </button>
                ) : (
                  <button onClick={() => setScreen({ type: 'login' })} className="hover:text-white cursor-pointer">
                    Sign In / Register
                  </button>
                )}
              </li>
              <li>
                <button onClick={() => setScreen({ type: 'admin-dashboard' })} className="hover:text-amber-400 cursor-pointer flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Portal</span>
                </button>
              </li>
              <li>
                <button onClick={() => setScreen({ type: 'integration-guide' })} className="hover:text-white cursor-pointer">
                  Architecture & API Guide
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 flex items-center gap-1 text-emerald-400"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Support</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Verification */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Marketplace Trust</h4>
            <p className="text-[11px] text-slate-400">
              Verified merchants, protected payments, and direct WhatsApp tracking updates for all shipments.
            </p>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00D053]" />
              <span>Firebase Auth & Cloud Firestore Verified</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
          <p>© {new Date().getFullYear()} BUYJUMP. All rights reserved.</p>
          <p className="flex items-center gap-1 font-mono text-[10px]">
            Architecture: USER • SELLER • ADMIN | Firebase Auth | Firestore | Meta WhatsApp Cloud API
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp Action Button */}
      <a
        href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20BUYJUMP,%20I%20have%20an%20inquiry`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-5 z-40 p-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center ring-4 ring-emerald-400/30 group"
        title="Chat on WhatsApp"
        aria-label="WhatsApp Contact"
      >
        <MessageCircle className="w-6 h-6 fill-white text-emerald-500" />
        <span className="hidden md:group-hover:inline-block ml-2 text-xs font-bold text-white whitespace-nowrap pr-1 transition-all">
          Chat With Us
        </span>
      </a>

      <BottomNavigation />
    </div>
  );
};
