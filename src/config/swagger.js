import swaggerJSDoc from "swagger-jsdoc";
import { config } from "../config/index.js";

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "ShipNow API",
      version: "1.0.0",
      description: "API de logística para gestionar usuarios, comercios y pedidos, con información de entregas, generación de mocks y logging."
    },
    servers: [
      { url: `http://localhost:${config.port}` }
    ]
  },
  apis: ["./src/docs/swagger.yaml"]
})

export default swaggerSpec;