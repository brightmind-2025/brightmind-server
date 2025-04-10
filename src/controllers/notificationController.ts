import NotificationModel from "../models/notificationModel";
import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middlewares/catchAsyncError";
import ErrorHandler from "../lib/util/errorHandler";
import cron from "node-cron";

//get all notification -- admin

export const getAllNotification = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await NotificationModel.find({}).sort({
        createdAt: -1,
      });
      if (!notifications) {
        return next(new ErrorHandler("No notifications found", 404));
      }
      if (notifications.length === 0) {
        return next(new ErrorHandler("No notifications found", 404));
      }
      res.status(200).json({
        success: true,
        message: "All notifications",
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//update notification status -- admin

export const updateNotificationStatus = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificationModel.findById(req.params.id);
      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      } else {
        notification.status
          ? (notification.status = "read")
          : notification?.status;
      }
      await notification.save();

      const notifications = await NotificationModel.find({}).sort({
        createdAt: -1,
      });
      if (!notifications) {
        return next(new ErrorHandler("No notifications found", 404));
      }
      res.status(200).json({
        success: true,
        message: "Notification status updated",
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// delete notification -- admin
cron.schedule("0 0 0 * * *", async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await NotificationModel.deleteMany({
    status: "read",
    createdAt: { $lt: thirtyDaysAgo },
  });
  console.log("Deleted read notifications");
});
