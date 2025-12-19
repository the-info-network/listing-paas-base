# @listing-platform/payments

Payment processing SDK with support for Stripe, PayPal, and subscription management.

## Installation

```bash
pnpm add @listing-platform/payments

# Install your preferred payment provider
pnpm add @stripe/stripe-js @stripe/react-stripe-js  # For Stripe
```

## Features

- **Multiple Providers** - Stripe, PayPal, Square support
- **Checkout Flow** - Complete checkout components
- **Subscriptions** - Recurring payment management
- **Invoices** - Invoice generation and display
- **Payment Methods** - Saved card management
- **Refunds** - Process refunds

## Usage

### Components

```tsx
import { 
  CheckoutForm, 
  PaymentMethods, 
  SubscriptionManager,
  InvoiceList,
  PricingTable 
} from '@listing-platform/payments';

// Checkout form
<CheckoutForm 
  amount={9900}
  currency="usd"
  onSuccess={(paymentId) => console.log('Paid:', paymentId)}
/>

// Manage saved payment methods
<PaymentMethods onMethodSelect={(method) => setPaymentMethod(method)} />

// Subscription management
<SubscriptionManager subscriptionId={subId} />
```

### Hooks

```tsx
import { 
  useCheckout, 
  usePaymentMethods, 
  useSubscription,
  useInvoices 
} from '@listing-platform/payments/hooks';

// Create checkout session
const { createCheckout, isLoading } = useCheckout();
await createCheckout({ priceId: 'price_xxx', quantity: 1 });

// Get payment methods
const { methods, addMethod, removeMethod } = usePaymentMethods();

// Manage subscription
const { subscription, cancel, resume } = useSubscription(subscriptionId);
```

## Configuration

Enable in `features.config.ts`:

```ts
payments: {
  enabled: true,
  provider: 'stripe',
  config: {
    publicKey: process.env.NEXT_PUBLIC_STRIPE_KEY,
    enableSubscriptions: true,
    enableInvoices: true,
  },
}
```

## License

MIT
