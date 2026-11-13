# ShipNow API

API de logística construida con Node.js, Express y MongoDB. Gestiona usuarios,
comercios y pedidos con arquitectura por capas, mocks para cargar datos de prueba
y un manejo centralizado de errores. Incluye logging con Winston y documentación
interactiva mediante Swagger/OpenAPI.

## Entidades

- `User`: usuario del sistema. Roles: `admin`, `customer` y `store`.
- `Store`: comercio asociado a un usuario con rol `store`.
- `Order`: pedido asociado a un `customer` y a un `store`.
- `Delivery`: representación de los datos de entrega incluidos en `Order`, sin modelo independiente.

## Requisitos

- Node.js 18 o superior
- MongoDB local o Atlas

## Instalación

```bash
npm install
cp .env.example .env
```

Completar el `.env`:

| Variable | Uso | Ejemplo |
| --- | --- | --- |
| `PORT` | Puerto del servidor | `8080` |
| `MONGODB_URI` | Conexión a MongoDB (obligatoria) | `mongodb://localhost:27017/shipnow` |
| `NODE_ENV` | Entorno (`development` o `production`) | `development` |
| `LOGGER_LVL` | Nivel de logging en producción | `info` |

```bash
npm run dev
```

La API queda en `http://localhost:8080` si `PORT=8080`. Sin `PORT` usa `3000`.

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desarrollo con nodemon |
| `npm start` | Producción |

## Swagger

La documentación interactiva está disponible en:

**http://localhost:8080/api/docs** (con `PORT=8080`).

Permite consultar y probar los endpoints, sus parámetros, cuerpos de solicitud, respuestas y errores mediante **Try it out**.

La configuración se encuentra en `src/config/swagger.js` y las definiciones OpenAPI en `src/docs/swagger.yaml`.

Módulos documentados: **Users, Stores, Orders, Deliveries, Mocks y Logger**. Deliveries incluye un schema reutilizable, pero no tiene endpoints independientes.

## Respuestas

Éxito:

```json
{ "status": "success", "message": "usuario creado", "payload": {} }
```

Los endpoints que utilizan `successResponse` incluyen `status`, `message` y `payload`.

Error (middleware global):

```json
{ "status": "error", "message": "Usuario no encontrado", "code": "USER_NOT_FOUND" }
```

Los controllers de users delegan el error con `next(error)`. El middleware
traduce `CastError` de Mongoose a `VALIDATION_ERROR` (`ID invalido`).

## Endpoints

### Health

```http
GET /health
```

### Users

```http
GET    /api/users
GET    /api/users/:uid
POST   /api/users
PUT    /api/users/:uid
DELETE /api/users/:uid
```

```json
{
  "firstName": "Martina",
  "lastName": "Gomez",
  "email": "martina@test.com",
  "password": "123456",
  "role": "customer"
}
```

Roles válidos: `admin`, `customer`, `store`. Default: `customer`.

### Stores

```http
GET    /api/stores
GET    /api/stores/:sid
POST   /api/stores
PUT    /api/stores/:sid
DELETE /api/stores/:sid
```

El `owner` tiene que ser un usuario con rol `store`:

```json
{
  "name": "Kiosco Centro",
  "address": "Av. Siempre Viva 742",
  "owner": "ID_DEL_USUARIO_STORE"
}
```

### Orders

```http
GET    /api/orders
GET    /api/orders/:oid
POST   /api/orders
PUT    /api/orders/:oid/status
DELETE /api/orders/:oid
```

```json
{
  "customer": "ID_DEL_USUARIO_CUSTOMER",
  "store": "ID_DEL_STORE",
  "deliveryAddress": "Av. Siempre Viva 742",
  "items": [
    { "name": "Caja mediana", "quantity": 2, "price": 1500 }
  ]
}
```

El service calcula el `total`. Estado inicial: `created`.
Estados: `created`, `assigned`, `picked_up`, `in_transit`, `delivered`, `cancelled`.

### Deliveries

La información de entrega forma parte de `Order`, mediante los campos
`deliveryAddress`, `status`, `priority` y `proof`.

Swagger incluye el schema `Delivery`, pero actualmente no existen rutas
independientes para gestionar entregas.

### Mocks

Los GET no guardan nada. `POST /api/mocks/generateData` inserta en Mongo.

```http
GET  /api/mocks/mockingusers?qty=5
GET  /api/mocks/mockingorders?qty=5
POST /api/mocks/generateData
```

Body opcional de `generateData`:

```json
{ "users": 5, "stores": 2, "orders": 10 }
```

Sin body: 10 customers, 5 stores (con su usuario `store`) y 10 orders.
Las cantidades son enteros entre 0 y 400. Para generar pedidos hace falta
al menos un customer y un store en la misma carga. El email lleva un UUID
para poder repetir la carga.

**Nota:** `generateData` modifica la base de datos; se recomienda probarlo en un entorno de desarrollo.

### Logger

```http
GET /api/logger-test
```

Endpoint de diagnóstico que genera mensajes de prueba para los niveles
`fatal`, `error`, `warning`, `info`, `http` y `debug` de Winston.

No realiza operaciones de negocio. Los errores se registran mediante archivos
rotativos en `logs/errors-YYYY-MM-DD.log`. Se recomienda utilizar este endpoint
únicamente en entornos de prueba.

## Arquitectura

```text
routes       -> endpoints, solo delegan
controller   -> lee la request y arma la respuesta
service      -> reglas de negocio
repository   -> acceso a MongoDB
models       -> schemas de Mongoose
middlewares  -> 404 y errores
utils        -> diccionario de errores y helpers de respuesta
```

Flujo de un pedido:

```text
orders.router.js
  -> order.controller.js
  -> order.service.js
  -> order.repository.js
  -> order.model.js
```

**Decisión técnica:** los mensajes y status de error viven en
`src/utils/errorDictionary.js`. El service lanza `createError(CODE)` y el
middleware responde `{ status, message, code }`. Así no se repite el texto
en cada capa y el cliente puede distinguir `USER_NOT_FOUND` de un 404 genérico.

## Postman

Importar `postman/ShipNow-Clase-4.postman_collection.json` y
`postman/ShipNow-Clase-4.postman_environment.json`. Seleccionar el environment
**ShipNow Clase-4**. Los POST de creación guardan `userId`, `storeId` y `orderId`.