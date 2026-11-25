# ShipNow API

API de logística construida con Node.js, Express y MongoDB. Gestiona usuarios,
tiendas y pedidos con arquitectura por capas, mocks para cargar datos de prueba
y un manejo centralizado de errores.

## Entidades

- `User`: usuario del sistema. Roles: `admin`, `customer` y `store`.
- `Store`: tienda asociada a un usuario con rol `store`.
- `Order`: pedido asociado a un `customer` y a un `store`.

## Requisitos

- Node.js 22 recomendado.
- MongoDB local o Atlas.
- Docker Desktop o Docker Engine para la ejecución en contenedores.

## Instalación

```bash
npm ci
cp .env.example .env
```

Completar el archivo `.env` con las variables correspondientes.

| Variable | Uso | Valor predeterminado |
| --- | --- | --- |
| `PORT` | Puerto HTTP del servidor | `3000` |
| `NODE_ENV` | Entorno: `development`, `test` o `production` | `development` |
| `MONGODB_URI` | Conexión a MongoDB para desarrollo y producción | Obligatoria en estos entornos |
| `MONGODB_URI_TEST` | Conexión exclusiva para testing | Obligatoria en testing |
| `LOGGER_LVL` | Nivel de logging | `debug` en desarrollo y testing; `warning` en producción |

El archivo `.env.example` utiliza el puerto `8080` como configuración de ejemplo.

Los niveles de logging admitidos son `fatal`, `error`, `warning`, `info`, `http` y `debug`.

La aplicación valida las variables críticas antes de inicializar el servidor y conectarse a MongoDB. Si la configuración es inválida, finaliza con un mensaje descriptivo y código de salida 1.

Las credenciales se proporcionan mediante variables de entorno y no se incluyen en el repositorio ni en la imagen Docker.

Actualmente la API no utiliza JWT ni servicios externos adicionales, por lo que no requiere variables para estos mecanismos.

### Ejecución en desarrollo

```bash
npm run dev
```

### Ejecución en producción

```bash
NODE_ENV=production npm start
```

La API queda disponible en `http://localhost:8080` si `PORT=8080`.

El comando `npm start` ejecuta el servidor sin nodemon. El entorno efectivo depende de `NODE_ENV`.

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desarrollo con nodemon |
| `npm start` | Ejecuta el servidor sin nodemon |
| `npm test` | Ejecuta los tests automatizados con Mocha |

## Respuestas

Éxito:

```json
{ "status": "success", "message": "usuario creado", "payload": {} }
```

Los módulos de usuarios, tiendas, pedidos y mocks usan este formato normalizado.
`GET /health` devuelve el estado, mensaje, entorno, uptime y timestamp de la API.

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

Devuelve HTTP 200 cuando la API está en funcionamiento.

Ejemplo de respuesta:

```json
{
  "status": "success",
  "message": "API funcionando",
  "environment": "production",
  "uptime": 125,
  "timestamp": "2026-11-25T13:00:00.000Z"
}
```

- `status`: estado de la API.
- `message`: mensaje descriptivo.
- `environment`: entorno de ejecución.
- `uptime`: tiempo de ejecución del proceso en segundos.
- `timestamp`: fecha y hora UTC en formato ISO 8601.

El endpoint no expone credenciales ni información sensible.

Comprueba que la aplicación está activa, pero no realiza una nueva consulta a MongoDB en cada petición.

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

#### Documentos de usuario

```http
POST /api/users/:uid/documents
```

Permite adjuntar documentos PDF a un usuario existente.

La petición utiliza `multipart/form-data` con dos campos obligatorios:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `document` | File | Archivo PDF de hasta 5 MB |
| `type` | String | Tipo de documento: `user_document` |

Ejemplo con cURL:

```bash
curl -X POST http://localhost:8080/api/users/ID_DEL_USUARIO/documents \
  -F "document=@documento.pdf;type=application/pdf" \
  -F "type=user_document"
```

Los archivos se guardan en `uploads/documents/` con un nombre único generado mediante UUID.

MongoDB almacena los metadatos del archivo dentro del arreglo `documents` del usuario: `originalName`, `fileName`, `path`, `mimeType`, `size`, `type` y `uploadedAt`.

Si la validación o persistencia falla después de guardar el archivo, el controller intenta eliminarlo para evitar archivos huérfanos.

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

#### Comprobantes de pedidos

```http
POST /api/orders/:oid/proof
```

Permite adjuntar un comprobante PDF a un pedido existente.

La petición utiliza `multipart/form-data` con el campo obligatorio `proof`.

Ejemplo con cURL:

```bash
curl -X POST http://localhost:8080/api/orders/ID_DEL_PEDIDO/proof \
  -F "proof=@comprobante.pdf;type=application/pdf"
```

