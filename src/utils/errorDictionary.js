export const ERROR_CODES = {
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  ROUTE_NOT_FOUND: "ROUTE_NOT_FOUND",

  USER_NOT_FOUND: "USER_NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_USER_ROLE: "INVALID_USER_ROLE",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  STORE_NOT_FOUND: "STORE_NOT_FOUND",
  INVALID_ORDER_STATUS: "INVALID_ORDER_STATUS",
  INVALID_ORDER_PRIORITY: "INVALID_ORDER_PRIORITY",
  INVALID_MOCK_AMOUNT: "INVALID_MOCK_AMOUNT",
  INVALID_ID_MONGOOSE: "INVALID_ID_MONGOOSE",

  FILE_REQUIRED: "FILE_REQUIRED",
  INVALID_DOCUMENT_TYPE: "INVALID_DOCUMENT_TYPE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  INVALID_PAGINATION: "INVALID_PAGINATION",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_UPLOAD: "INVALID_UPLOAD",
  UPLOAD_ERROR: "UPLOAD_ERROR"
}

export const ERROR_DICTIONARY = {
  "ORDER_NOT_FOUND": {
    statusCode: 404,
    message: "Pedido no encontrado"
  },

  "STORE_NOT_FOUND": {
    statusCode: 404,
    message: "Tienda no encontrada"
  },

  "INVALID_ORDER_STATUS": {
    statusCode: 400,
    message: "Estado de pedido invalido"
  },

  "INVALID_ORDER_PRIORITY": {
    statusCode: 400,
    message: "Prioridad de pedido invalida"
  },

  "INVALID_MOCK_AMOUNT": {
    statusCode: 400,
    message: "Cantidad de mocks invalida"
  },


  "INTERNAL_SERVER_ERROR": {
    statusCode: 500,
    message: "Error interno en el servidor"
  },

  "ROUTE_NOT_FOUND": {
    statusCode: 404,
    message: "Ruta no encontrada"
  },

  "USER_NOT_FOUND": {
    statusCode: 404,
    message: "Usuario no encontrado"
  },

  "VALIDATION_ERROR": {
    statusCode: 400,
    message: "Faltan datos obligatorios"
  },

  "INVALID_USER_ROLE": {
    statusCode: 400,
    message: "Rol invalido"
  },

  "INVALID_ID_MONGOOSE": {
    statusCode: 400,
    message: "ID invalido"
  },

  "FILE_REQUIRED": {
    statusCode: 400,
    message: "Debes adjuntar un archivo"
  },

  "INVALID_DOCUMENT_TYPE": {
    statusCode: 400,
    message: "Tipo de documento invalido"
  },

  "INVALID_FILE_TYPE": {
    statusCode: 400,
    message: "Solo se permiten archivos PDF"
  },

  "FILE_TOO_LARGE": {
    statusCode: 413,
    message: "El archivo supera el limite maximo de 5MB"
  },

  "INVALID_UPLOAD": {
    statusCode: 400,
    message: "Campo de archivo o cantidad no permitidos"
  },

  "UPLOAD_ERROR": {
    statusCode: 500,
    message: "No se pudo guardar el archivo"
  },

  "INVALID_PAGINATION": {
    statusCode: 400,
    message: "Los parametros page y limit deben ser enteros positivos. El limite maximo es 100"
  },
}
