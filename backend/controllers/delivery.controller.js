import Customer from "../models/customer.model.js";
import Delivery from "../models/delivery.model.js"


export const addDelivery = async (req, res) => {
    try {
        const userId = req.user.id;
        const { customerId, amount } = req.body;
        const newAmount = Number(amount);
        let isPaid = false;
        if (!customerId) return res.status(400).json({ message: "Missing customer id"});

        const customerExist = await Customer.findById(customerId);
        if (!customerExist) return res.status(404).json({ message: "Customer not found" });
            
        if (Number(newAmount) === 0 || newAmount == null) {
            isPaid = true;
        }

        //Create delivery
        const delivery = await Delivery.create({
            customerId,
            userId,
            amount: amount || 0,
            status: "out-for-delivery",
            isPaid,
        });

        res.status(201).json({ 
            message: "Delivery added successfully", 
            delivery, 
        });
        
    } catch (error) {
        console.log("Error in addDelivery controller:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//GET RIDER ACTIVE DELIVERIES (OUT-FOR-DELIVERY)
// export const getRiderDeliveries = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const deliveries = await Delivery.find(
//       { userId, 
//         status: "out-for-delivery", 
//       }).populate("customerId");
//     res.json(deliveries);
//   } catch (error) {
//       console.log("Error in getRiderDeliveries controller:", error.message);
//       res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const getRiderDeliveries = async (req, res) => {
  try {
    const userId = req.user.id;

    const deliveries = await Delivery.find({
      userId,
      status: "out-for-delivery",
    }).populate("customerId");

    // Custom address order
    const addressPriority = [
      "Barrio Militar",
      "Liwayway",
      "Mapalad",
      "Malacañang",
      "Patalac",
      "Kalikid sur",
      "Kalikid norte",
      "Camptinio",
      "Bangad",
      "Bakod bayan",
      "Cabanatuan",
    ];

    // Sorting logic
    const sortedDeliveries = deliveries.sort((a, b) => {
      const addressA = a.customerId?.address || "";
      const addressB = b.customerId?.address || "";

      const indexA = addressPriority.indexOf(addressA);
      const indexB = addressPriority.indexOf(addressB);

      // If address is in the list, use its index
      // If not in list, push to bottom
      const priorityA = indexA === -1 ? Infinity : indexA;
      const priorityB = indexB === -1 ? Infinity : indexB;

      return priorityA - priorityB;
    });

    res.json(sortedDeliveries);

  } catch (error) {
    console.log("Error in getRiderDeliveries controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.id;
    const deleted = await Delivery.findByIdAndDelete(deliveryId);

    if (!deleted) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.status(200).json({ message: "Delivery deleted successfully" });
  } catch (error) {
    console.log("Error in deleteDelivery controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


//GET RIDER DELIVERY HISTORY (DELIVERED + RETURNED - TODAY ONLY)
export const getDeliveryHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Compute start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const deliveries = await Delivery.find({
      userId,
      status: { $in: ["delivered", "returned"] },
      updatedAt: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate("customerId")
      .sort({ updatedAt: -1 });
    res.json(deliveries);
  } catch (error) {
    console.log("Error in getDeliveryHistory controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


//MARK AS DELIVERED
export const markAsDelivered = async (req, res) => {
  try {
    const { paymentMethod, deliveryId } = req.body;

    if (!paymentMethod || !["cash", "gcash"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Valid payment method required (cash or gcash)." });
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    delivery.status = "delivered";
    delivery.isPaid = true;
    delivery.paymentMethod = paymentMethod;
    
    await delivery.save();

    res.json({ message: "Delivery marked as delivered", delivery });
  } catch (error) {
    console.log("Error in markAsDelivered controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//MARK AS RETURNED (FAILED DELIVERY)
export const markAsReturned = async (req, res) => {
  try {
    const { deliveryId }= req.body;
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ message: "Delivery not found." });

    delivery.status = "returned";
    delivery.isPaid = false;
    delivery.paymentMethod = null;

    await delivery.save();

    res.json({ message: "Delivery returned.", delivery });
  } catch (error) {
    console.log("Error in markAsReturned controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


