import { isMongoReady, connectToDatabase } from '@/lib/db';
import { demoState } from '@/lib/demo-store';
import { minorUnitsToCurrency } from '@/lib/money';
import { Customer } from '@/models/Customer';
import { Order } from '@/models/Order';
import { FollowUpTask } from '@/models/FollowUpTask';
import { SyncLog } from '@/models/SyncLog';

export async function getDashboardData() {
  if (!isMongoReady()) {
    const totalCustomers = demoState.customers.length;
    const totalOrders = demoState.orders.length;
    const revenueMinor = demoState.orders.reduce((sum, order) => sum + order.totalMinor, 0);
    const recentOrders = [...demoState.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    const recentCustomers = [...demoState.customers].sort((a, b) => (b.lastOrderAt ?? '').localeCompare(a.lastOrderAt ?? '')).slice(0, 5);
    const pendingTasks = demoState.tasks.filter((task) => task.status !== 'completed').length;

    return {
      totalCustomers,
      totalOrders,
      totalSales: minorUnitsToCurrency(revenueMinor),
      revenueMinor,
      pendingOrders: demoState.orders.filter((order) => order.status === 'pending').length,
      completedOrders: demoState.orders.filter((order) => order.status === 'completed').length,
      recentOrders,
      recentCustomers,
      syncStatus: 'Demo mode active',
      lastSyncAt: null,
      pendingTasks,
      aiInsights: [
        'Maya Patel is a high-value repeat customer with recent purchase activity.',
        'Noah Kim has been inactive for more than 90 days and is a follow-up candidate.'
      ]
    };
  }

  await connectToDatabase();
  const [totalCustomers, totalOrders, revenueAggregate, pendingOrders, completedOrders, recentOrders, recentCustomers, recentSync, pendingTasks] = await Promise.all([
    Customer.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, revenueMinor: { $sum: '$totalMinor' } } }]),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: 'completed' }),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
    Customer.find().sort({ updatedAt: -1 }).limit(5).lean(),
    SyncLog.findOne().sort({ startedAt: -1 }).lean(),
    FollowUpTask.countDocuments({ status: { $ne: 'completed' } })
  ]);

  const revenueMinor = revenueAggregate[0]?.revenueMinor ?? 0;

  return {
    totalCustomers,
    totalOrders,
    totalSales: minorUnitsToCurrency(revenueMinor),
    revenueMinor,
    pendingOrders,
    completedOrders,
    recentOrders,
    recentCustomers,
    syncStatus: recentSync?.message ?? 'Ready',
    lastSyncAt: recentSync?.startedAt ?? null,
    pendingTasks,
    aiInsights: []
  };
}