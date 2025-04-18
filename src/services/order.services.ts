import { NextFunction, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import OrderModel from "../models/orderModel";

export const newOrder = catchAsyncError(
  async (data: any, res: Response, next: NextFunction) => {
    const order = await OrderModel.create(data);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  }
);

//Get all orders
export const getAllOrdersService = async (res: Response) => {
  const orders = await OrderModel.find().sort({
    createdAt: -1,
  });
  if (!orders) {
    return res.status(404).json({
      success: false,
      message: "No orders found",
    });
  }
  res.status(200).json({
    success: true,
    message: "All orders",
    orders,
  });
};
