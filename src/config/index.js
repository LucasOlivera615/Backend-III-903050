import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv,
  isProd: nodeEnv === "production",
  mongoDbUri: nodeEnv === "test" ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI,
  loggerLvl: process.env.LOGGER_LVL
};