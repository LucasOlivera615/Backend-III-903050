import { generateMockUsers, generateMockUser } from "../mocks/user.mock.js"
import { generateMockOrders } from "../mocks/order.mock.js"
import { generateMockDeliveries } from "../mocks/delivery.mock.js"
import { userRepository } from "../repository/user.repository.js"
import { orderRepository } from "../repository/order.repository.js"
import { deliveryRepository } from "../repository/delivery.repository.js"
import { orderService } from "./order.service.js"
import { deliveryService } from "./delivery.service.js"
import { AppError } from "../utils/errors.js"
import { USER_ROLES } from "../utils/constants.js"
import { faker } from "@faker-js/faker"

const MAX_MOCK_ITEMS = 400
const DEFAULT_MOCK_ITEMS = 10

const validateQty = (qty = DEFAULT_MOCK_ITEMS) => {
    const parsedQty = Number(qty)

    if (!Number.isInteger(parsedQty) || parsedQty < 0) {
        throw new AppError(
            "qty debe ser un número entero mayor o igual a 0",
            400
        )
    }

    if (parsedQty > MAX_MOCK_ITEMS) {
        throw new AppError(
            `qty no puede superar ${MAX_MOCK_ITEMS}`,
            400
        )
    }

    return parsedQty
}

export const mockService = {
    getMockUsers: (qty) => {
        return generateMockUsers(validateQty(qty))
    },


    getMockOrders: (qty) => {
        const parsedQty = validateQty(qty)

        const customerIds = Array.from(
            { length: parsedQty },
            () => faker.database.mongodbObjectId()
        )

        return generateMockOrders(customerIds)
    },

    getMockDeliveries: (qty) => {
        const parsedQty = validateQty(qty)

        const orderIds = Array.from(
            { length: parsedQty },
            () => faker.database.mongodbObjectId()
        )

        const driverIds = Array.from(
            { length: Math.ceil(parsedQty / 3) },
            () => faker.database.mongodbObjectId()
        )

        return generateMockDeliveries(orderIds, driverIds)
    },


    seed: async (qty) => {
        const parsedQty = validateQty(qty)

        if (parsedQty === 0) {
            throw new AppError("qty debe ser mayor a 0", 400)
        }

        const createdUsers = []
        const createdOrders = []
        const createdDeliveries = []

        try {
            const customers = Array.from({ length: parsedQty }, () => ({
                ...generateMockUser(),
                role: USER_ROLES.CUSTOMER
            }))

            const drivers = Array.from(
                { length: Math.max(1, Math.ceil(parsedQty / 3)) },
                () => ({
                    ...generateMockUser(),
                    role: USER_ROLES.DRIVER
                })
            )

            const insertedUsers = await userRepository.insertMany([
                ...customers,
                ...drivers
            ])

            createdUsers.push(...insertedUsers)

            const customerIds = insertedUsers
                .filter((user) => user.role === USER_ROLES.CUSTOMER)
                .map((user) => user._id)

            const driverIds = insertedUsers
                .filter((user) => user.role === USER_ROLES.DRIVER)
                .map((user) => user._id)

            const orderData = generateMockOrders(customerIds)

            for (const order of orderData) {
                const createdOrder = await orderService.createOrder(order)
                createdOrders.push(createdOrder)
            }

            const deliveryData = generateMockDeliveries(
                createdOrders.map((order) => order._id),
                driverIds
            )

            for (const delivery of deliveryData) {
                const createdDelivery =
                    await deliveryService.createDelivery(delivery)

                createdDeliveries.push(createdDelivery)

                await orderService.updateOrder(delivery.order, {
                    delivery: createdDelivery._id
                })
            }

            return {
                users: createdUsers.length,
                orders: createdOrders.length,
                deliveries: createdDeliveries.length
            }
        } catch (error) {
            const cleanupErrors = []

            for (const delivery of createdDeliveries) {
                try {
                    await deliveryRepository.delete(delivery._id)
                } catch (cleanupError) {
                    cleanupErrors.push(cleanupError)
                }
            }

            for (const order of createdOrders) {
                try {
                    await orderRepository.delete(order._id)
                } catch (cleanupError) {
                    cleanupErrors.push(cleanupError)
                }
            }

            for (const user of createdUsers) {
                try {
                    await userRepository.delete(user._id)
                } catch (cleanupError) {
                    cleanupErrors.push(cleanupError)
                }
            }

            if (cleanupErrors.length > 0) {
                console.error(
                    "No se pudieron limpiar todos los registros del seed:",
                    cleanupErrors
                )
            }

            throw error
        }
    }
}