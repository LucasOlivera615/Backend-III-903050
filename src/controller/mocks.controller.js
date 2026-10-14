import * as mocksService from '../service/mocks.service.js';

export const getMockUsers = async (req, res) => {
  try {
    const quantity = req.query.qty ?? 10;
    const users = await mocksService.generateUsers(quantity);

    res.status(200).json({ status: 'success', payload: users });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
  }
};

export const getMockOrders = async (req, res) => {
  try {
    const quantity = req.query.qty ?? 10;
    const orders = await mocksService.generateOrders(quantity);

    res.status(200).json({ status: 'success', payload: orders });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
  }
};

export const generateData = async (req, res) => {
  try {
    const {
      users = 10,
      stores = 5,
      orders = 10,
    } = req.body || {};
    const result = await mocksService.generateData({ users, stores, orders });

    res.status(201).json({ status: 'success', payload: result });
  } catch (error) {
    res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
  }
};