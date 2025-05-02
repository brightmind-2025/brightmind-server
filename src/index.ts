import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { connectDB } from "./config/dbConfig";
import { ErrorMiddleware } from "./middlewares/error";
import userRouter from "./routes/authRoutes";
import cloudinary from "./config/cloundinary";
import courseRouter from "./routes/courseRoutes";
import orderRouter from "./routes/orderRoutes";
import notificationRouter from "./routes/notificationRoutes";
import analyticsRouter from "./routes/analyticsRoutes";
import layoutRouter from "./routes/layoutRoute";
import initSocketServer from "./socketServer";

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Routes
app.use("/api/user", userRouter);
app.use("/api/course", courseRouter);
app.use("/api/order", orderRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/layout", layoutRouter);

// Test API
app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

// Unknown route handler
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// Error Middleware
app.use(ErrorMiddleware);

// Start Server
const server = http.createServer(app);
initSocketServer(server);

const port = process.env.PORT || 3001;

connectDB().then(() => {
  server.listen(port, () => {
    console.log("🚀 Server started on port", port);
  });
});
