import { createError, errorResponse } from "../utils/apiResponse.js"
import { ERROR_CODES } from "../utils/errorDictionary.js"
import logger from "../config/logger.js"

export const errorHandler = (error, req, res, next) => {
  let handledError = error

  if (error.name === "CastError") {
    handledError = createError(ERROR_CODES.VALIDATION_ERROR, "ID invalido")
  }

  const statusCode = handledError.statusCode || 500
  const code = handledError.code || ERROR_CODES.INTERNAL_SERVER_ERROR

  const logData = {
    code,
    message: handledError.message,
    method: req.method,
    url: req.originalUrl,
  }

  if (statusCode >= 500) {
    logger.error("Error inesperado en la aplicación", {
      ...logData,
      stack: error.stack,
    })
  } else {
    logger.warning("Error controlado de la aplicación", logData)
  }

  return errorResponse(res, handledError)
}