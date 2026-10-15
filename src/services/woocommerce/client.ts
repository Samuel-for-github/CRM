import crypto from 'node:crypto';
import { getEnv, isDemoMode } from '@/lib/env';
import { AppError } from '@/lib/errors';

type WooFetchOptions = {
  path: string;
  params?: Record<string, string | number | undefined>;
  timeoutMs?: number;
};

type WooOAuthHeaderOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  consumerKey: string;
  consumerSecret: string;
  params?: Record<string, string | number | undefined>;
};

function percentEncode(value: string) {
  return encodeURIComponent(value)
    .replace(/%7E/g, '~')
    .replace(/%20/g, '+');
}

export function buildWooOAuthHeader({ method, url, consumerKey, consumerSecret, params = {} }: WooOAuthHeaderOptions) {
  const targetUrl = new URL(url);
  const oauthNonce = crypto.randomBytes(16).toString('hex');
  const oauthTimestamp = String(Math.floor(Date.now() / 1000));

  const oauthParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      oauthParams.set(key, String(value));
    }
  }
  for (const [key, value] of targetUrl.searchParams.entries()) {
    oauthParams.set(key, value);
  }

  oauthParams.set('oauth_consumer_key', consumerKey);
  oauthParams.set('oauth_nonce', oauthNonce);
  oauthParams.set('oauth_signature_method', 'HMAC-SHA1');
  oauthParams.set('oauth_timestamp', oauthTimestamp);
  oauthParams.set('oauth_version', '1.0');

  const sortedEntries = [...oauthParams.entries()].sort(([left], [right]) => left.localeCompare(right));
  const normalizedParams = sortedEntries
    .map(([key, value]) => `${percentEncode(key)}=${percentEncode(value)}`)
    .join('&');

  const signatureBaseString = [
    method.toUpperCase(),
    percentEncode(`${targetUrl.origin}${targetUrl.pathname}`),
    percentEncode(normalizedParams)
  ].join('&');

  const signingKey = `${percentEncode(consumerSecret)}&`;
  const oauthSignature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64');

  return [
    `OAuth oauth_consumer_key="${percentEncode(consumerKey)}"`,
    `oauth_nonce="${percentEncode(oauthNonce)}"`,
    `oauth_signature="${percentEncode(oauthSignature)}"`,
    'oauth_signature_method="HMAC-SHA1"',
    `oauth_timestamp="${oauthTimestamp}"`,
    'oauth_version="1.0"'
  ].join(', ');
}

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
  const authHeader = buildWooOAuthHeader({
    method: 'GET',
    url: url.toString(),
    consumerKey: env.WOO_CONSUMER_KEY as string,
    consumerSecret: env.WOO_CONSUMER_SECRET as string,
    params
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        Authorization: authHeader
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