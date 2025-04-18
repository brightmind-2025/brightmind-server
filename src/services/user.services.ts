import { Response } from "express";
import { redis } from "../config/redis";
import userModel from "../models/userModel";

export const getUserById = async (id: string, res: Response) => {
  const user = await redis.get(id);
  if (user) {
    const userObj = JSON.parse(user);
    res.status(200).json({
      success: true,
      user: userObj,
    });
  }
};

//Get all users
export const getAllUsersService = async (res: Response) => {
  const users = await userModel.find().sort({
    createdAt: -1,
  });
  if (!users) {
    return res.status(404).json({
      success: false,
      message: "No users found",
    });
  }
  res.status(200).json({
    success: true,
    message: "All users",
    users,
  });
};

//update user role

export const updateUserRoleService = async (
  res: Response,
  id: string,
  role: string
) => {
  const user = await userModel.findByIdAndUpdate(id, { role }, { new: true });
  res.status(200).json({
    success: true,
    message: "User role updated",
    user,
  });
};
