// src/stores/useCustomerStore.js
import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCustomerStore = create((set, get) => ({
    customers: [],
    loading: false,

    // FETCH CUSTOMERS
    fetchCustomers: async () => {
        try {
            set({ loading: true });
            const res = await axios.get("/customer");
            set({ customers: res.data, loading: false });
        } catch (error) {
            set({ loading: false });
            console.log("Fetch Customers Error:", error);
            toast.error(error.response?.data?.message || "Failed to load customers");
        }
    },

    // ADD CUSTOMER
    addCustomer: async (payload) => {
        try {
            set({ loading: true });
            const res = await axios.post("/customer", payload);

            set({
                customers: [...get().customers, res.data.customer],
                loading: false,
            });

            toast.success("Customer added!");
        } catch (error) {
            set({ loading: false });
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to add customer");
        }
    },

    // UPDATE CUSTOMER
    updateCustomer: async (customerId, payload) => {
        try {
            set({ loading: true });

            const res = await axios.put("/customer", {
                customerId,
                ...payload,
            });

            const updated = res.data.updatedCustomer;

            set({
                customers: get().customers.map((c) =>
                    c._id === updated._id ? updated : c
                ),
                loading: false,
            });

            toast.success("Customer updated!");
        } catch (error) {
            set({ loading: false });
            console.log(error);
            toast.error(error.response?.data?.message || "Update failed");
        }
    },

    // ADD DELIVERY (optional handler based on your earlier UI)
    addDelivery: async (data) => {
        try {
            set({ loading: true });
            await axios.post("/delivery", data);
            set({ loading: false });

            toast.success("Delivery added!");
        } catch (error) {
            set({ loading: false });
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to add delivery");
        }
    },
}));
