
import request from "supertest"
import { expect } from "chai"
import app from "../src/app.js"
import UserModel from "../src/models/user.model.js"
import StoreModel from "../src/models/store.model.js"
import OrderModel from "../src/models/order.model.js"
import { userRepository } from "../src/repository/user.repository.js"
import { storeRepository } from "../src/repository/store.repository.js"
import { orderRepository } from "../src/repository/order.repository.js"
import { connectTestDB, disconnectTestDB, assertTestDB } from "./setup.js"

describe("Mocks - Tests funcionales", function () {
    this.timeout(15000)

    it("Tiene que generar usuarios simulados correctamente", async function () {
        const res = await request(app)
            .get("/api/mocks/mockingusers")
            .query({ qty: 5 })

        expect(res.status).to.equal(200)
        expect(res.body).to.have.property("status", "success")
        expect(res.body.payload).to.be.an("array")
        expect(res.body.payload).to.have.lengthOf(5)

    })

    it("Tiene que generar pedidos simulados correctamente", async function () {
        const res = await request(app)
            .get("/api/mocks/mockingorders")
            .query({ qty: 5 })

        expect(res.status).to.equal(200)
        expect(res.body).to.have.property("status", "success")
        expect(res.body.payload).to.be.an("array")
        expect(res.body.payload).to.have.lengthOf(5)

    })

    it("Tiene que retornar 400 cuando qty es inválido", async function () {
        const res = await request(app)
            .get("/api/mocks/mockingusers")
            .query({ qty: 401 })

        expect(res.status).to.equal(400)
        expect(res.body).to.have.property("status", "error")
        expect(res.body).to.have.property(
            "message",
            "qty debe ser un entero entre 0 y 400"
        )
        expect(res.body).to.have.property(
            "code",
            "INTERNAL_SERVER_ERROR"
        )

    })

    it("Tiene que ejecutar generateData correctamente sin insertar registros", async function () {
        const res = await request(app)
            .post("/api/mocks/generateData")
            .send({
                users: 0,
                stores: 0,
                orders: 0
            })

        expect(res.status).to.equal(201)
        expect(res.body).to.have.property("status", "success")

        expect(res.body.payload).to.deep.equal({
            users: 0,
            stores: 0,
            orders: 0
        })

    })


    it("Tiene que retornar 400 al generar pedidos sin usuarios ni comercios", async function () {
        const res = await request(app)
            .post("/api/mocks/generateData")
            .send({
                users: 0,
                stores: 0,
                orders: 3
            })

        expect(res.status).to.equal(400)
        expect(res.body).to.have.property("status", "error")
        expect(res.body).to.have.property(
            "message",
            "Para generar pedidos se necesita al menos un customer y un store"
        )
        expect(res.body).to.have.property(
            "code",
            "INTERNAL_SERVER_ERROR"
        )

    })


    it("Tiene que generar y guardar usuarios, comercios y pedidos en MongoDB", async function () {

        const createdUserIds = []
        const createdStoreIds = []
        const createdOrderIds = []
        const originalUserInsertMany = userRepository.insertMany
        const originalStoreInsertMany = storeRepository.insertMany
        const originalOrderInsertMany = orderRepository.insertMany

        let connected = false

        try {

            await connectTestDB()
            connected = true
            assertTestDB()

            userRepository.insertMany = async (users) => {
                createdUserIds.push(...users.map(user => user._id))
                return originalUserInsertMany(users)
            }

            storeRepository.insertMany = async (stores) => {
                createdStoreIds.push(...stores.map(store => store._id))
                return originalStoreInsertMany(stores)
            }

            orderRepository.insertMany = async (orders) => {
                createdOrderIds.push(...orders.map(order => order._id))
                return originalOrderInsertMany(orders)
            }

            const res = await request(app)
                .post("/api/mocks/generateData")
                .send({
                    users: 2,
                    stores: 1,
                    orders: 2
                })

            expect(res.status).to.equal(201)
            expect(res.body).to.have.property("status", "success")
            expect(res.body.payload).to.deep.equal({
                users: 3,
                stores: 1,
                orders: 2
            })

            expect(createdUserIds).to.have.lengthOf(3)
            expect(createdStoreIds).to.have.lengthOf(1)
            expect(createdOrderIds).to.have.lengthOf(2)

            const savedUsers = await UserModel.find({
                _id: { $in: createdUserIds }
            })

            const savedStores = await StoreModel.find({
                _id: { $in: createdStoreIds }
            })

            const savedOrders = await OrderModel.find({
                _id: { $in: createdOrderIds }
            })

            expect(savedUsers).to.have.lengthOf(3)
            expect(savedStores).to.have.lengthOf(1)
            expect(savedOrders).to.have.lengthOf(2)

        } finally {

            userRepository.insertMany = originalUserInsertMany
            storeRepository.insertMany = originalStoreInsertMany
            orderRepository.insertMany = originalOrderInsertMany

            if (connected) {
                try {
                    assertTestDB()

                    await OrderModel.deleteMany({
                        _id: { $in: createdOrderIds }
                    })

                    await StoreModel.deleteMany({
                        _id: { $in: createdStoreIds }
                    })

                    await UserModel.deleteMany({
                        _id: { $in: createdUserIds }
                    })
                } finally {
                    await disconnectTestDB()
                }
            }
        }

    })

})