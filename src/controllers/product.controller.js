import { productService } from '../services/product.service.js'

export const getProducts = async (req, res) => {

    try {

        const products = await productService.getProducts(
            req.query.all === 'true'
        )

        res.json(products)

    } catch (error) {

        res.status(500).send('Error del servidor')

    }

}

export const getProductById = async (req, res) => {

    try {

        const product = await productService.getProductById(req.params.id)

        res.json(product)

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message)

    }

}

export const createProduct = async (req, res) => {

    try {

        const product = await productService.createProduct(req.body)
        res.status(201).json(product)

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message)

    }

}

export const updateProduct = async (req, res) => {

    try {

        const product = await productService.updateProduct(
            req.params.id,
            req.body
        )

        res.json(product)

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message)

    }

}

export const deleteProduct = async (req, res) => {

    try {

        await productService.deleteProduct(req.params.id)
        res.json({ message: 'Producto eliminado' })

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message)

    }

}

export const getShippingCost = async (req, res) => {

    try {

        const shipping = await productService.getShippingCost(req.params.id)
        res.json(shipping)

    } catch (error) {

        res.status(error.statusCode || 500).send(error.message)

    }

}