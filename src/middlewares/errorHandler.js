
import { AppError, createError, errorResponse } from '../utils/apiResponse.js'
import { ERROR_CODES } from '../utils/errorDictionary.js'

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }

  if (
    !(error instanceof AppError) &&
    !['CastError', 'ValidationError'].includes(error.name)
  ) {
    console.error('[ERROR API]', {
      method: req.method,
      url: req.originalUrl,
      message: error.message,
      stack: error.stack,
    })
  }

  if (error.name === 'CastError') {
    return errorResponse(
      res,
      createError(ERROR_CODES.INVALID_ID),
    )
  }

  if (error.name === 'ValidationError') {
    return errorResponse(
      res,
      createError(ERROR_CODES.VALIDATION_ERROR),
    )
  }

  return errorResponse(res, error)
}