import { expect } from "chai"
import request from "supertest"
import fs from "node:fs"
import app from "../src/app.js"
import OrderModel from "../src/models/order.model.js"
import { orderFixture } from "./helpers/orderFixture.js"

describe("Comprobantes de pedidos", () => {

    it("Guarda el PDF y sus metadatos", async () => {
        const body = await orderFixture()

        const order = await OrderModel.create({
            ...body,
            total: 3000
        })

        const response = await request(app)
            .post(`/api/orders/${order._id}/proof`)
            .attach("proof", "tests/helpers/document.pdf")

        expect(response.status).to.equal(201)
        expect(response.body.status).to.equal("success")

        const proof = response.body.payload.proof

        expect(proof).to.not.equal(null)
        expect(proof.mimeType).to.equal("application/pdf")
        expect(proof.type).to.equal("order_proof")
        expect(proof.fileName).to.match(/\.pdf$/)
        expect(fs.existsSync(proof.path)).to.equal(true)

        const saved = await OrderModel.findById(order._id)

        expect(saved.proof.fileName).to.equal(proof.fileName)
    })

    it("Rechaza una carga sin archivo", async () => {
        const body = await orderFixture()

        const order = await OrderModel.create({
            ...body,
            total: 3000
        })

        const response = await request(app)
            .post(`/api/orders/${order._id}/proof`)

        expect(response.status).to.equal(400)
        expect(response.body.status).to.equal("error")
        expect(response.body.code).to.equal("FILE_REQUIRED")
        expect(response.body.message).to.equal("Debes adjuntar un archivo")

        const saved = await OrderModel.findById(order._id)

        expect(saved.proof).to.equal(null)
    })

    it("Rechaza un comprobante para un pedido inexistente", async () => {
        const nonexistentId = "507f1f77bcf86cd799439011"

        const response = await request(app)
            .post(`/api/orders/${nonexistentId}/proof`)
            .attach("proof", "tests/helpers/document.pdf")

        expect(response.status).to.equal(404)
        expect(response.body.status).to.equal("error")
        expect(response.body.code).to.equal("ORDER_NOT_FOUND")

        const files = fs.readdirSync("uploads/test/proofs")

        expect(files).to.have.lengthOf(0)
    })

    it("Rechaza archivos que no sean PDF", async () => {
        const body = await orderFixture()

        const order = await OrderModel.create({
            ...body,
            total: 3000
        })

        const response = await request(app)
            .post(`/api/orders/${order._id}/proof`)
            .attach("proof", Buffer.from("Esto no es un PDF"), {
                filename: "documento.txt",
                contentType: "text/plain"
            })

        expect(response.status).to.equal(400)
        expect(response.body.status).to.equal("error")
        expect(response.body.code).to.equal("INVALID_FILE_TYPE")

        const saved = await OrderModel.findById(order._id)

        expect(saved.proof).to.equal(null)

        const files = fs.readdirSync("uploads/test/proofs")

        expect(files).to.have.lengthOf(0)
    })

    it("Rechaza archivos PDF mayores a 5 MB", async () => {
        const body = await orderFixture()

        const order = await OrderModel.create({
            ...body,
            total: 3000
        })

        const oversizedFile = Buffer.alloc(5 * 1024 * 1024 + 1)

        const response = await request(app)
            .post(`/api/orders/${order._id}/proof`)
            .attach("proof", oversizedFile, {
                filename: "comprobante.pdf",
                contentType: "application/pdf"
            })

        expect(response.status).to.equal(413)
        expect(response.body.status).to.equal("error")
        expect(response.body.code).to.equal("FILE_TOO_LARGE")

        const saved = await OrderModel.findById(order._id)

        expect(saved.proof).to.equal(null)

        const files = fs.readdirSync("uploads/test/proofs")

        expect(files).to.have.lengthOf(0)
    })

    it("Rechaza un campo de archivo incorrecto", async () => {
        const body = await orderFixture()

        const order = await OrderModel.create({
            ...body,
            total: 3000
        })

        const response = await request(app)
            .post(`/api/orders/${order._id}/proof`)
            .attach("document", "tests/helpers/document.pdf")

        expect(response.status).to.equal(400)
        expect(response.body.status).to.equal("error")
        expect(response.body.code).to.equal("INVALID_UPLOAD")

        const saved = await OrderModel.findById(order._id)

        expect(saved.proof).to.equal(null)

        const files = fs.readdirSync("uploads/test/proofs")

        expect(files).to.have.lengthOf(0)
    })

    it("Rechaza un segundo comprobante para el mismo pedido", async () => {
        const body = await orderFixture()

        const order = await OrderModel.create({
            ...body,
            total: 3000
        })

        const endpoint = `/api/orders/${order._id}/proof`

        const firstResponse = await request(app)
            .post(endpoint)
            .attach("proof", "tests/helpers/document.pdf")

        expect(firstResponse.status).to.equal(201)

        const secondResponse = await request(app)
            .post(endpoint)
            .attach("proof", "tests/helpers/document.pdf")

        expect(secondResponse.status).to.equal(400)
        expect(secondResponse.body.status).to.equal("error")
        expect(secondResponse.body.code).to.equal("INVALID_UPLOAD")

        const saved = await OrderModel.findById(order._id)

        expect(saved.proof.fileName).to.equal(
            firstResponse.body.payload.proof.fileName
        )

        const files = fs.readdirSync("uploads/test/proofs")

        expect(files).to.have.lengthOf(1)
    })

    it("Permite solo un comprobante ante cargas simultaneas", async () => {
        const body = await orderFixture()

        const order = await OrderModel.create({
            ...body,
            total: 3000
        })

        const endpoint = `/api/orders/${order._id}/proof`

        const [firstResponse, secondResponse] = await Promise.all([
            request(app)
                .post(endpoint)
                .attach("proof", "tests/helpers/document.pdf"),
            request(app)
                .post(endpoint)
                .attach("proof", "tests/helpers/document.pdf")
        ])

        const statuses = [
            firstResponse.status,
            secondResponse.status
        ].sort()

        expect(statuses).to.deep.equal([201, 400])

        const successfulResponse =
            firstResponse.status === 201 ? firstResponse : secondResponse

        const rejectedResponse =
            firstResponse.status === 400 ? firstResponse : secondResponse

        expect(rejectedResponse.body.code).to.equal("INVALID_UPLOAD")

        const saved = await OrderModel.findById(order._id)

        expect(saved.proof.fileName).to.equal(
            successfulResponse.body.payload.proof.fileName
        )

        const files = fs.readdirSync("uploads/test/proofs")

        expect(files).to.have.lengthOf(1)
        expect(files[0]).to.equal(saved.proof.fileName)
    })

})
