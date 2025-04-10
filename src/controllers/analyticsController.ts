import { Response, Request, NextFunction } from "express";
import ErrorHandler from "../lib/util/errorHandler";
import catchAsyncError from "../middlewares/catchAsyncError";
import { generateLast12MonthsData } from "../lib/util/analyticsGenerator";
import userModel from "../models/userModel";
import CourseModel from "../models/courseModel";
import OrderModel from "../models/orderModel";

// get user analytics -- admin

export const getUserAnalytics = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await generateLast12MonthsData(userModel);
      res.status(200).json({
        success: true,
        message: "User analytics",
        users,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get course analytics -- admin
export const getCourseAnalytics = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courses = await generateLast12MonthsData(CourseModel);
      res.status(200).json({
        success: true,
        message: "Course analytics",
        courses,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get order analytics -- admin
export const getOrderAnalytics = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await generateLast12MonthsData(OrderModel);
      res.status(200).json({
        success: true,
        message: "Order analytics",
        orders,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
