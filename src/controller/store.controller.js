import { storeService } from '../service/store.service.js'
import { successResponse } from '../utils/apiResponse.js'

export const getStores = async (req, res, next) => {
  try {
    const stores = await storeService.getStores()

    return successResponse(res, {
      message: 'Lista de comercios',
      payload: stores,
    })
  } catch (error) {
    return next(error)
  }
}

export const getStoreById = async (req, res, next) => {
  try {
    const store = await storeService.getStoreById(req.params.sid)

    return successResponse(res, {
      message: 'Comercio obtenido',
      payload: store,
    })
  } catch (error) {
    return next(error)
  }
}

export const createStore = async (req, res, next) => {
  try {
    const store = await storeService.createStore(req.body)

    return successResponse(res, {
      statusCode: 201,
      message: 'Comercio creado',
      payload: store,
    })
  } catch (error) {
    return next(error)
  }
}

export const updateStore = async (req, res, next) => {
  try {
    const store = await storeService.updateStore(req.params.sid, req.body)

    return successResponse(res, {
      message: 'Comercio actualizado',
      payload: store,
    })
  } catch (error) {
    return next(error)
  }
}

export const deleteStore = async (req, res, next) => {
  try {
    const store = await storeService.deleteStore(req.params.sid)

    return successResponse(res, {
      message: 'Comercio eliminado',
      payload: store,
    })
  } catch (error) {
    return next(error)
  }
}