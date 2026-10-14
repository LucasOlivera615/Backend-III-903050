import UserModel from "../models/user.model.js";

export const userRepository = {
  findAll: async () => {
    return UserModel.find();
  },

  findById: async (id) => {
    return UserModel.findById(id);
  },

  create: async (userData) => {
    return UserModel.create(userData);
  },

  insertMany: async (users) => {
    return UserModel.insertMany(users);
  },

  update: async (id, userData) => {
    return UserModel.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    });
  },

  delete: async (id) => {
    return UserModel.findByIdAndDelete(id);
  },
};