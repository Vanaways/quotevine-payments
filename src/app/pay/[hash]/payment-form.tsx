'use client';

import { useState } from 'react';

interface PaymentFormProps {
  hash: string;
  cashflowId: number;
  amount: number;
  description: string;
}

export default function PaymentForm({ hash, cashflowId, amount, description }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hash,
          cashflowId,
          amount,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout using the session URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#e63946] to-[#d62839] hover:from-[#d62839] hover:to-[#c41e2a] disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 disabled:shadow-none"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing Payment...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pay £{amount.toFixed(2)} Securely
          </>
        )}
      </button>

      <div className="mt-6 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5 text-slate-400">
          <svg className="w-8 h-5" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="24" rx="4" fill="#1A1F71"/>
            <path d="M15.5 15.5L17 8.5H19L17.5 15.5H15.5Z" fill="white"/>
            <path d="M24 8.7C23.6 8.5 22.9 8.3 22.1 8.3C20.1 8.3 18.7 9.4 18.7 10.8C18.7 11.9 19.7 12.5 20.5 12.9C21.3 13.3 21.5 13.5 21.5 13.9C21.5 14.4 20.9 14.7 20.4 14.7C19.6 14.7 19.2 14.6 18.5 14.3L18.2 14.1L17.9 15.8C18.4 16 19.3 16.2 20.2 16.2C22.3 16.2 23.7 15.1 23.7 13.6C23.7 12.8 23.2 12.1 22 11.6C21.3 11.2 20.9 11 20.9 10.6C20.9 10.2 21.3 9.9 22.1 9.9C22.8 9.9 23.3 10 23.6 10.2L23.8 10.3L24 8.7Z" fill="white"/>
            <path d="M26.8 8.5H25.4C25 8.5 24.6 8.6 24.4 9.1L21.5 15.5H23.6L24 14.4H26.5L26.7 15.5H28.5L26.8 8.5ZM24.5 12.9L25.5 10.4L26.1 12.9H24.5Z" fill="white"/>
            <path d="M14.7 8.5L12.7 13.4L12.5 12.4C12.1 11.1 10.9 9.7 9.5 9L11.3 15.5H13.4L16.8 8.5H14.7Z" fill="white"/>
            <path d="M11.3 8.5H8.1L8 8.7C10.5 9.3 12.1 10.8 12.5 12.4L12 9.1C11.9 8.6 11.6 8.5 11.3 8.5Z" fill="#F9A51A"/>
          </svg>
          <svg className="w-8 h-5" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="24" rx="4" fill="#F5F5F5"/>
            <circle cx="15" cy="12" r="7" fill="#EB001B"/>
            <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
            <path d="M19 7C20.5 8.3 21.5 10 21.5 12C21.5 14 20.5 15.7 19 17C17.5 15.7 16.5 14 16.5 12C16.5 10 17.5 8.3 19 7Z" fill="#FF5F00"/>
          </svg>
          <svg className="w-8 h-5" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="24" rx="4" fill="#016FD0"/>
            <path d="M10 10H14V14H10V10Z" fill="white"/>
            <path d="M14 10H28L26 12L28 14H14V10Z" fill="white"/>
            <text x="17" y="13" fill="#016FD0" fontSize="4" fontWeight="bold">AMEX</text>
          </svg>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">
        By clicking Pay, you agree to our terms of service. Your card will be charged £{amount.toFixed(2)}.
      </p>
    </div>
  );
}
