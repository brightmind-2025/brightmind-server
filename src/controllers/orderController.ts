import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../lib/util/errorHandler";
import OrderModel, { IOrder } from "../models/orderModel";
import userModel from "../models/userModel";
import CourseModel from "../models/courseModel";
import sendMail from "../lib/util/sendMail";
import NotificationModel from "../models/notificationModel";
import { getAllOrdersService, newOrder } from "../services/order.services";

export const createOrder = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body as IOrder;
      const user = await userModel.findById(req.user?._id);
      const courseExistInUser = user?.courses.some(
        (course: any) => course._id.toString() === courseId
      );
      if (courseExistInUser) {
        return next(new ErrorHandler("Course already purchased", 400));
      }
      const course = (await CourseModel.findById(courseId)) as any;
      if (!course) {
        return next(new ErrorHandler("Course not found", 404));
      }
      const data: any = {
        courseId: course._id,
        userId: user?._id,
        payment_info,
      };
      const mailData = {
        order: {
          _id: course._id.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      const html = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>BrightMind Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #2c3e50; text-align: center;">🎉 Your BrightMind Order is Confirmed!</h1>
            <p style="font-size: 16px; color: #333; text-align: center;">Thanks for your purchase! We're just as excited as you are.</p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
      
            <h3 style="color: #2c3e50;">🧾 Order Summary</h3>
            <table style="width: 100%; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0;"><strong>Order #:</strong> ${mailData.order._id}</td>
                <td style="padding: 8px 0; text-align: right;"><strong>Date:</strong> ${mailData.order.date}</td>
              </tr>
            </table>
      
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f0f0f0;">
                  <th style="padding: 12px; text-align: left;">Course</th>
                  <th style="padding: 12px; text-align: center;">Qty</th>
                  <th style="padding: 12px; text-align: right;">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 12px 0;">${mailData.order.name}</td>
                  <td style="padding: 12px 0; text-align: center;">1</td>
                  <td style="padding: 12px 0; text-align: right;">$${mailData.order.price}</td>
                </tr>
              </tbody>
            </table>
      
            <table style="width: 100%; margin-top: 10px;">
              <tr>
                <td style="text-align: right;"><strong>Subtotal:</strong> $${mailData.order.price}</td>
              </tr>
              <tr>
                <td style="text-align: right;"><strong>Total:</strong> $${mailData.order.price}</td>
              </tr>
            </table>
      
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
      
            <p style="font-size: 14px; color: #555;">
              If you have any questions, reach out to our support team at 
              <a href="mailto:support@brightmind.com" style="color: #007bff; text-decoration: none;">support@brightmind.com</a>.
            </p>
      
            <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 40px;">
              &copy; 2025 BrightMind. All rights reserved.
            </p>
          </div>
        </body>
      </html>`;
      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: `BrightMind Order Confirmation`,
            html,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }
      user?.courses.push(course?._id);
      await user?.save();
      await NotificationModel.create({
        user: user?._id,
        title: "New Order",
        message: `You have successfully purchased the course ${course?.name}`,
      });
      course.purchased = (course.purchased || 0) + 1;

      await course.save();
      newOrder(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//Get all orders - admin

export const getAllOrders = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllOrdersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
); 
