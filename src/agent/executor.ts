import { answerDataQuestion } from '@/services/ai/service';
import { agentTools } from './tools';

export type AgentRequest = {
  question: string;
  actorId: string;
  confirmWrite?: boolean;
};

export async function runAgent(request: AgentRequest) {
  const lower = request.question.toLowerCase();
  const toolCalls: Array<Promise<unknown>> = [];

  if (lower.includes('inactive') || lower.includes('not ordered')) {
    toolCalls.push(agentTools.findInactiveCustomers({ days: 90 }, request.actorId));
  }

  if (lower.includes('summary') || lower.includes('summarize')) {
    const matches = lower.match(/customer\s+([a-z0-9_-]+)/i);
    if (matches?.[1]) {
      toolCalls.push(agentTools.getCustomerSummary({ customerId: matches[1] }, request.actorId));
    }
  }

  if (lower.includes('follow up') || lower.includes('create task')) {
    const customerId = lower.match(/customer\s+([a-z0-9_-]+)/i)?.[1];
    if (customerId) {
      toolCalls.push(
        agentTools.createFollowUpTask(
          {
            customerId,
            title: 'Follow up with customer',
            description: request.question,
            dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
            priority: 'medium',
            confirm: Boolean(request.confirmWrite)
          },
          request.actorId
        )
      );
    }
  }

  const results = toolCalls.length > 0 ? await Promise.all(toolCalls) : [];
  const response = await answerDataQuestion(request.question, { results });

  return { results, response };
}