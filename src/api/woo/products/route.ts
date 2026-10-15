
import { NextResponse } from "next/server";
import { getWooCommerceProducts } from "@/lib/woocommerce";

export async function GET() {
  try {
    const products = await getWooCommerceProducts();
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
