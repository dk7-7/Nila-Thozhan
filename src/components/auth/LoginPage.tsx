import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister?: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister, onSuccess }) => {
  const { t, refreshData, setRole } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const profile = await authService.signIn(email, password);
      await setRole(profile.role);
      await refreshData(profile.role, profile);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'CITIZEN' | 'OFFICER' | 'HIGH_AUTHORITY') => {
    const map = {
      CITIZEN: { email: 'citizen@nilathozhan.tn.gov.in', pass: 'NilaThozhan2026!' },
      OFFICER: { email: 'officer@nilathozhan.tn.gov.in', pass: 'NilaThozhan2026!' },
      HIGH_AUTHORITY: { email: 'authority@nilathozhan.tn.gov.in', pass: 'NilaThozhan2026!' },
    };
    setEmail(map[role].email);
    setPassword(map[role].pass);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50/50 via-slate-50 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 mb-4">
          <ShieldCheck className="w-9 h-9" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('appName')}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {t('appTagline')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address / மின்னஞ்சல்
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password / கடவுச்சொல்
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white transition-all text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fills */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('CITIZEN')}
                className="py-1.5 px-2 text-[11px] font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-center transition-colors"
              >
                👤 Citizen
              </button>
              <button
                type="button"
                onClick={() => fillDemo('OFFICER')}
                className="py-1.5 px-2 text-[11px] font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-center transition-colors"
              >
                🛡️ VAO Officer
              </button>
              <button
                type="button"
                onClick={() => fillDemo('HIGH_AUTHORITY')}
                className="py-1.5 px-2 text-[11px] font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-center transition-colors"
              >
                🏛️ Registrar
              </button>
            </div>
          </div>

          {onSwitchToRegister && (
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer inline-flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register as Citizen
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