Los archivos se guardan en `uploads/proofs/` con nombres únicos generados mediante UUID.

Los metadatos del comprobante se almacenan en MongoDB, asociados al pedido.

Cada pedido admite un único comprobante. La actualización atómica en MongoDB impide que dos solicitudes simultáneas asignen comprobantes diferentes al mismo pedido.

### Mocks

Los endpoints de mocks están disponibles únicamente en desarrollo y testing.
En producción no se registran estas rutas y las peticiones responden HTTP 404.

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

## Performance y paginación

Los endpoints de listado utilizan paginación para evitar consultas y respuestas de tamaño ilimitado.

| Endpoint | Paginación | Filtros |
| --- | --- | --- |
| `GET /api/users` | Sí | - |
| `GET /api/stores` | Sí | - |
| `GET /api/orders` | Sí | `status`, `priority` |

### Parámetros de consulta

| Parámetro | Descripción | Valor predeterminado |
| --- | --- | --- |
| `page` | Número de página, entero positivo | `1` |
| `limit` | Cantidad de registros por página, entre 1 y 100 | `10` |
| `status` | Estado del pedido | Sin filtro |
| `priority` | Prioridad del pedido | Sin filtro |

Los filtros `status` y `priority` pueden utilizarse individualmente o combinarse.

Prioridades admitidas: `low`, `normal` y `high`.

Ejemplos:

```http
GET /api/users?page=1&limit=10
GET /api/stores?page=2&limit=5
GET /api/orders?page=1&limit=20&status=delivered
GET /api/orders?page=1&limit=10&status=created&priority=high
```

El payload de las respuestas paginadas contiene:

- `docs`: registros de la página solicitada.
- `totalDocs`: cantidad total de registros que cumplen los filtros.
- `page`: página actual.
- `limit`: cantidad máxima de registros por página.
- `totalPages`: cantidad total de páginas.
- `hasNextPage`: indica si existe una página siguiente.
- `hasPrevPage`: indica si existe una página anterior.

Los parámetros inválidos se rechazan mediante errores controlados.

### Optimizaciones implementadas

- Paginación directamente desde MongoDB mediante `skip` y `limit`.
- Ordenamiento estable por `_id`.
- Conteo de documentos y consulta de registros ejecutados en paralelo.
- Uso de `lean()` en consultas de listado.
- Exclusión de contraseñas en las respuestas de usuarios.
- Selección de campos del customer al poblar pedidos.
- Límites de cantidad en los endpoints de mocks.
- Creación asíncrona de directorios de uploads.
- Nivel de logging configurable según el entorno.

Las contraseñas de usuarios nuevos y las actualizaciones de contraseña realizadas mediante la API se procesan con bcrypt. Las contraseñas no forman parte de las respuestas de usuarios.

## Carga de archivos con Multer

La API utiliza Multer con almacenamiento en disco para recibir archivos mediante `multipart/form-data`.

La configuración centralizada está en `src/middlewares/upload.middleware.js`.

**Restricciones:**

- Solo se aceptan archivos con MIME `application/pdf`.
- Tamaño máximo: 5 MB por archivo.
- Se permite un archivo por solicitud.
- Los nombres de archivo se generan mediante UUID.
- Los directorios de almacenamiento se crean automáticamente mediante operaciones asíncronas.
- Los archivos cargados se excluyen del repositorio mediante `.gitignore`.

**Directorios:**

```text
uploads/
├── documents/
└── proofs/
```

Durante las pruebas automatizadas se utiliza `uploads/test/` para mantener separados los archivos de prueba.

### Política de almacenamiento y persistencia

Los archivos se almacenan en el sistema de archivos local, fuera del código fuente y excluidos del control de versiones y del contexto de construcción de Docker.

MongoDB almacena los metadatos y las referencias a los archivos, no su contenido binario.

Los documentos y comprobantes aceptados se conservan como archivos asociados a los recursos correspondientes. Si una operación falla después de guardar un archivo, se intenta eliminarlo para evitar archivos huérfanos.

Actualmente no existe una política automática de expiración ni un proceso periódico de limpieza de archivos antiguos. Su conservación y eliminación deben gestionarse según las necesidades del negocio.

La restricción de tipo de archivo se basa en el MIME informado durante la carga.

En Docker, los archivos se almacenan en `/app/uploads`. Para conservarlos después de eliminar un contenedor se debe utilizar un volumen persistente.

En un despliegue con múltiples instancias, sería necesario utilizar almacenamiento compartido o un servicio de almacenamiento de objetos para garantizar el acceso a los mismos archivos desde todas las instancias.

### Errores de carga

