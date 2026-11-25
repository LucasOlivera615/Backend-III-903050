import UserModel from "../models/user.model.js";

export const userRepository = {
  findAll: async ({ page, limit }) => {
    const skip = (page - 1) * limit

    const [users, totalDocs] = await Promise.all([
      UserModel.find()
        .select("-password")
        .sort({ _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      UserModel.countDocuments()
    ])

    return {
      docs: users,
      totalDocs,
      page,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
      hasNextPage: page * limit < totalDocs,
      hasPrevPage: page > 1
    }
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