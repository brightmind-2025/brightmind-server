import { Response } from "express";
import { redis } from "../config/redis";

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
