import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RithoLogo } from '../common/RithoLogo';

interface ForgotPasswordPageProps {
  onNavigate: (view: 'login' | 'reset-password') => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { sendPasswordReset, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordReset(email);
      setSentSuccess(true);
    } catch (err: unknown) {
      setLocalError((err as Error).message || 'Could not send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayedError = localError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090a0f] relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-violet-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="mb-3">
            <RithoLogo size="xl" showText={false} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            Ritho <span className="text-violet-400">AI</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">Reset your account password</p>
        </div>

        <div className="bg-[#12141f]/90 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60">
          {sentSuccess ? (
            <div className="text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-white">Reset Link Dispatched</h2>
              <p className="text-xs text-neutral-300 leading-relaxed">
                If an account exists with <strong className="text-white">{email}</strong>, you will receive an email containing a secure password reset link shortly.
              </p>
              <div className="p-3 bg-[#181a28] rounded-xl text-[11px] text-neutral-400 text-left border border-neutral-700/60">
                💡 <strong className="text-neutral-300">Didn't receive the email?</strong> Be sure to check your spam or junk folder, or wait 2 minutes before requesting another.
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl transition-all duration-200"
                >
                  Return to Login
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-white">Forgot Password</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Enter your registered email address and we'll send you instructions to reset your password.
                </p>
              </div>

              {displayedError && (
                <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <div className="flex-1">{displayedError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                      className="w-full bg-[#181a28] border border-neutral-700/70 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-lg shadow-violet-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
