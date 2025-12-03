import express from "express";
import { addCustomer, getCustomers, updateCustomer } from "../controllers/customer.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, addCustomer);
router.get("/", protectRoute, getCustomers);
router.put("/", protectRoute, updateCustomer);

export default router;
