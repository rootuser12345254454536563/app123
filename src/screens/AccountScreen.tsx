import React from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { AppLanguage } from '../types';
import {
  User,
  Package,
  Heart,
  MapPin,
  Globe,
  ShieldCheck,
  PhoneCall,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Store,
  LogIn,
  UserPlus
} from 'lucide-react';

export const AccountScreen: React.FC = () => {
  const {
    wishlistIds,
    settings,
    language,
    setLanguage,
    t,
    setScreen
  } = useStore();

  const { currentUser, userProfile, role } = useAuth();

  const handleLanguageChange = (lang: AppLanguage) => {
    setLanguage(lang);
  };

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      {/* Account Header */}
      {currentUser ? (
        <div className="bg-gradient-to-r from-[#0F2C59] to-[#1E3A8A] rounded-3xl p-6 text-white shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 ring-4 ring-white/20 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-[#00D053]" />
            </div>
            <div>
              <h2 className="text-xl font-black">{userProfile?.fullName || 'BUYJUMP Member'}</h2>
              <p className="text-xs text-blue-200">{currentUser.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#00D053] border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                {role || 'Customer'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              if (role === 'admin') setScreen({ type: 'admin-dashboard' });
              else if (role === 'seller') setScreen({ type: 'seller-dashboard' });
              else setScreen({ type: 'user-dashboard' });
            }}
            className="px-4 py-2 bg-[#00D053] hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-sm"
          >
            My Dashboard
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#0F2C59] to-[#1E3A8A] rounded-3xl p-6 sm:p-8 text-white shadow-md text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 ring-4 ring-white/20 flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-[#00D053]" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black">Welcome to BUYJUMP</h2>
            <p className="text-xs text-blue-200">
              Sign in to manage your orders, wishlist, or register as a marketplace seller.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 justify-center pt-1">
            <button
              onClick={() => setScreen({ type: 'login' })}
              className="px-6 py-2.5 bg-[#00D053] hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => setScreen({ type: 'register-user' })}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>
        </div>
      )}

      {/* Seller Portal Callout */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Want to sell your products?</h4>
            <p className="text-xs text-slate-600">Register as an authorized BUYJUMP merchant</p>
          </div>
        </div>
        <button
          onClick={() => setScreen({ type: 'register-seller' })}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex-shrink-0 cursor-pointer"
        >
          Register Store
        </button>
      </div>

      {/* Language Selector Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#0F2C59]" />
          <span>{t.language} / Language / மொழி / භාෂාව</span>
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
              language === 'en'
                ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            English
          </button>
          <button
            onClick={() => handleLanguageChange('ta')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
              language === 'ta'
                ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            தமிழ் (Tamil)
          </button>
          <button
            onClick={() => handleLanguageChange('si')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
              language === 'si'
                ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            සිංහල (Sinhala)
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        <button
          onClick={() => setScreen({ type: 'wishlist' })}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{t.wishlist}</p>
              <p className="text-[11px] text-slate-400">{wishlistIds.length} saved products</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setScreen({ type: 'saved-addresses' })}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{t.savedAddresses}</p>
              <p className="text-[11px] text-slate-400">Manage delivery locations</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setScreen({ type: 'admin-dashboard' })}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>BUYJUMP Admin Portal</span>
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-extrabold rounded">
                  Admin
                </span>
              </p>
              <p className="text-[11px] text-slate-400">Manage products, approvals & orders</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setScreen({ type: 'integration-guide' })}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Marketplace Architecture & WhatsApp Guide</p>
              <p className="text-[11px] text-slate-400">Meta Cloud API, Firebase Auth & Storage overview</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Store Support */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Direct Support</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-3 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs font-bold text-emerald-900">WhatsApp Hotline</p>
              <p className="text-[11px] text-emerald-700 font-mono">{settings.whatsappNumber}</p>
            </div>
          </a>

          <a
            href={`tel:${settings.storePhone}`}
            className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center gap-3 transition-colors"
          >
            <PhoneCall className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs font-bold text-blue-900">Direct Call</p>
              <p className="text-[11px] text-blue-700 font-mono">{settings.storePhone}</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};
