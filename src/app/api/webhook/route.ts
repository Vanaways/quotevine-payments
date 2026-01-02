import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountFromStripe } from '@/lib/stripe';
import { getCashflowDetailsByHash, markQVCashflowAsPaid } from '@/lib/quotevine';
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

    // Get the cashflow details from QV APIs
    const cashflow = await getCashflowDetailsByHash(hash);
    if (!cashflow) {
      console.error('Cashflow not found for hash:', hash);
      return NextResponse.json({ error: 'Cashflow not found' }, { status: 404 });
    }

    const amountPaid = formatAmountFromStripe(amountTotal);

    // Mark the cashflow as paid via QuoteVine API
    if (!cashflow.isFullyPaid) {
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

    console.log(`Payment successful for cashflow ${cashflowId}: £${amountPaid}`);
  }

  return NextResponse.json({ received: true });
}
