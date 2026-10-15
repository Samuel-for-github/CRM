import { normalizeMoney } from '@/lib/money';

export function mapWooCustomer(customer: Record<string, unknown>) {
  return {
    wooCustomerId: Number(customer.id),
    firstName: String(customer.first_name ?? ''),
    lastName: String(customer.last_name ?? ''),
    email: String(customer.email ?? ''),
    phone: String(customer.billing && typeof customer.billing === 'object' ? (customer.billing as Record<string, unknown>).phone ?? '' : ''),
    company: String(customer.billing && typeof customer.billing === 'object' ? (customer.billing as Record<string, unknown>).company ?? '' : ''),
    source: 'woocommerce' as const,
    currency: String((customer as any).currency ?? 'USD'),
    metadata: customer
  };
}

export function mapWooOrder(order: Record<string, unknown>) {
  return {
    wooOrderId: Number(order.id),
    status: String(order.status ?? 'processing'),
    currency: String(order.currency ?? 'USD'),
    totalMinor: normalizeMoney(String(order.total ?? '0')),
    subtotalMinor: normalizeMoney(String(order.subtotal ?? order.total ?? '0')),
    shippingMinor: normalizeMoney(String(order.shipping_total ?? '0')),
    taxMinor: normalizeMoney(String(order.total_tax ?? '0')),
    guestCustomerEmail: String(order.billing_email ?? ''),
    guestCustomerName: `${String(order.billing_first_name ?? '')} ${String(order.billing_last_name ?? '')}`.trim(),
    createdAtWoo: order.date_created ? new Date(String(order.date_created)) : new Date(),
    items: Array.isArray(order.line_items)
      ? order.line_items.map((item: any) => ({
          productId: item.product_id,
          sku: item.sku,
          name: String(item.name ?? 'Item'),
          quantity: Number(item.quantity ?? 1),
          priceMinor: normalizeMoney(String(item.total ?? item.subtotal ?? 0))
        }))
      : [],
    metadata: order
  };
}

export function mapWooProduct(product: Record<string, unknown>) {
  return {
    wooProductId: Number(product.id),
    sku: String(product.sku ?? ''),
    name: String(product.name ?? 'Unnamed product'),
    slug: String(product.slug ?? ''),
    description: String(product.description ?? ''),
    type: String(product.type ?? 'simple'),
    status: String(product.status ?? 'publish'),
    priceMinor: normalizeMoney(String(product.price ?? product.regular_price ?? '0')),
    regularPriceMinor: normalizeMoney(String(product.regular_price ?? product.price ?? '0')),
    salePriceMinor: normalizeMoney(String(product.sale_price ?? '0')),
    currency: String(product.currency ?? 'USD'),
    stockStatus: String(product.stock_status ?? 'instock'),
    stockQuantity: Number(product.stock_quantity ?? 0),
    manageStock: Boolean(product.manage_stock),
    featured: Boolean(product.featured),
    onSale: Boolean(product.on_sale),
    categories: Array.isArray(product.categories) ? product.categories.map((item: any) => String(item?.name ?? '')) : [],
    images: Array.isArray(product.images) ? product.images.map((item: any) => String(item?.src ?? '')) : [],
    metadata: product
  };
}