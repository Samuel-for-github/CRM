import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getSessionFromCookies } from '@/lib/auth';

export default async function AiAssistantPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');

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
            <form action="/api/ai/ask" method="post" className="space-y-4">
              <Input name="question" placeholder="Summarize this customer's purchase history" />
              <Textarea name="context" placeholder="Optional customer or order IDs" />
              <Button type="submit">Run analysis</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}