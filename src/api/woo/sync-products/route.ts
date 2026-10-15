
import { NextResponse } from "next/server";
import { syncProductsFromWooCommerce } from "@/services/product";

export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await syncProductsFromWooCommerce();

    return NextResponse.json(result);
  } catch (error) {
    console.error("WooCommerce sync failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "WooCommerce synchronization failed",
      },
      { status: 500 }
    );
  }
}
