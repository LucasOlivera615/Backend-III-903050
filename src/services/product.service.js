import { productRepository } from '../repository/product.repository.js'
import { config } from '../config/index.js'
import { PRODUCT_STATUS } from '../utils/constants.js'

export const productService = {

    getProducts: async (showAll) => {

        const products = await productRepository.getAll()

        if (showAll) {

            return products

        }

        return products.filter((product) => {

            return product.stock > 0 && product.status === 'available'

        })

    },

    getProductById: async (id) => {

        const product = await productRepository.getById(id)

        if (!product) {

            const error = new Error('El producto no fue encontrado')
            error.statusCode = 404
            throw error

        }

        return product
    },

    getShippingCost: async (id) => {

        const product = await productRepository.getById(id)

        if (!product) {

            const error = new Error('El producto no fue encontrado')
            error.statusCode = 404
            throw error

        }

        if (!config.shippingApiKey) {

            const error = new Error('Falta API key')
            error.statusCode = 500
            throw error

        }

        const shippingCost = config.isProd
            ? 50 + product.price * 0.01
            : 10

        return {

            product: product._id,
            declaredValue: product.price,
            shippingCost
        }

    },

    createProduct: async (newProduct) => {
        const { title, code, price, stock = 0 } = newProduct

        if (!title || !code || price === undefined) {

            const error = new Error('Faltan campos obligatorios')
            error.statusCode = 400
            throw error

        }

        if (price < 0) {

            const error = new Error('El precio no puede ser menor que 0')
            error.statusCode = 400
            throw error

        }

        const existing = await productRepository.findByCode(code)

        if (existing) {

            const error = new Error('El código del producto ya existe')
            error.statusCode = 400
            throw error

        }

        const status = stock > 0
            ? PRODUCT_STATUS.AVAILABLE
            : PRODUCT_STATUS.OUT_OF_STOCK

        return productRepository.create({
            ...newProduct,
            stock,
            status
        })
    },

    updateProduct: async (id, updates) => {
        if (
            updates.status === 'Out_of_stock' ||
            updates.status === 'OUT_OF_STOCK'
        ) {
            updates.status = PRODUCT_STATUS.OUT_OF_STOCK
        }

        if (updates.stock !== undefined) {
            updates.status = updates.stock > 0
                ? PRODUCT_STATUS.AVAILABLE
                : PRODUCT_STATUS.OUT_OF_STOCK
        }

        const product = await productRepository.update(id, updates)

        if (!product) {

            const error = new Error('El producto no fue encontrado')
            error.statusCode = 404
            throw error

        }

        return product
    },

    deleteProduct: async (id) => {

        const product = await productRepository.delete(id)

        if (!product) {

            const error = new Error('El producto no fue encontrado')
            error.statusCode = 404
            throw error

        }

        return product
    }

}