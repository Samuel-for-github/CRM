import { redirect, notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessionFromCookies } from '@/lib/auth';
import { getCustomerProfile } from '@/services/customers/service';
import { minorUnitsToCurrency } from '@/lib/money';
import { Button } from '@/components/ui/button';

export default async function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');

  try {
    const profile = await getCustomerProfile(params.id);
    return (
      <AppShell>
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-semibold">{profile.customer.firstName} {profile.customer.lastName}</h2>
              <p className="text-muted-foreground">WooCommerce ID: {profile.customer.wooCustomerId ?? 'Local CRM record'}</p>
            </div>
            <Button asChild variant="outline"><a href={`/api/ai/customer/${params.id}`}>Generate AI summary</a></Button>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Customer details</CardTitle></CardHeader>
              <CardContent>
                <p>Email: {profile.customer.email}</p>
                <p>Phone: {profile.customer.phone ?? '—'}</p>
                <p>Lifetime value: {minorUnitsToCurrency(profile.customer.lifetimeValueMinor ?? 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(profile.notes as any[]).map((note) => <div key={note._id ?? note.createdAt} className="rounded-lg border border-border p-3 text-sm">{note.note ?? note}</div>)}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Order history</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(profile.orders as any[]).map((order) => <div key={order.id ?? order._id} className="rounded-lg border border-border p-3 text-sm">Order {order.wooOrderId ?? order.id} - {order.status} - {minorUnitsToCurrency(order.totalMinor ?? 0)}</div>)}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  } catch {
    notFound();
  }
}