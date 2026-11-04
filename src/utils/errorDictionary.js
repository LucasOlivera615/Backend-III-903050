export const ERROR_CODES = {
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  ROUTE_NOT_FOUND: "ROUTE_NOT_FOUND",

  VALIDATION_ERROR: "VALIDATION_ERROR",

  USER_NOT_FOUND: "USER_NOT_FOUND",
  INVALID_USER_ROLE: "INVALID_USER_ROLE",

  STORE_NOT_FOUND: "STORE_NOT_FOUND",
  STORE_OWNER_NOT_FOUND: "STORE_OWNER_NOT_FOUND",
  INVALID_STORE_OWNER_ROLE: "INVALID_STORE_OWNER_ROLE",

  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
}

export const ERROR_DICTIONARY = {
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    message: "Error interno en el servidor"
  },

  ROUTE_NOT_FOUND: {
    statusCode: 404,
    message: "Ruta no encontrada"
  },

  VALIDATION_ERROR: {
    statusCode: 400,
    message: "Faltan datos obligatorios"
  },

  USER_NOT_FOUND: {
    statusCode: 404,
    message: "Usuario no encontrado"
  },

  INVALID_USER_ROLE: {
    statusCode: 400,
    message: "Rol invalido"
  },

  STORE_NOT_FOUND: {
    statusCode: 404,
    message: "Comercio no encontrado"
  },

  STORE_OWNER_NOT_FOUND: {
    statusCode: 404,
    message: "Usuario propietario no encontrado"
  },

  INVALID_STORE_OWNER_ROLE: {
    statusCode: 400,
    message: "El propietario debe tener rol store"
  },

  ORDER_NOT_FOUND: {
    statusCode: 404,
    message: "Pedido no encontrado"
  }
}