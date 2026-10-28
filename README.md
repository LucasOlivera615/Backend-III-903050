# ShipNow API

API de logística construida con Node.js, Express y MongoDB. Esta versión integra la base de las clases 1 y 2: configuración inicial, arquitectura por capas y generación de datos ficticios.

## Entidades

La API trabaja con las siguientes entidades:

- `User`: usuario del sistema. Roles disponibles: `admin`, `customer` y `store`.
- `Store`: comercio asociado a un usuario con rol `store`.
- `Order`: pedido asociado a un usuario `customer` y a un `store`.

No se incluyen entidades `delivery` ni `driver`.

## Instalación y configuración

Instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/shipnow
```

La variable `MONGODB_URI` es obligatoria. El servidor carga las variables de entorno antes de conectarse a MongoDB.

## Ejecución

Iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

Para ejecutar la aplicación sin Nodemon:

```bash
npm start
```

La API queda disponible en http://localhost:8080.

## Arquitectura

El proyecto utiliza una arquitectura por capas:

```text
routes       -> define endpoints y delega
controllers  -> recibe requests y construye responses
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

La misma estructura se aplica a `User` y `Store`.

## Manejo de errores

La API utiliza un sistema centralizado de manejo de errores. Los servicios detectan errores de negocio y los envían al middleware global, que construye la respuesta HTTP.

**Respuesta exitosa:**

```json
{
  "status": "success",
  "message": "Pedido obtenido",
  "payload": {}
}
```

**Respuesta de error:**

```json
{
  "status": "error",
  "message": "Pedido no encontrado",
  "code": "ORDER_NOT_FOUND"
}
```

Cada error devuelve un código de estado HTTP y un cuerpo JSON con el mensaje y un código identificador.

Principales códigos HTTP:

- `400 Bad Request`: datos inválidos, identificadores con formato incorrecto o cantidades de mocks fuera del rango permitido.
- `404 Not Found`: recurso o ruta inexistente.
- `500 Internal Server Error`: error inesperado del servidor o fallo al persistir datos de prueba.

Los errores de negocio se representan mediante `AppError` y un diccionario de errores. El middleware global centraliza el formato de las respuestas, registra los errores inesperados en el servidor y evita exponer sus detalles internos al cliente.

## Endpoints principales

### Health check

```http
GET /health
```

Permite comprobar que la API está funcionando.

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

Un `Store` necesita un usuario propietario con rol `store`:

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

Estados disponibles: `created`, `assigned`, `picked_up`, `in_transit`, `delivered` y `cancelled`.

## Mocks

La API permite generar datos ficticios de `User`, `Store` y `Order` en memoria o persistirlos en MongoDB.

### Usuarios en memoria

```http
GET /api/mocks/mockingusers?qty=5
```

Genera 5 usuarios con rol `customer`. Si se omite `qty`, genera 10.

### Pedidos en memoria

```http
GET /api/mocks/mockingorders?qty=5
```

Genera usuarios, comercios y pedidos relacionados sin guardarlos en MongoDB.

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

Sin body, genera 10 usuarios `customer`, 5 usuarios `store`, 5 comercios y 10 pedidos. El total de `users` en la respuesta incluye ambos tipos de usuario.

Los datos se guardan en el siguiente orden:

```text
users -> stores -> orders
```

**Respuesta de ejemplo:**

```json
{
  "status": "success",
  "message": "Datos de prueba guardados",
  "payload": {
    "users": 7,
    "stores": 2,
    "orders": 10
  }
}
```

### Validaciones y errores

Las cantidades deben ser números enteros entre 0 y 400. Para generar pedidos se necesita al menos un usuario `customer` y un comercio en la misma solicitud.

Los datos inválidos devuelven HTTP 400. Los fallos de persistencia devuelven HTTP 500 con el código `MOCK_PERSISTENCE_ERROR`.

Ejemplos de pruebas:

**Cantidad negativa: HTTP 400**

```bash
curl -i "http://localhost:8080/api/mocks/mockingusers?qty=-1"
```

**Cantidad decimal: HTTP 400**

```bash
curl -i "http://localhost:8080/api/mocks/mockingorders?qty=1.5"
```

**Pedidos sin usuarios ni comercios: HTTP 400**

```bash
curl -i -X POST "http://localhost:8080/api/mocks/generateData" \
  -H "Content-Type: application/json" \
  -d '{"users":0,"stores":0,"orders":1}'
```

Los usuarios generados utilizan emails con identificadores aleatorios para permitir cargas repetidas.

## Estructura relevante

```text
src/
  app.js
  server.js
  config/
  controller/
  mocks/
  middlewares/
  models/
  repository/
  routes/
  service/
  utils/
    constants.js
```