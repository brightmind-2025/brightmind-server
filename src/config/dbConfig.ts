import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const dbUrl: string=process.env.DB_URL || "";

export const connectDB = async () => {
  try {
    const data = await mongoose.connect(dbUrl);
    console.log(`MongoDB connected with server: ${data.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB connection error: ${error.message}`);
    setTimeout(() => connectDB(), 5000); // Retry after 5 seconds
  }
};