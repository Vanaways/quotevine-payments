import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountFromStripe } from '@/lib/stripe';
import { getCashflowDetailsByHash, markQVCashflowAsPaid } from '@/lib/quotevine';

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

    // Get the cashflow details from QV APIs
    const cashflow = await getCashflowDetailsByHash(hash);
    if (!cashflow) {
      return NextResponse.json(
        { error: 'Cashflow not found' },
        { status: 404 }
      );
    }

    const amountPaid = formatAmountFromStripe(amountTotal);

    // Only update if not already fully paid (prevents double processing)
    if (!cashflow.isFullyPaid) {
      // Mark the cashflow as paid via QuoteVine API
      const today = new Date().toISOString().split('T')[0];
      const totalPaid = cashflow.paidAmount + amountPaid;

      const success = await markQVCashflowAsPaid(
        cashflow.ids,
        totalPaid,
        today,
        session.payment_intent as string
      );

      if (!success) {
        console.error('Failed to update cashflow via QV API');
      } else {
        console.log(`Successfully marked cashflow ${cashflow.ids.cashflowId} as paid via QV API`);
      }
    }

    // Get receipt URL from the payment intent
    let receiptUrl: string | null = null;
    if (session.payment_intent) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string,
          { expand: ['latest_charge'] }
        );
        const latestCharge = paymentIntent.latest_charge;
        if (latestCharge && typeof latestCharge === 'object' && 'receipt_url' in latestCharge) {
          receiptUrl = latestCharge.receipt_url;
        }
      } catch (err) {
        console.log('Could not retrieve receipt URL:', err);
      }
    }

    return NextResponse.json({
      success: true,
      amount: amountPaid,
      paymentIntent: session.payment_intent,
      receiptUrl,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
