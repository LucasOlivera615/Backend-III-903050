
import request from "supertest"
import { expect } from "chai"
import mongoose from "mongoose"
import app from "../src/app.js"
import UserModel from "../src/models/user.model.js"
import StoreModel from "../src/models/store.model.js"
import OrderModel from "../src/models/order.model.js"

import {
    connectTestDB,
    disconnectTestDB,
    assertTestDB
} from "./setup.js"

describe("Orders - Tests funcionales", function () {
    this.timeout(15000)

    let customerId
    let ownerId
    let storeId
    let orderId

    const createdOrderIds = []

    before(async function () {
        await connectTestDB()

        assertTestDB()

        const customer = await UserModel.create({
            firstName: "Cliente",
            lastName: "Testing",
            email: `cliente-${new mongoose.Types.ObjectId()}@test.com`,
            password: "test123456",
            role: "customer"
        })

        customerId = customer._id

        const owner = await UserModel.create({
            firstName: "Propietario",
            lastName: "Testing",
            email: `propietario-${new mongoose.Types.ObjectId()}@test.com`,
            password: "test123456",
            role: "store"
        })

        ownerId = owner._id

        const store = await StoreModel.create({
            name: "Comercio de Testing",
            address: "Dirección de prueba 123",
            owner: ownerId
        })

        storeId = store._id

    })

    after(async function () {
        try {
            assertTestDB()

            await OrderModel.deleteMany({
                _id: { $in: createdOrderIds }
            })

            if (storeId) {
                await StoreModel.deleteOne({ _id: storeId })
            }

            const userIds = [customerId, ownerId].filter(Boolean)

            if (userIds.length > 0) {
                await UserModel.deleteMany({
                    _id: { $in: userIds }
                })
            }
        } finally {
            await disconnectTestDB()
        }

    })

    it("Tiene que obtener la lista de pedidos correctamente", async function () {
        const res = await request(app).get("/api/orders")

        expect(res.status).to.equal(200)
        expect(res.body).to.have.property("status", "success")
        expect(res.body).to.have.property("message", "Lista de pedidos")
        expect(res.body.payload).to.be.an("array")

    })

    it("Tiene que crear un pedido correctamente", async function () {
        const orderData = {
            customer: customerId.toString(),
            store: storeId.toString(),
            items: [
                {
                    name: "Producto A",
                    quantity: 2,
                    price: 150
                },
                {
                    name: "Producto B",
                    quantity: 1,
                    price: 200
                }
            ],
            deliveryAddress: "Dirección de entrega 456",
            priority: "high"
        }

        const res = await request(app)
            .post("/api/orders")
            .send(orderData)

        if (res.body.payload?._id) {
            orderId = res.body.payload._id
            createdOrderIds.push(orderId)
        }

        expect(res.status).to.equal(201)
        expect(res.body).to.have.property("status", "success")
        expect(res.body).to.have.property("message", "pedido creado")

        const order = res.body.payload

        expect(order).to.be.an("object")
        expect(order).to.have.property("_id")
        expect(order).to.have.property("total", 500)
        expect(order).to.have.property("status", "created")
        expect(order).to.have.property("priority", "high")
        expect(order.items).to.have.lengthOf(2)

    })


    it("Tiene que obtener un pedido por su ID correctamente", async function () {
        expect(orderId).to.exist

        const res = await request(app).get(`/api/orders/${orderId}`)

        expect(res.status).to.equal(200)
        expect(res.body).to.have.property("status", "success")
        expect(res.body).to.have.property("message", "pedido obtenido")

        const order = res.body.payload

        expect(order).to.be.an("object")
        expect(order).to.have.property("_id", orderId)
        expect(order).to.have.property("total", 500)
        expect(order).to.have.property("status", "created")
        expect(order.customer).to.be.an("object")
        expect(order.customer).to.have.property("_id", customerId.toString())
        expect(order.store).to.be.an("object")
        expect(order.store).to.have.property("_id", storeId.toString())

    })


    it("Tiene que actualizar correctamente el estado de un pedido", async function () {
        expect(orderId).to.exist

        const res = await request(app)
            .put(`/api/orders/${orderId}/status`)
            .send({
                status: "assigned"
            })

        expect(res.status).to.equal(200)
        expect(res.body).to.have.property("status", "success")
        expect(res.body).to.have.property("message", "pedido actualizado")

        const order = res.body.payload

        expect(order).to.be.an("object")
        expect(order).to.have.property("_id", orderId)
        expect(order).to.have.property("status", "assigned")
        expect(order).to.have.property("total", 500)

    })

    it("Tiene que rechazar un estado de pedido inválido", async function () {
        expect(orderId).to.exist

        const res = await request(app)
            .put(`/api/orders/${orderId}/status`)
            .send({
                status: "flying"
            })

        expect(res.status).to.equal(400)
        expect(res.body).to.have.property("status", "error")
        expect(res.body).to.have.property("code", "VALIDATION_ERROR")
        expect(res.body).to.have.property("message").that.is.a("string")

        const order = await OrderModel.findById(orderId)

        expect(order).to.exist
        expect(order.status).to.equal("assigned")

    })

    it("Tiene que retornar 400 al crear un pedido con datos incompletos", async function () {
        const res = await request(app)
            .post("/api/orders")
            .send({
                customer: customerId.toString(),
                items: [
                    {
                        name: "Producto de prueba",
                        quantity: 1,
                        price: 100
                    }
                ]
            })

        expect(res.status).to.equal(400)
        expect(res.body).to.have.property("status", "error")
        expect(res.body).to.have.property("message", "Faltan datos obligatorios")
        expect(res.body).to.have.property("code", "INTERNAL_SERVER_ERROR")

    })

    it("Tiene que retornar 404 cuando el pedido no existe", async function () {
        const nonexistentOrderId = new mongoose.Types.ObjectId().toString()

        const res = await request(app)
            .get(`/api/orders/${nonexistentOrderId}`)

        expect(res.status).to.equal(404)
        expect(res.body).to.have.property("status", "error")
        expect(res.body).to.have.property("message", "Pedido no encontrado")
        expect(res.body).to.have.property("code", "INTERNAL_SERVER_ERROR")

    })

})