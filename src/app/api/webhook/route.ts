import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountFromStripe } from '@/lib/stripe';
import { markCashflowAsPaid, getCashflowByHash, recordStripePayment } from '@/lib/db';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const cashflowId = session.metadata?.cashflowId;
    const hash = session.metadata?.hash;
    const amountTotal = session.amount_total;

    if (!cashflowId || !hash || !amountTotal) {
      console.error('Missing metadata in session:', session.id);
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    try {
      const cashflow = await getCashflowByHash(hash);
      if (!cashflow) {
        console.error('Cashflow not found for hash:', hash);
        return NextResponse.json({ error: 'Cashflow not found' }, { status: 404 });
      }

      const amountPaid = formatAmountFromStripe(amountTotal);

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

      console.log(`Payment successful for cashflow ${cashflowId}: £${amountPaid}`);
    } catch (error) {
      console.error('Error processing payment:', error);
      return NextResponse.json(
        { error: 'Failed to process payment' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
