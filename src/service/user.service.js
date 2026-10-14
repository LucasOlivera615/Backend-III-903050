import { userRepository } from '../repository/user.repository.js';
import { createError } from '../utils/apiResponse.js';
import { ERROR_CODES } from '../utils/errorDictionary.js';
import { USER_ROLES } from '../utils/constants.js';

export const userService = {
  getUsers: async () => {
    return userRepository.findAll();
  },

  getUserById: async (id) => {
    const user = await userRepository.findById(id);

    if (!user) {
      /*
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
      */
      throw createError(ERROR_CODES.USER_NOT_FOUND);
    }

    return user;
  },

  createUser: async (userData) => {
    const { firstName, lastName, email, password, role } = userData;
    if (!firstName || !lastName || !email || !password) {
      throw createError(ERROR_CODES.VALIDATION_ERROR);
    }

    //validar el rol
    if (role && !Object.values(USER_ROLES).includes(role)) {
      throw createError(ERROR_CODES.INVALID_USER_ROLE);
    }

    return userRepository.create(userData);
  },

  updateUser: async (id, userData) => {
    const user = await userRepository.update(id, userData);

    if (!user) {
      throw createError(ERROR_CODES.USER_NOT_FOUND);
    }

    return user;
  },

  deleteUser: async (id) => {
    const user = await userRepository.delete(id);

    if (!user) {
      throw createError(ERROR_CODES.USER_NOT_FOUND);
    }

    return user;
  },
};
