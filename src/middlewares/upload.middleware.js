
import multer from "multer"
import { createError } from "../utils/apiResponse.js"
import { ERROR_CODES } from "../utils/errorDictionary.js"
import { config } from "../config/index.js"
import fs from "node:fs"
import path from "node:path"
import { randomUUID } from "node:crypto"

const uploadRoot =
  config.nodeEnv === "test" ? "uploads/test" : "uploads"

const folders = {
  document: path.join(uploadRoot, "documents"),
  proof: path.join(uploadRoot, "proofs")
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const folder = folders[file.fieldname]

    if (!folder) {
      return callback(createError(ERROR_CODES.INVALID_UPLOAD))
    }

    try {
      fs.mkdirSync(folder, { recursive: true })
      callback(null, folder)
    } catch {
      callback(createError(ERROR_CODES.UPLOAD_ERROR))
    }
  },

  filename: (req, file, callback) => {
    callback(null, `${randomUUID()}.pdf`)
  }
})

const fileFilter = (req, file, callback) => {
  if (file.mimetype !== "application/pdf") {
    return callback(createError(ERROR_CODES.INVALID_FILE_TYPE))
  }

  callback(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
})

export default upload
