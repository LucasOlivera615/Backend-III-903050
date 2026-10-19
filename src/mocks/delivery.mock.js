import { faker } from "@faker-js/faker"
import { DELIVERY_STATUS, DELIVERY_PRIORITY } from "../utils/constants.js"


export const generateMockDelivery = (orderId, driverId = null) => {
    const status = driverId
        ? faker.helpers.arrayElement(
            Object.values(DELIVERY_STATUS).filter(
                (value) => value !== DELIVERY_STATUS.PENDING
            )
        )
        : DELIVERY_STATUS.PENDING

    const assignedAt = driverId ? new Date() : null

    const deliveredAt =
        status === DELIVERY_STATUS.DELIVERED
            ? new Date()
            : null

    return {
        order: orderId,
        driver: driverId,
        status,
        priority: faker.helpers.arrayElement(
            Object.values(DELIVERY_PRIORITY)
        ),
        assignedAt,
        deliveredAt
    }
}


export const generateMockDeliveries = (orderIds, driverIds = []) => {
    return orderIds.map((orderId) => {
        const hasDriver =
            driverIds.length > 0 && Math.random() >= 0.3

        const driverId = hasDriver
            ? faker.helpers.arrayElement(driverIds)
            : null

        return generateMockDelivery(orderId, driverId)
    })
}
