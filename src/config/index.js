import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET"];

// si falta algo crítico, mejor fallar al arrancar
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Falta configurar la variable de entorno: ${envVar}`);
  }
});

export const config = {
  port: process.env.PORT || 8080,
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  mongoDbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET
};
