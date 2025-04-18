import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { createOrder, getAllOrders } from "../controllers/orderController";

const orderRouter = express.Router();
orderRouter
  .post("/create-order", isAuthenticated, createOrder)
  .get(
    "/get-all-orders",
    isAuthenticated,
    authorizeRoles("admin"),
    getAllOrders
  );

export default orderRouter;
