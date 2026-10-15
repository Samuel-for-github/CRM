import { demoCustomers, demoOrders, demoProducts, demoTasks, type DemoCustomer, type DemoOrder, type DemoProduct, type DemoTask } from './demo-data';

export const demoState = {
  customers: [...demoCustomers] as DemoCustomer[],
  orders: [...demoOrders] as DemoOrder[],
  products: [...demoProducts] as DemoProduct[],
  tasks: [...demoTasks] as DemoTask[],
  notesByCustomerId: new Map<string, string[]>(
    demoCustomers.map((customer) => [customer.id, [...customer.notes]])
  ),
  syncLog: [] as Array<{ id: string; startedAt: string; message: string }>
};

export function resetDemoState() {
  demoState.customers = [...demoCustomers];
  demoState.orders = [...demoOrders];
  demoState.products = [...demoProducts];
  demoState.tasks = [...demoTasks];
  demoState.notesByCustomerId = new Map(
    demoCustomers.map((customer) => [customer.id, [...customer.notes]])
  );
  demoState.syncLog = [];
}