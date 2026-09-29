import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';

export const WishlistScreen: React.FC = () => {
  const { wishlistIds, products, t, setScreen } = useStore();

  const favoriteProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <span>{t.myWishlist} ({favoriteProducts.length})</span>
        </h1>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="py-16 text-center max-w-sm mx-auto space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold text-slate-700">{t.emptyWishlist}</p>
          <p className="text-xs text-slate-400">
            Save items you like and want to buy later by tapping the heart icon on any product.
          </p>
          <button
            onClick={() => setScreen({ type: 'home' })}
            className="px-5 py-2.5 bg-[#0F2C59] text-white rounded-xl text-xs font-bold shadow-md"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {favoriteProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};
