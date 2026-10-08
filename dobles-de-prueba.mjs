// correr desde la raíz del proyecto: node docs-clase/demo/ejemplos/dobles-de-prueba.mjs
// no necesita Mongo levantado, solo el .env
import { userRepository } from '/src/repository/user.repository.js';
import { orderRepository } from '/src/repository/order.repository.js';
import { orderService } from '/src/services/order.service.js';

// 1. FIXTURES: datos fijos, sabemos de antemano el resultado (2 x 1500 + 10 de envío = 3010)
const customerFixture = {
  _id: 'cliente-1',
  firstName: 'Lucía',
  lastName: 'Gómez',
  role: 'customer'
};

const orderFixture = {
  customer: 'cliente-1',
  items: [{ name: 'Caja', quantity: 2, price: 1500 }],
  deliveryAddress: 'Av. Siempre Viva 742'
};

const orderFixtureWithoutItems = {
  customer: 'cliente-1',
  //items: [{ name: 'Caja', quantity: 2, price: 1500 }],
  deliveryAddress: 'Av. Siempre Viva 742'
};

// 2. STUB: getById contesta con la fixture en vez de ir a Mongo -- simulamos llamadas a apis externas u otros sevicios y podemos controlar la respuesta
userRepository.getById = async () => customerFixture;

// paypal => 
 const createOrder = async() => {
  try {
    //llamada a api real de paypal
    // const paypalResponse = await paypalApiCall()
    const paypalResponse = await paypalApiCallStub()

    //con el resultado queremos insertar en db
    //mongo insert

    //envio de email
  } catch (error) {
    return {
      payment: "Error",
      message: "porque fallo el error"
    }
  }
 } 
//las respuestas de los stubs deberian ser consistentes con su contraparte real
 const paypalApiCall = async()=>{
  //fetch a paypal
  return  {
        payment_id: "abc-123",
        amount: 200,
        currency: "USD"
      }
 }
 const paypalApiCallStub = async() =>{
  return  {
        payment_id: "abc-123",
        amount: 200,
        currency: "USD"
      }
 }
 const paypalApiCallStubError = async() =>{
  throw new Error("paypalError")
 }



// 3. MOCK: create contesta y además anota con qué lo llamaron
const createCalls = [];
orderRepository.create = async (data) => {
  createCalls.push(data);
  return data;
};

// 4. CASO 1: el cliente existe
console.log('--- Caso 1: el cliente existe ---');
const order = await orderService.createOrder(orderFixture);
console.log('total:', order.total);
console.log('veces que se guardó:', createCalls.length);
console.log('cliente guardado:', createCalls[0].customer);


// 5. CASO 2: el stub ahora dice que el cliente no existe
console.log('--- Caso 2: el cliente no existe ---');
userRepository.getById = async () => null;

try {
  await orderService.createOrder(orderFixture);
} catch (error) {
  console.log('error:', error.statusCode, error.message);
}
console.log('veces que se guardó:', createCalls.length);


// 6. CASO : orders sin items
console.log('--- Caso 3: El pedido debe tener al menos un item ---');
userRepository.getById = async () => customerFixture;

try {
  await orderService.createOrder(orderFixtureWithoutItems);
} catch (error) {
  console.log('error:', error.statusCode, error.message);
}
console.log('veces que se guardó:', createCalls.length);