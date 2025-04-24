import express from "express";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layoutController";
import { updateAccessToken } from "../controllers/authController";

const layoutRouter = express.Router();
layoutRouter
  .post("/create-layout", updateAccessToken,isAuthenticated, authorizeRoles("admin"), createLayout)
  .put("/edit-layout", updateAccessToken,isAuthenticated, authorizeRoles("admin"), editLayout)
  .get("/get-layout", updateAccessToken,isAuthenticated, getLayoutByType)



export default layoutRouter;