import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Sparkles, AlertCircle, ArrowRight, Compass, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RithoLogo } from '../common/RithoLogo';
import { DEMO_PERSONAS } from '../../data/demoAccounts';

interface LoginPageProps {
  onNavigate: (view: 'signup' | 'forgot-password' | 'dashboard') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { loginWithEmail, loginWithGoogle, loginAsDemo, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoadingId, setDemoLoadingId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLaunchDemo = async (personaId: string) => {
    setLocalError(null);
    clearAuthError();
    try {
      setDemoLoadingId(personaId);
      await loginAsDemo(personaId);
      onNavigate('dashboard');
    } catch (err: unknown) {
      setLocalError((err as Error).message || 'Failed to initialize demo session.');
    } finally {
      setDemoLoadingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim() || !password) {
      setLocalError('Please enter both email address and password.');
      return;
    }

    try {
      setLoading(true);
      await loginWithEmail(email, password, rememberMe);
      onNavigate('dashboard');
    } catch (err: unknown) {
      setLocalError((err as Error).message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearAuthError();
    try {
      setGoogleLoading(true);
      await loginWithGoogle(rememberMe);
      onNavigate('dashboard');
    } catch (err: unknown) {
      setLocalError((err as Error).message || 'Google sign-in could not be completed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const displayedError = localError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#090a0f] relative overflow-hidden">
      {/* Background glow ambiance */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Brand Title */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4">
            <RithoLogo size="xl" showText={false} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            Ritho <span className="text-violet-400">AI</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Build unshakeable habits with intelligent AI coaching
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#12141f]/90 border border-neutral-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Welcome back</h2>
            <p className="text-xs text-neutral-400 mt-1">Sign in to resume your active streaks & progress</p>
          </div>

          {/* Error Banner */}
          {displayedError && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">{displayedError}</div>
            </div>
          )}

          {/* Form */}
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-neutral-300">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-[#181a28] border border-neutral-700/70 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#181a28] border-neutral-700 text-violet-600 focus:ring-violet-500/30"
                />
                <span className="text-xs text-neutral-400">Remember me</span>
              </label>

              <span className="text-[11px] text-neutral-500">
                Or launch a demo below
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading || Boolean(demoLoadingId)}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-lg shadow-violet-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800" />
            </div>
            <span className="relative px-3 bg-[#12141f] text-[11px] uppercase tracking-wider text-neutral-500">
              Or continue with
            </span>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading || Boolean(demoLoadingId)}
            className="w-full py-2.5 px-4 bg-[#181a28] hover:bg-[#1f2233] border border-neutral-700/80 text-neutral-200 font-medium text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Demo Accounts Showcase */}
          <div className="mt-6 pt-5 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-semibold text-white">Live Demo Accounts</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-violet-400 font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                1-Click Launch
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
              Test-drive Ritho AI immediately with pre-populated routines, streaks, and peaceful themes:
            </p>

            <div className="space-y-2">
              {DEMO_PERSONAS.map((persona) => {
                const isThisLoading = demoLoadingId === persona.id;
                return (
                  <div
                    key={persona.id}
                    className="p-2.5 rounded-xl bg-[#171927] hover:bg-[#1c1f30] border border-neutral-800/90 hover:border-violet-500/30 transition-all flex items-center justify-between gap-2.5 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="w-8 h-8 rounded-full object-cover border border-neutral-700/80 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-neutral-200 group-hover:text-white truncate">
                            {persona.name}
                          </span>
                          <span className="text-[10px] text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                            {persona.streak}d streak
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate">{persona.headline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEmail(persona.email);
                          setPassword(persona.password);
                        }}
                        title={`Fill email & password for ${persona.name}`}
                        className="px-2 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 text-[10px] transition-colors"
                      >
                        Fill
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLaunchDemo(persona.id)}
                        disabled={loading || googleLoading || isThisLoading}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-[11px] transition-all shadow-md shadow-violet-600/20 flex items-center gap-1 disabled:opacity-50"
                      >
                        {isThisLoading ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Try Demo</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer link to sign up */}
          <div className="mt-5 text-center text-xs text-neutral-400">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="font-medium text-violet-400 hover:text-violet-300 underline underline-offset-4 ml-1"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
