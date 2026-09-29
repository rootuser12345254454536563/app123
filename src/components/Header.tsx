import React from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { AppLanguage } from '../types';
import {
  ShoppingBag,
  Heart,
  Search,
  ShieldCheck,
  PhoneCall,
  User,
  Store,
  LogIn
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    cartTotalCount,
    wishlistIds,
    setScreen,
    screen,
    searchQuery,
    setSearchQuery,
    settings
  } = useStore();

  const { currentUser, userProfile, role, sellerProfile } = useAuth();

  const handleLanguageChange = (lang: AppLanguage) => {
    setLanguage(lang);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (screen.type !== 'search') {
      setScreen({ type: 'search' });
    }
  };

  const handleProfileClick = () => {
    if (!currentUser) {
      setScreen({ type: 'login' });
      return;
    }
    if (role === 'admin') {
      setScreen({ type: 'admin-dashboard' });
    } else if (role === 'seller') {
      setScreen({ type: 'seller-dashboard' });
    } else {
      setScreen({ type: 'user-dashboard' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F2C59] text-white shadow-md border-b border-blue-900/40">
      {/* Top Banner Notice */}
      <div className="bg-[#091A36] px-4 py-1.5 text-xs flex justify-between items-center text-slate-300">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-block w-2 h-2 rounded-full bg-[#00D053] animate-pulse"></span>
          <span>{settings.storeAddress} | Islandwide Delivery</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>WhatsApp: {settings.whatsappNumber}</span>
          </a>

          {/* Seller Link */}
          {role !== 'admin' && (
            <button
              onClick={() => {
                if (currentUser && role === 'seller') {
                  setScreen({ type: 'seller-dashboard' });
                } else {
                  setScreen({ type: 'register-seller' });
                }
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Store className="w-3 h-3 text-[#00D053]" />
              <span>{role === 'seller' ? 'Seller Hub' : 'Sell on BUYJUMP'}</span>
            </button>
          )}

          {/* Admin Link */}
          <button
            onClick={() => setScreen({ type: 'admin-dashboard' })}
            className="text-[11px] px-2 py-0.5 rounded bg-blue-950/80 hover:bg-blue-800 text-blue-200 border border-blue-700/50 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 md:gap-6">
          {/* Logo & Brand */}
          <div
            onClick={() => setScreen({ type: 'home' })}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group flex-shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-0.5 ring-2 ring-emerald-400/80 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src="/images/buyjump_logo.jpg"
                alt="BUYJUMP"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                <span>BuyJump</span>
                <span className="hidden xs:inline-block px-1.5 py-0.5 text-[9px] uppercase font-black tracking-wider rounded bg-[#00D053] text-slate-950 shadow-xs">
                  Market
                </span>
              </h1>
              <p className="text-[11px] text-emerald-300/90 hidden sm:block -mt-0.5 line-clamp-1 font-medium">
                {t.storeSlogan}
              </p>
            </div>
          </div>

          {/* Search Bar - Center */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl relative hidden md:block"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (screen.type !== 'search') setScreen({ type: 'search' });
                }}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-10 py-2 rounded-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-blue-200/70 focus:placeholder:text-slate-400 border border-white/20 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 text-sm transition-all"
              />
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-200 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          {/* Action icons & Language switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="flex items-center bg-white/10 border border-white/15 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  language === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-blue-100 hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('ta')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  language === 'ta'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-blue-100 hover:text-white'
                }`}
                title="தமிழ்"
              >
                தமிழ்
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('si')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  language === 'si'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-blue-100 hover:text-white'
                }`}
                title="සිංහල"
              >
                සිංහල
              </button>
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => setScreen({ type: 'wishlist' })}
              className={`relative p-2 rounded-full hover:bg-white/10 transition-colors ${
                screen.type === 'wishlist' ? 'bg-white/15 text-rose-400' : 'text-blue-100'
              }`}
              title={t.wishlist}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-[#0F2C59]">
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setScreen({ type: 'cart' })}
              className={`relative p-2 rounded-full hover:bg-white/10 transition-colors ${
                screen.type === 'cart' ? 'bg-white/15 text-amber-400' : 'text-blue-100'
              }`}
              title={t.cart}
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 bg-amber-500 text-slate-950 rounded-full text-[11px] font-black flex items-center justify-center ring-2 ring-[#0F2C59] animate-bounce">
                  {cartTotalCount}
                </span>
              )}
            </button>

            {/* Auth / Account Button */}
            <button
              onClick={handleProfileClick}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                currentUser
                  ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                  : 'bg-[#00D053] hover:bg-emerald-400 text-slate-950 font-bold border-[#00D053]'
              }`}
              title={currentUser ? (userProfile?.fullName || 'My Account') : 'Sign In'}
            >
              {currentUser ? (
                <>
                  <User className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold hidden sm:inline max-w-[80px] truncate">
                    {userProfile?.fullName?.split(' ')[0] || 'Account'}
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span className="text-xs font-black">Login</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
