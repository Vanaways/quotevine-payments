import { getCashflowDetailsByHash } from '@/lib/quotevine';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import PaymentForm from './payment-form';

interface PageProps {
  params: Promise<{ hash: string }>;
}

export default async function PaymentPage({ params }: PageProps) {
  const { hash } = await params;

  const cashflow = await getCashflowDetailsByHash(hash);

  if (!cashflow) {
    notFound();
  }

  if (cashflow.isFullyPaid || cashflow.outstandingAmount <= 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
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
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Payment Complete</h1>
            <p className="text-slate-600">This invoice has already been paid in full.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:py-12">
      <div className="max-w-lg mx-auto">
        {/* Logo */}
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
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] px-6 py-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">Secure Payment</h1>
                <p className="text-white/70 text-sm">Complete your payment below</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Invoice Details */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Invoice Details</h2>
              </div>

              {cashflow.description && (
                <p className="text-slate-700 font-medium mb-1">{cashflow.description}</p>
              )}
            </div>

            {/* Amount Breakdown */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Net Amount</span>
                  <span className="font-medium text-slate-900">£{cashflow.netAmount.toFixed(2)}</span>
                </div>
                {cashflow.taxAmount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>VAT (20%)</span>
                    <span className="font-medium text-slate-900">£{cashflow.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {cashflow.paidAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Already Paid
                    </span>
                    <span className="font-medium">-£{cashflow.paidAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="text-lg font-bold text-slate-900">Amount Due</span>
                  <span className="text-2xl font-bold text-[#1e3a5f]">£{cashflow.outstandingAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <PaymentForm
              hash={hash}
              cashflowId={cashflow.ids.cashflowId}
              amount={cashflow.outstandingAmount}
              description={cashflow.description || 'Payment'}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256-bit SSL Encrypted | Secured by Stripe
          </div>
          <p className="text-xs text-slate-400">
            Vanaways Ltd | Company Reg: 07654321
          </p>
        </div>
      </div>
    </div>
  );
}
