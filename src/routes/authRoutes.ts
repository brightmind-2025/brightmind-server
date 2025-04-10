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
  updateUserRole,
  deleteUser,
} from "../controllers/authController";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";

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
  .get("/get-users", isAuthenticated, authorizeRoles("admin"), getAllUsers)
  .put(
    "/update-user-role",
    isAuthenticated,
    authorizeRoles("admin"),
    updateUserRole
  )
  .delete("/delete-user/:id", isAuthenticated, authorizeRoles("admin"), deleteUser);
export default userRouter;
