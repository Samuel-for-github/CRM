import { connectToDatabase, isMongoReady } from '@/lib/db';
import { demoState } from '@/lib/demo-store';
import { randomId } from '@/lib/auth';
import { Customer } from '@/models/Customer';
import { CustomerNote } from '@/models/CustomerNote';
import { AppError } from '@/lib/errors';
import { customerUpsertSchema } from '@/lib/validation/customer';

export type CustomerInput = ReturnType<typeof customerUpsertSchema.parse>;

export async function listCustomers({ page, limit, search }: { page: number; limit: number; search: string }) {
  if (!isMongoReady()) {
    const filtered = demoState.customers.filter((customer) => {
      const haystack = `${customer.firstName} ${customer.lastName} ${customer.email} ${customer.phone ?? ''}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
    const total = filtered.length;
    const data = filtered.slice((page - 1) * limit, page * limit);
    return { data, total };
  }

  await connectToDatabase();
  const query = search
    ? {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }
    : {};

  const [data, total] = await Promise.all([
    Customer.find(query).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Customer.countDocuments(query)
  ]);

  return { data, total };
}

export async function getCustomerById(customerId: string) {
  if (!isMongoReady()) {
    const customer = demoState.customers.find((item) => item.id === customerId);
    if (!customer) throw new AppError('Customer not found', 404);
    return customer;
  }

  await connectToDatabase();
  const customer = await Customer.findById(customerId).lean();
  if (!customer) throw new AppError('Customer not found', 404);
  return customer;
}

export async function createCustomer(input: CustomerInput) {
  const parsed = customerUpsertSchema.parse(input);

  if (!isMongoReady()) {
    const created = {
      id: randomId('cust'),
      wooCustomerId: null,
      ...parsed,
      source: parsed.source,
      lifetimeValueMinor: 0,
      orderCount: 0,
      notesSummary: parsed.notesSummary ?? '',
      syncedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: parsed.tags
    };
    demoState.customers.unshift(created);
    demoState.notesByCustomerId.set(created.id, []);
    return created;
  }

  await connectToDatabase();
  const customer = await Customer.create({ ...parsed, notesSummary: parsed.notesSummary ?? '' });
  return customer.toObject();
}

export async function updateCustomer(customerId: string, input: CustomerInput) {
  const parsed = customerUpsertSchema.parse(input);

  if (!isMongoReady()) {
    const index = demoState.customers.findIndex((item) => item.id === customerId);
    if (index === -1) throw new AppError('Customer not found', 404);
    const existing = demoState.customers[index];
    const updated = { ...existing, ...parsed, updatedAt: new Date().toISOString() };
    demoState.customers[index] = updated;
    return updated;
  }

  await connectToDatabase();
  const updated = await Customer.findByIdAndUpdate(customerId, parsed, { new: true }).lean();
  if (!updated) throw new AppError('Customer not found', 404);
  return updated;
}

export async function deleteCustomer(customerId: string) {
  if (!isMongoReady()) {
    const index = demoState.customers.findIndex((item) => item.id === customerId);
    if (index === -1) throw new AppError('Customer not found', 404);
    demoState.customers.splice(index, 1);
    demoState.orders = demoState.orders.filter((order) => order.customerId !== customerId);
    demoState.tasks = demoState.tasks.filter((task) => task.customerId !== customerId);
    demoState.notesByCustomerId.delete(customerId);
    return { deleted: true };
  }

  await connectToDatabase();
  const deleted = await Customer.findByIdAndDelete(customerId);
  if (!deleted) throw new AppError('Customer not found', 404);
  await CustomerNote.deleteMany({ customer: customerId });
  return { deleted: true };
}

export async function addCustomerNote(customerId: string, note: string, authorId?: string) {
  if (!isMongoReady()) {
    const notes = demoState.notesByCustomerId.get(customerId);
    if (!notes) throw new AppError('Customer not found', 404);
    notes.unshift(note);
    demoState.notesByCustomerId.set(customerId, notes);
    return { id: randomId('note'), customerId, note, createdAt: new Date().toISOString(), authorId };
  }

  await connectToDatabase();
  const created = await CustomerNote.create({ customer: customerId, note, author: authorId });
  return created.toObject();
}

export async function getCustomerProfile(customerId: string) {
  const customer = await getCustomerById(customerId);

  if (!isMongoReady()) {
    const orders = demoState.orders.filter((order) => order.customerId === customerId);
    const notes = demoState.notesByCustomerId.get(customerId) ?? [];
    return { customer, orders, notes };
  }

  await connectToDatabase();
  const [orders, notes] = await Promise.all([
    import('@/models/Order').then(({ Order }) => Order.find({ customer: customerId }).sort({ createdAt: -1 }).lean()),
    CustomerNote.find({ customer: customerId }).sort({ createdAt: -1 }).lean()
  ]);
  return { customer, orders, notes };
}

export async function findInactiveCustomers(days = 90) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  if (!isMongoReady()) {
    return demoState.customers.filter((customer) => !customer.lastOrderAt || new Date(customer.lastOrderAt) < cutoff);
  }

  await connectToDatabase();
  return Customer.find({ $or: [{ lastOrderAt: { $exists: false } }, { lastOrderAt: { $lt: cutoff } }] })
    .sort({ lastOrderAt: 1 })
    .lean();
}