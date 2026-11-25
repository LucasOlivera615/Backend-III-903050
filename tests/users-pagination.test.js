import { expect } from "chai"
import request from "supertest"
import app from "../src/app.js"
import UserModel from "../src/models/user.model.js"

describe("Paginación de usuarios", () => {

  it("Utiliza page=1 y limit=10 por defecto", async () => {
    const response = await request(app)
      .get("/api/users")

    expect(response.status).to.equal(200)
    expect(response.body.status).to.equal("success")

    const pagination = response.body.payload

    expect(pagination.docs).to.be.an("array")
    expect(pagination.docs).to.have.lengthOf(0)
    expect(pagination.totalDocs).to.equal(0)
    expect(pagination.page).to.equal(1)
    expect(pagination.limit).to.equal(10)
    expect(pagination.totalPages).to.equal(0)
    expect(pagination.hasNextPage).to.equal(false)
    expect(pagination.hasPrevPage).to.equal(false)
  })

  it("Rechaza parametros de paginacion invalidos", async () => {
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
        .get(`/api/users${query}`)

      expect(response.status, `Consulta: ${query}`).to.equal(400)
      expect(response.body.status).to.equal("error")
      expect(response.body.code).to.equal("INVALID_PAGINATION")
    }
  })

  it("Pagina correctamente 12 usuarios y no expone contraseñas", async () => {
    const users = Array.from({ length: 12 }, (_, index) => ({
      firstName: `Usuario${index + 1}`,
      lastName: "Test",
      email: `usuario${index + 1}@test.com`,
      password: "password-de-prueba",
      role: "customer"
    }))

    await UserModel.insertMany(users)

    const firstPage = await request(app)
      .get("/api/users?page=1&limit=5")

    const secondPage = await request(app)
      .get("/api/users?page=2&limit=5")

    const thirdPage = await request(app)
      .get("/api/users?page=3&limit=5")

    for (const response of [firstPage, secondPage, thirdPage]) {
      expect(response.status).to.equal(200)
      expect(response.body.status).to.equal("success")
      expect(response.body.payload.totalDocs).to.equal(12)
      expect(response.body.payload.totalPages).to.equal(3)

      for (const user of response.body.payload.docs) {
        expect(user).to.not.have.property("password")
      }
    }

    expect(firstPage.body.payload.docs).to.have.lengthOf(5)
    expect(firstPage.body.payload.page).to.equal(1)
    expect(firstPage.body.payload.hasNextPage).to.equal(true)
    expect(firstPage.body.payload.hasPrevPage).to.equal(false)

    expect(secondPage.body.payload.docs).to.have.lengthOf(5)
    expect(secondPage.body.payload.page).to.equal(2)
    expect(secondPage.body.payload.hasNextPage).to.equal(true)
    expect(secondPage.body.payload.hasPrevPage).to.equal(true)

    expect(thirdPage.body.payload.docs).to.have.lengthOf(2)
    expect(thirdPage.body.payload.page).to.equal(3)
    expect(thirdPage.body.payload.hasNextPage).to.equal(false)
    expect(thirdPage.body.payload.hasPrevPage).to.equal(true)

    const allIds = [
      ...firstPage.body.payload.docs,
      ...secondPage.body.payload.docs,
      ...thirdPage.body.payload.docs
    ].map(user => user._id)

    expect(new Set(allIds).size).to.equal(12)
  })

  it("Devuelve una lista vacia cuando la pagina supera el total disponible", async () => {
    await UserModel.insertMany(
      Array.from({ length: 3 }, (_, index) => ({
        firstName: `Usuario${index + 1}`,
        lastName: "Test",
        email: `fuera-rango-${index + 1}@test.com`,
        password: "password-de-prueba"
      }))
    )

    const response = await request(app)
      .get("/api/users?page=99&limit=5")

    expect(response.status).to.equal(200)

    const pagination = response.body.payload

    expect(pagination.docs).to.be.an("array").that.is.empty
    expect(pagination.totalDocs).to.equal(3)
    expect(pagination.totalPages).to.equal(1)
    expect(pagination.page).to.equal(99)
    expect(pagination.limit).to.equal(5)
    expect(pagination.hasNextPage).to.equal(false)
    expect(pagination.hasPrevPage).to.equal(true)
  })

})