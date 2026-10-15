import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSessionFromCookies } from '@/lib/auth';
import { getPaginationParams, buildPaginationMeta } from '@/lib/pagination';
import { listTasks } from '@/services/tasks/service';

export default async function TasksPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');

  const params = getPaginationParams(new URLSearchParams(searchParams as Record<string, string>));
  const { data, total } = await listTasks(params);
  const meta = buildPaginationMeta(total, params.page, params.limit);

  return (
    <AppShell>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold">Follow-up tasks</h2>
            <p className="text-muted-foreground">Tracked customer actions and internal reminders.</p>
          </div>
          <Button asChild><a href="/ai-assistant">Ask AI for a task suggestion</a></Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.map((task: any) => (
              <div key={task.id ?? task._id} className="rounded-xl border border-border p-4">
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
            ))}
            <div className="text-sm text-muted-foreground">Page {meta.page} of {meta.totalPages}</div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}