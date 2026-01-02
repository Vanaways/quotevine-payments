# QuoteVine Payments

A Next.js application for processing payments via Stripe for QuoteVine cashflows.

## Features

- Secure Stripe payment integration
- Payment page at `/pay/[cashflow_id_hash]`
- Automatic database updates when payment succeeds
- Success and error pages
- Webhook support for reliable payment processing

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and fill in the values:
   ```bash
   cp .env.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_... or sk_live_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (pk_test_... or pk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `DB_USER` | Oracle database username |
| `DB_PASSWORD` | Oracle database password |
| `DB_CONNECT_STRING` | Oracle connection string (host:port/service) |
| `NEXT_PUBLIC_APP_URL` | Base URL of the application |
| `QUOTEVINE_API_URL` | QuoteVine Communications API URL |
| `QUOTEVINE_API_KEY` | QuoteVine API key |

## Usage

To make a payment, navigate to:
```
/pay/{cashflow_id_hash}
```

The hash can be obtained from the QuoteVine database `SIMPLE_CASHFLOW.SIMPLE_CASHFLOW_ID_HASH` field.

## Stripe Webhook

For production, set up a webhook in Stripe Dashboard pointing to:
```
https://your-domain.com/api/webhook
```

Subscribe to the `checkout.session.completed` event.

## Deployment

This app can be deployed to:
- Vercel
- Coolify
- Any Node.js hosting platform

Make sure to set all environment variables in your deployment platform.
