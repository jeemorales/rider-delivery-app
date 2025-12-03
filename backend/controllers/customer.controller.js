import Customer from "../models/customer.model.js";

// CREATE CUSTOMER
export const addCustomer = async (req, res) => {
    try {
        const userId = req.user.id;
        let { name, address, phone, lat, lng, remarks } = req.body;

        if (!name || !address) {
            return res.status(400).json({ message: "Please provide required fields" });
        }

        // Set default coordinates if invalid or zero
        if (!lat || !lng || lat == 0 || lng == 0) {
            lat = 15.484995;   // default LAT
            lng = 121.086929; // default LONG
        }

        const customerExist = await Customer.findOne({ phone });
        if (customerExist)
            return res.status(400).json({ message: "Customer already exists" });

        const customer = await Customer.create({
            userId,
            name,
            address,
            phone: phone || Number("000000"),
            lat,
            lng,
            remarks,
        });

        res.status(201).json({
            customer,
            message: "Customer added successfully",
        });

    } catch (error) {
        console.log("Error in addCustomer controller:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


//GET CUSTOMER
export const getCustomers = async (req, res) => {
    try {
        const userId = req.user.id;
        const customersList = await Customer.find();
        res.status(200).json(customersList);
    } catch (error) {
        console.log("Error in getCustomers controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, address, phone, lat, lng, remarks, customerId } = req.body;

        if (!name || !address) {
            return res.status(400).json({ message: "Please provide required fields" });
        }

        const updatedCustomer = await Customer.findOneAndUpdate(
            { _id: customerId, userId: userId},
            req.body,
            { new: true }
        );
        if (!updatedCustomer) return res.status(400).json({ message: "Customer not found" });

        res.status(201).json({
            updatedCustomer,
            message: "Customer details update successfully",
        });
    } catch (error) {
        console.log("Error in updateCustomer controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
    }
} ;