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
  .post("/login", loginUser)
  .post("/social-login", socialLogin)
  .get("/logout-user", updateAccessToken, isAuthenticated, logoutUser)
  .get("/refresh-token", updateAccessToken)
  .get("/user-info", updateAccessToken, isAuthenticated, getUserInfo)
  .put("/update-user-info", updateAccessToken, isAuthenticated, updateUserInfo)
  .put(
    "/update-user-password",
    updateAccessToken,
    isAuthenticated,
    updatePassword
  )
  .put(
    "/update-user-avatar",
    updateAccessToken,
    isAuthenticated,
    updateUserProfile
  )
  .get(
    "/get-users",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    getAllUsers
  )
  .put(
    "/update-user-role",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    updateUserRole
  )
  .delete(
    "/delete-user/:id",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    deleteUser
  );
export default userRouter;
