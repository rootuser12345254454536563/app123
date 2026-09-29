import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Store,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface LoginScreenProps {
  onSuccessRedirect?: (role: UserRole) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccessRedirect }) => {
  const { loginWithEmail, loginWithGoogle, loginWithFacebook } = useAuth();
  const { setScreen } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [providerConfigHelp, setProviderConfigHelp] = useState<string | null>(null);

  const handleSuccessfulRole = (role: UserRole) => {
    if (onSuccessRedirect) {
      onSuccessRedirect(role);
    } else {
      if (role === 'admin') setScreen({ type: 'admin-dashboard' });
      else if (role === 'seller') setScreen({ type: 'seller-dashboard' });
      else setScreen({ type: 'user-dashboard' });
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setProviderConfigHelp(null);
    setIsLoading(true);

    try {
      const role = await loginWithEmail(email, password);
      handleSuccessfulRole(role);
    } catch (err: any) {
      console.error('Email sign in error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMessage('Invalid email or password. Please verify your credentials or create an account.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.');
      } else {
        setErrorMessage(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage('');
    setProviderConfigHelp(null);
    setIsLoading(true);
    try {
      const role = await loginWithGoogle('user');
      handleSuccessfulRole(role);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        setProviderConfigHelp('Google Sign-in is not yet enabled in your Firebase Console. Go to Firebase Console > Authentication > Sign-in method > Enable Google.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Google authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setErrorMessage('');
    setProviderConfigHelp(null);
    setIsLoading(true);
    try {
      const role = await loginWithFacebook('user');
      handleSuccessfulRole(role);
    } catch (err: any) {
      console.error('Facebook sign in error:', err);
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        setProviderConfigHelp('Facebook Login is not yet enabled in Firebase Console. Go to Firebase Console > Authentication > Sign-in method > Enable Facebook (App ID & App Secret from Meta for Developers required).');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Facebook authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-20 h-20 rounded-2xl p-1 bg-white border border-slate-100 shadow-md flex items-center justify-center">
              <img
                src="/images/buyjump_logo.jpg"
                alt="BUYJUMP Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0F2C59] tracking-tight">
                Welcome to BUYJUMP
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Sign in to your account to continue shopping or managing your store
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Provider Help Notice */}
          {providerConfigHelp && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900 text-xs font-medium animate-in fade-in">
              <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Provider Configuration Required:</p>
                <p>{providerConfigHelp}</p>
              </div>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-3 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-[#0F2C59] hover:bg-blue-900 active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4 text-[#00D053]" />
                </>
              )}
            </button>
          </form>

          {/* Social Auth Separator */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Or continue with
            </span>
            <div className="border-t border-slate-200 w-full"></div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="py-2.5 px-3 border border-slate-200 hover:border-slate-300 rounded-xl bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.67-4.93H1.27v3.13C3.25 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.33 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.6H1.27C.46 8.22 0 10.05 0 12s.46 3.78 1.27 5.4l4.06-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4.06 3.13c.94-2.83 3.57-4.98 6.67-4.98z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookLogin}
              disabled={isLoading}
              className="py-2.5 px-3 border border-slate-200 hover:border-slate-300 rounded-xl bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Register Links */}
          <div className="pt-4 border-t border-slate-100 space-y-3 text-center text-xs">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <button
                onClick={() => setScreen({ type: 'register-user' })}
                className="font-bold text-[#0F2C59] hover:underline"
              >
                Create Account
              </button>
            </p>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-left">
              <div>
                <p className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sell on BUYJUMP</span>
                </p>
                <p className="text-[11px] text-emerald-800">Reach buyers across the island</p>
              </div>
              <button
                onClick={() => setScreen({ type: 'register-seller' })}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Register as Seller
              </button>
            </div>
          </div>
        </div>

        {/* Admin Portal Quick Link */}
        <div className="text-center">
          <button
            onClick={() => setScreen({ type: 'admin-dashboard' })}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={email}
      />
    </div>
  );
};
