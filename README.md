# ShipNow API

API de logística construida con Node.js, Express y MongoDB. Gestiona usuarios,
comercios y pedidos con arquitectura por capas, mocks para cargar datos de prueba
y un manejo centralizado de errores.

## Entidades

- `User`: usuario del sistema. Roles: `admin`, `customer` y `store`.
- `Store`: comercio asociado a un usuario con rol `store`.
- `Order`: pedido asociado a un `customer` y a un `store`.

## Requisitos

- Node.js 22 o superior
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

```bash
npm run dev
```

La API queda en `http://localhost:8080` si `PORT=8080`. Sin `PORT` usa `3000`.

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desarrollo con nodemon |
| `npm start` | Producción |
| `npm test` | Ejecuta los tests funcionales con Mocha, Chai y Supertest |

## Respuestas

Éxito:

```json
{ "status": "success", "message": "usuario creado", "payload": {} }
```

Algunos endpoints responden solo `{ "status": "success", "payload": {} }`.

Error (middleware global):

```json
{ "status": "error", "message": "Usuario no encontrado", "code": "USER_NOT_FOUND" }
```

Los controllers de users delegan el error con `next(error)`. El middleware transforma los errores `CastError` de Mongoose en respuestas
HTTP 400 con código `VALIDATION_ERROR` y mensaje `ID invalido`. También reconoce los errores `ValidationError` de Mongoose y los transforma
en respuestas HTTP 400 con código `VALIDATION_ERROR`, conservando el detalle del error de validación.

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

## Testing funcional

Se implementaron pruebas funcionales utilizando:

- **Mocha:** ejecución y organización de las pruebas.
- **Chai:** aserciones sobre los resultados.
- **Supertest:** simulación de peticiones HTTP a la API.

### Configuración

Las pruebas utilizan una base de datos MongoDB independiente llamada
`shipnow_test`, evitando modificar los datos de desarrollo o producción.

Copiar `.env.test.example` a `.env.test` y configurar la conexión a MongoDB:

```env
NODE_ENV=test
PORT=8081
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/shipnow_test?retryWrites=true&w=majority
LOGGER_LVL=error
```

Si se utiliza MongoDB Atlas, reemplazar `MONGODB_URI` por la cadena de
conexión correspondiente, asegurándose de que apunte a `shipnow_test`.

El archivo `.env.test` contiene información privada y no debe subirse
al repositorio.

### Ejecutar los tests

Instalar las dependencias:

```bash
npm install
```

Ejecutar:

```bash
npm test
```

El script utiliza Node.js, Mocha y las variables definidas en `.env.test`.

El comando `npm test` requiere Node.js 20.6 o superior
debido al uso de `--env-file`. Se recomienda Node.js 22.

### Pruebas implementadas

| Suite | Archivo | Tests |
| --- | --- | ---: |
| Users | `tests/users.test.js` | 3 |
| Orders | `tests/orders.test.js` | 7 |
| Mocks | `tests/mocks.test.js` | 6 |
| System | `tests/system.test.js` | 3 |
| **Total** | | **19** |

Las pruebas verifican:

- Consulta de usuarios y manejo de errores.
- Creación, consulta y actualización de pedidos.
- Validación de datos obligatorios y estados inválidos.
- Generación de usuarios y pedidos simulados.
- Inserción real de datos mock en MongoDB.
- Funcionamiento del endpoint de Logger.
- Disponibilidad de la interfaz de Swagger.
- Respuesta HTTP 404 para rutas inexistentes.

### Protección de la base de testing

El archivo `tests/setup.js` verifica que:

1. `NODE_ENV` sea `test`.
2. La URI de MongoDB apunte a `shipnow_test`.
3. La conexión activa corresponda a esa base de datos.

Los tests que insertan documentos registran sus identificadores y realizan
la limpieza al finalizar.

No se utiliza `dropDatabase()` ni se vacían colecciones completas.

### Resultado de las pruebas

Última ejecución verificada:

```text
19 passing (3s)
```

Las 19 pruebas se ejecutaron correctamente en conjunto y se comprobó
su reproducibilidad mediante ejecuciones consecutivas.