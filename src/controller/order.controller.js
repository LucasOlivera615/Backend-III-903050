import { orderService } from '../service/order.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { unlink } from "node:fs/promises"
import logger from "../config/logger.js"

export const getOrders = async (req, res, next) => {
  try {
    const { page, limit, status, priority } = req.query

    const orders = await orderService.getOrders({
      page,
      limit,
      status,
      priority
    })

    successResponse(res, {
      message: "Lista de pedidos",
      payload: orders
    })
  } catch (error) {
    next(error)
  }
}

export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.oid);

    successResponse(res, { message: 'Pedido obtenido', payload: order });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body);

    successResponse(res, { statusCode: 201, message: 'Pedido creado', payload: order });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.oid, req.body.status);

    successResponse(res, { message: 'Estado del pedido actualizado', payload: order });
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const order = await orderService.deleteOrder(req.params.oid);

    successResponse(res, { message: 'Pedido eliminado', payload: order });
  } catch (error) {
    next(error);
  }
};

export const uploadOrderProof = async (req, res, next) => {
  try {
    const order = await orderService.addProof(
      req.params.oid,
      req.file
    )

    logger.info(
      `Comprobante cargado correctamente - Pedido: ${req.params.oid} - Archivo: ${req.file.filename}`
    )

    successResponse(res, {
      statusCode: 201,
      message: "Comprobante agregado correctamente",
      payload: order
    })
  } catch (error) {
    if (req.file?.path) {
      try {
        await unlink(req.file.path)
      } catch (cleanupError) {
        logger.error(
          `Error al eliminar comprobante temporal: ${cleanupError.message}`
        )
      }
    }

    next(error)
  }
}
