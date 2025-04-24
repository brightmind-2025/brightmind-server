import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { createOrder, getAllOrders } from "../controllers/orderController";
import { updateAccessToken } from "../controllers/authController";

const orderRouter = express.Router();
orderRouter
  .post("/create-order", updateAccessToken,isAuthenticated, createOrder)
  .get(
    "/get-all-orders",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    getAllOrders
  );

export default orderRouter;
