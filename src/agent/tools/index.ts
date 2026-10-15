import { searchCustomers } from './searchCustomers';
import { getCustomerOrdersTool } from './getCustomerOrders';
import { getCustomerSummaryTool } from './getCustomerSummary';
import { findInactiveCustomersTool } from './findInactiveCustomers';
import { createFollowUpTaskTool } from './createFollowUpTask';

export const agentTools = {
  searchCustomers,
  getCustomerOrders: getCustomerOrdersTool,
  getCustomerSummary: getCustomerSummaryTool,
  findInactiveCustomers: findInactiveCustomersTool,
  createFollowUpTask: createFollowUpTaskTool
};