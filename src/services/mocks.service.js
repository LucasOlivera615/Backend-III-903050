import { generateMockUsers } from "../mocks/user.mock.js";
import { userRepository } from "../repository/user.repository.js";
import { AppError } from "../utils/errors.js";


const MAX_MOCK_ITEMS = 400
const DEFAULT_MOCK_ITEMS = 10

// qty puede llegar como texto (query string) o número (body)
const validateQty = (qty = DEFAULT_MOCK_ITEMS) =>{
    const parsedQty = Number(qty)
    if(!Number.isInteger(parsedQty) || parsedQty < 0){
        throw new AppError(`qty debe ser un número entero mayor o igual a 0`, 400);
    }

    if(parsedQty > MAX_MOCK_ITEMS){
        throw new AppError(`qty no puede superar ${MAX_MOCK_ITEMS}`, 400)
    }

    return parsedQty
}


export const mockService = {
    getMockUsers: (qty)=> {
        return generateMockUsers(validateQty(qty))
    },

    seed: async(qty)=>{
        const parsedQty = validateQty(qty)

        if(parsedQty === 0){
            throw new AppError("qty debe ser mayor a 0", 400)
        }

        const createdUsers = await userRepository.insertMany(generateMockUsers(parsedQty))

        return {
            users: createdUsers.length
        }
    }
}
