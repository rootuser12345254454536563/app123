import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Truck,
  CreditCard,
  Banknote,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';

export const CheckoutScreen: React.FC = () => {
  const {
    t,
    cartWithProducts,
    cartSubtotal,
    cartDeliveryFee,
    settings,
    addresses,
    user,
    createOrder,
    setScreen
  } = useStore();

  const { currentUser, userProfile } = useAuth();

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

  const [customerName, setCustomerName] = useState(userProfile?.fullName || defaultAddr?.fullName || user.name || '');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || defaultAddr?.phone || user.phone || '');
  const [streetAddress, setStreetAddress] = useState(defaultAddr?.streetAddress || '');

  useEffect(() => {
    if (userProfile?.fullName && !customerName) {
      setCustomerName(userProfile.fullName);
    }
    if (userProfile?.phone && !customerPhone) {
      setCustomerPhone(userProfile.phone);
    }
  }, [userProfile]);
  const [city, setCity] = useState(defaultAddr?.city || 'Jaffna');
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode || '40000');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Online Payment'>('Cash on Delivery');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const grandTotal = cartSubtotal + cartDeliveryFee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Please enter a valid phone number for delivery coordination.');
      return;
    }
    if (!streetAddress.trim() || !city.trim()) {
      setError('Please provide full delivery address and city.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const itemsSummary = cartWithProducts
      .map(
        ({ cartItem, product }) =>
          `${product.name} (${cartItem.selectedVariant || 'Standard'}) x ${cartItem.quantity}`
      )
      .join(', ');

    const fullAddress = `${streetAddress}, ${city}${postalCode ? ` - ${postalCode}` : ''}`;

    setTimeout(() => {
      const created = createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: fullAddress,
        itemsSummary,
        subtotal: cartSubtotal,
        deliveryFee: cartDeliveryFee,
        totalAmount: grandTotal,
        paymentMethod,
        status: 'Pending'
      });

      setIsSubmitting(false);
      setScreen({ type: 'order-success', orderId: created.orderId });
    }, 600);
  };

  if (cartWithProducts.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="text-slate-600">Your cart is empty.</p>
        <button
          onClick={() => setScreen({ type: 'home' })}
          className="px-5 py-2.5 bg-[#0F2C59] text-white rounded-xl text-xs font-bold"
        >
          Return to Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Back button */}
      <button
        onClick={() => setScreen({ type: 'cart' })}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Cart</span>
      </button>

      <h1 className="text-2xl font-extrabold text-slate-900">{t.checkout}</h1>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details Box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#0F2C59]" />
              <span>1. Delivery Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.customerName} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. S. Kumar"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.phone} *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +94 77 123 4567"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.streetAddress} *
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="House / Building No, Street Name, Landmark"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.city} *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City / Town"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.postalCode}
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="40000"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Delivery Instructions / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call before delivery, leave with neighbor..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/20"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-[#0F2C59]" />
              <span>2. {t.paymentMethod}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-[#0F2C59] bg-blue-50/50 ring-1 ring-[#0F2C59]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Cash on Delivery'}
                  onChange={() => setPaymentMethod('Cash on Delivery')}
                  className="mt-0.5 accent-[#0F2C59]"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    {t.cashOnDelivery}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Pay safely with cash upon receiving your order.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('Online Payment')}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'Online Payment'
                    ? 'border-[#0F2C59] bg-blue-50/50 ring-1 ring-[#0F2C59]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Online Payment'}
                  onChange={() => setPaymentMethod('Online Payment')}
                  className="mt-0.5 accent-[#0F2C59]"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    {t.onlinePayment}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Visa, Mastercard, Genie & direct bank transfer.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Confirmation */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Order Items ({cartWithProducts.length})
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartWithProducts.map(({ cartItem, product }) => {
                const effPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
                return (
                  <div key={cartItem.id} className="flex justify-between items-center text-xs">
                    <div className="pr-2">
                      <p className="font-semibold text-slate-800 line-clamp-1">{product.name}</p>
                      <p className="text-[10px] text-slate-400">
                        Qty: {cartItem.quantity} {cartItem.selectedVariant ? `• ${cartItem.selectedVariant}` : ''}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 flex-shrink-0">
                      {settings.currency} {(effPrice * cartItem.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
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
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>{t.total}</span>
                <span className="text-[#0F2C59] text-base">
                  {settings.currency} {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-[#0F2C59] hover:bg-blue-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Placing Your Order...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t.placeOrder}</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Direct Confirmation</span>
            </p>
            <p className="text-[11px] text-emerald-700">
              After placing the order, you will be able to send the full order summary directly to our WhatsApp support team for instant order tracking.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
