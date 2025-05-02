import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import {
  createOrder,
  getAllOrders,
  newPayment,
  sendStripePublishableKey,
} from "../controllers/orderController";
import { updateAccessToken } from "../controllers/authController";

const orderRouter = express.Router();
orderRouter
  .post("/create-order", updateAccessToken, isAuthenticated, createOrder)
  .get(
    "/get-all-orders",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    getAllOrders
  )
  .get("/payment/stripe-pk", sendStripePublishableKey)
  .post("/payment", isAuthenticated, newPayment);

export default orderRouter;
