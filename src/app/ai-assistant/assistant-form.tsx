'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function AssistantForm({ initialContext = '' }: { initialContext?: string }) {
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState(initialContext);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setAnswer('');
    setError('');

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context }),
      });
      const body = (await response.json()) as { answer?: string; error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? `Request failed with status ${response.status}`);
      }

      setAnswer(body.answer ?? 'No answer was returned.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to contact the AI assistant.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-4">
        <Input
          name="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Summarize this customer's purchase history"
          required
        />
        <Textarea
          name="context"
          value={context}
          onChange={(event) => setContext(event.target.value)}
          placeholder="CRM facts used to answer the question"
          rows={4}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Run analysis'}
        </Button>
      </form>

      {error && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {answer && (
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="mb-1 text-sm font-medium">AI response</p>
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  );
}
