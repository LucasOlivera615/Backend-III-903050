
import request from "supertest"
import { expect } from "chai"
import app from "../src/app.js"
import { connectTestDB, disconnectTestDB } from "./setup.js"

describe("Users - GET /api/users", function () {
    this.timeout(15000)

    before(async function () {
        await connectTestDB()
    })

    after(async function () {
        await disconnectTestDB()
    })

    it("Tiene que obtener la lista de usuarios correctamente", async function () {
        const res = await request(app).get("/api/users")

        expect(res.status).to.equal(200)
        expect(res.body).to.be.an("object")
        expect(res.body).to.have.property("status", "success")
        expect(res.body).to.have.property("payload")
        expect(res.body.payload).to.be.an("array")
    })

    it("Tiene que retornar 404 cuando el usuario no existe", async function () {
        const userId = "000000000000000000000000"

        const res = await request(app).get(`/api/users/${userId}`)

        expect(res.status).to.equal(404)
        expect(res.body).to.be.an("object")
        expect(res.body).to.have.property("status", "error")
        expect(res.body).to.have.property("code", "USER_NOT_FOUND")
        expect(res.body).to.have.property("message", "Usuario no encontrado")

    })

    it("Tiene que retornar 400 al crear un usuario con datos incompletos", async function () {
        const res = await request(app)
            .post("/api/users")
            .send({
                firstName: "Usuario",
                email: "usuario-test@example.com"
            })

        expect(res.status).to.equal(400)
        expect(res.body).to.be.an("object")
        expect(res.body).to.have.property("status", "error")
        expect(res.body).to.have.property("code", "VALIDATION_ERROR")
        expect(res.body).to.have.property("message", "Faltan datos obligatorios")

    })

})