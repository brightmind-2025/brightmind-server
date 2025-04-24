import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import {
  getAllNotification,
  updateNotificationStatus,
} from "../controllers/notificationController";
import { updateAccessToken } from "../controllers/authController";

const notificationRouter = express.Router();
notificationRouter
  .get(
    "/get-all-notifications",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    getAllNotification
  )
  .put(
    "/update-notification-status/:id",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    updateNotificationStatus
  );
export default notificationRouter;

