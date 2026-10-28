export const ERROR_CODES = {
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_ID: 'INVALID_ID',

  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_USER_ROLE: 'INVALID_USER_ROLE',

  STORE_NOT_FOUND: 'STORE_NOT_FOUND',
  STORE_OWNER_NOT_FOUND: 'STORE_OWNER_NOT_FOUND',
  INVALID_STORE_OWNER_ROLE: 'INVALID_STORE_OWNER_ROLE',

  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS',
  CUSTOMER_NOT_FOUND: 'CUSTOMER_NOT_FOUND',
  ORDER_STORE_NOT_FOUND: 'ORDER_STORE_NOT_FOUND',

  INVALID_MOCK_QUANTITY: 'INVALID_MOCK_QUANTITY',
  MOCK_ORDERS_REQUIRE_USERS_AND_STORES: 'MOCK_ORDERS_REQUIRE_USERS_AND_STORES',
  MOCK_PERSISTENCE_ERROR: 'MOCK_PERSISTENCE_ERROR',
}

export const ERROR_DICTIONARY = {
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: {
    statusCode: 500,
    message: 'Error interno en el servidor',
  },
  [ERROR_CODES.ROUTE_NOT_FOUND]: {
    statusCode: 404,
    message: 'Ruta no encontrada',
  },
  [ERROR_CODES.VALIDATION_ERROR]: {
    statusCode: 400,
    message: 'Faltan datos obligatorios o los datos son inválidos',
  },
  [ERROR_CODES.INVALID_ID]: {
    statusCode: 400,
    message: 'El identificador proporcionado no es válido',
  },

  [ERROR_CODES.USER_NOT_FOUND]: {
    statusCode: 404,
    message: 'Usuario no encontrado',
  },
  [ERROR_CODES.INVALID_USER_ROLE]: {
    statusCode: 400,
    message: 'Rol de usuario inválido',
  },

  [ERROR_CODES.STORE_NOT_FOUND]: {
    statusCode: 404,
    message: 'Comercio no encontrado',
  },
  [ERROR_CODES.STORE_OWNER_NOT_FOUND]: {
    statusCode: 404,
    message: 'Usuario propietario no encontrado',
  },
  [ERROR_CODES.INVALID_STORE_OWNER_ROLE]: {
    statusCode: 400,
    message: 'El propietario debe tener rol store',
  },

  [ERROR_CODES.ORDER_NOT_FOUND]: {
    statusCode: 404,
    message: 'Pedido no encontrado',
  },
  [ERROR_CODES.INVALID_ORDER_STATUS]: {
    statusCode: 400,
    message: 'Estado de pedido inválido',
  },
  [ERROR_CODES.CUSTOMER_NOT_FOUND]: {
    statusCode: 404,
    message: 'Cliente no encontrado',
  },
  [ERROR_CODES.ORDER_STORE_NOT_FOUND]: {
    statusCode: 404,
    message: 'Comercio del pedido no encontrado',
  },

  [ERROR_CODES.INVALID_MOCK_QUANTITY]: {
    statusCode: 400,
    message: 'La cantidad debe ser un entero entre 0 y 400',
  },
  [ERROR_CODES.MOCK_ORDERS_REQUIRE_USERS_AND_STORES]: {
    statusCode: 400,
    message: 'Para generar pedidos se necesitan usuarios y comercios',
  },
  [ERROR_CODES.MOCK_PERSISTENCE_ERROR]: {
    statusCode: 500,
    message: 'No se pudieron guardar los datos de prueba',
  },
}