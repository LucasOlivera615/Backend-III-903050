import mongoose from 'mongoose';
import { ORDER_PRIORITY, ORDER_STATUS } from '../utils/constants.js';

export const generateMockOrder = (customerId, storeId, index) => {
  const items = [
    {
      name: `Paquete ${index}`,
      quantity: 1,
      price: 1500,
    },
  ];

  const total = items.reduce(
    (accumulator, item) => accumulator + item.quantity * item.price,
    0,
  );

  return {
    _id: new mongoose.Types.ObjectId(),
    customer: customerId,
    store: storeId,
    items,
    deliveryAddress: `Av. Siempre Viva ${100 + index}`,
    total,
    status: ORDER_STATUS.CREATED,
    priority: ORDER_PRIORITY.NORMAL,
  };
};

export const generateMockOrders = (customerIds, storeIds, quantity) => {
  return Array.from(
    { length: quantity },
    (_, index) => generateMockOrder(
      customerIds[index % customerIds.length],
      storeIds[index % storeIds.length],
      index + 1,
    ),
  );
};