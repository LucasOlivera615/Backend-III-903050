import * as mocksService from '../service/mocks.service.js'
import { successResponse } from '../utils/apiResponse.js'

export const getMockUsers = async (req, res, next) => {
  try {
    const quantity = req.query.qty ?? 10
    const users = await mocksService.generateUsers(quantity)

    return successResponse(res, {
      message: 'Usuarios de prueba generados',
      payload: users,
    })
  } catch (error) {
    return next(error)
  }
}

export const getMockOrders = async (req, res, next) => {
  try {
    const quantity = req.query.qty ?? 10
    const orders = await mocksService.generateOrders(quantity)

    return successResponse(res, {
      message: 'Pedidos de prueba generados',
      payload: orders,
    })
  } catch (error) {
    return next(error)
  }
}

export const generateData = async (req, res, next) => {
  try {
    const {
      users = 10,
      stores = 5,
      orders = 10,
    } = req.body || {}

    const result = await mocksService.generateData({
      users,
      stores,
      orders,
    })

    return successResponse(res, {
      statusCode: 201,
      message: 'Datos de prueba guardados',
      payload: result,
    })
  } catch (error) {
    return next(error)
  }
}