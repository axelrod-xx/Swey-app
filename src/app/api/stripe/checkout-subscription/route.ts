import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer, STRIPE_SUBSCRIPTION_PRICE_ID } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const stripe = getStripeServer();
  if (!stripe || !STRIPE_SUBSCRIPTION_PRICE_ID) {
    return NextResponse.json(
      { error: 'Stripe or subscription price not configured' },
      { status: 500 }
    );
  }
  try {
    const body = await req.json();
    const { creatorId, successUrl, cancelUrl, userId } = body as {
      creatorId: string;
      successUrl?: string;
      cancelUrl?: string;
      userId: string;
    };
    if (!creatorId || !userId) {
      return NextResponse.json({ error: 'creatorId and userId required' }, { status: 400 });
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_SUBSCRIPTION_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || ''}/profile/${creatorId}?subscribed=1`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || ''}/profile/${creatorId}`,
      client_reference_id: userId,
      subscription_data: {
        metadata: { creator_id: creatorId, subscriber_id: userId },
      },
      metadata: { type: 'subscription', creator_id: creatorId, subscriber_id: userId },
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('checkout-subscription', e);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
