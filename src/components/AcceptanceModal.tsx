'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle2, Loader2, PenLine, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AcceptanceModalProps {
  proposalId: string;
  proposalToken: string;
  totalAmount: number;
}

export default function AcceptanceModal({
  proposalId,
  proposalToken,
  totalAmount,
}: AcceptanceModalProps) {
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [startTime] = useState(Date.now());
  const router = useRouter();

  // Track time on page and send duration on unload
  useEffect(() => {
    const handleUnload = async () => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      // Send duration via beacon API for reliability
      if (navigator.sendBeacon) {
        const data = JSON.stringify({ proposal_id: proposalId, duration_seconds: duration });
        navigator.sendBeacon('/api/proposals/track-duration', data);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handleUnload();
    });

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [proposalId, startTime]);

  const handleAccept = async () => {
    if (!signature.trim()) {
      setError('Please enter your full name to sign this proposal.');
      return;
    }

    if (signature.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/proposals/${proposalId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: signature.trim(),
          token: proposalToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to accept proposal');
      }

      setAccepted(true);
      // Refresh page to show accepted state
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (accepted) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Proposal Accepted!
        </h3>
        <p className="text-slate-500 text-sm">
          Thank you, <span className="font-semibold text-slate-700">{signature}</span>. The proposal
          has been accepted and the sender has been notified.
        </p>
        <p className="text-slate-400 text-xs mt-2">Refreshing the page...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Signature input */}
      <div>
        <label className="label flex items-center gap-2">
          <PenLine className="w-4 h-4 text-slate-400" />
          Your Full Name (typed signature)
        </label>
        <input
          type="text"
          value={signature}
          onChange={(e) => {
            setSignature(e.target.value);
            setError(null);
          }}
          placeholder="e.g. Jane Doe"
          className="input text-lg"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && signature.trim()) handleAccept();
          }}
          disabled={loading}
          autoComplete="name"
        />
        {signature && (
          <p className="mt-2 text-slate-500 text-sm">
            Preview:{' '}
            <span className="font-serif text-lg text-slate-900 italic">{signature}</span>
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
        <p>
          You are accepting this proposal for{' '}
          <strong>{formatCurrency(totalAmount)}</strong>. This constitutes a
          legally binding agreement.
        </p>
      </div>

      {/* Accept button */}
      <button
        onClick={handleAccept}
        disabled={loading || !signature.trim()}
        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-blue-600 text-white font-semibold text-base rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg shadow-blue-200"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Accept Proposal — {formatCurrency(totalAmount)}
          </>
        )}
      </button>

      <p className="text-xs text-center text-slate-400">
        By accepting, you agree to the terms above. Your IP address and timestamp will be recorded.
      </p>
    </div>
  );
}
