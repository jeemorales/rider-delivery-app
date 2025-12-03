import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // rider
    amount: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ["cash", "gcash", null], default: null },
    status: { type: String, enum: ["out-for-delivery","delivered", "returned"], default: "pending" },
  },
  { timestamps: true }
);

const Delivery = mongoose.model("Delivery", deliverySchema);

export default Delivery;
