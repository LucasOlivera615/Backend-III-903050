import { config, validateConfig } from "./config/index.js"

const startServer = async () => {
  try {
    validateConfig()

    const { default: app } = await import("./app.js")
    const { default: connectDB } = await import("./config/db.js")
    const { default: logger } = await import("./config/logger.js")

    await connectDB()

    app.listen(config.port, () => {
      logger.info(`Servidor escuchando en el puerto ${config.port}`)
    })
  } catch (error) {
    console.error(`Error al iniciar el servidor: ${error.message}`)
    process.exit(1)
  }
}

startServer()