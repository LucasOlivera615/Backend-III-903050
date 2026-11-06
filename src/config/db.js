import mongoose from "mongoose";
import { config } from "./index.js";
import logger from "./logger.js";

const connectDB = async () => {
  const mongoUri = config.mongoDbUri;

  if (!mongoUri) {
    logger.fatal("Falta la variable MONGODB_URI");
    throw new Error("Falta la variable MONGODB_URI");
  }

  await mongoose.connect(mongoUri);
  logger.info("Conexión a MongoDB establecida");
};

export default connectDB;
