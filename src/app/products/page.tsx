import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { getSessionFromCookies } from '@/lib/auth';
import WooProductsPage from './products-client';

export default async function ProductsPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');

  return (
    <AppShell>
      <WooProductsPage />
    </AppShell>
  );
}
