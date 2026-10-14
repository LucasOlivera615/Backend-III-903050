import mongoose from 'mongoose';

export const generateMockStore = (ownerId, index) => ({
  _id: new mongoose.Types.ObjectId(),
  name: `Comercio Demo ${index}`,
  address: `Av. Siempre Viva ${700 + index}`,
  owner: ownerId,
  isActive: true,
});

export const generateMockStores = (users, quantity) => {
  return Array.from(
    { length: quantity },
    (_, index) => generateMockStore(
      users[index % users.length]._id,
      index + 1,
    ),
  );
};