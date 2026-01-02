import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  typescript: true,
});

export function formatAmountForStripe(amount: number): number {
  // Stripe expects amounts in pence/cents
  return Math.round(amount * 100);
}

export function formatAmountFromStripe(amount: number): number {
  // Convert from pence/cents to pounds/dollars
  return amount / 100;
}
