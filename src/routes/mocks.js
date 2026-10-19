import { Router } from "express"
import {
    getMockUsers,
    getMockOrders,
    getMockDeliveries,
    seed
} from "../controllers/mock.controller.js"

const router = Router()

router.get("/mockingUsers", getMockUsers)
router.get("/users", getMockUsers)
router.get("/orders", getMockOrders)
router.get("/deliveries", getMockDeliveries)
router.post("/seed", seed)

export default router
