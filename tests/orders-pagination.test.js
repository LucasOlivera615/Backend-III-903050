import { expect } from "chai"
import request from "supertest"
import app from "../src/app.js"
import OrderModel from "../src/models/order.model.js"
import { orderFixture } from "./helpers/orderFixture.js"

describe("Paginación de pedidos", () => {

    it("Utiliza page=1 y limit=10 por defecto", async () => {
        const response = await request(app).get("/api/orders")

        expect(response.status).to.equal(200)
        expect(response.body.status).to.equal("success")

        const pagination = response.body.payload

        expect(pagination.docs).to.be.an("array").that.is.empty
        expect(pagination.totalDocs).to.equal(0)
        expect(pagination.page).to.equal(1)
        expect(pagination.limit).to.equal(10)
        expect(pagination.totalPages).to.equal(0)
        expect(pagination.hasNextPage).to.equal(false)
        expect(pagination.hasPrevPage).to.equal(false)
    })

    it("Rechaza parámetros de paginación inválidos", async () => {
        const invalidQueries = [
            "?page=0",
            "?page=-1",
            "?page=abc",
            "?page=1.5",
            "?limit=0",
            "?limit=-5",
            "?limit=abc",
            "?limit=101",
            "?limit=2.5"
        ]

        for (const query of invalidQueries) {
            const response = await request(app)
                .get(`/api/orders${query}`)

            expect(response.status, query).to.equal(400)
            expect(response.body.status, query).to.equal("error")
            expect(response.body.code, query).to.equal("INVALID_PAGINATION")
        }
    })

    it("Pagina correctamente 12 pedidos y no expone contraseñas", async () => {
        const body = await orderFixture()

        const orders = Array.from({ length: 12 }, (_, index) => ({
            ...body,
            deliveryAddress: `Direccion de prueba ${index + 1}`,
            total: 3000,
            status: "created"
        }))

        await OrderModel.insertMany(orders)

        const responses = []

        for (const page of [1, 2, 3]) {
            const response = await request(app)
                .get(`/api/orders?page=${page}&limit=5`)

            expect(response.status).to.equal(200)
            expect(response.body.status).to.equal("success")

            responses.push(response.body.payload)
        }

        const [first, second, third] = responses

        expect(first.docs).to.have.lengthOf(5)
        expect(second.docs).to.have.lengthOf(5)
        expect(third.docs).to.have.lengthOf(2)

        for (const pagination of responses) {
            expect(pagination.totalDocs).to.equal(12)
            expect(pagination.totalPages).to.equal(3)
            expect(pagination.limit).to.equal(5)
        }

        expect(first.page).to.equal(1)
        expect(first.hasNextPage).to.equal(true)
        expect(first.hasPrevPage).to.equal(false)

        expect(second.page).to.equal(2)
        expect(second.hasNextPage).to.equal(true)
        expect(second.hasPrevPage).to.equal(true)

        expect(third.page).to.equal(3)
        expect(third.hasNextPage).to.equal(false)
        expect(third.hasPrevPage).to.equal(true)

        const allOrders = responses.flatMap(pagination => pagination.docs)

        const uniqueIds = new Set(allOrders.map(order => order._id))

        expect(uniqueIds.size).to.equal(12)

        for (const order of allOrders) {
            expect(order.customer).to.be.an("object")
            expect(order.customer).to.not.have.property("password")
            expect(order.customer).to.have.property("email")
            expect(order.store).to.be.an("object")
        }
    })

    it("Devuelve una lista vacia cuando la pagina supera el total disponible", async () => {
        const body = await orderFixture()

        const orders = Array.from({ length: 3 }, (_, index) => ({
            ...body,
            deliveryAddress: `Direccion fuera de rango ${index + 1}`,
            total: 3000,
            status: "created"
        }))

        await OrderModel.insertMany(orders)

        const response = await request(app)
            .get("/api/orders?page=99&limit=5")

        expect(response.status).to.equal(200)
        expect(response.body.status).to.equal("success")

        const pagination = response.body.payload

        expect(pagination.docs).to.be.an("array").that.is.empty
        expect(pagination.totalDocs).to.equal(3)
        expect(pagination.totalPages).to.equal(1)
        expect(pagination.page).to.equal(99)
        expect(pagination.limit).to.equal(5)
        expect(pagination.hasNextPage).to.equal(false)
        expect(pagination.hasPrevPage).to.equal(true)
    })

    it("Filtra pedidos por estado y mantiene la paginacion correcta", async () => {
        const body = await orderFixture()

        const orders = Array.from({ length: 12 }, (_, index) => ({
            ...body,
            deliveryAddress: `Direccion filtrada ${index + 1}`,
            total: 3000,
            status: index < 7 ? "created" : "delivered"
        }))

        await OrderModel.insertMany(orders)

        const firstResponse = await request(app)
            .get("/api/orders?status=created&page=1&limit=5")

        const secondResponse = await request(app)
            .get("/api/orders?status=created&page=2&limit=5")

        expect(firstResponse.status).to.equal(200)
        expect(secondResponse.status).to.equal(200)

        const first = firstResponse.body.payload
        const second = secondResponse.body.payload

        expect(first.docs).to.have.lengthOf(5)
        expect(second.docs).to.have.lengthOf(2)

        for (const pagination of [first, second]) {
            expect(pagination.totalDocs).to.equal(7)
            expect(pagination.totalPages).to.equal(2)
            expect(pagination.limit).to.equal(5)

            for (const order of pagination.docs) {
                expect(order.status).to.equal("created")
            }
        }

        expect(first.page).to.equal(1)
        expect(first.hasNextPage).to.equal(true)
        expect(first.hasPrevPage).to.equal(false)

        expect(second.page).to.equal(2)
        expect(second.hasNextPage).to.equal(false)
        expect(second.hasPrevPage).to.equal(true)

        const deliveredResponse = await request(app)
            .get("/api/orders?status=delivered")

        expect(deliveredResponse.status).to.equal(200)
        expect(deliveredResponse.body.payload.docs).to.have.lengthOf(5)
        expect(deliveredResponse.body.payload.totalDocs).to.equal(5)

        for (const order of deliveredResponse.body.payload.docs) {
            expect(order.status).to.equal("delivered")
        }
    })

    it("Rechaza estados de pedido invalidos", async () => {
        const invalidQueries = [
            "?status=invalid",
            "?status=",
            "?status=CREATED",
            "?status=pending"
        ]

        for (const query of invalidQueries) {
            const response = await request(app)
                .get(`/api/orders${query}`)

            expect(response.status, query).to.equal(400)
            expect(response.body.status, query).to.equal("error")
            expect(response.body.code, query).to.equal("INVALID_ORDER_STATUS")
        }
    })

    it("Filtra pedidos por estado y prioridad combinados", async () => {
        const body = await orderFixture()

        const orders = [
            ...Array.from({ length: 7 }, (_, index) => ({
                ...body,
                deliveryAddress: `Creado alta ${index + 1}`,
                total: 3000,
                status: "created",
                priority: "high"
            })),
            ...Array.from({ length: 3 }, (_, index) => ({
                ...body,
                deliveryAddress: `Creado normal ${index + 1}`,
                total: 3000,
                status: "created",
                priority: "normal"
            })),
            ...Array.from({ length: 2 }, (_, index) => ({
                ...body,
                deliveryAddress: `Entregado alta ${index + 1}`,
                total: 3000,
                status: "delivered",
                priority: "high"
            }))
        ]

        await OrderModel.insertMany(orders)

        const responses = []

        for (const page of [1, 2]) {
            const response = await request(app)
                .get(`/api/orders?status=created&priority=high&page=${page}&limit=5`)

            expect(response.status).to.equal(200)
            expect(response.body.status).to.equal("success")

            responses.push(response.body.payload)
        }

        const [first, second] = responses

        expect(first.docs).to.have.lengthOf(5)
        expect(second.docs).to.have.lengthOf(2)

        for (const pagination of responses) {
            expect(pagination.totalDocs).to.equal(7)
            expect(pagination.totalPages).to.equal(2)
            expect(pagination.limit).to.equal(5)

            for (const order of pagination.docs) {
                expect(order.status).to.equal("created")
                expect(order.priority).to.equal("high")
            }
        }

        expect(first.page).to.equal(1)
        expect(first.hasNextPage).to.equal(true)
        expect(first.hasPrevPage).to.equal(false)

        expect(second.page).to.equal(2)
        expect(second.hasNextPage).to.equal(false)
        expect(second.hasPrevPage).to.equal(true)

        const priorityResponse = await request(app)
            .get("/api/orders?priority=high")

        expect(priorityResponse.status).to.equal(200)
        expect(priorityResponse.body.payload.totalDocs).to.equal(9)

        for (const order of priorityResponse.body.payload.docs) {
            expect(order.priority).to.equal("high")
        }
    })

    it("Rechaza prioridades de pedido invalidas", async () => {
        const invalidPriorities = [
            "invalid",
            "",
            "HIGH",
            "urgent"
        ]

        for (const priority of invalidPriorities) {
            const response = await request(app)
                .get("/api/orders")
                .query({ priority })

            expect(response.status).to.equal(400)
            expect(response.body.status).to.equal("error")
            expect(response.body.code).to.equal("INVALID_ORDER_PRIORITY")
            expect(response.body.message).to.equal(
                "Prioridad de pedido invalida"
            )
        }
    })

})
