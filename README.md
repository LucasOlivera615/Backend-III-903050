# ShipNow API

API de logística de ShipNow con Node.js, Express y MongoDB. Gestiona usuarios (clientes, repartidores y tiendas), pedidos y entregas, e incluye endpoints de mocking para generar usuarios de prueba con Faker.

## Requisitos

- Node.js 18+
- MongoDB (local o Atlas)

## Instalación

```bash
npm install
cp .env.example .env   # completar con tus valores
npm run dev
```

Si falta `MONGODB_URI` o `JWT_SECRET`, la app no arranca y avisa qué variable falta.

## Variables de entorno

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto del servidor | `8080` |
| `MONGODB_URI` | Conexión a MongoDB | `mongodb://localhost:27017/shipnow` |
| `JWT_SECRET` | Secreto de la app (también valida la cotización de envío) | `un_secreto_largo` |

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET/POST | `/api/users` | Listar / crear usuarios |
| GET/PUT/DELETE | `/api/users/:id` | Obtener / actualizar / eliminar usuario |
| GET/POST | `/api/orders` | Listar / crear pedidos (calcula total y costo de envío) |
| GET/PUT/DELETE | `/api/orders/:id` | Obtener / actualizar / eliminar pedido |
| GET/POST | `/api/deliveries` | Listar / crear entregas |
| GET/PUT/DELETE | `/api/deliveries/:id` | Obtener / actualizar / eliminar entrega |

### Mocks

Herramientas de desarrollo para tener datos con los que probar la API. Los usuarios se generan con [Faker](https://fakerjs.dev/).

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/mocks/mockingUsers?qty=10` | Devuelve usuarios falsos. **No** los guarda |
| POST | `/api/mocks/seed?qty=10` | Genera usuarios falsos y los **inserta** en MongoDB |

- `qty` llega por query string. En `seed` también se acepta en el body (`{ "qty": 10 }`); si vienen los dos, gana el query.
- Sin `qty` se usan 10.
- `qty` tiene que ser un entero entre 0 y 400. En `seed` tiene que ser mayor a 0, porque insertar 0 usuarios no tiene sentido.
- Los usuarios generados son `customer` o `driver` (3 a 1, porque los pedidos necesitan clientes), nunca `admin`, y todos tienen la contraseña `coder123!`.
- El email lleva un sufijo random para no chocar con el índice `unique`.

Respuesta de `POST /api/mocks/seed?qty=10`:

```json
{ "status": "success", "payload": { "users": 10 } }
```

Errores (400):

| Request | Mensaje |
| --- | --- |
| `?qty=muchos`, `?qty=-1`, `?qty=2.5` | `qty debe ser un número entero mayor o igual a 0` |
| `?qty=401` | `qty no puede superar 400` |
| `POST /seed?qty=0` | `qty debe ser mayor a 0` |

Todas las respuestas siguen el mismo formato:

```json
{ "status": "success", "payload": {} }
{ "status": "error", "message": "Pedido no encontrado" }
```

## Estructura

```
src/
  app.js            express, rutas y middleware de errores
  server.js         conexión a MongoDB y listen
  config/           variables de entorno y conexión a la base
  routes/           endpoints, solo delegan
  controllers/      leen la request y arman la respuesta
  services/         reglas de negocio (incluye validación y carga de mocks)
  repository/       acceso a datos con Mongoose
  models/           schemas
  mocks/            generadores de datos falsos con Faker
  utils/            constantes del dominio y AppError
```

Flujo de los mocks:

```
routes/mocks.js → controllers/mock.controller.js → services/mocks.service.js → mocks/user.mock.js
                                                                             → repository/user.repository.js (insertMany)
```

**Decisiones técnicas:**

- El costo de envío se calcula en `order.service.js` con `calculateShippingCost`, que recibe entorno, valor y API key por parámetro. Así la regla de negocio no depende de `process.env` ni de la base, y se puede probar aislada.
- El generador de `src/mocks/user.mock.js` solo arma objetos: no conoce Mongoose ni Express. Quien inserta es `mocks.service.js` a través de `userRepository.insertMany`, igual que el resto de la API. Así el router de mocks no habla con los modelos y el generador se puede reutilizar en tests.
- `seed` usa `insertMany` en vez de un `create` por usuario: una sola operación contra MongoDB, que igual corre las validaciones del schema.


## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desarrollo con nodemon |
| `npm start` | Producción |
