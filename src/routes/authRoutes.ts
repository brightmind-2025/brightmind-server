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
  socialLogin,
  updateUserProfile,
  getAllUsers,
} from "../controllers/authController";
import { isAuthenticated } from "../middlewares/auth";

const userRouter = express.Router();

userRouter
  .post("/register", registerUser)
  .post("/activate-user", activateUser)
  .post("/login-user", loginUser)
  .post("/social-login", socialLogin)
  .get("/logout-user", isAuthenticated, logoutUser)
  .get("/refresh-token", updateAccessToken)
  .get("/user-info", isAuthenticated, getUserInfo)
  .put("/update-user-info", isAuthenticated, updateUserInfo)
  .put("/update-user-password", isAuthenticated, updatePassword)
  .put("/update-user-avatar", isAuthenticated, updateUserProfile)
  .get("/get-all-users", getAllUsers);
export default userRouter;
