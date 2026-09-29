import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { FirestoreOrder } from '../services/marketplaceService';
import {
  User,
  Package,
  MapPin,
  Mail,
  Phone,
  LogOut,
  Edit2,
  Check,
  AlertCircle,
  Clock,
  Truck,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const {
    currentUser,
    userProfile,
    logout,
    updateUserFields,
    sendVerificationEmail,
    linkProvider
  } = useAuth();

  const { addresses, setDefaultAddress, deleteAddress, setScreen } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile?.fullName || '');
  const [editPhone, setEditPhone] = useState(userProfile?.phone || '');
  const [editPhotoURL, setEditPhotoURL] = useState(userProfile?.photoURL || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.fullName);
      setEditPhone(userProfile.phone || '');
      setEditPhotoURL(userProfile.photoURL || '');
    }
  }, [userProfile]);

  // Real-time listener for current user's orders in Firestore
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded: FirestoreOrder[] = [];
      snapshot.forEach(docSnap => {
        loaded.push(docSnap.data() as FirestoreOrder);
      });
      // Sort in memory by createdAt
      loaded.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setOrders(loaded);
      setIsLoadingOrders(false);
    }, (err) => {
      console.warn('Orders snapshot error:', err);
      setIsLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserFields({
      fullName: editName.trim(),
      phone: editPhone.trim(),
      photoURL: editPhotoURL.trim()
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSendVerification = async () => {
    await sendVerificationEmail();
    setVerificationSent(true);
    setTimeout(() => setVerificationSent(false), 5000);
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-[#0F2C59] to-[#1E3A8A] rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/10 ring-4 ring-white/20 overflow-hidden flex items-center justify-center flex-shrink-0">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-[#00D053]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{userProfile?.fullName || 'BUYJUMP Customer'}</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#00D053] border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider">
                {userProfile?.role || 'Customer'}
              </span>
            </div>
            <p className="text-xs text-blue-200/90">{userProfile?.email}</p>
            <p className="text-xs text-blue-300 font-mono mt-0.5">{userProfile?.phone || 'No phone set'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setScreen({ type: 'home' })}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Go Shopping
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

      {/* Email Verification Alert */}
      {!currentUser?.emailVerified && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Email not verified:</span> Please verify your email ({currentUser?.email}) to secure your account.
            </div>
          </div>
          <button
            onClick={handleSendVerification}
            disabled={verificationSent}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex-shrink-0"
          >
            {verificationSent ? 'Verification Link Sent!' : 'Send Verification Link'}
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#0F2C59] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#0F2C59] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'addresses'
              ? 'bg-[#0F2C59] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({addresses.length})</span>
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {isLoadingOrders ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-50 text-[#0F2C59] rounded-2xl flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
                <p className="text-xs text-slate-500 mt-1">Browse our genuine products and place your first order!</p>
              </div>
              <button
                onClick={() => setScreen({ type: 'home' })}
                className="px-5 py-2.5 bg-[#0F2C59] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Order ID</span>
                      <span className="text-sm font-mono font-extrabold text-[#0F2C59]">{ord.id}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        ord.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        ord.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-900'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700">
                    <p className="font-bold text-slate-900">Items Ordered:</p>
                    <div className="space-y-1.5 pl-2 border-l-2 border-slate-200">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span>{item.name} {item.selectedVariant ? `(${item.selectedVariant})` : ''} x {item.quantity}</span>
                          <span className="font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-500">Shipping to: </span>
                      <span className="font-medium text-slate-800">{ord.shippingAddress}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Total: </span>
                      <span className="text-base font-black text-[#0F2C59]">Rs. {ord.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Profile Details</h3>
              <p className="text-xs text-slate-500">Manage your private contact details</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Avatar / Photo URL</label>
                <input
                  type="text"
                  value={editPhotoURL}
                  onChange={(e) => setEditPhotoURL(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0F2C59] text-white font-bold rounded-xl"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-bold text-slate-500">Full Name:</span>
                <span className="font-semibold text-slate-900">{userProfile?.fullName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-bold text-slate-500">Email:</span>
                <span className="font-semibold text-slate-900">{userProfile?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-bold text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-900">{userProfile?.phone || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="font-bold text-slate-500">Sign-in Provider:</span>
                <span className="font-bold uppercase text-blue-700">{userProfile?.provider}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-bold text-slate-500">Account Role:</span>
                <span className="font-bold uppercase text-emerald-700">{userProfile?.role}</span>
              </div>
            </div>
          )}

          {/* Account Linking Section */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h4 className="font-bold text-xs text-slate-900">Linked Sign-in Providers</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => linkProvider('google')}
                className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-700"
              >
                + Link Google Account
              </button>
              <button
                onClick={() => linkProvider('facebook')}
                className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-700"
              >
                + Link Facebook Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Manage delivery addresses saved on your device</p>
            <button
              onClick={() => setScreen({ type: 'saved-addresses' })}
              className="px-3.5 py-1.5 bg-[#0F2C59] text-white rounded-xl text-xs font-bold"
            >
              + Add New Address
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{addr.fullName}</span>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{addr.streetAddress}</p>
                <p className="text-xs text-slate-600">{addr.city} {addr.postalCode ? `- ${addr.postalCode}` : ''}</p>
                <p className="text-xs text-slate-500 font-mono">{addr.phone}</p>

                {!addr.isDefault && (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 pt-1 block"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
