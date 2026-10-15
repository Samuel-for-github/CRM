import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';
import { verifyWooWebhookSignature, handleWooWebhook } from '@/services/woocommerce/sync';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-wc-webhook-signature');
  const topic = request.headers.get('x-wc-webhook-topic') ?? '';
  const env = getEnv();

  if (!verifyWooWebhookSignature(rawBody, signature, env.WOO_WEBHOOK_SECRET ?? '')) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as Record<string, unknown>;
  if (topic.includes('customer')) {
    return NextResponse.json(await handleWooWebhook('customers', payload));
  }
  return NextResponse.json(await handleWooWebhook('orders', payload));
}