import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

export const RegisterUserScreen: React.FC = () => {
  const { registerUser, loginWithGoogle, loginWithFacebook } = useAuth();
  const { setScreen } = useStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      await registerUser(fullName, email, phone, password);
      setScreen({ type: 'user-dashboard' });
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email address already exists. Please log in.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('The chosen password is too weak. Please use letters and numbers.');
      } else {
        setErrorMessage(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setErrorMessage('');
    setProviderConfigHelp(null);
    setIsLoading(true);
    try {
      await loginWithGoogle('user');
      setScreen({ type: 'user-dashboard' });
    } catch (err: any) {
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        setProviderConfigHelp('Google Sign-in is not enabled in Firebase Console. Enable it under Authentication > Sign-in method.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Google registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookRegister = async () => {
    setErrorMessage('');
    setProviderConfigHelp(null);
    setIsLoading(true);
    try {
      await loginWithFacebook('user');
      setScreen({ type: 'user-dashboard' });
    } catch (err: any) {
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        setProviderConfigHelp('Facebook Login is not enabled in Firebase Console.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'Facebook registration failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl p-1 bg-white border border-slate-100 shadow-md flex items-center justify-center">
            <img
              src="/images/buyjump_logo.jpg"
              alt="BUYJUMP Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-black text-[#0F2C59]">Create BUYJUMP Account</h1>
          <p className="text-xs text-slate-500">
            Join thousands of shoppers for great deals and fast delivery
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {providerConfigHelp && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900 text-xs font-medium animate-in fade-in">
            <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Provider Configuration Notice:</p>
              <p>{providerConfigHelp}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priyantha Silva"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priyantha@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                placeholder="+94 77 123 4567"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15"
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

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white rounded-xl border border-slate-200 focus:border-[#0F2C59] focus:outline-none focus:ring-2 focus:ring-[#0F2C59]/15"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#0F2C59] hover:bg-blue-900 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer pt-3"
          >
            {isLoading ? <span>Creating Account...</span> : <span>Create Account</span>}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Or
          </span>
          <div className="border-t border-slate-200 w-full"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isLoading}
            className="py-2.5 px-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.73-2.1-6.67-4.93H1.27v3.13C3.25 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.33 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.6H1.27C.46 8.22 0 10.05 0 12s.46 3.78 1.27 5.4l4.06-3.13z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.6l4.06 3.13c.94-2.83 3.57-4.98 6.67-4.98z" />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={handleFacebookRegister}
            disabled={isLoading}
            className="py-2.5 px-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <button
            onClick={() => setScreen({ type: 'login' })}
            className="font-bold text-[#0F2C59] hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
