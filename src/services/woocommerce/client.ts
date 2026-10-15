import { getEnv, isDemoMode } from '@/lib/env';
import { AppError } from '@/lib/errors';

type WooFetchOptions = {
  path: string;
  params?: Record<string, string | number | undefined>;
  timeoutMs?: number;
};

function buildWooUrl(path: string, params?: Record<string, string | number | undefined>) {
  const env = getEnv();
  const url = new URL(`/wp-json/wc/v3/${path.replace(/^\//, '')}`, env.WOO_STORE_URL);
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  url.search = searchParams.toString();
  return url;
}

export function isWooCommerceConfigured() {
  const env = getEnv();
  return Boolean(env.WOO_STORE_URL && env.WOO_CONSUMER_KEY && env.WOO_CONSUMER_SECRET && !isDemoMode());
}

export async function wooFetch<T>({ path, params, timeoutMs = 15000 }: WooFetchOptions): Promise<T> {
  if (!isWooCommerceConfigured()) {
    throw new AppError('WooCommerce is not configured', 400);
  }

  const env = getEnv();
  const url = buildWooUrl(path, params);
  url.searchParams.set('consumer_key', env.WOO_CONSUMER_KEY as string);
  url.searchParams.set('consumer_secret', env.WOO_CONSUMER_SECRET as string);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new AppError(`WooCommerce request failed with status ${response.status}`, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AppError('WooCommerce request timed out', 504);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('WooCommerce request failed', 502);
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchWooPaginated<T>(path: string, perPage = 100) {
  const aggregated: T[] = [];
  let page = 1;

  while (true) {
    const batch = await wooFetch<T[]>({ path, params: { per_page: perPage, page } });
    aggregated.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
  }

  return aggregated;
}