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
import { config } from "./config/index.js"

const app = express();

app.use(cors());
app.use(express.json());
app.use(httpLogger)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API funcionando",
    environment: config.nodeEnv,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.use("/api/users", usersRouter);
app.use("/api/stores", storesRouter);
app.use("/api/orders", ordersRouter);
if (!config.isProd) {
  app.use("/api/mocks", mocksRouter);
}
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(notFoundHandler);

//middleware global de errores
app.use(errorHandler);

export default app;
