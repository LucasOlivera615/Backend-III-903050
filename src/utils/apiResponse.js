
import { ERROR_CODES, ERROR_DICTIONARY } from './errorDictionary.js'

export class AppError extends Error {
  constructor(code, message) {
    const config = ERROR_DICTIONARY[code]
      ?? ERROR_DICTIONARY[ERROR_CODES.INTERNAL_SERVER_ERROR]

    super(message ?? config.message)

    this.name = 'AppError'
    this.code = ERROR_DICTIONARY[code] ? code : ERROR_CODES.INTERNAL_SERVER_ERROR
    this.statusCode = config.statusCode
  }
}

export const createError = (code, message) => {
  return new AppError(code, message)
}

export const successResponse = (
  res,
  { statusCode = 200, message = '', payload },
) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    payload,
  })
}

export const errorResponse = (res, error) => {
  const isAppError = error instanceof AppError

  const code = isAppError
    ? error.code
    : ERROR_CODES.INTERNAL_SERVER_ERROR

  const config = ERROR_DICTIONARY[code]

  return res.status(config.statusCode).json({
    status: 'error',
    message: isAppError ? error.message : config.message,
    code,
  })
}