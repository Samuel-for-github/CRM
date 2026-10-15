import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getSessionFromCookies } from '@/lib/auth';
import { getPaginationParams, buildPaginationMeta } from '@/lib/pagination';
import { listCustomers } from '@/services/customers/service';

export default async function CustomersPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');

  const params = getPaginationParams(new URLSearchParams(searchParams as Record<string, string>));
  const { data, total } = await listCustomers(params);
  const meta = buildPaginationMeta(total, params.page, params.limit);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Customers</h2>
            <p className="text-muted-foreground">Search and manage CRM records.</p>
          </div>
          <Button asChild><Link href="/api/customers/new">Add customer</Link></Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer list</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>LTV</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((customer: any) => (
                  <TableRow key={customer.id ?? customer._id}>
                    <TableCell>{customer.firstName} {customer.lastName}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell><Badge variant={customer.source === 'woocommerce' ? 'secondary' : 'outline'}>{customer.source}</Badge></TableCell>
                    <TableCell>${((customer.lifetimeValueMinor ?? 0) / 100).toFixed(2)}</TableCell>
                    <TableCell><Button asChild variant="ghost"><Link href={`/customers/${customer.id ?? customer._id}`}>View</Link></Button></TableCell>
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