| Código | HTTP | Descripción |
| --- | --- | --- |
| `FILE_REQUIRED` | 400 | No se adjuntó un archivo obligatorio |
| `INVALID_DOCUMENT_TYPE` | 400 | Tipo de documento no permitido |
| `INVALID_FILE_TYPE` | 400 | El archivo no tiene el MIME permitido |
| `INVALID_UPLOAD` | 400 | Campo incorrecto, cantidad no permitida o comprobante duplicado |
| `FILE_TOO_LARGE` | 413 | El archivo supera los 5 MB |
| `UPLOAD_ERROR` | 500 | Error de almacenamiento |

Los errores se procesan mediante el middleware global, manteniendo el formato de respuesta normalizado de la API.

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

Los siguientes ejemplos de generación de datos deben ejecutarse en desarrollo
o testing, ya que los endpoints de mocks están deshabilitados en producción.

Los IDs y emails de Swagger son ilustrativos: los IDs no se crean por abrir
la documentación. Reemplazarlos por datos de tu base antes de ejecutar.
`Try it out` envía peticiones reales y puede crear, actualizar o eliminar datos.

1. Ejecutar `POST /api/mocks/generateData` con
   `{ "users": 2, "stores": 1, "orders": 2 }`.
   Guarda 3 usuarios (2 clientes y 1 propietario), 1 tienda y 2 pedidos.
2. Consultar `GET /api/users` y copiar el `_id` de un usuario con rol `customer`
   dentro de `payload.docs`.
3. Consultar `GET /api/stores` y copiar el `_id` de la tienda dentro de
   `payload.docs`. No confundir ese ID con `owner`, que identifica a su propietario.
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

## Logging

La API utiliza Winston con niveles personalizados:

| Nivel | Uso |
| --- | --- |
| `fatal` | Fallos críticos |
| `error` | Errores internos |
| `warning` | Advertencias y errores controlados |
| `info` | Información general |
| `http` | Registro de peticiones HTTP |
| `debug` | Información de depuración |

El nivel se configura mediante `LOGGER_LVL`.

En producción se utiliza `warning` por defecto para reducir el volumen de logs.

Los logs se escriben en consola y los errores se almacenan adicionalmente en archivos rotativos:

```text
logs/errors-YYYY-MM-DD.log
```

Los archivos de errores tienen una retención configurada de 14 días mediante `winston-daily-rotate-file`.

El directorio `logs/` está excluido de Git y del contexto de construcción de Docker.

En contenedores, los logs de consola pueden consultarse mediante `docker logs`. Para conservar los archivos de errores después de eliminar un contenedor se debe utilizar un volumen persistente.

## Docker

La API puede ejecutarse en un contenedor Docker sin instalar Node.js ni las dependencias directamente en el sistema anfitrión.

### Configuración de la imagen

El `Dockerfile` utiliza:

- Imagen base `node:22-bookworm-slim`.
- Instalación reproducible mediante `npm ci --omit=dev`.
- Únicamente dependencias de producción.
- Directorio de trabajo `/app`.
- Entorno `production`.
- Puerto `8080`.
- Usuario sin privilegios de root.
- Directorios de uploads y logs con permisos de escritura.

### Construir la imagen

Desde la raíz del proyecto:

```bash
docker build -t shipnow-api:1.0.0 .
```

Verificar la imagen:

```bash
docker images shipnow-api
```

### Ejecutar el contenedor

Crear y completar el archivo `.env` antes de ejecutar el contenedor.

La conexión a MongoDB debe ser accesible desde Docker. Si MongoDB se ejecuta localmente en el sistema anfitrión con Docker Desktop, se puede utilizar `host.docker.internal` en lugar de `localhost` dentro de la URI.

```bash
docker run -d \
  --name shipnow-api \
  --env-file .env \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e LOGGER_LVL=warning \
  -p 127.0.0.1:8080:8080 \
  shipnow-api:1.0.0
```

Las variables se proporcionan durante la ejecución y las credenciales no se incorporan a la imagen.

El puerto interno y externo es `8080`. El mapeo a `127.0.0.1` limita el acceso al equipo anfitrión.

### Verificar el funcionamiento

```bash
docker ps
docker logs shipnow-api
```

Health check:

```bash
curl -i http://localhost:8080/health
```

Swagger:

http://localhost:8080/api/docs/

Endpoints principales:

```bash
curl "http://localhost:8080/api/users?page=1&limit=1"
curl "http://localhost:8080/api/stores?page=1&limit=1"
curl "http://localhost:8080/api/orders?page=1&limit=1"
```

### Endpoints según el entorno

