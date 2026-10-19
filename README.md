# ShipNow API

API de logística desarrollada con Node.js, Express y MongoDB. Gestiona usuarios, pedidos y entregas, e incluye endpoints para generar datos de prueba con Faker.

## Requisitos

- Node.js 18+
- MongoDB local o Atlas

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

Completar las variables de entorno en `.env` antes de iniciar la aplicación. Si falta `MONGODB_URI` o `JWT_SECRET`, la aplicación informa el error al arrancar.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto del servidor | `8080` |
| `MONGODB_URI` | Conexión a MongoDB | `mongodb://localhost:27017/shipnow` |
| `JWT_SECRET` | Secreto de la aplicación | `un_secreto_largo` |

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servidor |
| GET/POST | `/api/users` | Listar y crear usuarios |
| GET/PUT/DELETE | `/api/users/:id` | Consultar, actualizar y eliminar usuarios |
| GET/POST | `/api/orders` | Listar y crear pedidos |
| GET/PUT/DELETE | `/api/orders/:id` | Consultar, actualizar y eliminar pedidos |
| GET/POST | `/api/deliveries` | Listar y crear entregas |
| GET/PUT/DELETE | `/api/deliveries/:id` | Consultar, actualizar y eliminar entregas |

## Mocking y carga de datos

Las rutas de mocking utilizan Faker para generar datos de prueba. Solo están disponibles fuera de producción.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/mocks/users?qty=2` | Genera usuarios ficticios sin guardarlos |
| GET | `/api/mocks/mockingUsers?qty=2` | Alias de la ruta de usuarios |
| GET | `/api/mocks/orders?qty=2` | Genera pedidos ficticios sin guardarlos |
| GET | `/api/mocks/deliveries?qty=2` | Genera entregas ficticias sin guardarlas |
| POST | `/api/mocks/seed?qty=3` | Inserta usuarios, pedidos y entregas en MongoDB |

### Parámetro `qty`

- Si se omite, se generan 10 elementos.
- Debe ser un número entero entre 0 y 400.
- En `seed`, debe ser mayor que 0.
- También se acepta `qty` en el body de `seed`, como `{ "qty": 3 }`. Si se envían ambos valores, prevalece el de la query string.

Los GET generan datos en memoria. Sus referencias a clientes, pedidos y repartidores son simuladas y no necesariamente corresponden a documentos existentes en MongoDB.

El `seed` crea clientes, repartidores, pedidos asociados a clientes y entregas asociadas a pedidos. Aproximadamente el 70 % de las entregas recibe un repartidor y el 30 % queda pendiente de asignación. La cantidad de repartidores generados es `max(1, ceil(qty / 3))`.

Ejemplo: `POST /api/mocks/seed?qty=3`

```json
{
  "status": "success",
  "payload": {
    "users": 4,
    "orders": 3,
    "deliveries": 3
  }
}
```

La cantidad de usuarios incluye tanto clientes como repartidores. Ejecutar el seed nuevamente genera registros adicionales.

### Validación de `qty`

| Entrada | Resultado |
|---|---|
| `qty=muchos`, `qty=-1` o `qty=2.5` | Error 400: debe ser un entero mayor o igual a 0 |
| `qty=401` | Error 400: no puede superar 400 |
| `POST /api/mocks/seed?qty=0` | Error 400: debe ser mayor a 0 |

## Formato de respuesta

Las respuestas siguen un formato común:

```json
{
  "status": "success",
  "payload": {}
}
```

En caso de error:

```json
{
  "status": "error",
  "message": "Pedido no encontrado"
}
```

## Estructura del proyecto

```text
src/
  app.js
  server.js
  config/
  routes/
  controllers/
  services/
  repository/
  models/
  mocks/
  utils/
```

- `config/`: configuración y conexión a MongoDB.
- `routes/`: definición de rutas.
- `controllers/`: manejo de requests y responses.
- `services/`: reglas de negocio y validaciones.
- `repository/`: acceso a datos mediante Mongoose.
- `models/`: esquemas de MongoDB.
- `mocks/`: generadores de datos ficticios con Faker.
- `utils/`: constantes y manejo de errores.

Flujo de mocking:

```text
routes/mocks.js
  → controllers/mock.controller.js
  → services/mocks.service.js
  → mocks/user.mock.js
  → mocks/order.mock.js
  → mocks/delivery.mock.js
  → repositories y servicios de la API
```

## Decisiones técnicas

- Los generadores producen objetos sin depender de Express ni de Mongoose.
- Los servicios coordinan la generación, validación y persistencia de los datos.
- Los repositorios centralizan el acceso a MongoDB.
- El servicio de pedidos calcula el total y el costo de envío.
- Las constantes centralizan los roles, estados y prioridades permitidos.

## Scripts

| Comando | Uso |
|---|---|
| `npm run dev` | Desarrollo con Nodemon |
| `npm start` | Inicio del servidor |