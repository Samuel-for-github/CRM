import { HfInference } from '@huggingface/inference';
import { getEnv } from '@/lib/env';
import { AppError } from '@/lib/errors';
import { minorUnitsToCurrency } from '@/lib/money';
import { getCustomerProfile, findInactiveCustomers } from '@/services/customers/service';
import { getOrdersForCustomer } from '@/services/orders/service';

function getInferenceClient() {
  const env = getEnv();
  if (!env.HUGGING_FACE_TOKEN) {
    return null;
  }

  return new HfInference(env.HUGGING_FACE_TOKEN);
}

function summarizeFacts(customer: any, orders: any[]) {
  const revenueMinor = orders.reduce((sum, order) => sum + Number(order.totalMinor ?? 0), 0);
  const completedOrders = orders.filter((order) => order.status === 'completed').length;
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const lastOrderAt = orders[0]?.createdAt ?? customer.lastOrderAt ?? null;
  return {
    name: `${customer.firstName} ${customer.lastName}`,
    source: customer.source,
    lifetimeValue: minorUnitsToCurrency(customer.lifetimeValueMinor ?? revenueMinor, customer.currency ?? 'USD'),
    revenueMinor,
    completedOrders,
    pendingOrders,
    lastOrderAt,
    notes: customer.notesSummary ?? '',
    orderCount: orders.length
  };
}

async function generateText(prompt: string) {
  const env = getEnv();
  const client = getInferenceClient();
  if (!client) {
    return null;
  }

  try {
    const response = await client.chatCompletion({
      model: env.HUGGING_FACE_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You summarize customer relationship data without inventing facts. Use only the provided facts.'
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.3
    });

    return response.choices[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

export async function getCustomerInsight(customerId: string) {
  const profile = await getCustomerProfile(customerId);
  const orders = await getOrdersForCustomer(customerId);
  const facts = summarizeFacts(profile.customer, orders);

  const prompt = [
    `Customer facts: ${JSON.stringify(facts)}`,
    'Write a concise customer summary, follow-up suggestions, and a short communication draft.',
    'Do not add facts that are not present in the data.'
  ].join('\n');

  const summary = await generateText(prompt);
  return {
    facts,
    summary: summary ?? `Customer ${facts.name} has ${facts.orderCount} orders and a lifetime value of ${facts.lifetimeValue}.`,
    inactive: (await findInactiveCustomers(90)).some((customer: any) => String(customer.id ?? customer._id) === customerId)
  };
}

export async function answerDataQuestion(question: string, context: Record<string, unknown>) {
  const prompt = [
    'Use the provided CRM facts only.',
    `Question: ${question}`,
    `Context: ${JSON.stringify(context)}`,
    'Answer clearly. If the facts are insufficient, say so.'
  ].join('\n');

  const answer = await generateText(prompt);
  return answer ?? 'AI is unavailable right now. The requested facts are available in the dashboard and records above.';
}

export async function getInactiveCustomerSummary(days = 90) {
  const inactiveCustomers = await findInactiveCustomers(days);
  const prompt = `Summarize these inactive customers in one short paragraph without inventing facts: ${JSON.stringify(
    inactiveCustomers.map((customer: any) => ({
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      lastOrderAt: customer.lastOrderAt,
      lifetimeValueMinor: customer.lifetimeValueMinor
    }))
  )}`;

  const summary = await generateText(prompt);
  return {
    inactiveCustomers,
    summary: summary ?? `Found ${inactiveCustomers.length} inactive customers using the ${days}-day rule.`
  };
}

export async function getDashboardInsights() {
  try {
    const inactiveSummary = await getInactiveCustomerSummary(90);
    return inactiveSummary.summary;
  } catch (error) {
    if (error instanceof AppError) throw error;
    return 'AI insight generation is unavailable. Use the dashboard data and customer lists for manual review.';
  }
}