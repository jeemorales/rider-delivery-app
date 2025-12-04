import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useDeliveryStore = create((set, get) => ({
    deliveries: [],
    delivered: [],
    loading: false,
    completedCount: 0,

    // -------------------------
    // SETTERS
    // -------------------------
    setDeliveries: (list) => set({ deliveries: list }),
    setDelivered: (list) => set({ delivered: list }),

    addDelivery: (delivery) =>
        set({ deliveries: [...get().deliveries, delivery] }),

    removeDelivery: (id) =>
        set({ deliveries: get().deliveries.filter(d => d._id !== id) }),

    completeDelivery: (delivery) =>
        set({
            delivered: [delivery, ...get().delivered],
            completedCount: get().completedCount + 1,
            deliveries: get().deliveries.filter(d => d._id !== delivery._id),
        }),

    updateDelivered: (updatedDelivery) =>
        set({
            delivered: get().delivered.map((d) =>
                d._id === updatedDelivery._id ? updatedDelivery : d
            ),
        }),

    // -------------------------
    // FETCH FROM API
    // -------------------------
    fetchDeliveries: async () => {
        try {
            set({ loading: true });
            const res = await axios.get("/delivery");
            set({ deliveries: res.data, loading: false });
        } catch (error) {
            set({ loading: false });
            console.log("Fetch Deliveries Error:", error);
            toast.error(error.response?.data?.message || "Failed to load deliveries");
        }
    },

    fetchAllDelivered: async () => {
        try {
            set({ loading: true });
            const res = await axios.get("/delivery/history");
            set({ delivered: res.data, loading: false });
        } catch (error) {
            set({ loading: false });
            console.log("Fetch Deliver History Error:", error);
            toast.error(error.response?.data?.message || "Failed to load delivery history");
        }
    },

    // -------------------------
    // MARK AS RETURNED
    // -------------------------
    markAsReturned: async (deliveryId) => {
        try {
            set({ loading: true });
            const res = await axios.put("/delivery/returned", { deliveryId });

            // Update state locally
            set((state) => ({
                deliveries: state.deliveries.filter(d => d._id !== deliveryId),
                delivered: state.delivered.map(d =>
                    d._id === deliveryId ? { ...d, status: "returned", paymentMethod: "return" } : d
                ),
                loading: false,
            }));

            toast.success("Delivery marked as returned");
        } catch (error) {
            set({ loading: false });
            console.log("Mark as Returned Error:", error);
            toast.error(error.response?.data?.message || "Failed to update delivery");
        }
    },

    // -------------------------
    // MARK AS DELIVERED
    // -------------------------
    markAsDelivered: async (deliveryId, paymentType) => {
        try {
            set({ loading: true });
            const paymentMethod = paymentType
            // Call backend endpoint for marking delivered
            const res = await axios.put("/delivery/delivered", {
                deliveryId,
                paymentMethod,
            });

            // Find delivery in list and update
            const delivery = get().deliveries.find(d => d._id === deliveryId);
            if (delivery) {
                const updatedDelivery = {
                    ...delivery,
                    status: "delivered",
                    paymentMethod,
                };

                // Remove from deliveries and add to delivered list
                set((state) => ({
                    deliveries: state.deliveries.filter(d => d._id !== deliveryId),
                    delivered: [updatedDelivery, ...state.delivered],
                    completedCount: state.completedCount + 1,
                    loading: false,
                }));
            }

            toast.success("Delivery marked as delivered");
        } catch (error) {
            set({ loading: false });
            console.log("Mark as Delivered Error:", error);
            toast.error(error.response?.data?.message || "Failed to update delivery");
        }
    },
}));
