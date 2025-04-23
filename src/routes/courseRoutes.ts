import express from "express";
import {
  addAnswer,
  addQuestion,
  addReplyToReview,
  addReview,
  deleteCourse,
  editCourse,
  generateVideoUrl,
  getAllCourses,
  getAllCourses_Admin,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/courseController";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";
import { updateAccessToken } from "../controllers/authController";

const courseRouter = express.Router();

courseRouter
  .post(
    "/create-course",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    uploadCourse
  )
  .put("/edit-course/:id", updateAccessToken,isAuthenticated, authorizeRoles("admin"), editCourse)
  .get("/get-course/:id", getSingleCourse)
  .get("/get-all-courses", getAllCourses)
  .get("/get-course-content/:id", updateAccessToken,isAuthenticated, getCourseByUser)
  .put("/add-question", updateAccessToken,isAuthenticated, addQuestion)
  .put("/add-answer", updateAccessToken,isAuthenticated, authorizeRoles("admin"), addAnswer)
  .put("/add-review/:id", updateAccessToken,isAuthenticated, addReview)
  .put("/add-reply", updateAccessToken,isAuthenticated, authorizeRoles("admin"), addReplyToReview)
  .get(
    "/get-courses",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    getAllCourses_Admin
  )
  .delete(
    "/delete-course/:id",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    deleteCourse
  )
  .post("/getVdoCipherOTP", generateVideoUrl);

export default courseRouter;
