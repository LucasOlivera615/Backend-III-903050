import multer from 'multer';
import { createError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../utils/errorDictionary.js';
import { config } from '../config/index.js';
import fs from "node:fs";
import { randomUUID } from 'node:crypto';

const folder = config.nodeEnv === "test" ? "uploads/test/documents" : "uploads/documents";

fs.mkdirSync(folder, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, folder);
  },

  filename: (req, file, callback) => {
    callback(null, randomUUID() + ".pdf" )
  }
})

const fileFilter = (req, file, callback) => {
  if (file.mimetype === 'application/pdf') {
    return callback(null, true);
  }

  callback(createError(ERROR_CODES.INVALID_FILE_TYPE));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

export default upload;
