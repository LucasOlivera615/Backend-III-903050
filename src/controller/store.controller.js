import { storeService } from '../service/store.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getStores = async (req, res, next) => {
  try {
    const { page, limit } = req.query

    const stores = await storeService.getStores({ page, limit })

    successResponse(res, { message: 'Lista de tiendas', payload: stores })
  } catch (error) {
    next(error)
  }
}

export const getStoreById = async (req, res, next) => {
  try {
    const store = await storeService.getStoreById(req.params.sid);
    successResponse(res, { message: 'Tienda obtenida', payload: store });
  } catch (error) {
    next(error);
  }
};

export const createStore = async (req, res, next) => {
  try {
    const store = await storeService.createStore(req.body);
    successResponse(res, { statusCode: 201, message: 'Tienda creada', payload: store });
  } catch (error) {
    next(error);
  }
};

export const updateStore = async (req, res, next) => {
  try {
    const store = await storeService.updateStore(req.params.sid, req.body);
    successResponse(res, { message: 'Tienda actualizada', payload: store });
  } catch (error) {
    next(error);
  }
};

export const deleteStore = async (req, res, next) => {
  try {
    const store = await storeService.deleteStore(req.params.sid);
    successResponse(res, { message: 'Tienda eliminada', payload: store });
  } catch (error) {
    next(error);
  }
};