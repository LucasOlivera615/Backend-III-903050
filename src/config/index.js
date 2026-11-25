import dotenv from "dotenv";

dotenv.config();

const validEnvironments = [
  "development",
  "test",
  "production"
]

const validLogLevels = [
  "fatal",
  "error",
  "warning",
  "info",
  "http",
  "debug"
]

const nodeEnv = process.env.NODE_ENV ?? "development"

export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv,
  isProd: nodeEnv === "production",
  mongoDbUri:
    nodeEnv === "test"
      ? process.env.MONGODB_URI_TEST
      : process.env.MONGODB_URI,
  loggerLvl:
    process.env.LOGGER_LVL ??
    (nodeEnv === "production" ? "warning" : "debug")
}

export const validateConfig = () => {
  if (!validEnvironments.includes(config.nodeEnv)) {
    throw new Error(
      "NODE_ENV debe ser development, test o production"
    )
  }

  if (
    !Number.isInteger(config.port) ||
    config.port < 1 ||
    config.port > 65535
  ) {
    throw new Error(
      "PORT debe ser un numero entero entre 1 y 65535"
    )
  }

  const mongoVariable =
    config.nodeEnv === "test"
      ? "MONGODB_URI_TEST"
      : "MONGODB_URI"

  if (
    typeof config.mongoDbUri !== "string" ||
    !config.mongoDbUri.trim()
  ) {
    throw new Error(`Falta la variable ${mongoVariable}`)
  }

  if (!/^mongodb(\+srv)?:\/\/\S+$/.test(config.mongoDbUri)) {
    throw new Error(`${mongoVariable} tiene un formato invalido`)
  }

  if (!validLogLevels.includes(config.loggerLvl)) {
    throw new Error("LOGGER_LVL contiene un nivel invalido")
  }

  return true
}