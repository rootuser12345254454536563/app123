import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import {
  FirestoreProduct,
  FirestoreOrder,
  createProductInFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  uploadImageToStorage
} from '../services/marketplaceService';
import {
  Store,
  Package,
  ShoppingBag,
  Plus,
  DollarSign,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Upload,
  LogOut,
  X,
  Clock,
  ShieldCheck,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { currentUser, sellerProfile, logout, isSellerApproved } = useAuth();
  const { categories, setScreen } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'profile'>('products');
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FirestoreProduct | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.name || 'Electronics & Gadgets');
  const [formPrice, setFormPrice] = useState('2500');
  const [formDiscountPrice, setFormDiscountPrice] = useState('2200');
  const [formStock, setFormStock] = useState('20');
  const [formDescription, setFormDescription] = useState('');
  const [formVariants, setFormVariants] = useState('Standard');
  const [formImageUrl, setFormImageUrl] = useState('/images/buyjump_logo.jpg');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listen to seller's products
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'products'),
      where('sellerId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: FirestoreProduct[] = [];
      snapshot.forEach(docSnap => {
        prods.push(docSnap.data() as FirestoreProduct);
      });
      setProducts(prods);
      setIsLoading(false);
    }, (err) => {
      console.warn('Seller products query error:', err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Listen to seller's orders
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'orders'),
      where('sellerId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ords: FirestoreOrder[] = [];
      snapshot.forEach(docSnap => {
        ords.push(docSnap.data() as FirestoreOrder);
      });
      setOrders(ords);
    }, (err) => {
      console.warn('Seller orders query error:', err);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory(categories[0]?.name || 'Electronics & Gadgets');
    setFormPrice('2500');
    setFormDiscountPrice('2200');
    setFormStock('20');
    setFormDescription('Authentic product with standard manufacturer warranty.');
    setFormVariants('Standard');
    setFormImageUrl('/images/buyjump_logo.jpg');
    setImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: FirestoreProduct) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(String(p.price));
    setFormDiscountPrice(p.discountPrice ? String(p.discountPrice) : '');
    setFormStock(String(p.stock));
    setFormDescription(p.description);
    setFormVariants(p.variants || 'Standard');
    setFormImageUrl(p.imageUrl);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);

    let finalImageUrl = formImageUrl;
    if (imageFile) {
      finalImageUrl = await uploadImageToStorage(imageFile, 'products');
    }

    const payload = {
      sellerId: currentUser.uid,
      sellerName: sellerProfile?.businessName || sellerProfile?.fullName || 'BUYJUMP Merchant',
      name: formName.trim(),
      category: formCategory,
      price: parseFloat(formPrice) || 0,
      discountPrice: formDiscountPrice ? parseFloat(formDiscountPrice) : undefined,
      stock: parseInt(formStock, 10) || 0,
      description: formDescription.trim(),
      variants: formVariants.trim(),
      imageUrl: finalImageUrl,
      status: 'active' as const
    };

    if (editingProduct) {
      await updateProductInFirestore(editingProduct.id, payload);
    } else {
      await createProductInFirestore(payload);
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleDeleteProduct = async (pId: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from your store?`)) {
      await deleteProductFromFirestore(pId);
    }
  };

  // Status banners if not approved
  const isPending = sellerProfile?.status === 'pending';
  const isRejected = sellerProfile?.status === 'rejected';
  const isSuspended = sellerProfile?.status === 'suspended';

  const totalSalesRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/10 ring-4 ring-white/20 flex items-center justify-center flex-shrink-0">
            <Store className="w-8 h-8 text-[#00D053]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{sellerProfile?.businessName || 'Seller Storefront'}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                sellerProfile?.status === 'approved' ? 'bg-[#00D053] text-slate-950' :
                sellerProfile?.status === 'pending' ? 'bg-amber-400 text-slate-950' :
                'bg-rose-500 text-white'
              }`}>
                {sellerProfile?.status || 'Pending'}
              </span>
            </div>
            <p className="text-xs text-emerald-200">{sellerProfile?.fullName} • {sellerProfile?.phone}</p>
            <p className="text-xs text-emerald-300 font-mono mt-0.5">{sellerProfile?.address}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setScreen({ type: 'home' })}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Buyer Storefront
          </button>
          <button
            onClick={() => {
              logout();
              setScreen({ type: 'home' });
            }}
            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Non-Approved Status Alert */}
      {!isSellerApproved && (
        <div className="p-5 rounded-2xl border bg-amber-50 border-amber-200 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>
              {isPending && 'Seller Registration Pending Approval'}
              {isRejected && 'Seller Registration Rejected'}
              {isSuspended && 'Seller Account Suspended'}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-amber-800">
            {isPending && 'Thank you for registering your store with BUYJUMP! Our marketplace administration team is currently verifying your business details. You will receive full access to publish listings, manage stock, and process orders once approved.'}
            {isRejected && 'Your seller application could not be approved at this time. If you believe this is in error, please contact us at support@buyjump.com.'}
            {isSuspended && 'Your seller capabilities have been temporarily paused by administration. Please reach out to admin@buyjump.com to reactivate your store.'}
          </p>
        </div>
      )}

      {/* Metrics Row (if approved) */}
      {isSellerApproved && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Products</span>
              <Package className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{products.length}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Listed in BUYJUMP catalog</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Customer Orders</span>
              <ShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{orders.length}</p>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">Direct store sales</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Store Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">Rs. {totalSalesRevenue.toLocaleString()}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Gross order total</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs (only active if approved) */}
      {isSellerApproved && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({orders.length})</span>
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          )}
        </div>
      )}

      {/* TAB 1: PRODUCTS LIST */}
      {isSellerApproved && activeTab === 'products' && (
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Your store has no products yet</h3>
                <p className="text-xs text-slate-500 mt-1">Start by adding your first product to sell on BUYJUMP.</p>
              </div>
              <button
                onClick={openAddModal}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                + Add First Product
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Price</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={p.imageUrl || '/images/buyjump_logo.jpg'}
                            alt={p.name}
                            className="w-11 h-11 object-contain rounded-xl border border-slate-200 bg-slate-50 p-1 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/buyjump_logo.jpg';
                            }}
                          />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {p.id}</p>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600">{p.category}</td>
                        <td className="p-3.5">
                          <span className="font-extrabold text-[#0F2C59]">Rs. {(p.discountPrice || p.price).toLocaleString()}</span>
                          {p.discountPrice && (
                            <span className="text-[10px] text-slate-400 line-through block">Rs. {p.price.toLocaleString()}</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            p.stock < 10 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-700"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-rose-600"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ORDERS LIST */}
      {isSellerApproved && activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              No orders have been received for your products yet.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="font-mono font-bold text-xs text-slate-900">{ord.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700">
                    <p><strong>Customer:</strong> {ord.customerName} ({ord.customerPhone})</p>
                    <p><strong>Address:</strong> {ord.shippingAddress}</p>
                    <p className="mt-1"><strong>Total:</strong> Rs. {ord.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
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
                    placeholder="e.g. Wireless Bluetooth Earbuds Pro"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Price (Rs.)</label>
                  <input
                    type="number"
                    value={formDiscountPrice}
                    onChange={(e) => setFormDiscountPrice(e.target.value)}
                    placeholder="Optional promotional price"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Product Image (Firebase Storage Upload)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                      className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                  </div>
                  {imageFile ? (
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">Ready to upload: {imageFile.name}</p>
                  ) : (
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="Or paste an image URL"
                      className="w-full mt-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-mono"
                    />
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Variants (Optional)</label>
                  <input
                    type="text"
                    value={formVariants}
                    onChange={(e) => setFormVariants(e.target.value)}
                    placeholder="e.g. Black, White OR 250g, 500g"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add to Catalog')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
