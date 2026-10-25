import React, { useState } from 'react';
import { Mail, Check, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const EmailVerificationBanner: React.FC = () => {
  const { user, resendVerification, isGoogleUser } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Google users are automatically email-verified, so banner is only for unverified password users
  if (!user || user.emailVerified || isGoogleUser || dismissed) {
    return null;
  }

  const handleResend = async () => {
    try {
      setLoading(true);
      await resendVerification();
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      console.warn('Verification resend error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-200 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 max-w-2xl">
        <Mail className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          Please verify your email address (<strong>{user.email}</strong>) to guarantee password recovery and data security.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleResend}
          disabled={loading || sent}
          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-semibold text-[11px] transition-colors"
        >
          {sent ? 'Link Sent!' : loading ? 'Sending...' : 'Resend Verification'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400 hover:text-amber-200 p-0.5"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
