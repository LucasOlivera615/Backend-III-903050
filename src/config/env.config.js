import dotenv from 'dotenv'

dotenv.config()

const requiredEnvVariables = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'SHIPPING_API_KEY'
]

for (const variable of requiredEnvVariables) {
    if (!process.env[variable]) {
        throw new Error(`La variable de entorno ${variable} tiene que estar definida.`)
    }
}

export const config = {
    port: process.env.PORT,
    nodeEnv: process.env.NODE_ENV,
    isProd: process.env.NODE_ENV === 'production',
    mongoDbUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    shippingApiKey: process.env.SHIPPING_API_KEY
}