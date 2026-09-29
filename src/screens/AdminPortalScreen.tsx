import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase/config';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  FirestoreProduct,
  FirestoreOrder,
  updateOrderStatusInFirestore,
  deleteProductFromFirestore,
  updateProductInFirestore,
  sendTestWhatsAppMessage,
  getWhatsAppApiStatus,
  getWhatsAppLogs
} from '../services/marketplaceService';
import { UserProfileDoc, SellerProfileDoc } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Store,
  Package,
  ShoppingBag,
  MessageCircle,
  Settings,
  ArrowLeft,
  Search,
  Check,
  X,
  AlertTriangle,
  Send,
  RefreshCw,
  LogOut,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2
} from 'lucide-react';

export const AdminPortalScreen: React.FC = () => {
  const { currentUser, role, logout } = useAuth();
  const { setScreen } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sellers' | 'products' | 'orders' | 'whatsapp'>('overview');

  // Firestore Live State
  const [users, setUsers] = useState<UserProfileDoc[]>([]);
  const [sellers, setSellers] = useState<SellerProfileDoc[]>([]);
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);

  // Search queries
  const [userSearch, setUserSearch] = useState('');
  const [sellerSearch, setSellerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // WhatsApp State
  const [waStatus, setWaStatus] = useState<any>(null);
  const [waLogs, setWaLogs] = useState<any[]>([]);
  const [testPhone, setTestPhone] = useState('+94771234567');
  const [testMsg, setTestMsg] = useState('Hello from BUYJUMP! Your order notification service is active.');
  const [testSendResult, setTestSendResult] = useState<any>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Security Gate
  const isAdmin = Boolean(
    currentUser && (
      role === 'admin' ||
      currentUser.email?.toLowerCase() === 'admin@buyjump.com' ||
      currentUser.email?.toLowerCase() === 'vithusan2553@gmail.com'
    )
  );

  // 1. Subscribe to Users
  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const uList: UserProfileDoc[] = [];
      snap.forEach(d => uList.push(d.data() as UserProfileDoc));
      setUsers(uList);
    }, (err) => console.warn('Admin users snapshot error:', err));
    return () => unsub();
  }, [isAdmin]);

  // 2. Subscribe to Sellers
  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(collection(db, 'sellers'), (snap) => {
      const sList: SellerProfileDoc[] = [];
      snap.forEach(d => sList.push(d.data() as SellerProfileDoc));
      setSellers(sList);
    }, (err) => console.warn('Admin sellers snapshot error:', err));
    return () => unsub();
  }, [isAdmin]);

  // 3. Subscribe to Products
  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      const pList: FirestoreProduct[] = [];
      snap.forEach(d => pList.push(d.data() as FirestoreProduct));
      setProducts(pList);
    }, (err) => console.warn('Admin products snapshot error:', err));
    return () => unsub();
  }, [isAdmin]);

  // 4. Subscribe to Orders
  useEffect(() => {
    if (!isAdmin) return;
    const unsub = onSnapshot(collection(db, 'orders'), (snap) => {
      const oList: FirestoreOrder[] = [];
      snap.forEach(d => oList.push(d.data() as FirestoreOrder));
      oList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(oList);
    }, (err) => console.warn('Admin orders snapshot error:', err));
    return () => unsub();
  }, [isAdmin]);

  // 5. WhatsApp API check
  const refreshWhatsAppState = async () => {
    const statusData = await getWhatsAppApiStatus();
    const logsData = await getWhatsAppLogs();
    setWaStatus(statusData);
    setWaLogs(logsData.logs || []);
  };

  useEffect(() => {
    if (isAdmin) {
      refreshWhatsAppState();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Protected Admin Portal</h2>
          <p className="text-xs text-slate-500">
            You must be logged in as an authorized BUYJUMP administrator to view this portal.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => setScreen({ type: 'login' })}
              className="py-3 px-4 bg-[#0F2C59] hover:bg-blue-900 text-white rounded-xl text-xs font-bold"
            >
              Sign In as Administrator
            </button>
            <button
              onClick={() => setScreen({ type: 'home' })}
              className="py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Action Handlers
  const handleUpdateUserStatus = async (uid: string, status: 'active' | 'suspended') => {
    await updateDoc(doc(db, 'users', uid), { status, updatedAt: serverTimestamp() });
  };

  const handleUpdateSellerStatus = async (uid: string, status: 'approved' | 'rejected' | 'suspended') => {
    await updateDoc(doc(db, 'sellers', uid), {
      status,
      approvedAt: status === 'approved' ? serverTimestamp() : null,
      approvedBy: currentUser?.uid,
      updatedAt: serverTimestamp()
    });
    // Also update role in users collection
    await updateDoc(doc(db, 'users', uid), {
      role: 'seller',
      status: status === 'approved' ? 'active' : 'suspended',
      updatedAt: serverTimestamp()
    });
  };

  const handleToggleProductStatus = async (pId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
    await updateProductInFirestore(pId, { status: newStatus as any });
  };

  const handleDeleteProduct = async (pId: string) => {
    if (confirm('Delete this product from marketplace catalog?')) {
      await deleteProductFromFirestore(pId);
    }
  };

  const handleChangeOrderStatus = async (ord: FirestoreOrder, newStatus: FirestoreOrder['status']) => {
    await updateOrderStatusInFirestore(ord.id, newStatus, ord.customerPhone, ord.customerName);
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingTest(true);
    setTestSendResult(null);
    try {
      const res = await sendTestWhatsAppMessage(testPhone, testMsg);
      setTestSendResult(res);
      refreshWhatsAppState();
    } catch (err: any) {
      setTestSendResult({ success: false, error: err.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl p-1 bg-white border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
            <img src="/images/buyjump_logo.jpg" alt="BUYJUMP" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>BUYJUMP Master Admin</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                Active
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Logged in as: <strong className="text-slate-800 font-mono">{currentUser?.email}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScreen({ type: 'home' })}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Buyer Storefront
          </button>
          <button
            onClick={() => {
              logout();
              setScreen({ type: 'home' });
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Sales</span>
          <p className="text-xl font-black text-[#0F2C59] mt-1">Rs. {totalRevenue.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">{orders.length} orders recorded</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Users</span>
          <p className="text-xl font-black text-slate-900 mt-1">{users.length}</p>
          <p className="text-[10px] text-blue-600 font-semibold">Registered accounts</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Sellers</span>
          <p className="text-xl font-black text-slate-900 mt-1">{sellers.length}</p>
          <p className="text-[10px] text-amber-600 font-semibold">
            {sellers.filter(s => s.status === 'pending').length} pending approval
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Products</span>
          <p className="text-xl font-black text-slate-900 mt-1">{products.length}</p>
          <p className="text-[10px] text-slate-500 font-semibold">Active catalog items</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">WhatsApp Cloud API</span>
          <p className={`text-sm font-black mt-1 ${waStatus?.configured ? 'text-emerald-600' : 'text-amber-600'}`}>
            {waStatus?.configured ? '● Connected' : '○ Standby / Simulated'}
          </p>
          <p className="text-[10px] text-slate-400">{waLogs.length} logged messages</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sellers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sellers ({sellers.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'products' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'whatsapp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          WhatsApp Cloud API
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Sellers Alert Box */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-500" />
                <span>Seller Applications Pending Verification</span>
              </h3>
              <button onClick={() => setActiveTab('sellers')} className="text-xs font-bold text-blue-600">View All →</button>
            </div>

            {sellers.filter(s => s.status === 'pending').length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No pending seller applications.</p>
            ) : (
              <div className="space-y-2.5">
                {sellers.filter(s => s.status === 'pending').map(s => (
                  <div key={s.uid} className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{s.businessName}</p>
                      <p className="text-[11px] text-slate-500">{s.fullName} • {s.phone} • {s.address}</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleUpdateSellerStatus(s.uid, 'approved')}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateSellerStatus(s.uid, 'rejected')}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px]"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#0F2C59]" />
                <span>Recent Customer Orders</span>
              </h3>
              <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-blue-600">View All →</button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No customer orders yet.</p>
            ) : (
              <div className="space-y-2.5">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{o.id}</p>
                      <p className="text-[11px] text-slate-500">{o.customerName} • {o.customerPhone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-[#0F2C59]">Rs. {o.totalAmount.toLocaleString()}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name, email or phone..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500">{users.length} total users in Firestore</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Provider</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.filter(u => {
                    const q = userSearch.toLowerCase();
                    return u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
                  }).map(u => (
                    <tr key={u.uid} className="hover:bg-slate-50/70">
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{u.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">UID: {u.uid}</p>
                      </td>
                      <td className="p-3.5">
                        <p className="text-slate-800">{u.email}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{u.phone || 'No phone'}</p>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="p-3.5 uppercase font-mono text-[10px] text-slate-500">
                        {u.provider}
                      </td>
                      <td className="p-3.5 text-right">
                        {u.role !== 'admin' && (
                          u.status === 'suspended' ? (
                            <button
                              onClick={() => handleUpdateUserStatus(u.uid, 'active')}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[11px]"
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateUserStatus(u.uid, 'suspended')}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-[11px]"
                            >
                              Suspend
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SELLER MANAGEMENT */}
      {activeTab === 'sellers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={sellerSearch}
                onChange={(e) => setSellerSearch(e.target.value)}
                placeholder="Search sellers by store name, person, address..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500">{sellers.length} registered merchants</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-3.5">Store & Owner</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Address</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellers.filter(s => {
                    const q = sellerSearch.toLowerCase();
                    return s.businessName?.toLowerCase().includes(q) || s.fullName?.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q);
                  }).map(s => (
                    <tr key={s.uid} className="hover:bg-slate-50/70">
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{s.businessName}</p>
                        <p className="text-[11px] text-slate-500">{s.fullName}</p>
                      </td>
                      <td className="p-3.5">
                        <p className="text-slate-800">{s.email}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{s.phone}</p>
                      </td>
                      <td className="p-3.5 text-slate-700 max-w-xs truncate">
                        {s.address}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          s.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          s.status === 'pending' ? 'bg-amber-100 text-amber-900' :
                          s.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-slate-200 text-slate-800'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateSellerStatus(s.uid, 'approved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px]"
                            >
                              Approve
                            </button>
                          )}
                          {s.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateSellerStatus(s.uid, 'suspended')}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg font-bold text-[11px]"
                            >
                              Suspend
                            </button>
                          )}
                          {s.status !== 'rejected' && s.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateSellerStatus(s.uid, 'rejected')}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-[11px]"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by title or seller..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500">{products.length} marketplace listings</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Seller</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.filter(p => {
                    const q = productSearch.toLowerCase();
                    return p.name?.toLowerCase().includes(q) || p.sellerName?.toLowerCase().includes(q);
                  }).map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={p.imageUrl || '/images/buyjump_logo.jpg'}
                          alt={p.name}
                          className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-slate-50 p-1 flex-shrink-0"
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
                      <td className="p-3.5 text-slate-800 font-medium">{p.sellerName || 'Direct Store'}</td>
                      <td className="p-3.5 font-extrabold text-[#0F2C59]">
                        Rs. {(p.discountPrice || p.price).toLocaleString()}
                      </td>
                      <td className="p-3.5">{p.stock} units</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleProductStatus(p.id, p.status)}
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase cursor-pointer ${
                            p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {p.status}
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search orders by ID, customer, phone..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500">{orders.length} total orders</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-3.5">Order ID & Date</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Shipping Address</th>
                    <th className="p-3.5">Total</th>
                    <th className="p-3.5">Update Status</th>
                    <th className="p-3.5 text-right">WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.filter(o => {
                    const q = orderSearch.toLowerCase();
                    return o.id?.toLowerCase().includes(q) || o.customerName?.toLowerCase().includes(q) || o.customerPhone?.includes(q);
                  }).map(ord => (
                    <tr key={ord.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-900 block">{ord.id}</span>
                        <span className="text-[10px] text-slate-400">
                          {ord.createdAt?.seconds ? new Date(ord.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{ord.customerName}</span>
                        <span className="text-[11px] text-slate-500 font-mono">{ord.customerPhone}</span>
                      </td>
                      <td className="p-3.5 text-slate-700 max-w-xs truncate">{ord.shippingAddress}</td>
                      <td className="p-3.5 font-extrabold text-[#0F2C59]">
                        Rs. {ord.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={ord.status}
                          onChange={(e) => handleChangeOrderStatus(ord, e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-1 text-[11px] font-bold text-slate-800"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        <a
                          href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                            ord.customerName
                          )},%20BUYJUMP%20Order%20${ord.id}%20status%20is%20${ord.status}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-[11px]"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Direct WA</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: WHATSAPP CLOUD API MANAGEMENT */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          {/* Status & Configuration Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">Official Meta WhatsApp Cloud API Service</h3>
              </div>
              <button
                onClick={refreshWhatsAppState}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Status</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Connection State</span>
                <p className={`font-black text-sm ${waStatus?.configured ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {waStatus?.configured ? 'Live API Credentials Active' : 'Standby / Local Test Simulation'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">{waStatus?.instructions}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Webhook Endpoint</span>
                <p className="font-mono text-slate-800 text-[11px]">/api/whatsapp/webhook</p>
                <p className="text-[11px] text-slate-500">Supported methods: GET (Verification) & POST (Events)</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Environment Variables</span>
                <p className="font-mono text-[10px] text-slate-600">WHATSAPP_ACCESS_TOKEN</p>
                <p className="font-mono text-[10px] text-slate-600">WHATSAPP_PHONE_NUMBER_ID</p>
                <p className="font-mono text-[10px] text-slate-600">WHATSAPP_VERIFY_TOKEN</p>
              </div>
            </div>
          </div>

          {/* Test Sender & Audit Log Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Message Form */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-extrabold text-sm text-slate-900">Send Test WhatsApp Cloud Notification</h4>

              {testSendResult && (
                <div className={`p-3 rounded-2xl text-xs font-semibold ${
                  testSendResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {testSendResult.success ? (
                    <div>
                      <p className="font-bold">Message Dispatched!</p>
                      <p className="text-[11px] font-mono mt-0.5">{testSendResult.note || 'ID: ' + testSendResult.messageId}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold">Failed to send:</p>
                      <p className="text-[11px]">{testSendResult.error}</p>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSendTestMessage} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Phone Number (with Country Code)</label>
                  <input
                    type="tel"
                    required
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+94771234567"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Test Message Body</label>
                  <textarea
                    rows={3}
                    required
                    value={testMsg}
                    onChange={(e) => setTestMsg(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSendingTest ? 'Sending via Meta API...' : 'Send Test WhatsApp Message'}</span>
                </button>
              </form>
            </div>

            {/* Live Message Delivery Audit Logs */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-sm text-slate-900">Message Delivery Audit Logs ({waLogs.length})</h4>
                <button onClick={refreshWhatsAppState} className="text-xs font-bold text-blue-600 hover:underline">Refresh</button>
              </div>

              {waLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-10 text-center italic">No messages logged yet.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {waLogs.map((log: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800">{log.phone}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase ${
                          log.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                          log.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          log.status === 'read' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{log.payload?.textMessage || log.payload?.templateName || log.type}</p>
                      <span className="text-[9px] text-slate-400 block font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
