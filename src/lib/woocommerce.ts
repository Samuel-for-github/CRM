
import OAuth from "oauth-1.0a";
import crypto from "crypto";
import { getEnv } from "./env";

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: string;
  stock_quantity: number | null;
  manage_stock: boolean;
  featured: boolean;
  on_sale: boolean;
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  images: {
    id: number;
    src: string;
    alt: string;
  }[];
}

export async function getWooCommerceProducts(): Promise<
  WooCommerceProduct[]
> {
  const { WOO_STORE_URL: storeUrl, WOO_CONSUMER_KEY: consumerKey, WOO_CONSUMER_SECRET: consumerSecret } = getEnv();

  if (!storeUrl || !consumerKey || !consumerSecret) {
    throw new Error(
      "Missing WooCommerce environment variables. Check .env.local."
    );
  }

  const url = `${storeUrl.replace(/\/$/, "")}/wp-json/wc/v3/products`;

  const oauth = new OAuth({
    consumer: {
      key: consumerKey,
      secret: consumerSecret,
    },
    signature_method: "HMAC-SHA1",
    hash_function(baseString, key) {
      return crypto
        .createHmac("sha1", key)
        .update(baseString)
        .digest("base64");
    },
  });

  const requestData = {
    url,
    method: "GET",
  };

  const headers = oauth.toHeader(oauth.authorize(requestData));

  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: headers.Authorization },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `WooCommerce returned HTTP ${response.status}: ${errorBody}`
    );
  }

  return (await response.json()) as WooCommerceProduct[];
}

export const fetchWooCommerceProducts = getWooCommerceProducts;
