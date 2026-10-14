# ShipNow API

API de logística construida con Node.js, Express y MongoDB. Esta versión integra la
base de las clases 1 y 2: configuración inicial, arquitectura por capas y generación
de datos ficticios.

## Entidades

La API trabaja únicamente con estas entidades:

- `User`: usuario del sistema. Roles disponibles: `admin`, `customer` y `store`.
- `Store`: comercio asociado a un usuario con rol `store`.
- `Order`: pedido asociado a un usuario `customer` y a un `store`.

No se incluyen entidades `delivery` ni `driver`.

## Instalación y configuración

```bash
npm install
```

Crear un archivo `.env` en la raíz:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/shipnow
```

`MONGODB_URI` es obligatoria. El servidor carga las variables de entorno antes de
conectarse a MongoDB.

## Ejecución

```bash
npm run dev
```

Para ejecutar sin nodemon:

```bash
npm start
```

La API queda disponible en `http://localhost:8080`.

## Arquitectura

```text
routes       -> define endpoints y delega
controllers  -> recibe request y construye response
services     -> contiene la lógica de negocio
repositories -> accede a MongoDB
models       -> define schemas de Mongoose
```

Ejemplo del flujo de un pedido:

```text
orders.router.js
  -> order.controller.js
  -> order.service.js
  -> order.repository.js
  -> order.model.js
```

La misma estructura se aplica a `user` y `store`.

## Respuestas

Respuesta exitosa:

```json
{
  "status": "success",
  "payload": {}
}
```

Respuesta de error:

```json
{
  "status": "error",
  "message": "Usuario no encontrado"
}
```

## Endpoints principales

### Health check

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

Ejemplo de usuario:

```json
{
  "firstName": "Martina",
  "lastName": "Gomez",
  "email": "martina@test.com",
  "password": "123456",
  "role": "customer"
}
```

### Stores

```http
GET    /api/stores
GET    /api/stores/:sid
POST   /api/stores
PUT    /api/stores/:sid
DELETE /api/stores/:sid
```

Un store necesita un usuario propietario con rol `store`:

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

Ejemplo de pedido:

```json
{
  "customer": "ID_DEL_USUARIO_CUSTOMER",
  "store": "ID_DEL_STORE",
  "deliveryAddress": "Av. Siempre Viva 742",
  "items": [
    {
      "name": "Caja mediana",
      "quantity": 2,
      "price": 1500
    }
  ]
}
```

El service calcula el total automáticamente. El estado inicial es `created`.
Estados disponibles: `created`, `assigned`, `picked_up`, `in_transit`, `delivered` y
`cancelled`.

## Mocks

Los mocks generan datos dinámicos usando únicamente `User`, `Store` y `Order`. Cada
generación crea nuevos IDs. Los endpoints de prueba no guardan datos en MongoDB.

### Usuarios en memoria

```http
GET /api/mocks/mockingusers?qty=5
```

Si no se indica `qty`, genera 10 usuarios `customer`.

### Pedidos en memoria

```http
GET /api/mocks/mockingorders?qty=5
```

Genera usuarios `customer`, usuarios `store`, comercios y pedidos relacionados sin
persistirlos.

### Persistir datos ficticios

```http
POST /api/mocks/generateData
```

Body opcional:

```json
{
  "users": 5,
  "stores": 2,
  "orders": 10
}
```

Sin body se generan 10 usuarios `customer`, 5 usuarios `store`, 5 stores y 10 orders.
El resultado de `users` incluye ambos tipos de usuario.

Los datos se persisten en este orden:

```text
users -> stores -> orders
```

Respuesta de ejemplo:

```json
{
  "status": "success",
  "payload": {
    "users": 7,
    "stores": 2,
    "orders": 10
  }
}
```

Cada usuario generado tiene un email con un identificador aleatorio para permitir cargas repetidas.
Las cantidades deben ser enteros entre 0 y 400. Para generar pedidos se necesita
al menos un customer y un store en la misma carga. Las cantidades inv?lidas devuelven HTTP 400 antes de insertar datos.

## Estructura relevante

```text
src/
  app.js
  server.js
  config/
  controller/
  mocks/
  models/
  repository/
  routes/
  service/
  utils/constants.js
```

La siguiente etapa puede incorporar manejo global de errores, validaciones más completas,
tests y documentación Swagger.
