import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/dbConfig";
import { ErrorMiddleware } from "./middlewares/error";
import userRouter from "./routes/authRoutes";
import cloudinary from "./config/cloundinary";
import courseRouter from "./routes/courseRoutes";
import orderRouter from "./routes/orderRoutes";
import notificationRouter from "./routes/notificationRoutes";
import analyticsRouter from "./routes/analyticsRoutes";
import layoutRouter from "./routes/layoutRoute";

dotenv.config();

const app = express();
//body parser
app.use(express.json({ limit: "50mb" }));
//cookie parser
app.use(cookieParser());
//cors origin to frontend url
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
//cookie parser
app.use(cookieParser());
//routes
app.use("/api/user", userRouter);
app.use("/api/course", courseRouter);
app.use("/api/order", orderRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/layout", layoutRouter);
//test api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});
//unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});
app.use(ErrorMiddleware);
//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//localhost
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log("Server started on port " + port), connectDB();
});
