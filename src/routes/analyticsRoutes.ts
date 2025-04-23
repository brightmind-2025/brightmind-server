import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import {
  getUserAnalytics,
  getCourseAnalytics,
  getOrderAnalytics,
} from "../controllers/analyticsController";
import { updateAccessToken } from "../controllers/authController";
const analyticsRouter = express.Router();
analyticsRouter
  .get(
    "/get-user-analytics",

    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    getUserAnalytics
  )
  .get(
    "/get-course-analytics",

    updateAccessToken,

    isAuthenticated,
    authorizeRoles("admin"),
    getCourseAnalytics
  )
  .get(
    "/get-order-analytics",

    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    getOrderAnalytics
  );

export default analyticsRouter;
