'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const hash = searchParams.get('hash');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [amount, setAmount] = useState<number | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !hash) {
      setStatus('error');
      setError('Missing payment information');
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId, hash }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }

        setAmount(data.amount);
        setReceiptUrl(data.receiptUrl);
        setStatus('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setStatus('error');
      }
    };

    verifyPayment();
  }, [sessionId, hash]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Image
              src="https://ik.imagekit.io/vanaways/Vanaways%20Logo%20-%20High%20Res%20-%20Transparent%20Background%20(1)_s1OlHbxcD.png?updatedAt=1752744524121"
              alt="Vanaways"
              width={200}
              height={60}
              className="mx-auto"
              priority
            />
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
            <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-xl font-bold text-slate-900">Verifying Payment...</h1>
            <p className="text-slate-600 mt-2">Please wait while we confirm your payment.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Image
              src="https://ik.imagekit.io/vanaways/Vanaways%20Logo%20-%20High%20Res%20-%20Transparent%20Background%20(1)_s1OlHbxcD.png?updatedAt=1752744524121"
              alt="Vanaways"
              width={200}
              height={60}
              className="mx-auto"
              priority
            />
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Payment Error</h1>
            <p className="text-slate-600">{error}</p>
            {hash && (
              <a
                href={`/pay/${hash}`}
                className="inline-flex items-center gap-2 mt-6 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] hover:from-[#2d4a6f] hover:to-[#3d5a7f] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Image
            src="https://ik.imagekit.io/vanaways/Vanaways%20Logo%20-%20High%20Res%20-%20Transparent%20Background%20(1)_s1OlHbxcD.png?updatedAt=1752744524121"
            alt="Vanaways"
            width={200}
            height={60}
            className="mx-auto"
            priority
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
          </div>

          <div className="p-6">
            {/* Amount Paid */}
            {amount !== null && (
              <div className="bg-slate-50 rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-slate-500 mb-1">Amount Paid</p>
                <p className="text-3xl font-bold text-[#1e3a5f]">£{amount.toFixed(2)}</p>
              </div>
            )}

            <p className="text-slate-600 text-center mb-6">
              Thank you for your payment. A confirmation email will be sent to your registered email address.
            </p>

            {/* Receipt Download Button */}
            {receiptUrl && (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] hover:from-[#2d4a6f] hover:to-[#3d5a7f] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Receipt
              </a>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-sm text-slate-400">
                You can safely close this page.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Payment secured by Stripe
          </div>
          <p className="text-xs text-slate-400">
            Vanaways Ltd | Company Reg: 07654321
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Image
              src="https://ik.imagekit.io/vanaways/Vanaways%20Logo%20-%20High%20Res%20-%20Transparent%20Background%20(1)_s1OlHbxcD.png?updatedAt=1752744524121"
              alt="Vanaways"
              width={200}
              height={60}
              className="mx-auto"
              priority
            />
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
            <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-xl font-bold text-slate-900">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
