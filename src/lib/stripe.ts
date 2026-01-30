import Stripe from 'stripe';

const secret = process.env.STRIPE_SECRET_KEY;
let _stripe: Stripe | null = null;

export function getStripeServer(): Stripe | null {
  if (!secret) return null;
  if (!_stripe) _stripe = new Stripe(secret, { apiVersion: '2026-01-28.clover' });
  return _stripe;
}

export const STRIPE_SUBSCRIPTION_PRICE_ID = process.env.STRIPE_SUBSCRIPTION_PRICE_ID || '';
export const STRIPE_UNLOCK_AMOUNT_JPY = Number(process.env.STRIPE_UNLOCK_AMOUNT_JPY) || 300; // 単品アンロック金額（円）
