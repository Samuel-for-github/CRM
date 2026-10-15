import { redirect, notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessionFromCookies } from '@/lib/auth';
import { getOrderById } from '@/services/orders/service';
import { minorUnitsToCurrency } from '@/lib/money';

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');

  try {
    const order = await getOrderById(params.id);
    return (
      <AppShell>
        <div className="p-6 lg:p-8 space-y-6">
          <h2 className="text-3xl font-semibold">Order {order.wooOrderId ?? order.id}</h2>
          <Card>
            <CardHeader><CardTitle>Order details</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p>Status: {order.status}</p>
              <p>Total: {minorUnitsToCurrency(order.totalMinor ?? 0, order.currency ?? 'USD')}</p>
              <p>Created: {new Date(order.createdAt ?? order.createdAtWoo ?? Date.now()).toLocaleString()}</p>
              <p>Items: {(order.items ?? []).map((item: any) => `${item.quantity} x ${item.name}`).join(', ')}</p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  } catch {
    notFound();
  }
}