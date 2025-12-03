// src/stores/useDeliveryStore.js
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

    addDelivery: (delivery) =>
        set({ deliveries: [...get().deliveries, delivery] }),

    removeDelivery: (id) =>
        set({ deliveries: get().deliveries.filter(d => d.id !== id) }),

    completeDelivery: (delivery) =>
        set({
            delivered: [delivery, ...get().delivered],
            completedCount: get().completedCount + 1,
            deliveries: get().deliveries.filter(d => d.id !== delivery.id),
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
}));
