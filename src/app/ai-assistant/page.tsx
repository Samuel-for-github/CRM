import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessionFromCookies } from '@/lib/auth';
import { getDashboardData } from '@/services/dashboard/service';
import { AssistantForm } from './assistant-form';

export default async function AiAssistantPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');
  const dashboard = await getDashboardData();
  const initialContext = JSON.stringify({
    totals: {
      customers: dashboard.totalCustomers,
      orders: dashboard.totalOrders,
      products: dashboard.totalProducts,
      sales: dashboard.totalSales,
      pendingOrders: dashboard.pendingOrders,
      completedOrders: dashboard.completedOrders,
      pendingTasks: dashboard.pendingTasks
    },
    recentCustomers: dashboard.recentCustomers,
    recentOrders: dashboard.recentOrders,
    recentProducts: dashboard.recentProducts
  });

  return (
    <AppShell>
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">AI Assistant</h2>
          <p className="text-muted-foreground">Ask questions about customers and orders using factual CRM data.</p>
        </div>
        <Card>
          <CardHeader><CardTitle>Ask the CRM</CardTitle></CardHeader>
          <CardContent>
            <AssistantForm initialContext={initialContext} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}