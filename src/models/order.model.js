import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  {
    _id: false
  }
);

const proofSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    fileName: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    type: {
      type: String,
      enum: ["order_proof"],
      required: true
    },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    deliveryAddress: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["created", "assigned", "picked_up", "in_transit", "delivered", "cancelled"],
      default: "created"
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal"
    },
    proof: {
      type: proofSchema,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const OrderModel = mongoose.model("Order", orderSchema);

export default OrderModel;
