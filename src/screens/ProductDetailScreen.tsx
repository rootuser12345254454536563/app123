import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageCircle,
  ShoppingBag,
  Heart,
  Share2,
  Check,
  Plus,
  Minus,
  Sparkles,
  Info
} from 'lucide-react';

export const ProductDetailScreen: React.FC = () => {
  const {
    screen,
    setScreen,
    products,
    settings,
    t,
    addToCart,
    toggleWishlist,
    isInWishlist,
    reviews,
    addReview
  } = useStore();

  const productId = screen.productId;
  const product = products.find((p) => p.id === productId);

  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Review submission state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-slate-600">Product not found.</p>
        <button
          onClick={() => setScreen({ type: 'home' })}
          className="px-5 py-2 bg-[#0F2C59] text-white rounded-xl text-sm font-semibold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Parse variants
  const variantsList = product.variants
    ? product.variants.split(',').map((v) => v.trim()).filter(Boolean)
    : [];

  const currentVariant = selectedVariant || (variantsList.length > 0 ? variantsList[0] : '');

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const effectivePrice = hasDiscount ? product.discountPrice : product.price;
  const savings = hasDiscount ? product.price - product.discountPrice : 0;

  const isFavorite = isInWishlist(product.id);
  const productReviews = reviews.filter((r) => r.productId === product.id);

  const handleAddToCart = () => {
    if (product.stockQuantity <= 0) return;
    addToCart(product.id, quantity, currentVariant);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    if (product.stockQuantity <= 0) return;
    addToCart(product.id, quantity, currentVariant);
    setScreen({ type: 'checkout' });
  };

  const [copiedToast, setCopiedToast] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} at ${settings.storeName}!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    addReview({
      productId: product.id,
      customerName: reviewName.trim(),
      rating: reviewRating,
      reviewText: reviewComment.trim()
    });

    setReviewName('');
    setReviewComment('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  // Related products
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb / Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setScreen({ type: 'home' })}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`p-2 rounded-full border border-slate-200 bg-white transition-colors shadow-xs ${
              isFavorite ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'
            }`}
            title="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs">
        {/* Left: Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-6 group">
            {hasDiscount && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1 text-xs font-black uppercase tracking-wider bg-rose-600 text-white rounded-lg shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            <img
              src={product.images.split(',')[0].trim() || '/images/ic_store_logo.jpg'}
              alt={product.name}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/ic_store_logo.jpg';
              }}
            />
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Truck className="w-4 h-4 mx-auto text-[#0F2C59] mb-1" />
              <p className="text-[11px] font-bold text-slate-800">Fast Delivery</p>
              <p className="text-[10px] text-slate-400">Sri Lanka Wide</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
              <p className="text-[11px] font-bold text-slate-800">100% Genuine</p>
              <p className="text-[10px] text-slate-400">Quality Verified</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <RotateCcw className="w-4 h-4 mx-auto text-amber-600 mb-1" />
              <p className="text-[11px] font-bold text-slate-800">Doorstep COD</p>
              <p className="text-[10px] text-slate-400">Pay on Receipt</p>
            </div>
          </div>
        </div>

        {/* Right: Details & Buying Box */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-700">
              <span className="uppercase tracking-wider px-2.5 py-1 bg-blue-50 rounded-md">
                {product.category}
              </span>
              <span className="text-slate-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Brand */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 text-amber-700 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating > 0 ? product.rating.toFixed(1) : '5.0'}</span>
              </div>
              <span className="text-slate-500">
                ({product.reviewCount || productReviews.length} customer ratings)
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">Brand: <strong className="text-slate-900">{product.brand}</strong></span>
            </div>

            {/* Pricing Section */}
            <div className="pt-2 pb-1 border-y border-slate-100 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#0F2C59]">
                  {settings.currency} {effectivePrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-slate-400 line-through">
                    {settings.currency} {product.price.toLocaleString()}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-xs text-emerald-600 font-bold">
                  You save {settings.currency} {savings.toLocaleString()} ({discountPercent}% off)
                </p>
              )}
            </div>

            {/* Stock Availability */}
            <div className="flex items-center gap-2 text-sm pt-1">
              <span className="text-slate-600 font-medium">Availability:</span>
              {product.stockQuantity > 0 ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-md">
                  <Check className="w-3.5 h-3.5" />
                  <span>In Stock ({product.stockQuantity} items remaining)</span>
                </span>
              ) : (
                <span className="text-rose-600 font-bold text-xs bg-rose-50 px-2.5 py-1 rounded-md">
                  {t.outOfStock}
                </span>
              )}
            </div>

            {/* Variants Selector */}
            {variantsList.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Option / Variant:
                </label>
                <div className="flex flex-wrap gap-2">
                  {variantsList.map((variant) => {
                    const isSelected = currentVariant === variant;
                    return (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-[#0F2C59] text-white border-[#0F2C59] shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {variant}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Quantity:
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-40 shadow-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-extrabold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                    disabled={quantity >= product.stockQuantity}
                    className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-40 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs text-slate-500">
                  Total: <strong className="text-slate-900">{settings.currency} {(effectivePrice * quantity).toLocaleString()}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            {addedToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Successfully added {quantity} item(s) to your cart!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stockQuantity <= 0}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-blue-50 text-[#0F2C59] border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t.addToCart}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stockQuantity <= 0}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-[#0F2C59] text-white hover:bg-blue-900 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t.buyNow}</span>
              </button>
            </div>

            {/* Direct WhatsApp Ordering Button */}
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Hello ${settings.storeName}! I am interested in purchasing:\n\n*${product.name}*\nPrice: ${settings.currency} ${effectivePrice}\nSKU: ${product.sku}\nVariant: ${currentVariant || 'Standard'}\n\nPlease confirm availability!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Inquire / Order via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('desc')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'desc'
                ? 'border-[#0F2C59] text-[#0F2C59]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.description}
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'border-[#0F2C59] text-[#0F2C59]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.specifications}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-[#0F2C59] text-[#0F2C59]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.reviews} ({productReviews.length})
          </button>
        </div>

        {/* Tab 1: Description */}
        {activeTab === 'desc' && (
          <div className="prose max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line space-y-4">
            <p>{product.description}</p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3 mt-4">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Authenticity Guarantee</p>
                <p>
                  Every product shipped by BuyJump is carefully inspected, packed securely, and guaranteed to meet our high quality standards. Contact our store line anytime for order questions or bulk orders.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Specs */}
        {activeTab === 'specs' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 font-bold text-slate-500 w-1/3">Brand</td>
                  <td className="py-2.5 text-slate-800 font-semibold">{product.brand}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 font-bold text-slate-500">Category</td>
                  <td className="py-2.5 text-slate-800 font-semibold">{product.category}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 font-bold text-slate-500">SKU Code</td>
                  <td className="py-2.5 text-slate-800 font-mono">{product.sku}</td>
                </tr>
                {product.weight && (
                  <tr className="border-b border-slate-100">
                    <td className="py-2.5 font-bold text-slate-500">Weight / Unit</td>
                    <td className="py-2.5 text-slate-800">{product.weight}</td>
                  </tr>
                )}
                {product.specifications.split('\n').map((line, idx) => {
                  const parts = line.split(':');
                  if (parts.length < 2) return null;
                  return (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-2.5 font-bold text-slate-500">{parts[0].trim()}</td>
                      <td className="py-2.5 text-slate-800">{parts.slice(1).join(':').trim()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Reviews List */}
            <div className="space-y-4">
              {productReviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No reviews yet for this product. Be the first to review!</p>
              ) : (
                productReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{rev.customerName}</span>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600">{rev.reviewText}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a review form */}
            <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
              <h4 className="font-bold text-sm text-slate-900">{t.writeReview}</h4>

              {reviewSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                  Thank you! Your review has been published.
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewRating(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">{reviewRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. S. Kumar"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Review Comments</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details of your experience with this item..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
                ></textarea>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0F2C59] text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition-colors shadow-sm"
              >
                {t.submitReview}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Recommended / Related Products */}
      {related.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">{t.recommended}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {related.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
