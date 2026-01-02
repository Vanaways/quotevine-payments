import { getCashflowByHash } from '@/lib/db';
import { notFound } from 'next/navigation';
import PaymentForm from './payment-form';

interface PageProps {
  params: Promise<{ hash: string }>;
}

export default async function PaymentPage({ params }: PageProps) {
  const { hash } = await params;

  const cashflow = await getCashflowByHash(hash);

  if (!cashflow) {
    notFound();
  }

  if (cashflow.fullyPaidFlag === 'Y' || cashflow.outstandingAmount <= 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Paid</h1>
          <p className="text-gray-600">This invoice has already been paid in full.</p>
          {cashflow.invoiceReference && (
            <p className="text-sm text-gray-500 mt-4">Reference: {cashflow.invoiceReference}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold">Payment</h1>
            <p className="text-blue-100 mt-1">Complete your payment securely</p>
          </div>

          <div className="p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
              {cashflow.description && (
                <p className="text-gray-600 mt-1">{cashflow.description}</p>
              )}
              {cashflow.invoiceReference && (
                <p className="text-sm text-gray-500 mt-1">Reference: {cashflow.invoiceReference}</p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Net Amount</span>
                <span className="font-medium">£{cashflow.netAmount.toFixed(2)}</span>
              </div>
              {cashflow.taxAmount !== null && cashflow.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT</span>
                  <span className="font-medium">£{cashflow.taxAmount.toFixed(2)}</span>
                </div>
              )}
              {cashflow.paidAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Already Paid</span>
                  <span className="font-medium">-£{cashflow.paidAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Amount Due</span>
                <span className="text-blue-600">£{cashflow.outstandingAmount.toFixed(2)}</span>
              </div>
            </div>

            <PaymentForm
              hash={hash}
              cashflowId={cashflow.cashflowId}
              amount={cashflow.outstandingAmount}
              description={cashflow.description || 'Payment'}
            />
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secured by Stripe
          </div>
        </div>
      </div>
    </div>
  );
}
