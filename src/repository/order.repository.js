import OrderModel from '../models/order.model.js';

export const orderRepository = {

  findAll: async ({ page, limit, status, priority }) => {
    const skip = (page - 1) * limit

    const filter = {}

    if (status) {
      filter.status = status
    }

    if (priority) {
      filter.priority = priority
    }

    const [orders, totalDocs] = await Promise.all([
      OrderModel.find(filter)
        .sort({ _id: 1 })
        .skip(skip)
        .limit(limit)
        .populate("customer", "firstName lastName email role")
        .populate("store")
        .lean(),

      OrderModel.countDocuments(filter)
    ])

    return {
      docs: orders,
      totalDocs,
      page,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
      hasNextPage: page * limit < totalDocs,
      hasPrevPage: page > 1
    }
  },

  findById: async (id) => {
    return OrderModel.findById(id).populate("customer", "firstName lastName email role").populate("store")
  },

  create: async (orderData) => {
    return OrderModel.create(orderData);
  },

  insertMany: async (orders) => {
    return OrderModel.insertMany(orders);
  },

  updateStatus: async (id, status) => {
    return OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );
  },

  updateProof: async (id, proof) => {
    return OrderModel.findOneAndUpdate(
      {
        _id: id,
        proof: null
      },
      {
        $set: { proof }
      },
      {
        new: true,
        runValidators: true
      }
    )
  },

  delete: async (id) => {
    return OrderModel.findByIdAndDelete(id)
  }
};
