import { Router } from 'express'
import { getProducts, getProductById, getShippingCost, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller.js'

const router = Router()

router.get('/', getProducts)

router.get('/:id/shipping-cost', getShippingCost)

router.get('/:id', getProductById)

router.post('/', createProduct)

router.put('/:id', updateProduct)

router.delete('/:id', deleteProduct)

export default router