
import request from "supertest"
import { expect } from "chai"
import app from "../src/app.js"

describe("System - Tests funcionales", function () {
    this.timeout(15000)

    it("Tiene que ejecutar el endpoint de Logger correctamente", async function () {
        const res = await request(app)
            .get("/loggerTest")

        expect(res.status).to.equal(200)
        expect(res.body).to.deep.equal({
            status: "success",
            message: "Logs generados correctamente"
        })
    })

    it("Tiene que mostrar la documentación de Swagger", async function () {
        const res = await request(app)
            .get("/api/docs/")

        expect(res.status).to.equal(200)
        expect(res.headers["content-type"]).to.include("text/html")
        expect(res.text).to.include("Swagger UI")

    })

    it("Tiene que retornar 404 cuando la ruta no existe", async function () {
        const res = await request(app)
            .get("/api/ruta-inexistente-testing")

        expect(res.status).to.equal(404)
        expect(res.body).to.deep.equal({
            status: "error",
            message: "Ruta no encontrada",
            code: "ROUTE_NOT_FOUND"
        })

    })

})