import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeServer } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const stripe = getStripeServer();
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }
  const raw = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (e) {
    console.error('Webhook signature verification failed', e);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    console.error('Service role client not available');
    return NextResponse.json({ error: 'Server config' }, { status: 500 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = session.metadata || {};
        if (meta.type === 'subscription' && meta.creator_id && meta.subscriber_id) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1);
          await supabase.from('subscriptions').upsert(
            {
              subscriber_id: meta.subscriber_id,
              creator_id: meta.creator_id,
              expires_at: expiresAt.toISOString(),
            },
            { onConflict: 'subscriber_id,creator_id' }
          );
        }
        if (meta.type === 'unlock' && meta.photo_id && meta.buyer_id) {
          await supabase.from('purchases').insert({
            buyer_id: meta.buyer_id,
            photo_id: meta.photo_id,
            amount_cents: session.amount_total ?? 0,
            stripe_payment_intent_id: session.payment_intent as string || null,
          });
        }
        break;
      }
      case 'invoice.paid': {
        const payload = event.data.object as unknown as Record<string, unknown>;
        const subId = typeof payload.subscription === 'string' ? payload.subscription : undefined;
        if (!subId) break;
        const sub = await stripe.subscriptions.retrieve(subId) as unknown as { current_period_end?: number; metadata?: { creator_id?: string; subscriber_id?: string } };
        const creatorId = sub.metadata?.creator_id;
        const subscriberId = sub.metadata?.subscriber_id;
        if (creatorId && subscriberId) {
          const expiresAt = new Date((sub.current_period_end || 0) * 1000);
          await supabase.from('subscriptions').upsert(
            {
              subscriber_id: subscriberId as string,
              creator_id: creatorId,
              expires_at: expiresAt.toISOString(),
            },
            { onConflict: 'subscriber_id,creator_id' }
          );
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error('Webhook handler error', e);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
