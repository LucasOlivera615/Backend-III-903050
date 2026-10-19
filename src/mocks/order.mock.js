import { faker } from "@faker-js/faker"
import { ORDER_STATUS, DELIVERY_PRIORITY } from "../utils/constants.js"

export const generateMockOrder = (customerId) => {
    const items = Array.from(
        { length: faker.number.int({ min: 1, max: 3 }) },
        () => ({
            name: faker.commerce.productName(),
            quantity: faker.number.int({ min: 1, max: 5 }),
            price: Number(faker.commerce.price({ min: 10, max: 500, dec: 2 }))
        })
    )

    const declaredValue = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    )

    return {
        customer: customerId,
        items,
        deliveryAddress: faker.location.streetAddress(),
        declaredValue,
        total: declaredValue + 10,
        shippingCost: 10,
        status: faker.helpers.arrayElement(Object.values(ORDER_STATUS)),
        priority: faker.helpers.arrayElement(Object.values(DELIVERY_PRIORITY))
    }
}

export const generateMockOrders = (customerIds) => {
    return customerIds.map((customerId) => generateMockOrder(customerId))
}