| Endpoint | Development | Testing | Production |
| --- | --- | --- | --- |
| `/health` | Disponible | Disponible | Disponible |
| `/api/users` | Disponible | Disponible | Disponible |
| `/api/stores` | Disponible | Disponible | Disponible |
| `/api/orders` | Disponible | Disponible | Disponible |
| `/api/mocks/*` | Disponible | Disponible | Deshabilitado |
| `/api/docs` | Disponible | Disponible | Disponible |
| `/api/logger-test` | No implementado | No implementado | No implementado |

Swagger permanece disponible en producción para facilitar la documentación y comprobación de la API.

### Persistencia de archivos

Para conservar los uploads y los archivos de logs después de eliminar un contenedor, se pueden utilizar volúmenes de Docker:

```bash
docker run -d \
  --name shipnow-api \
  --env-file .env \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e LOGGER_LVL=warning \
  -p 127.0.0.1:8080:8080 \
  -v shipnow-uploads:/app/uploads \
  -v shipnow-logs:/app/logs \
  shipnow-api:1.0.0
```

Este comando es una alternativa al comando de ejecución anterior. No deben ejecutarse ambos simultáneamente con el mismo nombre de contenedor.

MongoDB se ejecuta externamente al contenedor de la API.

### Archivos excluidos

El archivo `.dockerignore` excluye del contexto de construcción:

- `node_modules`
- `.env` y archivos de entorno adicionales, excepto `.env.example`
- `.git` y `.gitignore`
- `logs`
- `uploads`
- `coverage`
- Archivos y directorios temporales
- `tests`

Los archivos de credenciales, dependencias locales, uploads, logs y cobertura también se excluyen del repositorio mediante `.gitignore`, según los patrones definidos en dicho archivo.

### Detener y eliminar el contenedor

```bash
docker stop shipnow-api
docker rm shipnow-api
```

Eliminar el contenedor no elimina la imagen Docker, los volúmenes nombrados ni los registros de MongoDB.

Sin volúmenes, los archivos almacenados localmente dentro del contenedor se pierden al eliminarlo.

### Validación de configuración

La imagen no puede iniciar sin las variables críticas correspondientes.

```bash
docker run --rm shipnow-api:1.0.0
```

Sin proporcionar una URI de MongoDB, el servidor informa que falta `MONGODB_URI` y finaliza con código de salida 1.

### Verificación realizada

Se comprobó exitosamente:

- Construcción de la imagen Docker.
- Ejecución del contenedor en producción.
- Conexión inicial a MongoDB.
- Health check con HTTP 200.
- Swagger con HTTP 200.
- Endpoints de usuarios, tiendas y pedidos con HTTP 200.
- Endpoints de mocks y logger-test con HTTP 404.
- Rechazo del arranque sin la variable MONGODB_URI.

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

## Pruebas automatizadas

La API cuenta con pruebas de integración utilizando Mocha, Chai y Supertest.

### Configuración

Crear un archivo `.env.test` en la raíz del proyecto:

```dotenv
NODE_ENV=test
PORT=8080
MONGODB_URI_TEST=
LOGGER_LVL=error
```

Completar `MONGODB_URI_TEST` con una conexión a MongoDB cuya base de datos indicada en la URI sea `shipnow-903050_test`.

Las credenciales de testing no deben incluirse en el repositorio.

### Ejecución

```bash
npm ci
npm test
```

Las pruebas utilizan una base de datos temporal con un nombre único por ejecución para evitar modificar los registros de desarrollo.

El entorno y la conexión se validan antes de realizar operaciones de limpieza.

La ejecución incluye pruebas de:

- Estado de la API, entorno, uptime y timestamp.
- Rutas inexistentes.
- Generación de mocks.
- Creación, consulta, validación y actualización de pedidos.
- Paginación de usuarios, tiendas y pedidos.
- Filtros de pedidos.
- Validación de parámetros de paginación.
- Seguridad y tratamiento de contraseñas de usuarios.
- Carga de documentos de usuario.
- Carga de comprobantes de pedidos.
- Rechazo de archivos inválidos, archivos mayores a 5 MB y campos incorrectos.
- Prevención de comprobantes duplicados, incluso ante solicitudes simultáneas.
- Disponibilidad de endpoints de soporte.

Los archivos temporales de prueba y la base de datos temporal se eliminan al finalizar la ejecución normal de la suite.

**Última ejecución verificada (25/11/2026):** 51 tests aprobados, 0 fallidos, en 22 segundos.

## Postman

Importar `postman/ShipNow-Clase-4.postman_collection.json` y
`postman/ShipNow-Clase-4.postman_environment.json`. Seleccionar el environment
**ShipNow Clase-4**. Los POST de creación guardan `userId`, `storeId` y `orderId`.
