import { userService } from '../service/user.service.js';
import { successResponse } from '../utils/apiResponse.js';
import { unlink } from "node:fs/promises";
import logger from "../config/logger.js"

export const getUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query

    const users = await userService.getUsers({ page, limit })

    successResponse(res, {
      message: 'Lista de usuarios',
      payload: users
    })
  } catch (error) {
    next(error)
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.uid);
    successResponse(res, { message: 'usuario obtenido', payload: user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    successResponse(res, { statusCode: 201, message: 'usuario creado', payload: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.uid, req.body);
    successResponse(res, { message: 'usuario actualizado', payload: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req.params.uid);
    successResponse(res, { message: 'usuario eliminado', payload: user });
  } catch (error) {
    next(error);
  }
};


export const uploadUserDocument = async (req, res, next) => {
  try {
    const uid = req.params.uid
    const type = req.body.type
    const file = req.file

    const user = await userService.addDocument(uid, file, type)

    logger.info(
      `Documento cargado correctamente - Usuario: ${uid} - Archivo: ${file.filename} - Tipo: ${type}`
    )

    successResponse(res, {
      statusCode: 201,
      message: "Documento agregado correctamente",
      payload: user
    })
  } catch (error) {
    if (req.file?.path) {
      try {
        await unlink(req.file.path)
      } catch (cleanupError) {
        logger.error(
          `Error al eliminar archivo temporal: ${cleanupError.message}`
        )
      }
    }

    next(error)
  }
}
