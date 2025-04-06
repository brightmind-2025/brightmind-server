import { Response } from "express";
import CourseModel from "../models/courseModel";
import catchAsyncError from "../middlewares/catchAsyncError";

export const createCourse = catchAsyncError(
  async (data: any, res: Response) => {
    const course = await CourseModel.create(data);
    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  }
);
