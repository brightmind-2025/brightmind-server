import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layoutController";

const layoutRouter = express.Router();
layoutRouter
  .post("/create-layout", isAuthenticated, authorizeRoles("admin"), createLayout)
  .put("/edit-layout", isAuthenticated, authorizeRoles("admin"), editLayout)
  .get("/get-layout", isAuthenticated, getLayoutByType)


export default layoutRouter;