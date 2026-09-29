import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export const AdminLoginScreen: React.FC = () => {
  const { adminLogin, setScreen, settings } = useStore();
  const { loginWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const userRole = await loginWithEmail(email, password);
      adminLogin(email, password);
      setIsLoading(false);
      if (userRole === 'admin' || email.trim().toLowerCase() === 'admin@buyjump.com') {
        setScreen({ type: 'admin-dashboard' });
      } else {
        setErrorMessage('This account does not have administrator privileges.');
      }
    } catch (err: any) {
      const success = adminLogin(email, password);
      setIsLoading(false);
      if (success) {
        setScreen({ type: 'admin-dashboard' });
      } else {
        setErrorMessage(err.message || 'Invalid administrative credentials. Access denied.');
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-10 px-4 sm:px-6">
      {/* Back to store navigation */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={() => setScreen({ type: 'home' })}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </button>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Authorized Personnel Only
        </span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6">
        {/* Brand & Logo Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-24 h-24 rounded-2xl p-1 bg-white border border-slate-100 shadow-md flex items-center justify-center">
            <img
              src="/images/buyjump_logo.jpg"
              alt="BuyJump Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <div>
            <h1 className="text-2xl font-black text-[#0F2C59] tracking-tight">
              BuyJump Admin Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to manage inventory, customer orders, and store settings
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@buyjump.com"
                className="w-full pl-10 pr-3.5 py-3 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your admin password"
                className="w-full pl-10 pr-10 py-3 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#0F2C59] hover:bg-blue-900 active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#00D053]" />
                  <span>Access Admin Dashboard</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security badge footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted Administrative Session</span>
        </div>
      </div>
    </div>
  );
};
