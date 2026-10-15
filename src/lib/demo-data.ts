import { minorUnitsToCurrency } from './money';

export type DemoCustomer = {
  id: string;
  wooCustomerId: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: 'woocommerce' | 'crm';
  lifetimeValueMinor: number;
  lastOrderAt?: string;
  notes: string[];
};

export type DemoOrder = {
  id: string;
  wooOrderId: number | null;
  customerId: string | null;
  status: 'pending' | 'processing' | 'completed';
  totalMinor: number;
  currency: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number; priceMinor: number }>;
};

export type DemoTask = {
  id: string;
  customerId: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in progress' | 'completed';
};

export const demoCustomers: DemoCustomer[] = [
  {
    id: 'cust_1001',
    wooCustomerId: 41,
    firstName: 'Maya',
    lastName: 'Patel',
    email: 'maya@example.com',
    phone: '+1 555 0101',
    source: 'woocommerce',
    lifetimeValueMinor: 184500,
    lastOrderAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    notes: ['Interested in premium bundles', 'Asked for faster shipping updates']
  },
  {
    id: 'cust_1002',
    wooCustomerId: null,
    firstName: 'Jordan',
    lastName: 'Lee',
    email: 'jordan.lee@example.com',
    phone: '+1 555 0102',
    source: 'crm',
    lifetimeValueMinor: 0,
    notes: ['Lead from support chat']
  },
  {
    id: 'cust_1003',
    wooCustomerId: 58,
    firstName: 'Noah',
    lastName: 'Kim',
    email: 'noah@example.com',
    source: 'woocommerce',
    lifetimeValueMinor: 97300,
    lastOrderAt: new Date(Date.now() - 104 * 86400000).toISOString(),
    notes: ['Potential repeat buyer']
  }
];

export const demoOrders: DemoOrder[] = [
  {
    id: 'ord_2001',
    wooOrderId: 1007,
    customerId: 'cust_1001',
    status: 'completed',
    totalMinor: 124500,
    currency: 'USD',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    items: [
      { name: 'Starter Kit', quantity: 1, priceMinor: 89000 },
      { name: 'Express Shipping', quantity: 1, priceMinor: 35500 }
    ]
  },
  {
    id: 'ord_2002',
    wooOrderId: 1008,
    customerId: 'cust_1003',
    status: 'pending',
    totalMinor: 97300,
    currency: 'USD',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    items: [{ name: 'Replacement Filters', quantity: 2, priceMinor: 48650 }]
  },
  {
    id: 'ord_2003',
    wooOrderId: null,
    customerId: null,
    status: 'processing',
    totalMinor: 5500,
    currency: 'USD',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    items: [{ name: 'Guest Order Fee', quantity: 1, priceMinor: 5500 }]
  }
];

export const demoTasks: DemoTask[] = [
  {
    id: 'task_3001',
    customerId: 'cust_1001',
    title: 'Follow up about bundle discount',
    description: 'Ask Maya if she wants a tailored premium bundle quote.',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    priority: 'high',
    status: 'pending'
  }
];

export function demoRevenueLabel() {
  return minorUnitsToCurrency(demoOrders.reduce((sum, order) => sum + order.totalMinor, 0));
}