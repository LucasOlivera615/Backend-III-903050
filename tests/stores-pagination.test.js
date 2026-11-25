
import { expect } from "chai"
import request from "supertest"
import app from "../src/app.js"
import UserModel from "../src/models/user.model.js"
import StoreModel from "../src/models/store.model.js"

describe("Paginación de tiendas", () => {

    it("Utiliza page=1 y limit=10 por defecto", async () => {
        const response = await request(app).get("/api/stores")

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
                .get(`/api/stores${query}`)

            expect(response.status, query).to.equal(400)
            expect(response.body.status, query).to.equal("error")
            expect(response.body.code, query).to.equal("INVALID_PAGINATION")
        }
    })

    it("Pagina correctamente 12 tiendas sin duplicados", async () => {
        const owner = await UserModel.create({
            firstName: "Propietario",
            lastName: "Test",
            email: "propietario-tiendas@test.com",
            password: "password-de-prueba",
            role: "store"
        })

        const stores = Array.from({ length: 12 }, (_, index) => ({
            name: `Tienda ${index + 1}`,
            address: `Direccion ${index + 1}`,
            owner: owner._id
        }))

        await StoreModel.insertMany(stores)

        const responses = []

        for (const page of [1, 2, 3]) {
            const response = await request(app)
                .get(`/api/stores?page=${page}&limit=5`)

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

        const allStores = responses.flatMap(pagination => pagination.docs)

        const uniqueIds = new Set(allStores.map(store => store._id))

        expect(uniqueIds.size).to.equal(12)

        for (const store of allStores) {
            expect(store).to.have.property("name")
            expect(store).to.have.property("address")
            expect(store.owner).to.equal(owner._id.toString())
        }
    })

    it("Devuelve una lista vacia cuando la pagina supera el total disponible", async () => {
        const owner = await UserModel.create({
            firstName: "Propietario",
            lastName: "Test",
            email: "propietario-pagina-vacia@test.com",
            password: "password-de-prueba",
            role: "store"
        })

        await StoreModel.create({
            name: "Tienda de prueba",
            address: "Direccion de prueba",
            owner: owner._id
        })

        const response = await request(app)
            .get("/api/stores?page=99&limit=5")

        expect(response.status).to.equal(200)
        expect(response.body.status).to.equal("success")

        const pagination = response.body.payload

        expect(pagination.docs).to.be.an("array").that.is.empty
        expect(pagination.totalDocs).to.equal(1)
        expect(pagination.page).to.equal(99)
        expect(pagination.limit).to.equal(5)
        expect(pagination.totalPages).to.equal(1)
        expect(pagination.hasNextPage).to.equal(false)
        expect(pagination.hasPrevPage).to.equal(true)
    })

})
