import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer, STRIPE_UNLOCK_AMOUNT_JPY } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  const stripe = getStripeServer();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }
  try {
    const body = await req.json();
    const { photoId, successUrl, cancelUrl, userId } = body as {
      photoId: string;
      successUrl?: string;
      cancelUrl?: string;
      userId: string;
    };
    if (!photoId || !userId) {
      return NextResponse.json({ error: 'photoId and userId required' }, { status: 400 });
    }
    const amount = Math.max(50, Math.min(99999, STRIPE_UNLOCK_AMOUNT_JPY)); // 最小50円〜
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: '写真のアンロック',
              description: '有料写真を1枚アンロック',
              images: [],
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || ''}/profile?unlocked=1`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || ''}/profile`,
      client_reference_id: userId,
      metadata: { type: 'unlock', photo_id: photoId, buyer_id: userId },
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('checkout-unlock', e);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
