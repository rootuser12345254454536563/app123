import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Truck,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  ChevronRight,
  Flame
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    t,
    products,
    categories,
    banners,
    settings,
    setScreen,
    setSelectedCategory
  } = useStore();

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Auto banner rotation
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const flashDeals = products.filter(p => p.discountPrice > 0 && p.discountPrice < p.price);
  const featured = products.filter(p => p.isFeatured);
  const bestSellers = products.filter(p => p.isBestSeller);
  const newArrivals = products.filter(p => p.isNewArrival);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setScreen({ type: 'categories' });
  };

  const handleBannerAction = (banner: typeof banners[0]) => {
    if (banner.destinationType === 'category' && banner.destinationValue) {
      setSelectedCategory(banner.destinationValue);
      setScreen({ type: 'categories' });
    } else {
      setScreen({ type: 'categories' });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Carousel Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#091A36] to-[#0F2C59] text-white shadow-xl">
        <div className="relative min-h-[260px] sm:min-h-[340px] md:min-h-[380px] flex items-center">
          {banners.map((banner, index) => {
            const isActive = index === activeBannerIndex;
            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col md:flex-row items-center justify-between p-6 sm:p-10 ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Text Content */}
                <div className="w-full md:w-1/2 z-20 space-y-3 sm:space-y-4 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Special Promo</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">
                    {banner.title}
                  </h2>
                  <p className="text-sm sm:text-base text-blue-100/90 max-w-md">
                    {banner.subtitle}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                    <button
                      onClick={() => handleBannerAction(banner)}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                    >
                      <span>{banner.buttonText}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20BuyJump,%20I%20am%20interested%20in%20your%20offers`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Order on WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Banner Image Visual */}
                <div className="w-full md:w-1/2 h-44 sm:h-64 md:h-80 flex items-center justify-center p-4">
                  <img
                    src={banner.imageUri}
                    alt={banner.title}
                    className="max-h-full max-w-full object-contain rounded-xl drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/ic_store_logo.jpg';
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBannerIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === activeBannerIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/40'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Value Pillars */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200/70 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Islandwide Delivery</h4>
            <p className="text-[11px] text-slate-500">Fast & reliable dispatch</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200/70 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">WhatsApp Ordering</h4>
            <p className="text-[11px] text-slate-500">Direct message support</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200/70 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">100% Genuine</h4>
            <p className="text-[11px] text-slate-500">Direct from trusted sources</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200/70 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Cash On Delivery</h4>
            <p className="text-[11px] text-slate-500">Pay at your doorstep</p>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Carousel */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>{t.categories}</span>
          </h2>
          <button
            onClick={() => setScreen({ type: 'categories' })}
            className="text-xs font-bold text-[#0F2C59] hover:text-blue-700 flex items-center gap-1"
          >
            <span>{t.viewAll}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name)}
              className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl shadow-xs transition-all hover:border-blue-400 group cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100/60 text-[#0F2C59] group-hover:bg-[#0F2C59] group-hover:text-white flex items-center justify-center font-bold text-xs transition-colors">
                {cat.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-900 whitespace-nowrap">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Flash Deals Section */}
      {flashDeals.length > 0 && (
        <section className="bg-gradient-to-br from-rose-50/60 to-amber-50/60 rounded-2xl p-4 sm:p-6 border border-rose-200/60 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>{t.flashDeals}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold">
                    Limited Time
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Unbeatable discounts for today only</p>
              </div>
            </div>
            <button
              onClick={() => setScreen({ type: 'categories' })}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 self-start sm:self-center"
            >
              {t.viewAll} →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {flashDeals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0F2C59] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t.featuredProducts}</h3>
              <p className="text-xs text-slate-500">Handpicked premium selections</p>
            </div>
          </div>
          <button
            onClick={() => setScreen({ type: 'categories' })}
            className="text-xs font-bold text-[#0F2C59] hover:underline"
          >
            {t.viewAll} →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t.bestSellers}</h3>
              <p className="text-xs text-slate-500">Most loved by our customers</p>
            </div>
          </div>
          <button
            onClick={() => setScreen({ type: 'categories' })}
            className="text-xs font-bold text-[#0F2C59] hover:underline"
          >
            {t.viewAll} →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* WhatsApp Quick Order Callout Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-bold uppercase tracking-wider inline-block">
            Instant Ordering
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold">Need Help Or Custom Orders?</h3>
          <p className="text-sm text-emerald-100 max-w-lg">
            Chat directly with our store managers on WhatsApp. Fast response, custom orders, bulk discounts, and doorstep delivery.
          </p>
        </div>
        <a
          href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20BuyJump,%20I%20have%20an%20inquiry%20regarding%20products`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2 flex-shrink-0"
        >
          <MessageCircle className="w-5 h-5 text-emerald-600" />
          <span>Chat on WhatsApp: {settings.whatsappNumber}</span>
        </a>
      </section>
    </div>
  );
};
