import { describe, expect, it } from 'vitest';
import { buildWooOAuthHeader } from '../services/woocommerce/client';

describe('WooCommerce OAuth 1.0', () => {
  it('builds an OAuth Authorization header with a valid signature', () => {
    const header = buildWooOAuthHeader({
      method: 'GET',
      url: 'https://example.com/wp-json/wc/v3/products?per_page=10&page=1',
      consumerKey: 'ck_test_key',
      consumerSecret: 'cs_test_secret'
    });

    expect(header).toContain('OAuth ');
    expect(header).toContain('oauth_consumer_key="ck_test_key"');
    expect(header).toContain('oauth_signature_method="HMAC-SHA1"');
    expect(header).toContain('oauth_version="1.0"');
    expect(header).toContain('oauth_signature="');
    expect(header).toContain('oauth_nonce="');
    expect(header).toContain('oauth_timestamp="');
  });
});
