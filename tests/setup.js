import "./env.js"
import { config } from "../src/config/index.js"
import mongoose from "mongoose"
import UserModel from "../src/models/user.model.js"
import StoreModel from "../src/models/store.model.js"
import OrderModel from "../src/models/order.model.js"
import fs from "node:fs/promises"
import { randomUUID } from "node:crypto"

const BASE_DATABASE = "shipnow-903050_test"
const RUN_DATABASE = `shipnow_test_${randomUUID().slice(0, 8)}`

function validateTestEnvironment() {
  if (config.nodeEnv !== "test" || !config.mongoDbUri) {
    throw new Error("Testing bloqueado: entorno o URI incorrectos")
  }

  let databaseName

  try {
    databaseName = new URL(config.mongoDbUri).pathname.slice(1)
  } catch {
    throw new Error("Testing bloqueado: URI de MongoDB inválida")
  }

  if (databaseName !== BASE_DATABASE) {
    throw new Error("Testing bloqueado: base de referencia incorrecta")
  }
}

function validateConnection() {
  if (
    config.nodeEnv !== "test" ||
    mongoose.connection.name !== RUN_DATABASE
  ) {
    throw new Error("Operación bloqueada: conexión de testing incorrecta")
  }
}

async function clean() {
  validateConnection()

  await OrderModel.deleteMany({})
  await StoreModel.deleteMany({})
  await UserModel.deleteMany({})
}

export const mochaHooks = {
  async beforeAll() {
    validateTestEnvironment()

    await mongoose.connect(config.mongoDbUri, {
      dbName: RUN_DATABASE,
      serverSelectionTimeoutMS: 5000
    })

    validateConnection()
    await UserModel.init()
  },

  async beforeEach() {
    await clean()

    for (const folder of [
      "uploads/test/documents",
      "uploads/test/proofs"
    ]) {
      await fs.rm(folder, {
        recursive: true,
        force: true
      })

      await fs.mkdir(folder, {
        recursive: true
      })
    }
  },


  async afterAll() {
    try {
      if (mongoose.connection.readyState === 1) {
        validateConnection()
        await mongoose.connection.dropDatabase()
      }
    } finally {
      await mongoose.disconnect()

      if (config.nodeEnv === "test") {
        await fs.rm("uploads/test", {
          recursive: true,
          force: true
        })
      }
    }
  }

}
