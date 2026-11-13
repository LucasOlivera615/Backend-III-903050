import { createError, errorResponse } from "../utils/apiResponse.js";
import { ERROR_CODES } from "../utils/errorDictionary.js";
import logger from "../config/logger.js";
import multer from "multer";

export const errorHandler = (error, req, res, next) => {
  let handledError = error;

  if(error.name === "CastError"){
    handledError = createError(ERROR_CODES.INVALID_ID_MONGOOSE);
  }

  if(error instanceof multer.MulterError){
    if(error.code === "LIMIT_FILE_SIZE") {
      handledError = createError(ERROR_CODES.FILE_TOO_LARGE);
    }else{
      handledError = createError(ERROR_CODES.INVALID_UPLOAD);
    }
  }

  if( ["ENOENT", "EACCESS", "EPERM", "ENOSPC"].includes(error.code) ){
    handledError = createError(ERROR_CODES.UPLOAD_ERROR);
  }

  const statusCode = handledError.statusCode || 500
  const code = handledError.code || ERROR_CODES.INTERNAL_SERVER_ERROR
  const line = `${code} - ${handledError.message} - ${req.method} ${req.originalUrl}`
  
  if(statusCode >=500){
    logger.error(line)
  }else{
    logger.warning(line)
  }

  return errorResponse(res, handledError);
};
