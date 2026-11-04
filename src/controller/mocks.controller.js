import * as mocksService from '../service/mocks.service.js';

export const getMockUsers = async (req, res, next) => {
  try {
    const quantity = req.query.qty ?? 10;
    const users = await mocksService.generateUsers(quantity);

    res.status(200).json({ status: 'success', payload: users });
  } catch (error) {
    next(error)
  }
};

export const getMockOrders = async (req, res, next) => {
  try {
    const quantity = req.query.qty ?? 10;
    const orders = await mocksService.generateOrders(quantity);

    res.status(200).json({ status: 'success', payload: orders });
  } catch (error) {
    next(error)
  }
};

export const generateData = async (req, res, next) => {
  try {
    const {
      users = 10,
      stores = 5,
      orders = 10,
    } = req.body || {};
    const result = await mocksService.generateData({ users, stores, orders });

    res.status(201).json({ status: 'success', payload: result });
  } catch (error) {
    next(error)
  }
};