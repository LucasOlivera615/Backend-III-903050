import UserModel from "../../src/models/user.model.js"
import StoreModel from "../../src/models/store.model.js"

export async function orderFixture() {

  const customer = await UserModel.create({
    firstName: "Ana",
    lastName: "Test",
    email: "customer@test.com",
    password: "testing",
    role: "customer"
  });

  const owner = await UserModel.create({
    firstName: "Leo",
    lastName: "Test",
    email: "owner@test.com",
    password: "testing",
    role: "store"
  });

  const store = await StoreModel.create({
    name: "Tienda de prueba",
    address: "Calle 123",
    owner: owner._id
  });

  return {
    customer: customer._id.toString(),
    store: store._id.toString(),
    deliveryAddress: "Calle falsa 123",
    items: [ { name: "Auriculares", quantity: 2, price: 1500 } ]
  }
}
