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

//Get all courses
export const getAllCoursesService = async (res: Response) => {
  const courses = await CourseModel.find().sort({
    createdAt: -1,
  });
  if (!courses) {
    return res.status(404).json({
      success: false,
      message: "No courses found",
    });
  }
  res.status(200).json({
    success: true,
    message: "All courses",
    courses,
  });
};
