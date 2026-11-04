import { orderRepository } from '../repository/order.repository.js';
import { userRepository } from '../repository/user.repository.js';
import { storeRepository } from '../repository/store.repository.js';
import { createError } from '../utils/apiResponse.js'
import { ERROR_CODES } from '../utils/errorDictionary.js'
import logger from '../config/logger.js'

export const orderService = {
  getOrders: async () => {
    return orderRepository.findAll();
  },

  getOrderById: async (id) => {
    const order = await orderRepository.findById(id);

    if (!order) {
      throw createError(ERROR_CODES.ORDER_NOT_FOUND)
    }

    return order;
  },

  createOrder: async (orderData) => {
    const { customer, store, items, deliveryAddress, priority } = orderData;

    if (!customer || !store || !items || !deliveryAddress) {
      throw createError(ERROR_CODES.VALIDATION_ERROR)
    }

    const userFound = await userRepository.findById(customer);
    if (!userFound) {
      throw createError(ERROR_CODES.USER_NOT_FOUND)
    }

    const storeFound = await storeRepository.findById(store);
    if (!storeFound) {
      throw createError(ERROR_CODES.STORE_NOT_FOUND)
    }

    const total = items.reduce((accumulator, item) => accumulator + item.price * item.quantity, 0);

    const newOrder = {
      ...orderData,
      total,
      status: 'created',
      priority: priority ? priority : 'normal',
    };

    const createdOrder = await orderRepository.create(newOrder)

    logger.info(`Order created with ID: ${createdOrder._id}`)

    return createdOrder
  },

  updateOrderStatus: async (id, status) => {
    const order = await orderRepository.updateStatus(id, status);
    if (!order) {
      throw createError(ERROR_CODES.ORDER_NOT_FOUND)
    }

    return order;
  },

  deleteOrder: async (id) => {
    const order = await orderRepository.delete(id);
    if (!order) {
      throw createError(ERROR_CODES.ORDER_NOT_FOUND)
    }

    return order;
  },
};
