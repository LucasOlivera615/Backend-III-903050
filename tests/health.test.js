import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";

describe("Health API", () => {

  it("responde con el estado de la API", async () => {
    const response = await request(app).get("/health");

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("success");
    expect(response.body.message).to.equal("API funcionando");

    expect(response.body.environment).to.equal("test")

    expect(response.body.uptime).to.be.a("number")
    expect(response.body.uptime).to.be.at.least(0)

    expect(response.body.timestamp).to.be.a("string")
    expect(new Date(response.body.timestamp).toISOString())
      .to.equal(response.body.timestamp)

    expect(response.body).to.have.all.keys(
      "status",
      "message",
      "environment",
      "uptime",
      "timestamp"
    )
  });

});