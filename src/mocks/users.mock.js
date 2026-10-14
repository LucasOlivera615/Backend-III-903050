import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { USER_ROLES } from '../utils/constants.js';

export const generateMockUser = (
  index,
  role = USER_ROLES.CUSTOMER,
  prefix = 'user',
) => ({
  _id: new mongoose.Types.ObjectId(),
  firstName: `Usuario${index}`,
  lastName: `Demo${index}`,
  email: `${prefix}${index}.${randomUUID()}@test.com`,
  password: 'coder123',
  role,
});

export const generateMockUsers = (quantity) => {
  return Array.from(
    { length: quantity },
    (_, index) => generateMockUser(index + 1),
  );
};

export const generateMockStoreUsers = (quantity) => {
  return Array.from(
    { length: quantity },
    (_, index) => generateMockUser(
      index + 1,
      USER_ROLES.STORE,
      'store',
    ),
  );
};