import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MapPin, Plus, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react';

export const SavedAddressesScreen: React.FC = () => {
  const { addresses, addAddress, deleteAddress, setDefaultAddress, t, setScreen } = useStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !streetAddress || !city) return;

    addAddress({
      fullName,
      phone,
      streetAddress,
      city,
      postalCode,
      isDefault: addresses.length === 0
    });

    setFullName('');
    setPhone('');
    setStreetAddress('');
    setCity('');
    setPostalCode('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 pb-16 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setScreen({ type: 'account' })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account</span>
        </button>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-1.5 bg-[#0F2C59] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.addNewAddress}</span>
        </button>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-[#0F2C59]" />
        <span>{t.savedAddresses}</span>
      </h1>

      {/* Add Address Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900">{t.addNewAddress}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Receiver name"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
              <input
                type="text"
                required
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="Street address / Landmark"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City / Town *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Postal code"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#0F2C59] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Save Address
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address List */}
      <div className="space-y-3">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-4 rounded-2xl bg-white border transition-all ${
              addr.isDefault
                ? 'border-[#0F2C59] ring-1 ring-[#0F2C59] shadow-xs'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">{addr.fullName}</h4>
                  {addr.isDefault && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#0F2C59] text-[10px] font-bold">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">{addr.streetAddress}</p>
                <p className="text-xs text-slate-600">
                  {addr.city} {addr.postalCode ? `- ${addr.postalCode}` : ''}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono">{addr.phone}</p>
              </div>

              <div className="flex items-center gap-2">
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Set as Default
                  </button>
                )}
                {addresses.length > 1 && (
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
