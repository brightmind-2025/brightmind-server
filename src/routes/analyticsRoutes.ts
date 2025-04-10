import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import {
  getUserAnalytics,
  getCourseAnalytics,
  getOrderAnalytics,
} from "../controllers/analyticsController";
const analyticsRouter = express.Router();
analyticsRouter
  .get(
    "/get-user-analytics",
    isAuthenticated,
    authorizeRoles("admin"),
    getUserAnalytics
  )
  .get(
    "/get-course-analytics",
    isAuthenticated,
    authorizeRoles("admin"),
    getCourseAnalytics
  )
  .get(
    "/get-order-analytics",
    isAuthenticated,
    authorizeRoles("admin"),
    getOrderAnalytics
  );

export default analyticsRouter;
