import { describe, expect, it } from 'vitest';
import { listProducts } from '../services/products/service';

describe('Product tracking', () => {
  it('returns demo products in demo mode', async () => {
    const products = await listProducts({ page: 1, limit: 10, search: '' });
    expect(products.total).toBeGreaterThan(0);
    expect(products.data[0]).toHaveProperty('name');
  });
});
