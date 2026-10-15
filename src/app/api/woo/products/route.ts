
import { NextResponse } from "next/server";
import { getWooCommerceProducts } from "@/lib/woocommerce";
import { upsertProductFromWooCommerce } from "@/services/product";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await getSessionFromCookies())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await getWooCommerceProducts();

    for (const product of products) {
      await upsertProductFromWooCommerce(
        product as unknown as Record<string, unknown>
      );
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("WooCommerce products error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch WooCommerce products",
        error:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
