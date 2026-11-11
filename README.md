# ShipNow API

API de logística construida con Node.js, Express y MongoDB. Gestiona usuarios,
tiendas y pedidos con arquitectura por capas, mocks para cargar datos de prueba
y un manejo centralizado de errores.

## Entidades

- `User`: usuario del sistema. Roles: `admin`, `customer` y `store`.
- `Store`: tienda asociado a un usuario con rol `store`.
- `Order`: pedido asociado a un `customer` y a un `store`.

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

```bash
npm run dev
```

La API queda en `http://localhost:8080` si `PORT=8080`. Sin `PORT` usa `3000`.

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desarrollo con nodemon |
| `npm start` | Producción |

## Respuestas

Éxito:

```json
{ "status": "success", "message": "usuario creado", "payload": {} }
```

Los módulos de usuarios, tiendas, pedidos y mocks usan este formato normalizado.
`GET /health` devuelve `status` y `message`.

Error (middleware global):

```json
{ "status": "error", "message": "Usuario no encontrado", "code": "USER_NOT_FOUND" }
```

Los controllers de usuarios, tiendas, pedidos y mocks delegan el error con `next(error)`. El middleware
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

## Documentación con Swagger

Instalar dependencias y levantar el servidor desde la raíz del proyecto:

```bash
npm install
npm run dev
```

Abrir [Swagger UI](http://localhost:8080/api/docs/) si `PORT=8080`.
Si usás otro puerto, reemplazar `8080` por el valor de `PORT`.
El servidor de Swagger toma el puerto de `src/config/index.js`.

La configuración está en `src/config/swagger.js` y toda la documentación
en `src/docs/swagger.yaml`. Se documentan Users, Stores, Orders y Mocks,
con schemas de entrada, salida y errores. El comando de desarrollo observa
cambios de JavaScript, JSON y YAML y reinicia el servidor automáticamente.

### Probar los ejemplos

Los IDs y emails de Swagger son ilustrativos: los IDs no se crean por abrir
la documentación. Reemplazarlos por datos de tu base antes de ejecutar.
`Try it out` envía peticiones reales y puede crear, actualizar o eliminar datos.

1. Ejecutar `POST /api/mocks/generateData` con
   `{ "users": 2, "stores": 1, "orders": 2 }`.
   Guarda 3 usuarios (2 clientes y 1 propietario), 1 tienda y 2 pedidos.
2. Consultar `GET /api/users` y copiar el `_id` de un usuario con rol `customer`.
3. Consultar `GET /api/stores` y copiar el `_id` de la tienda.
   No confundir ese ID con `owner`, que identifica a su propietario.
4. Reemplazar `customer` y `store` en el ejemplo de `POST /api/orders`.
5. Copiar el `_id` del pedido creado para consultar, actualizar su estado o eliminarlo.

Para crear una tienda manualmente, crear primero un usuario con rol `store`
y usar su ID como `owner`. Para crear usuarios nuevos, cambiar el email de ejemplo.

`GET /api/mocks/mockingusers` y `GET /api/mocks/mockingorders` generan datos
en memoria: sus IDs no representan registros persistidos. Admiten `qty`
entre 0 y 400; el valor predeterminado es 10. `generateData` tiene body opcional
y usa 10 clientes, 5 tiendas y 10 pedidos si no se indican cantidades.

### Interpretar las respuestas

- Los GET de pedidos devuelven `customer` y `store` como objetos poblados.
  Pueden ser `null` si se eliminaron las entidades relacionadas.
- Crear, actualizar el estado o eliminar un pedido devuelve esas relaciones como IDs.
- Un ID mal formado responde `400` con `VALIDATION_ERROR`.
  Un ID válido sin registro responde `404` con el código del recurso.
- Los estados admitidos están en el `enum` de `OrderStatusInput`.
  No se impone una secuencia de transiciones entre ellos.
- Algunas validaciones de Mongoose y los emails duplicados todavía responden
  `500`. Swagger describe ese comportamiento actual; no se documentan como `409`.
- `required`, los límites y los ejemplos del YAML describen el contrato.
  Las validaciones de Express y Mongoose son las que deciden si se acepta la petición.

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
