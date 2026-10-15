'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Package, RefreshCw, Search, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Product {
  id: number;
  name: string;
  price: string;
  sku: string;
  stock_status: string;
  images: { src: string; alt: string }[];
  categories: { id: number; name: string }[];
}

const stockLabels: Record<string, string> = {
  instock: 'In stock',
  outofstock: 'Out of stock',
  onbackorder: 'On backorder',
};

function stockVariant(status: string): 'default' | 'secondary' | 'destructive' {
  if (status === 'outofstock') return 'destructive';
  if (status === 'onbackorder') return 'secondary';
  return 'default';
}

export default function WooProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  async function loadProducts() {
    setLoading(true);
    setError('');

    try {
      const syncResponse = await fetch('/api/woo/sync?scope=products', {
        cache: 'no-store',
      });
      const syncBody = await syncResponse.text();

      if (!syncResponse.ok) {
        throw new Error(`Product sync failed (${syncResponse.status}): ${syncBody}`);
      }

      const response = await fetch('/api/woo/products', { cache: 'no-store' });
      const body = await response.text();

      console.log('API status:', response.status);
      console.log('API response:', body);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${body}`);
      }

      setProducts(JSON.parse(body) as Product[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.sku?.toLowerCase().includes(normalizedQuery) ||
        product.categories.some((category) =>
          category.name.toLowerCase().includes(normalizedQuery)
        );
      const matchesStock =
        stockFilter === 'all' || product.stock_status === stockFilter;

      return matchesQuery && matchesStock;
    });
  }, [products, query, stockFilter]);

  const outOfStockCount = products.filter(
    (product) => product.stock_status === 'outofstock'
  ).length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(248,250,252,1)_40%,_rgba(226,232,240,0.85))] px-4 py-6 text-foreground sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-primary">
              Catalog
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Products
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Browse and monitor your WooCommerce catalog in one place.
            </p>
          </div>
          <Button variant="outline" onClick={loadProducts} disabled={loading}>
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh catalog
          </Button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total products</p>
                <p className="mt-1 text-2xl font-semibold">{products.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-xl bg-destructive/10 p-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of stock</p>
                <p className="mt-1 text-2xl font-semibold">{outOfStockCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="gap-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Product catalog</CardTitle>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products..."
                  className="pl-9 sm:w-64"
                />
              </div>
              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Filter by stock status"
              >
                <option value="all">All stock statuses</option>
                <option value="instock">In stock</option>
                <option value="outofstock">Out of stock</option>
                <option value="onbackorder">On backorder</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {error ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="font-medium">Unable to load products</p>
                <p className="max-w-xl text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={loadProducts}>
                  Try again
                </Button>
              </div>
            ) : loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-72 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <Package className="h-10 w-10 text-muted-foreground/50" />
                <p className="font-medium">No products found</p>
                <p className="text-sm text-muted-foreground">
                  Try changing your search or stock filter.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-xl border border-border bg-background transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].src}
                          alt={product.images[0].alt || product.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <Package className="h-12 w-12 opacity-30" />
                        </div>
                      )}
                      <Badge
                        variant={stockVariant(product.stock_status)}
                        className="absolute left-3 top-3 shadow-sm"
                      >
                        {stockLabels[product.stock_status] ?? product.stock_status}
                      </Badge>
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="line-clamp-2 font-semibold">{product.name}</h2>
                        <p className="shrink-0 font-semibold text-primary">
                          ${product.price || '0.00'}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        SKU: {product.sku || 'Not set'}
                      </p>
                      {product.categories.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Tag className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {product.categories.map((category) => category.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
