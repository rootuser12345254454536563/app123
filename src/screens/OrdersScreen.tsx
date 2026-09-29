import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Package,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

export const OrdersScreen: React.FC = () => {
  const { orders, t, settings, setScreen } = useStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Processing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Confirmed':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-[#0F2C59]" />
          <span>{t.myOrders}</span>
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center max-w-sm mx-auto space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-[#0F2C59] rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold text-slate-700">{t.emptyOrders}</p>
          <p className="text-xs text-slate-400">
            When you purchase items, your order history and live delivery tracking will appear here.
          </p>
          <button
            onClick={() => setScreen({ type: 'home' })}
            className="px-5 py-2.5 bg-[#0F2C59] text-white rounded-xl text-xs font-bold shadow-md"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {t.orderId}
                    </span>
                    <span className="text-sm font-mono font-extrabold text-[#0F2C59]">
                      {order.orderId}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formattedDate}</span>
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items & Address */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <p>
                    <strong className="text-slate-700">Items:</strong> {order.itemsSummary}
                  </p>
                  <p>
                    <strong className="text-slate-700">Delivery To:</strong> {order.deliveryAddress}
                  </p>
                </div>

                {/* Price and Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="text-xs">
                    <span className="text-slate-400">Total: </span>
                    <span className="text-base font-extrabold text-[#0F2C59]">
                      {settings.currency} {order.totalAmount.toLocaleString()}
                    </span>
                    <span className="text-slate-400 ml-1.5">({order.paymentMethod})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20BuyJump,%20checking%20status%20for%20Order%20${order.orderId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Support</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
