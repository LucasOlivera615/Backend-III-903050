import StoreModel from '../models/store.model.js';

export const storeRepository = {
  findAll: async ({ page, limit }) => {
    const skip = (page - 1) * limit

    const [stores, totalDocs] = await Promise.all([
      StoreModel.find()
        .sort({ _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      StoreModel.countDocuments()
    ])

    return {
      docs: stores,
      totalDocs,
      page,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
      hasNextPage: page * limit < totalDocs,
      hasPrevPage: page > 1
    }
  },

  findById: async (id) => {
    return StoreModel.findById(id);
  },

  create: async (storeData) => {
    return StoreModel.create(storeData);
  },

  insertMany: async (stores) => {
    return StoreModel.insertMany(stores);
  },

  update: async (id, storeData) => {
    return StoreModel.findByIdAndUpdate(id, storeData, {
      new: true,
      runValidators: true,
    });
  },

  delete: async (id) => {
    return StoreModel.findByIdAndDelete(id);
  },
};
