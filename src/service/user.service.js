import { userRepository } from '../repository/user.repository.js';

export const userService = {
  getUsers: async () => {
    return userRepository.findAll();
  },

  getUserById: async (id) => {
    const user = await userRepository.findById(id);

    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return user;
  },

  createUser: async (userData) => {
    const { firstName, lastName, email, password, role } = userData;
    if (!firstName || !lastName || !email || !password) {
      const error = new Error('Faltan datos obligatorios');
      error.statusCode = 400;
      throw error;
    }

    //falta validar si role contiene un valor valido

    return userRepository.create(userData);
  },

  updateUser: async (id, userData) => {
    const user = await userRepository.update(id, userData);

    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return user;
  },

  deleteUser: async (id) => {
    const user = await userRepository.delete(id);

    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return user;
  },
};
