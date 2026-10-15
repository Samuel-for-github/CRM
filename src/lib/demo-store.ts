import { demoCustomers, demoOrders, demoTasks, type DemoCustomer, type DemoOrder, type DemoTask } from './demo-data';

export const demoState = {
  customers: [...demoCustomers] as DemoCustomer[],
  orders: [...demoOrders] as DemoOrder[],
  tasks: [...demoTasks] as DemoTask[],
  notesByCustomerId: new Map<string, string[]>(
    demoCustomers.map((customer) => [customer.id, [...customer.notes]])
  ),
  syncLog: [] as Array<{ id: string; startedAt: string; message: string }>
};

export function resetDemoState() {
  demoState.customers = [...demoCustomers];
  demoState.orders = [...demoOrders];
  demoState.tasks = [...demoTasks];
  demoState.notesByCustomerId = new Map(
    demoCustomers.map((customer) => [customer.id, [...customer.notes]])
  );
  demoState.syncLog = [];
}