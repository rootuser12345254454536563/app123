import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    t,
    settings,
    setScreen,
    addToCart,
    toggleWishlist,
    isInWishlist
  } = useStore();

  const [addedAnimation, setAddedAnimation] = useState(false);
  const isFavorite = isInWishlist(product.id);
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const currentPrice = hasDiscount ? product.discountPrice : product.price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stockQuantity <= 0) return;
    addToCart(product.id, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  // Get image URL or fallback
  const firstImage = product.images.split(',')[0].trim() || '/images/ic_store_logo.jpg';

  return (
    <div
      onClick={() => setScreen({ type: 'product-detail', productId: product.id })}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Badges Overlay */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
        {hasDiscount && (
          <span className="px-2 py-0.5 text-[11px] font-extrabold tracking-wide uppercase bg-rose-600 text-white rounded-md shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
        {product.isBestSeller && (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500 text-slate-950 rounded-md shadow-sm">
            Best Seller
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={handleWishlistToggle}
        className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isFavorite
            ? 'bg-rose-50 text-rose-600 shadow-sm'
            : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm'
        }`}
        title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Image Thumbnail */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center p-3">
        <img
          src={firstImage}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/ic_store_logo.jpg';
          }}
        />
        {product.stockQuantity <= 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase px-2.5 py-1 bg-rose-600/90 rounded-md">
              {t.outOfStock}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="truncate max-w-[120px]">{product.brand}</span>
            <span className="text-slate-400 font-medium">#{product.sku}</span>
          </div>

          {/* Name */}
          <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-xs font-bold ml-1 text-slate-700">
                {product.rating > 0 ? product.rating.toFixed(1) : '5.0'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              ({product.reviewCount || 12})
            </span>
          </div>
        </div>

        {/* Pricing & Add Button */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-[#0F2C59]">
                {settings.currency} {currentPrice.toLocaleString()}
              </span>
            </div>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {settings.currency} {product.price.toLocaleString()}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stockQuantity <= 0}
            className={`p-2 rounded-xl flex items-center justify-center transition-all ${
              product.stockQuantity <= 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : addedAnimation
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-[#0F2C59] hover:bg-blue-900 text-white hover:shadow-md'
            }`}
            title={product.stockQuantity <= 0 ? t.outOfStock : t.addToCart}
          >
            {addedAnimation ? (
              <Check className="w-4 h-4 animate-in fade-in" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
