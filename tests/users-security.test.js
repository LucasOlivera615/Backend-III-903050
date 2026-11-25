import { expect } from "chai"
import request from "supertest"
import bcrypt from "bcryptjs"
import app from "../src/app.js"
import UserModel from "../src/models/user.model.js"
import { orderFixture } from "./helpers/orderFixture.js"

const createUserData = () => ({
    firstName: "Usuario",
    lastName: "Seguridad",
    email: "seguridad@test.com",
    password: "password-de-prueba",
    role: "customer"
})

describe("Seguridad de usuarios", () => {

    it("Almacena la contraseña hasheada al crear un usuario", async () => {
        const userData = createUserData()

        const response = await request(app)
            .post("/api/users")
            .send(userData)

        expect(response.status).to.equal(201)
        expect(response.body.status).to.equal("success")

        const userId = response.body.payload._id

        const storedUser = await UserModel
            .findById(userId)
            .select("+password")

        expect(storedUser).to.not.equal(null)
        expect(storedUser.password).to.be.a("string")
        expect(storedUser.password).to.not.equal(userData.password)

        expect(
            await bcrypt.compare(userData.password, storedUser.password)
        ).to.equal(true)

        expect(
            bcrypt.getRounds(storedUser.password)
        ).to.equal(10)
    })

    it("No expone la contraseña al crear un usuario", async () => {
        const response = await request(app)
            .post("/api/users")
            .send(createUserData())

        expect(response.status).to.equal(201)
        expect(response.body.status).to.equal("success")
        expect(response.body.payload).to.not.have.property("password")
        expect(response.body.payload._id).to.be.a("string")
        expect(response.body.payload.email).to.equal("seguridad@test.com")
    })

    it("No expone la contraseña al consultar un usuario individual", async () => {
        const user = await UserModel.create(createUserData())

        const response = await request(app)
            .get(`/api/users/${user._id}`)

        expect(response.status).to.equal(200)
        expect(response.body.status).to.equal("success")
        expect(response.body.payload).to.not.have.property("password")
        expect(response.body.payload._id).to.equal(user._id.toString())
        expect(response.body.payload.email).to.equal(user.email)
    })

    it("Genera un nuevo hash al actualizar la contraseña", async () => {
        const userData = createUserData()
        const user = await UserModel.create(userData)

        const originalUser = await UserModel
            .findById(user._id)
            .select("+password")

        const originalHash = originalUser.password
        const newPassword = "nueva-password-de-prueba"

        const response = await request(app)
            .put(`/api/users/${user._id}`)
            .send({ password: newPassword })

        expect(response.status).to.equal(200)
        expect(response.body.status).to.equal("success")
        expect(response.body.payload).to.not.have.property("password")

        const updatedUser = await UserModel
            .findById(user._id)
            .select("+password")

        expect(updatedUser.password).to.be.a("string")
        expect(updatedUser.password).to.not.equal(originalHash)
        expect(updatedUser.password).to.not.equal(newPassword)

        expect(
            await bcrypt.compare(newPassword, updatedUser.password)
        ).to.equal(true)

        expect(
            await bcrypt.compare(userData.password, updatedUser.password)
        ).to.equal(false)

        expect(
            bcrypt.getRounds(updatedUser.password)
        ).to.equal(10)
    })

    it("Conserva el hash al actualizar otros campos del usuario", async () => {
        const userData = createUserData()
        const user = await UserModel.create(userData)

        const originalUser = await UserModel
            .findById(user._id)
            .select("+password")

        const originalHash = originalUser.password

        const response = await request(app)
            .put(`/api/users/${user._id}`)
            .send({ firstName: "Nombre actualizado" })

        expect(response.status).to.equal(200)
        expect(response.body.status).to.equal("success")
        expect(response.body.payload.firstName).to.equal("Nombre actualizado")
        expect(response.body.payload).to.not.have.property("password")

        const updatedUser = await UserModel
            .findById(user._id)
            .select("+password")

        expect(updatedUser.firstName).to.equal("Nombre actualizado")
        expect(updatedUser.password).to.equal(originalHash)

        expect(
            await bcrypt.compare(userData.password, updatedUser.password)
        ).to.equal(true)
    })

    it("No expone la contraseña al eliminar un usuario", async () => {
        const user = await UserModel.create(createUserData())

        const response = await request(app)
            .delete(`/api/users/${user._id}`)

        expect(response.status).to.equal(200)
        expect(response.body.status).to.equal("success")
        expect(response.body.payload).to.not.have.property("password")
        expect(response.body.payload._id).to.equal(user._id.toString())

        const deletedUser = await UserModel.findById(user._id)

        expect(deletedUser).to.equal(null)
    })

    it("Rechaza contraseñas invalidas al crear un usuario", async () => {
        const invalidPasswords = [
            undefined,
            null,
            "",
            123456,
            true,
            [],
            {},
            "a".repeat(73),
            "á".repeat(37)
        ]

        for (const password of invalidPasswords) {
            const response = await request(app)
                .post("/api/users")
                .send({
                    ...createUserData(),
                    password
                })

            expect(
                response.status,
                `Contraseña: ${JSON.stringify(password)}`
            ).to.equal(400)

            expect(response.body.status).to.equal("error")
            expect(response.body.code).to.equal("VALIDATION_ERROR")
        }

        expect(await UserModel.countDocuments()).to.equal(0)
    })

    it("Rechaza contraseñas invalidas al actualizar un usuario", async () => {
        const user = await UserModel.create(createUserData())

        const originalUser = await UserModel
            .findById(user._id)
            .select("+password")

        const originalHash = originalUser.password

        const invalidPasswords = [
            null,
            "",
            123456,
            true,
            [],
            {},
            "a".repeat(73),
            "á".repeat(37)
        ]

        for (const password of invalidPasswords) {
            const response = await request(app)
                .put(`/api/users/${user._id}`)
                .send({ password })

            expect(
                response.status,
                `Contraseña: ${JSON.stringify(password)}`
            ).to.equal(400)

            expect(response.body.status).to.equal("error")
            expect(response.body.code).to.equal("VALIDATION_ERROR")

            const storedUser = await UserModel
                .findById(user._id)
                .select("+password")

            expect(storedUser.password).to.equal(originalHash)
        }
    })

    it("Acepta contraseñas de exactamente 72 bytes", async () => {
        const originalPassword = "a".repeat(72)
        const newPassword = "á".repeat(36)

        expect(Buffer.byteLength(originalPassword, "utf8")).to.equal(72)
        expect(Buffer.byteLength(newPassword, "utf8")).to.equal(72)

        const createResponse = await request(app)
            .post("/api/users")
            .send({
                ...createUserData(),
                password: originalPassword
            })

        expect(createResponse.status).to.equal(201)
        expect(createResponse.body.status).to.equal("success")
        expect(createResponse.body.payload).to.not.have.property("password")

        const userId = createResponse.body.payload._id

        const originalUser = await UserModel
            .findById(userId)
            .select("+password")

        expect(
            await bcrypt.compare(originalPassword, originalUser.password)
        ).to.equal(true)

        const updateResponse = await request(app)
            .put(`/api/users/${userId}`)
            .send({ password: newPassword })

        expect(updateResponse.status).to.equal(200)
        expect(updateResponse.body.status).to.equal("success")
        expect(updateResponse.body.payload).to.not.have.property("password")

        const updatedUser = await UserModel
            .findById(userId)
            .select("+password")

        expect(
            await bcrypt.compare(newPassword, updatedUser.password)
        ).to.equal(true)

        expect(updatedUser.password).to.not.equal(originalUser.password)
    })

    it("Rechaza operadores de MongoDB en la actualizacion de usuarios", async () => {
        const user = await UserModel.create(createUserData())

        const originalUser = await UserModel
            .findById(user._id)
            .select("+password")

        const invalidUpdates = [
            { $set: { password: "password-no-autorizada" } },
            { $unset: { password: "" } },
            { $rename: { password: "exposedPassword" } },
            { $inc: { password: 1 } },
            { firstName: "Nombre modificado", $unset: { password: "" } },
            { exposedPassword: "campo-no-permitido" }
        ]

        for (const update of invalidUpdates) {
            const response = await request(app)
                .put(`/api/users/${user._id}`)
                .send(update)

            expect(
                response.status,
                `Actualizacion: ${JSON.stringify(update)}`
            ).to.equal(400)

            expect(response.body.status).to.equal("error")
            expect(response.body.code).to.equal("VALIDATION_ERROR")

            const storedUser = await UserModel
                .findById(user._id)
                .select("+password")
                .lean()

            expect(storedUser.password).to.equal(originalUser.password)
            expect(storedUser.firstName).to.equal(originalUser.firstName)
            expect(storedUser).to.not.have.property("exposedPassword")
        }
    })

    it("Almacena contraseñas hasheadas durante inserciones masivas", async () => {
        const originalPassword = "password-masiva-de-prueba"

        const users = Array.from({ length: 3 }, (_, index) => ({
            ...createUserData(),
            firstName: `Usuario${index + 1}`,
            email: `masivo${index + 1}@test.com`,
            password: originalPassword
        }))

        const createdUsers = await UserModel.insertMany(users)

        expect(createdUsers).to.have.lengthOf(3)

        const storedUsers = await UserModel
            .find()
            .select("+password")

        expect(storedUsers).to.have.lengthOf(3)

        for (const user of storedUsers) {
            expect(user.password).to.be.a("string")
            expect(user.password).to.not.equal(originalPassword)

            expect(
                await bcrypt.compare(originalPassword, user.password)
            ).to.equal(true)

            expect(
                bcrypt.getRounds(user.password)
            ).to.equal(10)
        }

        const hashes = storedUsers.map(user => user.password)

        expect(new Set(hashes).size).to.equal(3)
    })

    it("Rechaza inserciones masivas con contraseñas invalidas", async () => {
        const invalidPasswords = [
            undefined,
            null,
            "",
            123456,
            true,
            [],
            {},
            "a".repeat(73),
            "á".repeat(37)
        ]

        for (const password of invalidPasswords) {
            const users = [
                {
                    ...createUserData(),
                    email: "masivo-valido@test.com"
                },
                {
                    ...createUserData(),
                    email: "masivo-invalido@test.com",
                    password
                }
            ]

            let receivedError

            try {
                await UserModel.insertMany(users)
            } catch (error) {
                receivedError = error
            }

            expect(
                receivedError,
                `Contraseña: ${JSON.stringify(password)}`
            ).to.be.instanceOf(Error)

            expect(receivedError.code).to.equal("VALIDATION_ERROR")
            expect(receivedError.statusCode).to.equal(400)

            expect(await UserModel.countDocuments()).to.equal(0)
        }
    })

    it("No expone datos sensibles del cliente al consultar un pedido individual", async () => {
        const orderData = await orderFixture()

        const createResponse = await request(app)
            .post("/api/orders")
            .send(orderData)

        expect(createResponse.status).to.equal(201)
        expect(createResponse.body.status).to.equal("success")

        const orderId = createResponse.body.payload._id

        const response = await request(app)
            .get(`/api/orders/${orderId}`)

        expect(response.status).to.equal(200)
        expect(response.body.status).to.equal("success")
        expect(response.body.payload._id).to.equal(orderId)

        const customer = response.body.payload.customer

        expect(customer).to.be.an("object")

        expect(customer).to.have.all.keys(
            "_id",
            "firstName",
            "lastName",
            "email",
            "role"
        )

        expect(customer._id).to.equal(orderData.customer)
        expect(customer.firstName).to.equal("Ana")
        expect(customer.lastName).to.equal("Test")
        expect(customer.email).to.equal("customer@test.com")
        expect(customer.role).to.equal("customer")

        expect(customer).to.not.have.property("password")
        expect(customer).to.not.have.property("documents")
        expect(customer).to.not.have.property("createdAt")
        expect(customer).to.not.have.property("updatedAt")

        const storedCustomer = await UserModel
            .findById(orderData.customer)
            .select("+password")

        expect(storedCustomer).to.not.equal(null)

        expect(
            await bcrypt.compare("testing", storedCustomer.password)
        ).to.equal(true)
    })

})
