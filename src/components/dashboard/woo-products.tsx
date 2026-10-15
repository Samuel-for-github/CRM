'use client';

import { useEffect, useState } from 'react';

type WooProduct = {
  id: number;
  name: string;
  price: string;
  sku: string;
  stock_status: string;
};

export function WooProductCount({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    fetch('/api/woo/products', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return;
        const products = (await response.json()) as WooProduct[];
        setCount(products.length);
      })
      .catch((error) => {
        console.error('Unable to refresh dashboard product count:', error);
      });
  }, []);

  return <>{count}</>;
}

export function WooProducts() {
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch('/api/woo/products');
        const body = await response.text();

        console.log('API status:', response.status);
        console.log('API response:', body);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${body}`);
        }

        setProducts(JSON.parse(body) as WooProduct[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    loadProducts();
  }, []);

  if (error) {
    return <p className="text-sm text-destructive">Unable to load products: {error}</p>;
  }

  if (products.length === 0) {
    return <p className="text-sm text-muted-foreground">Loading products...</p>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {products.map((product) => (
        <div key={product.id} className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-muted-foreground">{product.sku || 'No SKU'}</p>
          <p className="mt-2 text-sm">
            Price: {product.price || '0.00'} | Stock: {product.stock_status}
          </p>
        </div>
      ))}
    </div>
  );
}
