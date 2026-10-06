import Product from '../models/product.model.js'

export const productRepository = {

    getAll: () => {
        return Product.find()
    },

    getById: (id) => {
        return Product.findById(id)
    },

    findByCode: (code) => {
        return Product.findOne({ code })
    },

    create: (newProduct) => {
        return Product.create(newProduct)
    },

    update: (id, updates) => {
        return Product.findByIdAndUpdate(id, updates, { new: true })
    },

    delete: (id) => {
        return Product.findByIdAndDelete(id)
    }

}