import crypto from 'node:crypto';
import { connectToDatabase, isMongoReady } from '@/lib/db';
import { demoState } from '@/lib/demo-store';
import { AppError } from '@/lib/errors';
import { SyncLog } from '@/models/SyncLog';
import { Customer } from '@/models/Customer';
import { Order } from '@/models/Order';
import { fetchWooPaginated, isWooCommerceConfigured, wooFetch } from './client';
import { mapWooCustomer, mapWooOrder } from './mappers';

export function verifyWooWebhookSignature(rawBody: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader || !secret) {
    return false;
  }

  const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
  const provided = Buffer.from(signatureHeader);
  const actual = Buffer.from(expected);
  return provided.length === actual.length && crypto.timingSafeEqual(provided, actual);
}

async function writeSyncLog(syncType: 'customers' | 'orders' | 'webhook' | 'initial-import' | 'manual', payload: Partial<{
  status: 'success' | 'partial' | 'error';
  recordsProcessed: number;
  recordsUpserted: number;
  recordsFailed: number;
  message: string;
  details: unknown;
}>) {
  if (!isMongoReady()) {
    demoState.syncLog.unshift({ id: `${syncType}_${Date.now()}`, startedAt: new Date().toISOString(), message: payload.message ?? '' });
    return null;
  }

  await connectToDatabase();
  return SyncLog.create({
    syncType,
    startedAt: new Date(),
    finishedAt: new Date(),
    status: payload.status ?? 'success',
    recordsProcessed: payload.recordsProcessed ?? 0,
    recordsUpserted: payload.recordsUpserted ?? 0,
    recordsFailed: payload.recordsFailed ?? 0,
    message: payload.message ?? '',
    details: payload.details ?? {}
  });
}

export async function syncWooCustomers() {
  if (!isWooCommerceConfigured()) {
    return { mode: 'demo', processed: demoState.customers.length, upserted: 0 };
  }

  const rawCustomers = await fetchWooPaginated<Record<string, unknown>>('customers');
  let upserted = 0;
  await connectToDatabase();

  for (const rawCustomer of rawCustomers) {
    const mapped = mapWooCustomer(rawCustomer);
    await Customer.findOneAndUpdate({ wooCustomerId: mapped.wooCustomerId }, { ...mapped, syncedAt: new Date() }, { upsert: true, new: true });
    upserted += 1;
  }

  await writeSyncLog('customers', { status: 'success', recordsProcessed: rawCustomers.length, recordsUpserted: upserted, message: 'Customer sync completed' });
  return { mode: 'live', processed: rawCustomers.length, upserted };
}

export async function syncWooOrders() {
  if (!isWooCommerceConfigured()) {
    return { mode: 'demo', processed: demoState.orders.length, upserted: 0 };
  }

  const rawOrders = await fetchWooPaginated<Record<string, unknown>>('orders');
  let upserted = 0;
  await connectToDatabase();

  for (const rawOrder of rawOrders) {
    const mapped = mapWooOrder(rawOrder);
    await Order.findOneAndUpdate({ wooOrderId: mapped.wooOrderId }, { ...mapped, syncedAt: new Date() }, { upsert: true, new: true });
    upserted += 1;
  }

  await writeSyncLog('orders', { status: 'success', recordsProcessed: rawOrders.length, recordsUpserted: upserted, message: 'Order sync completed' });
  return { mode: 'live', processed: rawOrders.length, upserted };
}

export async function runInitialSync(scope: 'customers' | 'orders' | 'all') {
  if (scope === 'customers') return syncWooCustomers();
  if (scope === 'orders') return syncWooOrders();
  const [customers, orders] = await Promise.all([syncWooCustomers(), syncWooOrders()]);
  await writeSyncLog('initial-import', { status: 'success', message: 'Initial import finished', details: { customers, orders } });
  return { customers, orders };
}

export async function handleWooWebhook(pathType: 'customers' | 'orders', event: Record<string, unknown>) {
  if (!isWooCommerceConfigured()) {
    throw new AppError('WooCommerce is not configured', 400);
  }

  if (pathType === 'customers') {
    const mapped = mapWooCustomer(event);
    await connectToDatabase();
    const upserted = await Customer.findOneAndUpdate({ wooCustomerId: mapped.wooCustomerId }, { ...mapped, syncedAt: new Date() }, { upsert: true, new: true });
    await writeSyncLog('webhook', { status: 'success', message: 'Customer webhook processed', details: mapped });
    return upserted;
  }

  const mapped = mapWooOrder(event);
  await connectToDatabase();
  const upserted = await Order.findOneAndUpdate({ wooOrderId: mapped.wooOrderId }, { ...mapped, syncedAt: new Date() }, { upsert: true, new: true });
  await writeSyncLog('webhook', { status: 'success', message: 'Order webhook processed', details: mapped });
  return upserted;
}

export async function pingWooCommerce() {
  if (!isWooCommerceConfigured()) {
    return { ok: false, message: 'WooCommerce demo mode' };
  }

  await wooFetch({ path: 'system_status' });
  return { ok: true };
}