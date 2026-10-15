import { connectToDatabase, isMongoReady } from '@/lib/db';
import { demoState } from '@/lib/demo-store';
import { Order } from '@/models/Order';
import { AppError } from '@/lib/errors';

export async function listOrders({ page, limit, search, status }: { page: number; limit: number; search: string; status: string }) {
  if (!isMongoReady()) {
    const filtered = demoState.orders.filter((order) => {
      const matchesSearch = !search || `${order.wooOrderId ?? ''} ${order.id}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !status || order.status === status;
      return matchesSearch && matchesStatus;
    });
    return { data: filtered.slice((page - 1) * limit, page * limit), total: filtered.length };
  }

  await connectToDatabase();
  const query: Record<string, unknown> = {};

  if (status) query.status = status;
  if (search) {
    query.$or = [
      { guestCustomerName: { $regex: search, $options: 'i' } },
      { guestCustomerEmail: { $regex: search, $options: 'i' } },
      { wooOrderId: Number.isNaN(Number(search)) ? undefined : Number(search) }
    ].filter((item) => Object.values(item).every((value) => value !== undefined));
  }

  const [data, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(query)
  ]);
  return { data, total };
}

export async function getOrderById(orderId: string) {
  if (!isMongoReady()) {
    const order = demoState.orders.find((item) => item.id === orderId);
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  await connectToDatabase();
  const order = await Order.findById(orderId).populate('customer').lean();
  if (!order) throw new AppError('Order not found', 404);
  return order;
}

export async function upsertOrderFromWooCommerce(orderInput: Record<string, unknown>) {
  if (!isMongoReady()) {
    const wooOrderId = Number(orderInput.id);
    const existingIndex = demoState.orders.findIndex((order) => order.wooOrderId === wooOrderId);
    const mapped = {
      id: existingIndex >= 0 ? demoState.orders[existingIndex].id : `ord_${wooOrderId}`,
      wooOrderId,
      customerId: typeof orderInput.customer_id === 'number' ? `cust_${orderInput.customer_id}` : null,
      status: String(orderInput.status ?? 'processing'),
      totalMinor: Math.round(Number(orderInput.total ?? 0) * 100),
      currency: String(orderInput.currency ?? 'USD'),
      createdAt: String(orderInput.date_created ?? new Date().toISOString()),
      items: Array.isArray(orderInput.line_items)
        ? orderInput.line_items.map((item: any) => ({
            name: String(item.name ?? 'Item'),
            quantity: Number(item.quantity ?? 1),
            priceMinor: Math.round(Number(item.total ?? item.subtotal ?? 0) * 100)
          }))
        : []
    };
    if (existingIndex >= 0) {
      demoState.orders[existingIndex] = mapped;
    } else {
      demoState.orders.unshift(mapped);
    }
    return mapped;
  }

  await connectToDatabase();
  const wooOrderId = Number(orderInput.id);
  const customerId = typeof orderInput.customer_id === 'number' ? `cust_${orderInput.customer_id}` : null;
  const payload = {
    wooOrderId,
    customer: customerId,
    status: String(orderInput.status ?? 'processing'),
    currency: String(orderInput.currency ?? 'USD'),
    totalMinor: Math.round(Number(orderInput.total ?? 0) * 100),
    subtotalMinor: Math.round(Number(orderInput.subtotal ?? 0) * 100),
    shippingMinor: Math.round(Number(orderInput.shipping_total ?? 0) * 100),
    taxMinor: Math.round(Number(orderInput.total_tax ?? 0) * 100),
    guestCustomerEmail: String(orderInput.billing_email ?? ''),
    guestCustomerName: `${String(orderInput.billing_first_name ?? '')} ${String(orderInput.billing_last_name ?? '')}`.trim(),
    createdAtWoo: orderInput.date_created ? new Date(String(orderInput.date_created)) : new Date(),
    items: Array.isArray(orderInput.line_items)
      ? orderInput.line_items.map((item: any) => ({
          productId: item.product_id,
          sku: item.sku,
          name: String(item.name ?? 'Item'),
          quantity: Number(item.quantity ?? 1),
          priceMinor: Math.round(Number(item.total ?? item.subtotal ?? 0) * 100)
        }))
      : [],
    syncedAt: new Date(),
    metadata: orderInput
  };

  const updated = await Order.findOneAndUpdate({ wooOrderId }, payload, { new: true, upsert: true }).lean();
  return updated;
}

export async function deleteOrder(orderId: string) {
  if (!isMongoReady()) {
    const index = demoState.orders.findIndex((order) => order.id === orderId);
    if (index === -1) throw new AppError('Order not found', 404);
    demoState.orders.splice(index, 1);
    return { deleted: true };
  }

  await connectToDatabase();
  const deleted = await Order.findByIdAndDelete(orderId);
  if (!deleted) throw new AppError('Order not found', 404);
  return { deleted: true };
}

export async function getOrdersForCustomer(customerId: string) {
  if (!isMongoReady()) {
    return demoState.orders.filter((order) => order.customerId === customerId);
  }

  await connectToDatabase();
  return Order.find({ customer: customerId }).sort({ createdAt: -1 }).lean();
}