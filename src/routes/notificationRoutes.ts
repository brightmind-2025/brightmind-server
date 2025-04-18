import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { getAllNotification, updateNotificationStatus } from "../controllers/notificationController";

const notificationRouter = express.Router();
notificationRouter.get(
  "/get-all-notifications",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllNotification
).put(
  "/update-notification-status/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  updateNotificationStatus
);
export default notificationRouter;