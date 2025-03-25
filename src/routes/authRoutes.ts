import express from "express";
import {
  registerUser,
  activateUser,
  loginUser,
  logoutUser,
  updateAccessToken,
  getUserInfo,
  updateUserInfo,
  updatePassword,
} from "../controllers/authController";
import { isAuthenticated } from "../middlewares/auth";

const userRouter = express.Router();

userRouter
  .post("/register", registerUser)
  .post("/activate-user", activateUser)
  .post("/login-user", loginUser)
  .get("/logout-user", isAuthenticated, logoutUser)
  .get("/refresh-token", updateAccessToken)
  .get("/user-info", isAuthenticated, getUserInfo)
  .put("/update-user-info", isAuthenticated, updateUserInfo)
  .put("/update-user-password", isAuthenticated, updatePassword);
export default userRouter;
