import { userRepository } from '../repository/user.repository.js';
import { createError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../utils/errorDictionary.js';
import { DOCUMENT_TYPES, USER_ROLES } from '../utils/constants.js';
import logger from '../config/logger.js';

export const userService = {

  getUsers: async ({ page = "1", limit = "10" } = {}) => {
    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    if (
      !Number.isSafeInteger(pageNumber) ||
      !Number.isSafeInteger(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      throw createError(ERROR_CODES.INVALID_PAGINATION)
    }

    return userRepository.findAll({
      page: pageNumber,
      limit: limitNumber
    })
  },

  getUserById: async (id) => {
    const user = await userRepository.findById(id);

    if (!user) {

      throw createError(ERROR_CODES.USER_NOT_FOUND);
    }

    return user;
  },

  createUser: async (userData) => {
    if (
      !userData ||
      typeof userData !== "object" ||
      Array.isArray(userData)
    ) {
      throw createError(
        ERROR_CODES.VALIDATION_ERROR,
        "Los datos del usuario deben ser un objeto"
      )
    }

    const { firstName, lastName, email, password, role } = userData;

    if (
      !firstName ||
      !lastName ||
      !email ||
      typeof password !== "string" ||
      password.length === 0
    ) {
      throw createError(ERROR_CODES.VALIDATION_ERROR);
    }

    //validar el rol
    if (role && !Object.values(USER_ROLES).includes(role)) {
      throw createError(ERROR_CODES.INVALID_USER_ROLE);
    }

    const user = await userRepository.create({ firstName, lastName, email, password, role })

    logger.info(`User created with ID: ${user._id}`)

    return user
  },

  updateUser: async (id, userData) => {
    logger.info(`Trying to update User ${id}`)

    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "password",
      "role"
    ]

    if (
      !userData ||
      typeof userData !== "object" ||
      Array.isArray(userData)
    ) {
      throw createError(
        ERROR_CODES.VALIDATION_ERROR,
        "Los datos de actualizacion deben ser un objeto"
      )
    }

    const fields = Object.keys(userData)

    if (
      fields.length === 0 ||
      fields.some(field => !allowedFields.includes(field))
    ) {
      throw createError(
        ERROR_CODES.VALIDATION_ERROR,
        "Campos de actualizacion invalidos"
      )
    }

    const user = await userRepository.update(id, userData);

    if (!user) {
      throw createError(ERROR_CODES.USER_NOT_FOUND);
    }

    logger.info(`User ${user._id} updated`)

    return user;
  },

  deleteUser: async (id) => {
    const user = await userRepository.delete(id);

    if (!user) {
      throw createError(ERROR_CODES.USER_NOT_FOUND);
    }

    return user;
  },

  addDocument: async (id, file, type) => {
    if (!file) throw createError(ERROR_CODES.FILE_REQUIRED);

    if (!Object.values(DOCUMENT_TYPES).includes(type)) {
      throw createError(ERROR_CODES.INVALID_DOCUMENT_TYPE)
    }

    const user = await userRepository.findById(id);
    if (!user) throw createError(ERROR_CODES.USER_NOT_FOUND);

    const document = {
      originalName: file.originalname,
      fileName: file.filename,
      path: file.path,
      mimeType: file.mimetype,
      size: file.size,
      type
    }

    const documents = [...user.documents, document];
    const updatedUser = await userRepository.update(id, { documents });

    return updatedUser;
  }
};
