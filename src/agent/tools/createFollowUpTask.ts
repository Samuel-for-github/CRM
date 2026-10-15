import { z } from 'zod';
import { createTask } from '@/services/tasks/service';

const schema = z.object({
  customerId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  dueDate: z.string().datetime(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  confirm: z.boolean().default(false)
});

export async function createFollowUpTaskTool(input: unknown, actorId: string) {
  if (!actorId) throw new Error('Unauthorized');
  const parsed = schema.parse(input);
  if (!parsed.confirm) {
    return {
      needsConfirmation: true,
      task: {
        customerId: parsed.customerId,
        title: parsed.title,
        description: parsed.description,
        dueDate: parsed.dueDate,
        priority: parsed.priority
      }
    };
  }

  return createTask({
    customerId: parsed.customerId,
    title: parsed.title,
    description: parsed.description,
    dueDate: parsed.dueDate,
    priority: parsed.priority,
    status: 'pending'
  });
}