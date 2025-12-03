import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    // Rider who added this customer
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    name: {
        type: String,
        required: [true, "Name is required"],
    },
    address: {
        type: String,
        required: [true, "Address is required"],
    },
    phone: {
        type: Number,
    },
    lat: {
        type: Number,
    },
    lng: {
        type: Number,
    },
    remarks: {
        type: String,
    },
}, { timestamps: true});

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;