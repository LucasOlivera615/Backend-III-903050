import { Router } from "express";
import { getMockUsers, seed} from "../controllers/mock.controller.js";

const router = Router()

router.get("/mockingUsers", getMockUsers)
router.post("/seed", seed)


export default router