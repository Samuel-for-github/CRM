import Link from 'next/link';
import { BarChart3, Users, ShoppingBag, ClipboardList, Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getSessionFromCookies } from '@/lib/auth';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/ai-assistant', label: 'AI Assistant', icon: Sparkles }
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookies();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(248,250,252,1)_40%,_rgba(226,232,240,0.85))] text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 p-4 lg:p-6">
        <aside className="hidden w-72 shrink-0 flex-col justify-between rounded-2xl border border-border bg-card/90 p-5 shadow-soft lg:flex">
          <div>
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">AI CRM</p>
              <h1 className="mt-2 text-2xl font-semibold">WooCommerce Command Center</h1>
            </div>
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3">
            <Separator />
            <div className="text-sm text-muted-foreground">
              {session ? <p>Signed in as {session.email}</p> : <p>Demo mode available</p>}
            </div>
            <form action="/api/auth/logout" method="post">
              <Button variant="outline" className="w-full" type="submit">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden rounded-2xl border border-border bg-card/90 shadow-soft">
          {children}
        </main>
      </div>
    </div>
  );
}