import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import bcrypt from "bcryptjs"
import UserModel from "../src/models/user.model.js"

describe("Mocks API", () => {

  it("genera tres usuarios sin guardarlos en la base", async () => {
    const response = await request(app)
      .get("/api/mocks/mockingusers?qty=3");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.be.an("array");
    expect(response.body.payload).to.have.lengthOf(3);

    for (const user of response.body.payload) {
      expect(user._id).to.be.a("string");
      expect(user.email).to.be.a("string");
      expect(user.role).to.equal("customer");
      expect(user).to.not.have.property("password")
    }

    const users = await request(app).get("/api/users")

    expect(users.status).to.equal(200)
    expect(users.body.status).to.equal("success")
    expect(users.body.payload.docs).to.be.an("array").that.is.empty
    expect(users.body.payload.totalDocs).to.equal(0)
    expect(users.body.payload.page).to.equal(1)
    expect(users.body.payload.limit).to.equal(10)
  });

  it("Almacena contraseñas hasheadas al generar datos mock", async () => {
    const response = await request(app)
      .post("/api/mocks/generateData")
      .send({
        users: 3,
        stores: 2,
        orders: 0
      })

    expect(response.status).to.equal(201)
    expect(response.body.status).to.equal("success")

    expect(response.body.payload).to.deep.equal({
      users: 5,
      stores: 2,
      orders: 0
    })

    const storedUsers = await UserModel
      .find()
      .select("+password")

    expect(storedUsers).to.have.lengthOf(5)

    const customers = storedUsers.filter(
      user => user.role === "customer"
    )

    const storeOwners = storedUsers.filter(
      user => user.role === "store"
    )

    expect(customers).to.have.lengthOf(3)
    expect(storeOwners).to.have.lengthOf(2)

    for (const user of storedUsers) {
      expect(user.password).to.be.a("string")
      expect(user.password).to.not.equal("coder123")

      expect(
        await bcrypt.compare("coder123", user.password)
      ).to.equal(true)

      expect(
        bcrypt.getRounds(user.password)
      ).to.equal(10)
    }

    const hashes = storedUsers.map(user => user.password)

    expect(new Set(hashes).size).to.equal(5)
  })

});
