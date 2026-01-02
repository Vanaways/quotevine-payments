# Vanaways Payments

A secure payment portal for Vanaways customers to pay invoices via Stripe.

## Features

- Secure Stripe Checkout integration
- Real-time payment verification
- Automatic QuoteVine cashflow updates via API
- Receipt download functionality
- Mobile-responsive design with Vanaways branding

## Tech Stack

- **Framework**: Next.js 16 with Turbopack
- **Styling**: Tailwind CSS 4
- **Payments**: Stripe Checkout
- **APIs**: QuoteVine Communications API & Cashflow API

## How It Works

1. Customer receives a payment link with a unique cashflow hash
2. Payment page displays invoice details fetched from QuoteVine APIs
3. Customer pays via Stripe Checkout
4. On successful payment:
   - Cashflow is marked as paid in QuoteVine
   - Customer can download their Stripe receipt

## API Integration

### QuoteVine Communications API
Used to look up cashflow details by hash:
- Endpoint: `/api/cashflow/lookup`
- Returns: relationshipId, opportunityId, quoteId, cashflowId

### QuoteVine Cashflow API
Used to get cashflow details and mark as paid:
- GET: Retrieves cashflow amounts and description
- PUT: Updates paid amount and payment reference

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and configure:
   ```bash
   cp .env.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_test_... or sk_live_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | Base URL of the application |
| `QUOTEVINE_API_URL` | QuoteVine Communications API URL |
| `QUOTEVINE_API_KEY` | QuoteVine Communications API key |
| `QV_CASHFLOW_API_URL` | QuoteVine Cashflow API URL |
| `QV_CASHFLOW_API_KEY` | QuoteVine Cashflow API key |

## Payment URLs

Payment links follow this format:
```
https://your-domain.com/pay/{cashflow_hash}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── checkout/       # Creates Stripe checkout sessions
│   │   ├── verify-payment/ # Verifies payment and updates QV
│   │   └── webhook/        # Stripe webhook handler
│   ├── pay/[hash]/         # Payment page
│   └── success/            # Success page with receipt
└── lib/
    ├── quotevine.ts        # QuoteVine API client
    └── stripe.ts           # Stripe client configuration
```

## Stripe Webhook

For production, set up a webhook in Stripe Dashboard pointing to:
```
https://your-domain.com/api/webhook
```

Subscribe to the `checkout.session.completed` event.

## Deployment

Build for production:
```bash
npm run build
npm start
```

This app can be deployed to Vercel, Coolify, or any Node.js hosting platform.

## License

Private - Vanaways Ltd
