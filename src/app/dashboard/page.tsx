import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getSessionFromCookies } from '@/lib/auth';
import { getDashboardData } from '@/services/dashboard/service';
import { getDashboardInsights } from '@/services/ai/service';

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-sm text-muted-foreground">{label}</p>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');

  const data = await getDashboardData();
  const aiInsight = data.aiInsights.length > 0 ? data.aiInsights.join(' ') : await getDashboardInsights();

  return (
    <AppShell>
      <div className="p-6 lg:p-8 space-y-8 animate-fadeUp">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Overview</p>
            <h2 className="mt-2 text-3xl font-semibold">Dashboard</h2>
            <p className="text-muted-foreground">WooCommerce sync status, revenue, and AI-assisted customer signals.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link href="/customers">Customers</Link></Button>
            <Button asChild><Link href="/api/woo/sync?scope=all">Run sync</Link></Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total customers" value={data.totalCustomers} hint="CRM and WooCommerce customers" />
          <MetricCard label="Total orders" value={data.totalOrders} hint="Synced orders in the system" />
          <MetricCard label="Total sales" value={data.totalSales} hint="Revenue across stored orders" />
          <MetricCard label="Open tasks" value={data.pendingTasks} hint="Requires follow-up" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Recent orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.wooOrderId ?? order.id}</TableCell>
                      <TableCell><Badge variant={order.status === 'completed' ? 'secondary' : 'outline'}>{order.status}</Badge></TableCell>
                      <TableCell>{order.totalMinor ? `$${(order.totalMinor / 100).toFixed(2)}` : '—'}</TableCell>
                      <TableCell>{new Date(order.createdAt ?? order.createdAtWoo ?? Date.now()).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI customer insight</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{aiInsight}</p>
              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <p>Sync status: {data.syncStatus}</p>
                <p>Last sync: {data.lastSyncAt ? new Date(data.lastSyncAt).toLocaleString() : 'Demo mode'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent customer activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.recentCustomers.map((customer: any) => (
                <div key={customer.id ?? customer._id} className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                  <p className="mt-2 text-sm">LTV: {(customer.lifetimeValueMinor ?? 0) / 100}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}