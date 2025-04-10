import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../lib/util/errorHandler";
import catchAsyncError from "../middlewares/catchAsyncError";
import userModel, { IUser } from "../models/userModel";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import dotenv from "dotenv";
import sendMail from "../lib/util/sendMail";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../lib/util/jwt";
import { redis } from "../config/redis";
import {
  getAllUsersService,
  getUserById,
  updateUserRoleService,
} from "../services/user.services";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();

interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

interface IActivationToken {
  token: string;
  activationCode: string;
}

export const registerUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body as IRegistrationBody;
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }

      const user: IRegistrationBody = { name, email, password };
      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;

      // Build inline HTML email
      const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Activation - Brightmind</title>
</head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f0f2f5; margin: 0; padding: 20px; line-height: 1.6;">
    <div style="max-width: 600px; margin: auto; background: linear-gradient(135deg, #ffffff, #f9f9f9); border-radius: 12px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="background: linear-gradient(90deg, #007bff, #00c4ff); color: #ffffff; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Welcome to Brightmind</h1>
        </div>
        <div style="padding: 30px; color: #333333; text-align: center;">
            <p style="margin: 10px 0; font-size: 18px; font-weight: 500; color: #007bff;">Hello <strong>${user.name}</strong>,</p>
            <p style="margin: 10px 0; font-size: 16px;">Thank you for joining Brightmind! To activate your account, use the OTP below:</p>
            <div style="display: inline-block; font-size: 24px; font-weight: bold; color: #ffffff; background: linear-gradient(45deg, #d9534f, #ff6b6b); padding: 12px 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 4px 10px rgba(217, 83, 79, 0.3); letter-spacing: 2px; transition: transform 0.2s ease;">
                ${activationCode}
            </div>
            <p style="font-weight: bold; color: #d9534f; font-size: 16px;">This code is valid for <strong>5 minutes</strong>.</p>
            <p style="margin: 10px 0; font-size: 16px;">If you didn’t sign up, feel free to ignore this email.</p>
        </div>
        <div style="background: #f8f9fa; padding: 15px; font-size: 14px; color: #666666; text-align: center; border-top: 1px solid #e9ecef; border-radius: 0 0 12px 12px;">
            <p>Questions? Reach out at <a href="mailto:support@brightmind.com" style="color: #007bff; text-decoration: none; font-weight: 600;">support@brightmind.com</a>.</p>
            <p>&copy; 2025 Brightmind. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
      try {
        await sendMail({
          email: user.email,
          subject: "Account Activation",
          html, // pass inline HTML directly to sendMail
        });
        res.status(201).json({
          success: true,
          message: "Account activation email has been sent to your email",
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

const createActivationToken = (user: IRegistrationBody): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    { user, activationCode },
    process.env.JWT_SECRET as Secret,
    { expiresIn: "5m" }
  );
  return { token, activationCode };
};
//user activation
interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;
      if (!activation_token || !activation_code) {
        return next(new ErrorHandler("Invalid activation token or code", 400));
      }
      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.JWT_SECRET as Secret
      ) as { user: IUser; activationCode: string };
      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }

      const { name, email, password } = newUser.user;
      const existUser = await userModel.findOne({ email });
      if (existUser) {
        return next(new ErrorHandler("User already exists", 400));
      }
      const user = await userModel.create({ name, email, password });
      res.status(201).json({
        success: true,
        message: "Account has been activated",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//user login
interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as ILoginRequest;

    if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 400));
    }

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    return sendToken(user, 200, res);
  }
);

//social login

interface ISocialAuthBody {
  name: string;
  email: string;
  avatar: string;
}

export const socialLogin = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, avatar } = req.body as ISocialAuthBody;
      const user = await userModel.findOne({ email });
      if (!user) {
        const newUser = await userModel.create({
          name,
          email,
          avatar,
        });
        sendToken(newUser, 201, res);
      } else {
        sendToken(user, 200, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//user logout
export const logoutUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "none", {
        maxAge: 1,
      });
      res.cookie("refresh_token", "none", {
        maxAge: 1,
      });
      const userId = req.user?._id;
      redis.del(userId as string);
      res.status(200).json({
        success: true,
        message: "Logout successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//access token update
export const updateAccessToken = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;
      const message = "could not refresh token";
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }
      const session = await redis.get(decoded.id as string);
      if (!session) {
        return next(new ErrorHandler("Please login for access this resource", 400));
      }
      const user = JSON.parse(session);
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        {
          expiresIn: "50m",
        }
      );
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        {
          expiresIn: "10d",
        }
      );
      req.user = user;
      res.cookie("access_token", accessToken, accessTokenOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenOptions);
      await redis.set(user._id, JSON.stringify(user), "EX", 604800 ); //7 days
      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//get user info
export const getUserInfo = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      getUserById(userId as string, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update user info

interface IUpdateUserInfo {
  name?: string;
  email?: string;
}

export const updateUserInfo = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email } = req.body as IUpdateUserInfo;
      const userId = req.user?._id;
      const user = await userModel.findById(userId);
      if (email && user) {
        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
          return next(new ErrorHandler("Email already exists", 400));
        }
        user.email = email;
      }

      if (name && user) {
        user.name = name;
      }
      await user?.save();
      await redis.set(userId as string, JSON.stringify(user));
      res.status(200).json({
        success: true,
        message: "User updated",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update user password
interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}

export const updatePassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;
      const user = await userModel.findById(req.user?._id).select("+password");
      if (user?.password === undefined) {
        return next(new ErrorHandler("User not found", 404));
      }
      const isPasswordMatched = await user?.comparePassword(oldPassword);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400));
      }
      user.password = newPassword;
      await user.save();
      await redis.set(user._id as string, JSON.stringify(user));

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update user profile
interface IUpdateProfile {
  avatar: string;
}

export const updateUserProfile = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body as IUpdateProfile;
      const userId = req.user?._id;
      const user = await userModel.findById(userId);
      if (avatar && user) {
        if (user?.avatar?.public_id) {
          await cloudinary.uploader.destroy(user?.avatar?.public_id);
          const cloud = await cloudinary.uploader.upload(avatar, {
            folder: "brightmind",
          });
          user.avatar = {
            public_id: cloud.public_id,
            url: cloud.secure_url,
          };
        } else {
          const cloud = await cloudinary.uploader.upload(avatar, {
            folder: "brightmind",
          });
          user.avatar = {
            public_id: cloud.public_id,
            url: cloud.secure_url,
          };
        }
      }

      await user?.save();
      await redis.set(userId as string, JSON.stringify(user));
      res.status(200).json({
        success: true,
        message: "User updated",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//get all users -- admin

export const getAllUsers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update user role -- admin

export const updateUserRole = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role } = req.body;
      updateUserRoleService(res, id, role);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//Delete user -- admin

export const deleteUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await userModel.findById(id);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
      await user.deleteOne({ id });
      await redis.del(id);
      res.status(200).json({
        success: true,
        message: "User deleted",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
