import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Truck,
  ArrowRight,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export const OrderSuccessScreen: React.FC = () => {
  const { screen, orders, settings, setScreen, t } = useStore();
  const [copied, setCopied] = useState(false);

  const orderId = screen.orderId;
  const order = orders.find((o) => o.orderId === orderId) || orders[0];

  const handleCopyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = order ? `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `🎉 *NEW ORDER CONFIRMATION - ${settings.storeName}*\n\n` +
    `*Order ID:* ${order.orderId}\n` +
    `*Customer:* ${order.customerName}\n` +
    `*Phone:* ${order.customerPhone}\n` +
    `*Delivery Address:* ${order.deliveryAddress}\n\n` +
    `*Items Ordered:*\n${order.itemsSummary}\n\n` +
    `*Subtotal:* ${settings.currency} ${order.subtotal.toLocaleString()}\n` +
    `*Delivery Fee:* ${settings.currency} ${order.deliveryFee.toLocaleString()}\n` +
    `*Total Payable:* ${settings.currency} ${order.totalAmount.toLocaleString()}\n` +
    `*Payment Method:* ${order.paymentMethod}\n\n` +
    `Please confirm dispatch status. Thank you!`
  )}` : '#';

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Order Information</h2>
        <p className="text-xs text-slate-500">Thank you for your purchase!</p>
        <button
          onClick={() => setScreen({ type: 'home' })}
          className="px-5 py-2.5 bg-[#0F2C59] text-white rounded-xl text-xs font-bold"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6 text-center pb-20">
      {/* Celebration Icon */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md animate-in zoom-in">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t.orderSuccess}
        </h1>
        <p className="text-xs text-slate-500">
          Thank you, <strong className="text-slate-800">{order.customerName}</strong>! Your order has been placed with BuyJump.
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-left">
        {/* Order ID Pill */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              {t.orderId}
            </span>
            <span className="text-sm sm:text-base font-mono font-extrabold text-[#0F2C59]">
              {order.orderId}
            </span>
          </div>
          <button
            onClick={handleCopyOrderId}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Order Details Breakdown */}
        <div className="space-y-2.5 text-xs text-slate-600 divide-y divide-slate-100">
          <div className="pt-2 flex justify-between">
            <span className="font-medium text-slate-500">{t.customerName}:</span>
            <span className="font-bold text-slate-800">{order.customerName}</span>
          </div>
          <div className="pt-2 flex justify-between">
            <span className="font-medium text-slate-500">{t.phone}:</span>
            <span className="font-bold text-slate-800">{order.customerPhone}</span>
          </div>
          <div className="pt-2 flex justify-between">
            <span className="font-medium text-slate-500">{t.deliveryAddress}:</span>
            <span className="font-bold text-slate-800 text-right max-w-xs">{order.deliveryAddress}</span>
          </div>
          <div className="pt-2 flex justify-between">
            <span className="font-medium text-slate-500">{t.paymentMethod}:</span>
            <span className="font-bold text-slate-800">{order.paymentMethod}</span>
          </div>
          <div className="pt-2 flex justify-between">
            <span className="font-medium text-slate-500">Items:</span>
            <span className="font-medium text-slate-800 text-right max-w-xs">{order.itemsSummary}</span>
          </div>
          <div className="pt-3 flex justify-between text-sm font-extrabold text-slate-900">
            <span>{t.total}:</span>
            <span className="text-[#0F2C59] text-base">
              {settings.currency} {order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-700" />
            <span className="font-semibold text-amber-800">Current Status:</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[11px]">
            {order.status}
          </span>
        </div>
      </div>

      {/* WhatsApp Confirmation Action Button */}
      <div className="space-y-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{t.sendWhatsAppOrder}</span>
        </a>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setScreen({ type: 'my-orders' })}
            className="py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors"
          >
            {t.myOrders}
          </button>
          <button
            onClick={() => setScreen({ type: 'home' })}
            className="py-2.5 px-4 rounded-xl bg-[#0F2C59] hover:bg-blue-900 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
