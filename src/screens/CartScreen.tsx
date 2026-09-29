import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  MessageCircle,
  Tag,
  Check,
  ShieldCheck,
  Truck
} from 'lucide-react';

export const CartScreen: React.FC = () => {
  const {
    t,
    cartWithProducts,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartDeliveryFee,
    settings,
    setScreen
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'PUKALAVAN10') {
      const disc = Math.round(cartSubtotal * 0.1);
      setAppliedDiscount(disc);
      setCouponMessage('Coupon PUKALAVAN10 applied: 10% Discount!');
    } else if (couponCode.trim().toUpperCase() === 'FREESHIP') {
      setAppliedDiscount(cartDeliveryFee);
      setCouponMessage('Coupon FREESHIP applied: Free Delivery!');
    } else {
      setAppliedDiscount(0);
      setCouponMessage('Invalid promo code. Try "PUKALAVAN10"');
    }
  };

  const finalTotal = Math.max(0, cartSubtotal + cartDeliveryFee - appliedDiscount);

  const itemsList = cartWithProducts
    .map(
      ({ cartItem, product }, idx) =>
        `${idx + 1}. ${product.name} (${cartItem.selectedVariant || 'Standard'}) x ${cartItem.quantity} = ${settings.currency} ${(
          (product.discountPrice > 0 ? product.discountPrice : product.price) * cartItem.quantity
        ).toLocaleString()}`
    )
    .join('\n');

  const fastWhatsAppUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `🛍️ *NEW ORDER INQUIRY - ${settings.storeName}*\n\n` +
    `Items:\n${itemsList}\n\n` +
    `*Subtotal:* ${settings.currency} ${cartSubtotal.toLocaleString()}\n` +
    `*Delivery Fee:* ${settings.currency} ${cartDeliveryFee.toLocaleString()}\n` +
    `*Total Amount:* ${settings.currency} ${finalTotal.toLocaleString()}\n\n` +
    `Please provide delivery address details to confirm delivery!`
  )}`;

  if (cartWithProducts.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="w-20 h-20 bg-blue-50 text-[#0F2C59] rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">{t.emptyCart}</h2>
        <p className="text-xs text-slate-500">
          Looks like you haven't added anything to your cart yet. Explore our fresh collection!
        </p>
        <button
          onClick={() => setScreen({ type: 'home' })}
          className="px-6 py-2.5 bg-[#0F2C59] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md transition-all"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-[#0F2C59]" />
          <span>{t.cart} ({cartWithProducts.length} items)</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart items list */}
        <div className="lg:col-span-2 space-y-3">
          {cartWithProducts.map(({ cartItem, product }) => {
            const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
            const price = hasDiscount ? product.discountPrice : product.price;
            const itemTotal = price * cartItem.quantity;
            const firstImg = product.images.split(',')[0].trim() || '/images/ic_store_logo.jpg';

            return (
              <div
                key={cartItem.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-4 group"
              >
                {/* Thumbnail */}
                <div
                  onClick={() => setScreen({ type: 'product-detail', productId: product.id })}
                  className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2 flex-shrink-0 cursor-pointer border border-slate-100"
                >
                  <img
                    src={firstImg}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/ic_store_logo.jpg';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4
                        onClick={() => setScreen({ type: 'product-detail', productId: product.id })}
                        className="font-bold text-sm text-slate-900 truncate cursor-pointer hover:text-blue-900"
                      >
                        {product.name}
                      </h4>
                      {cartItem.selectedVariant && (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                          Variant: {cartItem.selectedVariant}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(cartItem.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity Stepper & Price */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                      <button
                        onClick={() => updateCartQuantity(cartItem.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(cartItem.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-[#0F2C59]">
                        {settings.currency} {itemTotal.toLocaleString()}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {settings.currency} {price.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. PUKALAVAN10"
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15 uppercase font-semibold"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className={`text-[11px] font-semibold mt-1 ${appliedDiscount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {couponMessage}
                </p>
              )}
            </form>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-100 text-slate-600">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="font-bold text-slate-900">
                  {settings.currency} {cartSubtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t.deliveryFee}</span>
                <span className="font-bold text-slate-900">
                  {settings.currency} {cartDeliveryFee.toLocaleString()}
                </span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>{t.discount}</span>
                  <span>- {settings.currency} {appliedDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>{t.total}</span>
                <span className="text-[#0F2C59] text-base">
                  {settings.currency} {finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => setScreen({ type: 'checkout' })}
                className="w-full py-3 px-4 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{t.checkout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={fastWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.sendWhatsAppOrder}</span>
              </a>
            </div>
          </div>

          {/* Guarantee info */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Safe & Secure Checkout</span>
            </div>
            <p className="text-[11px]">
              Cash on delivery is available at your doorstep. You inspect the parcel before making payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
