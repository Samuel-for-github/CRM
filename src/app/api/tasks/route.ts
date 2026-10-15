import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth';
import { taskListQuerySchema, taskUpsertSchema } from '@/lib/validation/task';
import { createTask, listTasks } from '@/services/tasks/service';

export async function GET(request: Request) {
  if (!(await getSessionFromCookies())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = new URL(request.url);
  const params = taskListQuerySchema.parse({
    page: url.searchParams.get('page') ?? 1,
    limit: url.searchParams.get('limit') ?? 10,
    search: url.searchParams.get('search') ?? '',
    status: url.searchParams.get('status') ?? ''
  });
  return NextResponse.json(await listTasks(params));
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = taskUpsertSchema.parse(await request.json());
  const task = await createTask(payload);
  return NextResponse.json(task, { status: 201 });
}