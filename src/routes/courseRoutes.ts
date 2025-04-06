import express from "express";
import {
  addAnswer,
  addQuestion,
  addReplyToReview,
  addReview,
  editCourse,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
  uploadCourse,
} from "../controllers/courseController";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth";

const courseRouter = express.Router();

courseRouter
  .post(
    "/create-course",
    isAuthenticated,
    authorizeRoles("admin"),
    uploadCourse
  )
  .put("/edit-course/:id", isAuthenticated, authorizeRoles("admin"), editCourse)
  .get("/get-course/:id", getSingleCourse)
  .get("/get-all-courses", getAllCourses)
  .get("/get-course-content/:id",isAuthenticated, getCourseByUser)
  .put("/add-question", isAuthenticated, addQuestion)
  .put("/add-answer", isAuthenticated,authorizeRoles("admin"), addAnswer)
  .put("/add-review/:id", isAuthenticated, addReview)
  .put("/add-reply", isAuthenticated, authorizeRoles("admin"), addReplyToReview)  


export default courseRouter;
