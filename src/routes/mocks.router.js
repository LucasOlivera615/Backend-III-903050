import { Router } from 'express';
import {
  generateData,
  getMockOrders,
  getMockUsers,
} from '../controller/mocks.controller.js';

const router = Router();

router.get('/mockingusers', getMockUsers);

router.get('/mockingorders', getMockOrders);

router.post('/generateData', generateData);

export default router;