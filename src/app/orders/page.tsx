import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getSessionFromCookies } from '@/lib/auth';
import { getPaginationParams, buildPaginationMeta } from '@/lib/pagination';
import { listOrders } from '@/services/orders/service';
import { minorUnitsToCurrency } from '@/lib/money';

export default async function OrdersPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');

  const params = getPaginationParams(new URLSearchParams(searchParams as Record<string, string>));
  const { data, total } = await listOrders(params);
  const meta = buildPaginationMeta(total, params.page, params.limit);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">Orders</h2>
          <p className="text-muted-foreground">WooCommerce remains the source of truth for order state.</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Order list</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((order: any) => (
                  <TableRow key={order.id ?? order._id}>
                    <TableCell>{order.wooOrderId ?? order.id}</TableCell>
                    <TableCell><Badge variant={order.status === 'completed' ? 'secondary' : 'outline'}>{order.status}</Badge></TableCell>
                    <TableCell>{minorUnitsToCurrency(order.totalMinor ?? 0, order.currency ?? 'USD')}</TableCell>
                    <TableCell>{new Date(order.createdAt ?? order.createdAtWoo ?? Date.now()).toLocaleDateString()}</TableCell>
                    <TableCell><Button asChild variant="ghost"><Link href={`/orders/${order.id ?? order._id}`}>View</Link></Button></TableCell>
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