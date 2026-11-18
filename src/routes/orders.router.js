import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  uploadOrderProof
} from '../controller/order.controller.js';
import upload from "../middlewares/upload.middleware.js"

const router = Router();

router.get('/', getOrders);

router.get('/:oid', getOrderById);

router.post('/', createOrder);

router.post("/:oid/proof", upload.single("proof"), uploadOrderProof)

router.put('/:oid/status', updateOrderStatus);

router.delete('/:oid', deleteOrder);

export default router;
