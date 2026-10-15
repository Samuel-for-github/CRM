import { connectToDatabase, isMongoReady } from '@/lib/db';
import { demoState } from '@/lib/demo-store';
import { randomId } from '@/lib/auth';
import { FollowUpTask } from '@/models/FollowUpTask';
import { AppError } from '@/lib/errors';

export async function listTasks({ page, limit, search, status }: { page: number; limit: number; search: string; status: string }) {
  if (!isMongoReady()) {
    const filtered = demoState.tasks.filter((task) => {
      const matchesSearch = !search || `${task.title} ${task.description}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !status || task.status === status;
      return matchesSearch && matchesStatus;
    });
    return { data: filtered.slice((page - 1) * limit, page * limit), total: filtered.length };
  }

  await connectToDatabase();
  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];

  const [data, total] = await Promise.all([
    FollowUpTask.find(query).sort({ dueDate: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    FollowUpTask.countDocuments(query)
  ]);
  return { data, total };
}

export async function createTask(input: { customerId: string; title: string; description: string; dueDate: string; priority: 'low' | 'medium' | 'high'; status: 'pending' | 'in progress' | 'completed' }) {
  if (!isMongoReady()) {
    const created = {
      id: randomId('task'),
      ...input,
      dueDate: input.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    demoState.tasks.unshift(created);
    return created;
  }

  await connectToDatabase();
  const created = await FollowUpTask.create({
    ...input,
    customer: input.customerId,
    dueDate: new Date(input.dueDate)
  });
  return created.toObject();
}

export async function updateTask(taskId: string, input: Partial<{ title: string; description: string; dueDate: string; priority: 'low' | 'medium' | 'high'; status: 'pending' | 'in progress' | 'completed' }>) {
  if (!isMongoReady()) {
    const index = demoState.tasks.findIndex((task) => task.id === taskId);
    if (index === -1) throw new AppError('Task not found', 404);
    demoState.tasks[index] = { ...demoState.tasks[index], ...input, updatedAt: new Date().toISOString() };
    return demoState.tasks[index];
  }

  await connectToDatabase();
  const updated = await FollowUpTask.findByIdAndUpdate(taskId, {
    ...input,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined
  }, { new: true }).lean();
  if (!updated) throw new AppError('Task not found', 404);
  return updated;
}

export async function deleteTask(taskId: string) {
  if (!isMongoReady()) {
    const index = demoState.tasks.findIndex((task) => task.id === taskId);
    if (index === -1) throw new AppError('Task not found', 404);
    demoState.tasks.splice(index, 1);
    return { deleted: true };
  }

  await connectToDatabase();
  const deleted = await FollowUpTask.findByIdAndDelete(taskId);
  if (!deleted) throw new AppError('Task not found', 404);
  return { deleted: true };
}

export async function getTaskById(taskId: string) {
  if (!isMongoReady()) {
    const task = demoState.tasks.find((item) => item.id === taskId);
    if (!task) throw new AppError('Task not found', 404);
    return task;
  }

  await connectToDatabase();
  const task = await FollowUpTask.findById(taskId).lean();
  if (!task) throw new AppError('Task not found', 404);
  return task;
}