import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Grid, Sparkles, Filter } from 'lucide-react';

export const CategoriesScreen: React.FC = () => {
  const {
    categories,
    products,
    selectedCategory,
    setSelectedCategory,
    t
  } = useStore();

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Grid className="w-6 h-6 text-[#0F2C59]" />
            <span>{t.categories}</span>
          </h1>
          <p className="text-xs text-slate-500">Explore authentic products by department</p>
        </div>

        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 self-start"
          >
            Show All Categories
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            selectedCategory === null
              ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
          }`}
        >
          All Items ({products.length})
        </button>
        {categories.map((cat) => {
          const count = products.filter((p) => p.category === cat.name).length;
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                isSelected
                  ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
        <span>
          Showing <strong>{filteredProducts.length}</strong> items {selectedCategory ? `in "${selectedCategory}"` : ''}
        </span>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <p className="text-sm text-slate-500">No products available in this category yet.</p>
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-xs font-bold text-[#0F2C59] underline"
          >
            Browse all products
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
