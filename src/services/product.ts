
import { fetchWooCommerceProducts } from "@/lib/woocommerce";
import { connectToDatabase, isMongoReady } from "@/lib/db";
import { demoState } from "@/lib/demo-store";
import { AppError } from "@/lib/errors";
import { Product } from "@/models/Product";

export async function upsertProductFromWooCommerce(
  productInput: Record<string, unknown>
) {
  const wooProductId = Number(productInput.id ?? 0);

  if (!Number.isInteger(wooProductId) || wooProductId <= 0) {
    throw new AppError("Invalid WooCommerce product ID", 400);
  }

  const categories = Array.isArray(productInput.categories)
    ? productInput.categories.map((item) =>
        String((item as { name?: string })?.name ?? "")
      )
    : [];

  const images = Array.isArray(productInput.images)
    ? productInput.images.map((item) =>
        String((item as { src?: string })?.src ?? "")
      )
    : [];

  const mapped = {
    wooProductId,
    sku: String(productInput.sku ?? ""),
    name: String(productInput.name ?? "Unnamed product"),
    slug: String(productInput.slug ?? ""),
    description: String(productInput.description ?? ""),
    type: String(productInput.type ?? "simple"),
    status: String(productInput.status ?? "publish"),
    priceMinor: Math.round(
      Number(productInput.price ?? productInput.regular_price ?? 0) * 100
    ),
    regularPriceMinor: Math.round(
      Number(productInput.regular_price ?? productInput.price ?? 0) * 100
    ),
    salePriceMinor: Math.round(
      Number(productInput.sale_price ?? 0) * 100
    ),
    currency: String(productInput.currency ?? "INR"),
    stockStatus: String(productInput.stock_status ?? "instock"),
    stockQuantity:
      productInput.stock_quantity == null
        ? 0
        : Number(productInput.stock_quantity),
    manageStock: Boolean(productInput.manage_stock),
    featured: Boolean(productInput.featured),
    onSale: Boolean(productInput.on_sale),
    categories,
    images,
    syncedAt: new Date(),
    metadata: productInput,
  };

  if (!isMongoReady()) {
    const existingIndex = demoState.products.findIndex(
      (product) => product.wooProductId === wooProductId
    );

    const demoProduct = {
      id:
        existingIndex >= 0
          ? demoState.products[existingIndex].id
          : `prod_${wooProductId}`,
      ...mapped,
      category: categories[0] ?? "",
      syncedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      demoState.products[existingIndex] = demoProduct;
    } else {
      demoState.products.unshift(demoProduct);
    }

    return demoProduct;
  }

  await connectToDatabase();

  return Product.findOneAndUpdate(
    { wooProductId },
    mapped,
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).lean();
}

export async function syncProductsFromWooCommerce() {
  const wooProducts = await fetchWooCommerceProducts();

  let syncedCount = 0;

  for (const product of wooProducts) {
    await upsertProductFromWooCommerce(
      product as unknown as Record<string, unknown>
    );

    syncedCount++;
  }

  return {
    success: true,
    syncedCount,
    message: `Successfully synchronized ${syncedCount} WooCommerce products`,
  };
}
