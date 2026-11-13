import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";

describe("Mocks API", () => {

  it("genera tres usuarios sin guardarlos en la base", async() => {
    const response = await request(app)
      .get("/api/mocks/mockingusers?qty=3");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.be.an("array");
    expect(response.body.payload).to.have.lengthOf(3);

    for(const user of response.body.payload){
      expect(user._id).to.be.a("string");
      expect(user.email).to.be.a("string");
      expect(user.role).to.equal("customer");
    }

    const users = await request(app).get("/api/users");
    expect(users.status).to.equal(200);
    expect(users.body.payload).to.deep.equal([]);
  });

});
