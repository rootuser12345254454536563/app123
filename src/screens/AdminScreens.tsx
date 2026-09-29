import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Order } from '../types';
import { AdminLoginScreen } from './AdminLoginScreen';
import {
  ShieldCheck,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  MessageCircle,
  Settings,
  ArrowLeft,
  Search,
  ExternalLink,
  Lock,
  LogOut
} from 'lucide-react';

export const AdminScreens: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    settings,
    updateSettings,
    categories,
    setScreen,
    isAdminAuthenticated,
    adminLogout,
    t
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');

  // Guard protected admin screens
  if (!isAdminAuthenticated) {
    return <AdminLoginScreen />;
  }

  // Product Add / Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.name || 'Electronics & Gadgets');
  const [formBrand, setFormBrand] = useState('BuyJump');
  const [formPrice, setFormPrice] = useState('1500');
  const [formDiscountPrice, setFormDiscountPrice] = useState('1200');
  const [formStock, setFormStock] = useState('25');
  const [formSku, setFormSku] = useState('BJ-NEW-01');
  const [formVariants, setFormVariants] = useState('Default');
  const [formDesc, setFormDesc] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [formImages, setFormImages] = useState('/images/buyjump_logo.jpg');
  const [formIsFeatured, setFormIsFeatured] = useState(true);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);

  // Settings form state
  const [settingStoreName, setSettingStoreName] = useState(settings.storeName);
  const [settingPhone, setSettingPhone] = useState(settings.storePhone);
  const [settingWhatsApp, setSettingWhatsApp] = useState(settings.whatsappNumber);
  const [settingEmail, setSettingEmail] = useState(settings.storeEmail);
  const [settingAddress, setSettingAddress] = useState(settings.storeAddress);
  const [settingDeliveryFee, setSettingDeliveryFee] = useState(String(settings.deliveryFee));
  const [settingCurrency, setSettingCurrency] = useState(settings.currency);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Search filter for admin products
  const [adminProductSearch, setAdminProductSearch] = useState('');

  // Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockProducts = products.filter((p) => p.stockQuantity < 10);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory(categories[0]?.name || 'Electronics & Gadgets');
    setFormBrand('BuyJump');
    setFormPrice('1500');
    setFormDiscountPrice('1200');
    setFormStock('25');
    setFormSku(`PKV-${Math.floor(100 + Math.random() * 900)}`);
    setFormVariants('Standard');
    setFormDesc('High quality product sourced directly.');
    setFormSpecs('Origin: Sri Lanka\nWarranty: 6 Months');
    setFormImages('/images/ic_store_logo.jpg');
    setFormIsFeatured(true);
    setFormIsBestSeller(false);
    setIsAddingProduct(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormBrand(p.brand);
    setFormPrice(String(p.price));
    setFormDiscountPrice(String(p.discountPrice));
    setFormStock(String(p.stockQuantity));
    setFormSku(p.sku);
    setFormVariants(p.variants);
    setFormDesc(p.description);
    setFormSpecs(p.specifications);
    setFormImages(p.images);
    setFormIsFeatured(p.isFeatured);
    setFormIsBestSeller(p.isBestSeller);
    setIsAddingProduct(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const productPayload = {
      name: formName.trim(),
      description: formDesc.trim(),
      price: parseFloat(formPrice) || 0,
      discountPrice: parseFloat(formDiscountPrice) || 0,
      stockQuantity: parseInt(formStock, 10) || 0,
      category: formCategory,
      brand: formBrand.trim(),
      sku: formSku.trim(),
      specifications: formSpecs.trim(),
      variants: formVariants.trim(),
      weight: 'Standard',
      images: formImages.trim() || '/images/ic_store_logo.jpg',
      isFeatured: formIsFeatured,
      isBestSeller: formIsBestSeller,
      isNewArrival: true,
      isVisible: true
    };

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...productPayload
      });
    } else {
      addProduct(productPayload);
    }

    setIsAddingProduct(false);
    setEditingProduct(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: settingStoreName,
      appName: settingStoreName,
      storePhone: settingPhone,
      whatsappNumber: settingWhatsApp,
      storeEmail: settingEmail,
      storeAddress: settingAddress,
      deliveryFee: parseFloat(settingDeliveryFee) || 0,
      currency: settingCurrency
    });
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2000);
  };

  const filteredProducts = products.filter((p) => {
    if (!adminProductSearch) return true;
    const q = adminProductSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl p-1 bg-white border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
            <img
              src="/images/buyjump_logo.jpg"
              alt="BuyJump Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>BuyJump Admin Portal</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  Live
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Inventory, customer orders, and store settings
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {/* Tab switch buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Settings
            </button>
          </div>

          <button
            onClick={() => setScreen({ type: 'home' })}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </button>

          <button
            onClick={adminLogout}
            className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Log Out of Admin Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">Total Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {settings.currency} {totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">From recorded orders</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{orders.length}</p>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">
            {orders.filter((o) => o.status === 'Pending').length} pending dispatch
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">Active Products</span>
            <Package className="w-4 h-4 text-[#0F2C59]" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{products.length}</p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">Across {categories.length} categories</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">Low Stock Warning</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{lowStockProducts.length}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Items below 10 units</p>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders Preview */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900">Recent Customer Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  View All ({orders.length}) →
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center italic">No customer orders received yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{ord.orderId}</p>
                        <p className="text-slate-500">{ord.customerName} • {ord.customerPhone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-[#0F2C59]">
                          {settings.currency} {ord.totalAmount.toLocaleString()}
                        </p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900">Inventory Health</h3>
                <button
                  onClick={() => setActiveTab('products')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Manage Stock →
                </button>
              </div>

              <div className="space-y-3">
                {products.slice(0, 5).map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800 line-clamp-1">{prod.name}</p>
                      <p className="text-slate-400">SKU: {prod.sku}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          prod.stockQuantity < 10
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prod.stockQuantity} in stock
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={adminProductSearch}
                onChange={(e) => setAdminProductSearch(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15"
              />
            </div>

            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-[#0F2C59] hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addProduct}</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const hasDiscount = p.discountPrice > 0 && p.discountPrice < p.price;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 flex items-center gap-3">
                          <img
                            src={p.images.split(',')[0].trim() || '/images/ic_store_logo.jpg'}
                            alt={p.name}
                            className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-slate-50 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/ic_store_logo.jpg';
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">{p.category}</td>
                        <td className="p-3">
                          <span className="font-extrabold text-[#0F2C59]">
                            {settings.currency} {(hasDiscount ? p.discountPrice : p.price).toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-slate-400 line-through block">
                              {settings.currency} {p.price.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              p.stockQuantity < 10
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.stockQuantity} units
                          </span>
                        </td>
                        <td className="p-3">
                          {p.isFeatured && (
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold mr-1">
                              Featured
                            </span>
                          )}
                          {p.isBestSeller && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                              Best Seller
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete ${p.name}?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-rose-600"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {orders.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-400">No orders placed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Order ID & Date</th>
                      <th className="p-3">Customer & Phone</th>
                      <th className="p-3">Delivery Address</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <span className="font-mono font-bold text-slate-900 block">{ord.orderId}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-800 block">{ord.customerName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{ord.customerPhone}</span>
                        </td>
                        <td className="p-3 text-slate-600 max-w-xs truncate">{ord.deliveryAddress}</td>
                        <td className="p-3">
                          <span className="font-extrabold text-[#0F2C59]">
                            {settings.currency} {ord.totalAmount.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{ord.paymentMethod}</span>
                        </td>
                        <td className="p-3">
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.orderId, e.target.value as Order['status'])}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-[11px] font-bold text-slate-700"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <a
                            href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                              ord.customerName
                            )},%20this%20is%20${encodeURIComponent(
                              settings.storeName
                            )}%20updating%20you%20regarding%20Order%20${ord.orderId}:%20Current%20Status%20is%20${ord.status}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px]"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: STORE SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 max-w-2xl">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#0F2C59]" />
            <span>Store Configuration & WhatsApp Integration</span>
          </h3>

          {settingsSavedToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Store settings saved successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                required
                value={settingStoreName}
                onChange={(e) => setSettingStoreName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Order Number *</label>
              <input
                type="text"
                required
                value={settingWhatsApp}
                onChange={(e) => setSettingWhatsApp(e.target.value)}
                placeholder="+94771234567"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
              />
              <span className="text-[10px] text-slate-400">Orders and inquiries are directed to this number.</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Phone</label>
              <input
                type="text"
                required
                value={settingPhone}
                onChange={(e) => setSettingPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Email</label>
              <input
                type="email"
                required
                value={settingEmail}
                onChange={(e) => setSettingEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Physical Store Address</label>
              <input
                type="text"
                required
                value={settingAddress}
                onChange={(e) => setSettingAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Standard Delivery Fee</label>
              <input
                type="number"
                required
                value={settingDeliveryFee}
                onChange={(e) => setSettingDeliveryFee(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                required
                value={settingCurrency}
                onChange={(e) => setSettingCurrency(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0F2C59] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md"
            >
              {t.saveChanges}
            </button>
          </div>
        </form>
      )}

      {/* Add / Edit Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsAddingProduct(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ceylon Spices Gift Box"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Regular Price ({settings.currency}) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Price ({settings.currency})</label>
                  <input
                    type="number"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                    placeholder="Leave 0 if no discount"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white uppercase font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Variants (comma separated)</label>
                  <input
                    type="text"
                    value={formVariants}
                    onChange={(e) => setFormVariants(e.target.value)}
                    placeholder="e.g. 250g, 500g, 1kg OR S, M, L, XL"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Image URL / Path</label>
                  <input
                    type="text"
                    value={formImages}
                    onChange={(e) => setFormImages(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  ></textarea>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Specifications (Key: Value per line)</label>
                  <textarea
                    rows={2}
                    value={formSpecs}
                    onChange={(e) => setFormSpecs(e.target.value)}
                    placeholder="Origin: Sri Lanka&#10;Material: 100% Cotton"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  ></textarea>
                </div>

                <div className="sm:col-span-2 flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="accent-[#0F2C59] rounded"
                    />
                    <span className="font-semibold text-slate-700">Featured on Home</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsBestSeller}
                      onChange={(e) => setFormIsBestSeller(e.target.checked)}
                      className="accent-[#0F2C59] rounded"
                    />
                    <span className="font-semibold text-slate-700">Best Seller Tag</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0F2C59] text-white rounded-xl font-bold hover:bg-blue-900"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
