import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountFromStripe } from '@/lib/stripe';
import { markCashflowAsPaid, getCashflowByHash, recordStripePayment } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, hash } = body;

    if (!sessionId || !hash) {
      return NextResponse.json(
        { error: 'Missing session ID or hash' },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed', status: session.payment_status },
        { status: 400 }
      );
    }

    const cashflowId = session.metadata?.cashflowId;
    const amountTotal = session.amount_total;

    if (!cashflowId || !amountTotal) {
      return NextResponse.json(
        { error: 'Missing metadata' },
        { status: 400 }
      );
    }

    // Get the cashflow to check current status
    const cashflow = await getCashflowByHash(hash);
    if (!cashflow) {
      return NextResponse.json(
        { error: 'Cashflow not found' },
        { status: 404 }
      );
    }

    const amountPaid = formatAmountFromStripe(amountTotal);

    // Only update if not already fully paid (prevents double processing)
    if (cashflow.fullyPaidFlag !== 'Y') {
      try {
        // Record the Stripe payment
        await recordStripePayment(
          cashflow.clientId,
          parseInt(cashflowId),
          session.payment_intent as string,
          amountPaid,
          'succeeded'
        );

        // Mark the cashflow as paid
        await markCashflowAsPaid(
          parseInt(cashflowId),
          amountPaid,
          session.payment_intent as string
        );
      } catch (dbError) {
        // Payment might have already been processed by webhook
        console.log('Payment may have already been processed:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      amount: amountPaid,
      paymentIntent: session.payment_intent,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
