import { Redis } from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redisClient =()=>{
  if(process.env.REDIS_URL){
    console.log("Redis Connected")
    return process.env.REDIS_URL;
  }
    throw new Error("Redis URL not found")
}

export const redis = new Redis(redisClient());