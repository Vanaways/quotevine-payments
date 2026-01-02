import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountForStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash, cashflowId, amount, description } = body;

    if (!hash || !cashflowId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: description || 'Payment',
              description: `Cashflow ID: ${cashflowId}`,
            },
            unit_amount: formatAmountForStripe(amount),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&hash=${hash}`,
      cancel_url: `${appUrl}/pay/${hash}?cancelled=true`,
      metadata: {
        cashflowId: cashflowId.toString(),
        hash,
        amount: amount.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
