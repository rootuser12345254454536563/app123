import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { SortOption } from '../types';
import { Search, SlidersHorizontal, ArrowUpDown, X, Tag } from 'lucide-react';

export const SearchScreen: React.FC = () => {
  const {
    products,
    categories,
    searchQuery,
    setSearchQuery,
    t,
    settings
  } = useStore();

  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('DEFAULT');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(10000);
  const [onlyDiscounted, setOnlyDiscounted] = useState<boolean>(false);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Query match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchBrand && !matchCategory && !matchSku) {
            return false;
          }
        }

        // Category filter
        if (selectedCat !== 'ALL' && p.category !== selectedCat) {
          return false;
        }

        // Price filter
        const effPrice = p.discountPrice > 0 ? p.discountPrice : p.price;
        if (effPrice > maxPriceFilter) {
          return false;
        }

        // In Stock
        if (onlyInStock && p.stockQuantity <= 0) {
          return false;
        }

        // Discounted only
        if (onlyDiscounted && (!p.discountPrice || p.discountPrice >= p.price)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice > 0 ? a.discountPrice : a.price;
        const priceB = b.discountPrice > 0 ? b.discountPrice : b.price;

        if (sortOption === 'PRICE_LOW_TO_HIGH') return priceA - priceB;
        if (sortOption === 'PRICE_HIGH_TO_LOW') return priceB - priceA;
        if (sortOption === 'NEWEST') return b.createdAt - a.createdAt;
        return 0;
      });
  }, [products, searchQuery, selectedCat, maxPriceFilter, onlyDiscounted, onlyInStock, sortOption]);

  return (
    <div className="space-y-6 pb-16">
      {/* Search Input Box */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            autoFocus
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0F2C59] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15 transition-all"
          />
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Category:</span>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">{t.sortBy}:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
            >
              <option value="DEFAULT">Recommended</option>
              <option value="PRICE_LOW_TO_HIGH">{t.priceLowToHigh}</option>
              <option value="PRICE_HIGH_TO_LOW">{t.priceHighToLow}</option>
              <option value="NEWEST">{t.newestFirst}</option>
            </select>
          </div>
        </div>

        {/* Quick Toggles: In stock only, Deals only */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setOnlyDiscounted(!onlyDiscounted)}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              onlyDiscounted
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            🔥 Deals Only
          </button>
          <button
            onClick={() => setOnlyInStock(!onlyInStock)}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              onlyInStock
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            ✓ In Stock Only
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-slate-500 font-medium">Max Price:</span>
            <span className="font-bold text-slate-800">{settings.currency} {maxPriceFilter}</span>
            <input
              type="range"
              min="500"
              max="15000"
              step="500"
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              className="w-24 accent-[#0F2C59]"
            />
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Found <strong>{filteredProducts.length}</strong> items
          {searchQuery ? ` for "${searchQuery}"` : ''}
        </span>
      </div>

      {/* Results Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Search className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No matching products found</p>
          <p className="text-xs text-slate-400">
            Try adjusting your search keywords, clear filters, or browse other categories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCat('ALL');
              setMaxPriceFilter(10000);
              setOnlyDiscounted(false);
              setOnlyInStock(false);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
};
