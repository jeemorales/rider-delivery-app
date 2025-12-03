import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { addDelivery, getRiderDeliveries, getDeliveryHistory, markAsDelivered, markAsReturned } from "../controllers/delivery.controller.js"

const router = express.Router();

router.post("/", protectRoute, addDelivery);
router.get("/", protectRoute, getRiderDeliveries);
router.get("/history", protectRoute, getDeliveryHistory);
router.put("/delivered", protectRoute, markAsDelivered);
router.put("/returned", protectRoute, markAsReturned);

export default router;
