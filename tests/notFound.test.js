import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";

describe("Rutas inexistentes", ()=> {

  it("responde 404 por una ruta no encontrada", async()=> {
    const response = await request(app).get("/api/no-existe");

    expect(response.status).to.equal(404);
    expect(response.body.status).to.equal("error");
    expect(response.body.code).to.equal("ROUTE_NOT_FOUND");
    expect(response.body.message).to.equal("Ruta no encontrada");
  });

});