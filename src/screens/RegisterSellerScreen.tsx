import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  User,
  Store,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export const RegisterSellerScreen: React.FC = () => {
  const { registerSeller, loginWithGoogle, loginWithFacebook } = useAuth();
  const { setScreen } = useStore();

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [providerConfigHelp, setProviderConfigHelp] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setProviderConfigHelp(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      await registerSeller(fullName, businessName, email, phone, address, password);
      setScreen({ type: 'seller-dashboard' });
    } catch (err: any) {
      console.error('Seller registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email already exists. Please log in.');
      } else {
        setErrorMessage(err.message || 'Failed to register seller.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSellerRegister = async () => {
    if (!businessName.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('Please fill in Store Name, Phone Number, and Address before continuing with Google.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    try {
      await loginWithGoogle('seller', {
        businessName: businessName.trim(),
        phone: phone.trim(),
        address: address.trim()
      });
      setScreen({ type: 'seller-dashboard' });
    } catch (err: any) {
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        setProviderConfigHelp('Google Sign-in is not enabled in Firebase Console.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Google seller registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSellerRegister = async () => {
    if (!businessName.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('Please fill in Store Name, Phone Number, and Address before continuing with Facebook.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    try {
      await loginWithFacebook('seller', {
        businessName: businessName.trim(),
        phone: phone.trim(),
        address: address.trim()
      });
      setScreen({ type: 'seller-dashboard' });
    } catch (err: any) {
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        setProviderConfigHelp('Facebook Login is not enabled in Firebase Console.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Facebook seller registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl p-1 bg-white border border-slate-100 shadow-md flex items-center justify-center">
            <img
              src="/images/buyjump_logo.jpg"
              alt="BUYJUMP Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-black text-[#0F2C59]">Register as Seller</h1>
          <p className="text-xs text-slate-500">
            Open your storefront on BUYJUMP and reach thousands of verified buyers
          </p>
        </div>

        {/* Notice about approval */}
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-blue-900 text-xs">
          <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Seller Verification Process:</strong> Newly registered seller accounts are submitted in <em>pending</em> status and reviewed by BUYJUMP Admins to maintain platform quality.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {providerConfigHelp && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900 text-xs font-medium">
            <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>{providerConfigHelp}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Primary contact name"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Store / Business Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Royal Ceylon Traders"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none"
                />
                <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Business Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="store@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 000 0000"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Physical Store Address</label>
            <div className="relative">
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Shop No., Street, City, District"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer pt-3"
          >
            {isLoading ? <span>Registering Store...</span> : <span>Register as Seller</span>}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Or with business account
          </span>
          <div className="border-t border-slate-200 w-full"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleSellerRegister}
            disabled={isLoading}
            className="py-2.5 px-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
          >
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={handleFacebookSellerRegister}
            disabled={isLoading}
            className="py-2.5 px-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
          >
            <span>Facebook</span>
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <button
            onClick={() => setScreen({ type: 'login' })}
            className="font-bold text-[#0F2C59] hover:underline"
          >
            Sign In to Seller Portal
          </button>
        </p>
      </div>
    </div>
  );
};
