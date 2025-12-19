/**
 * Types for Payments SDK
 */

export type PaymentProvider = 'stripe' | 'paypal' | 'square';

export interface PaymentConfig {
  provider: PaymentProvider;
  publicKey: string;
  enableSubscriptions: boolean;
  enableInvoices: boolean;
  enableRefunds: boolean;
  webhookSecret?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  metadata?: Record<string, string>;
  createdAt: string;
}

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'paypal';
  card?: CardDetails;
  isDefault: boolean;
  createdAt: string;
}

export interface CardDetails {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface Subscription {
  id: string;
  customerId: string;
  priceId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  price: Price;
  createdAt: string;
}

export type SubscriptionStatus = 
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'trialing'
  | 'paused';

export interface Price {
  id: string;
  productId: string;
  unitAmount: number;
  currency: string;
  interval?: 'day' | 'week' | 'month' | 'year';
  intervalCount?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  images?: string[];
  prices: Price[];
  metadata?: Record<string, string>;
}

export interface Invoice {
  id: string;
  customerId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  paidAt?: string;
  dueDate?: string;
  invoicePdf?: string;
  lineItems: InvoiceLineItem[];
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
}

export interface CheckoutSession {
  id: string;
  url: string;
  status: 'open' | 'complete' | 'expired';
  paymentStatus: 'paid' | 'unpaid' | 'no_payment_required';
}

export interface CreateCheckoutInput {
  priceId: string;
  quantity?: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface RefundInput {
  paymentIntentId: string;
  amount?: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}
