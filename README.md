# ShipNow API

API desarrollada con Node.js, Express y MongoDB.

## Requisitos

- Node.js 18+
- MongoDB

## Instalación

```bash
npm install
```

Crear un archivo `.env` tomando como referencia `.env.example`.

Luego ejecutar:

```bash
npm run dev
```

## Variables de entorno

```env
NODE_ENV=development
PORT=8080
MONGODB_URI=tu_mongodb_uri
JWT_SECRET=tu_jwt_secret
SHIPPING_API_KEY=tu_shipping_api_key
```

Las variables obligatorias se validan al iniciar la aplicación.

## Endpoints

### Users

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/users` | Listar usuarios |
| GET | `/api/users/:id` | Obtener usuario |
| POST | `/api/users` | Crear usuario |
| PUT | `/api/users/:id` | Actualizar usuario |
| DELETE | `/api/users/:id` | Eliminar usuario |

### Products

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/products` | Listar productos |
| GET | `/api/products/:id` | Obtener producto |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/:id` | Actualizar producto |
| DELETE | `/api/products/:id` | Eliminar producto |
| GET | `/api/products/:id/shipping-cost` | Obtener costo de envío |

Para obtener también los productos sin stock:

```text
GET /api/products?all=true
```

### Health check

```text
GET /api/health
```

## Estructura

El proyecto está organizado en:

- `controllers`: manejan las peticiones HTTP.
- `services`: contienen la lógica de negocio.
- `repository`: acceso a MongoDB.
- `models`: modelos de Mongoose.
- `config`: configuración y conexión a la base de datos.
- `utils`: constantes.

## Separación de responsabilidades

Los controllers manejan las peticiones y respuestas HTTP. Los services contienen las validaciones y reglas de negocio, mientras que los repositories se encargan del acceso a MongoDB.

Esta separación permite probar cada capa de forma independiente. Por ejemplo, un service puede probarse usando un repository simulado, o se puede cambiar la forma de acceder a los datos sin tener que modificar los controllers.

## Scripts

```bash
npm run dev
npm start
```