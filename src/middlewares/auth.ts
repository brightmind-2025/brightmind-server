import { Request, Response, NextFunction } from "express";
import catchAsyncError from "./catchAsyncError";
import ErrorHandler from "../lib/util/errorHandler";
import jwt from "jsonwebtoken";
import { redis } from "../config/redis";

// Define an interface for the expected JWT payload
interface IDecoded {
  id: string;
  iat: number;
  exp: number;
}

export const isAuthenticated = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
      return next(new ErrorHandler("Please login to access", 400));
    }

    let decoded: IDecoded;
    try {
      decoded = jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN as string
      ) as IDecoded;
    } catch (error) {
      return next(new ErrorHandler("Invalid token. Please login again", 400));
    }

    // Ensure decoded has an id property
    if (!decoded || !decoded.id) {
      return next(new ErrorHandler("Invalid token payload", 400));
    }

    // Get user from redis (assuming redis.get returns a stringified JSON)
    const user = await redis.get(decoded.id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Attach user to request object
    req.user = JSON.parse(user);

    next();
  }
);

//validate user roles
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role (${req.user?.role}) is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
