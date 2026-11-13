import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.router.js";
import storesRouter from "./routes/stores.router.js";
import ordersRouter from "./routes/orders.router.js";
import mocksRouter from "./routes/mocks.router.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { httpLogger } from "./middlewares/httpLogger.js";
import swaggerSpec from "./config/swagger.js";
import swaggerUi from "swagger-ui-express";
import logger from "./config/logger.js"

const app = express();

app.use(cors());
app.use(express.json());
app.use(httpLogger)
app.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "API funcionando"
  });
});
app.get("/api/logger-test", (req, res) => {
  logger.fatal("Prueba de nivel fatal")
  logger.error("Prueba de nivel error")
  logger.warning("Prueba de nivel warning")
  logger.info("Prueba de nivel info")
  logger.http("Prueba de nivel http")
  logger.debug("Prueba de nivel debug")

  res.json({
    status: "success",
    message: "Prueba de logger ejecutada"
  })
})

app.use("/api/users", usersRouter);
app.use("/api/stores", storesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/mocks", mocksRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFoundHandler);

//middleware global de errores
app.use(errorHandler);

export default app;
