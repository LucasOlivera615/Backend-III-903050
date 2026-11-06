import { storeRepository } from '../repository/store.repository.js';
import { userRepository } from '../repository/user.repository.js';

export const storeService = {
  getStores: async () => {
    return storeRepository.findAll();
  },

  getStoreById: async (id) => {
    const store = await storeRepository.findById(id);

    if (!store) {
      const error = new Error('Comercio no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return store;
  },

  createStore: async (storeData) => {
    const { name, address, owner } = storeData;

    if (!name || !address || !owner) {
      const error = new Error('Faltan datos obligatorios');
      error.statusCode = 400;
      throw error;
    }

    const ownerFound = await userRepository.findById(owner);

    if (!ownerFound) {
      const error = new Error('Usuario propietario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (ownerFound.role !== 'store') {
      const error = new Error('El propietario debe tener rol store');
      error.statusCode = 400;
      throw error;
    }

    return storeRepository.create(storeData);
  },

  updateStore: async (id, storeData) => {
    const store = await storeRepository.update(id, storeData);

    if (!store) {
      const error = new Error('Comercio no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return store;
  },

  deleteStore: async (id) => {
    const store = await storeRepository.delete(id);

    if (!store) {
      const error = new Error('Comercio no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return store;
  },
};