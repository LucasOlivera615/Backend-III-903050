
import mongoose from "mongoose"

const TEST_DATABASE = "shipnow_test"


export const connectTestDB = async () => {
    if (process.env.NODE_ENV !== "test") {
        throw new Error("Los tests solo pueden ejecutarse con NODE_ENV=test")
    }

    const mongoUri = process.env.MONGODB_URI

    if (!mongoUri) {
        throw new Error("Falta MONGODB_URI para testing")
    }

    const parsedUri = new URL(mongoUri)

    if (parsedUri.pathname !== `/${TEST_DATABASE}`) {
        throw new Error("La URI no apunta a la base de testing")
    }

    try {
        await mongoose.connect(mongoUri)

        if (mongoose.connection.name !== TEST_DATABASE) {
            throw new Error("La conexión no utiliza la base de testing")
        }

        console.log("Conectado a MongoDB de testing")
    } catch (error) {
        await mongoose.disconnect()
        throw error
    }
}

export const disconnectTestDB = async () => {
    await mongoose.disconnect()
}

export const assertTestDB = () => {
    if (process.env.NODE_ENV !== "test") {
        throw new Error("Operación bloqueada: NODE_ENV no es test")
    }

    if (
        mongoose.connection.readyState !== 1 ||
        mongoose.connection.name !== TEST_DATABASE
    ) {
        throw new Error(
            "Operación bloqueada: no hay conexión activa a shipnow_test"
        )
    }
}
