import { connectToDatabase, isMongoReady } from '@/lib/db';
import { demoState } from '@/lib/demo-store';
import { randomId } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { Product } from '@/models/Product';
import { productUpsertSchema } from '@/lib/validation/product';
import type { DemoProduct } from '@/lib/demo-data';

export type ProductInput = ReturnType<typeof productUpsertSchema.parse>;

const stockStatuses: DemoProduct['stockStatus'][] = ['instock', 'lowstock', 'outofstock', 'onbackorder'];

function getStockStatus(value: unknown): DemoProduct['stockStatus'] {
  return stockStatuses.includes(value as DemoProduct['stockStatus'])
    ? value as DemoProduct['stockStatus']
    : 'instock';
}

export async function listProducts({ page, limit, search }: { page: number; limit: number; search: string }) {
  if (!isMongoReady()) {
    const filtered = demoState.products.filter((product) => {
      const haystack = `${product.name} ${product.sku ?? ''} ${product.category ?? ''}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });

    return {
      data: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length
    };
  }

  await connectToDatabase();
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { categories: { $in: [new RegExp(search, 'i')] } }
        ]
      }
    : {};

  const [data, total] = await Promise.all([
    Product.find(query).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(query)
  ]);

  return { data, total };
}

export async function getProductById(productId: string) {
  if (!isMongoReady()) {
    const product = demoState.products.find((item) => item.id === productId);
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  await connectToDatabase();
  const product = await Product.findById(productId).lean();
  if (!product) throw new AppError('Product not found', 404);
  return product;
}

export async function createProduct(input: ProductInput) {
  const parsed = productUpsertSchema.parse(input);

  if (!isMongoReady()) {
    const created = {
      id: randomId('prod'),
      wooProductId: null,
      ...parsed,
      category: parsed.categories[0] ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    demoState.products.unshift(created);
    return created;
  }

  await connectToDatabase();
  const product = await Product.create({
    ...parsed,
    syncedAt: new Date()
  });
  return product.toObject();
}

export async function updateProduct(productId: string, input: ProductInput) {
  const parsed = productUpsertSchema.parse(input);

  if (!isMongoReady()) {
    const index = demoState.products.findIndex((item) => item.id === productId);
    if (index === -1) throw new AppError('Product not found', 404);
    const updated = {
      ...demoState.products[index],
      ...parsed,
      updatedAt: new Date().toISOString()
    };
    demoState.products[index] = updated;
    return updated;
  }

  await connectToDatabase();
  const updated = await Product.findByIdAndUpdate(productId, parsed, { new: true }).lean();
  if (!updated) throw new AppError('Product not found', 404);
  return updated;
}

export async function deleteProduct(productId: string) {
  if (!isMongoReady()) {
    const index = demoState.products.findIndex((item) => item.id === productId);
    if (index === -1) throw new AppError('Product not found', 404);
    demoState.products.splice(index, 1);
    return { deleted: true };
  }

  await connectToDatabase();
  const deleted = await Product.findByIdAndDelete(productId);
  if (!deleted) throw new AppError('Product not found', 404);
  return { deleted: true };
}

export async function upsertProductFromWooCommerce(productInput: Record<string, unknown>) {
  if (!isMongoReady()) {
    const wooProductId = Number(productInput.id ?? 0);
    const existingIndex = demoState.products.findIndex((product) => product.wooProductId === wooProductId);
    const mapped = {
      id: existingIndex >= 0 ? demoState.products[existingIndex].id : `prod_${wooProductId}`,
      wooProductId,
      sku: String(productInput.sku ?? ''),
      name: String(productInput.name ?? 'Unnamed product'),
      description: String(productInput.description ?? ''),
      type: String(productInput.type ?? 'simple'),
      status: String(productInput.status ?? 'publish'),
      priceMinor: Math.round(Number(productInput.price ?? productInput.regular_price ?? 0) * 100),
      regularPriceMinor: Math.round(Number(productInput.regular_price ?? productInput.price ?? 0) * 100),
      salePriceMinor: Math.round(Number(productInput.sale_price ?? 0) * 100),
      currency: String(productInput.currency ?? 'USD'),
      stockStatus: getStockStatus(productInput.stock_status),
      stockQuantity: Number(productInput.stock_quantity ?? 0),
      manageStock: Boolean(productInput.manage_stock),
      featured: Boolean(productInput.featured),
      onSale: Boolean(productInput.on_sale),
      category: String((productInput.categories as any[] | undefined)?.[0]?.name ?? ''),
      categories: Array.isArray(productInput.categories) ? (productInput.categories as any[]).map((item: any) => String(item?.name ?? '')) : [],
      images: Array.isArray(productInput.images) ? (productInput.images as any[]).map((item: any) => String(item?.src ?? '')) : [],
      syncedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      demoState.products[existingIndex] = mapped;
    } else {
      demoState.products.unshift(mapped);
    }

    return mapped;
  }

  await connectToDatabase();
  const wooProductId = Number(productInput.id ?? 0);
  const payload = {
    wooProductId,
    sku: String(productInput.sku ?? ''),
    name: String(productInput.name ?? 'Unnamed product'),
    slug: String(productInput.slug ?? ''),
    description: String(productInput.description ?? ''),
    type: String(productInput.type ?? 'simple'),
    status: String(productInput.status ?? 'publish'),
    priceMinor: Math.round(Number(productInput.price ?? productInput.regular_price ?? 0) * 100),
    regularPriceMinor: Math.round(Number(productInput.regular_price ?? productInput.price ?? 0) * 100),
    salePriceMinor: Math.round(Number(productInput.sale_price ?? 0) * 100),
    currency: String(productInput.currency ?? 'USD'),
    stockStatus: String(productInput.stock_status ?? 'instock'),
    stockQuantity: Number(productInput.stock_quantity ?? 0),
    manageStock: Boolean(productInput.manage_stock),
    featured: Boolean(productInput.featured),
    onSale: Boolean(productInput.on_sale),
    categories: Array.isArray(productInput.categories) ? productInput.categories.map((item: any) => String(item?.name ?? '')) : [],
    images: Array.isArray(productInput.images) ? productInput.images.map((item: any) => String(item?.src ?? '')) : [],
    syncedAt: new Date(),
    metadata: productInput
  };

  const updated = await Product.findOneAndUpdate({ wooProductId }, payload, { new: true, upsert: true }).lean();
  return updated;
}
