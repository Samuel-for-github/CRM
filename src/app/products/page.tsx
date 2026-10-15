import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getSessionFromCookies } from '@/lib/auth';
import { getPaginationParams, buildPaginationMeta } from '@/lib/pagination';
import { listProducts } from '@/services/products/service';
import { minorUnitsToCurrency } from '@/lib/money';

export default async function ProductsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');

  const params = getPaginationParams(new URLSearchParams(searchParams as Record<string, string>));
  const { data, total } = await listProducts(params);
  const meta = buildPaginationMeta(total, params.page, params.limit);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">Products</h2>
          <p className="text-muted-foreground">Track inventory, price, and product activity across the WooCommerce catalog.</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Catalog</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((product: any) => (
                  <TableRow key={product.id ?? product._id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sku || '—'}</TableCell>
                    <TableCell>{minorUnitsToCurrency(product.priceMinor ?? 0, product.currency ?? 'USD')}</TableCell>
                    <TableCell>{product.stockQuantity ?? 0}</TableCell>
                    <TableCell><Badge variant={product.stockStatus === 'instock' ? 'secondary' : 'outline'}>{product.stockStatus ?? 'unknown'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-sm text-muted-foreground">Page {meta.page} of {meta.totalPages}</div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
