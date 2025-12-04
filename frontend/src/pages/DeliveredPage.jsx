// src/pages/DeliveredPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useDeliveryStore } from "../stores/useDeliveryStore";

export default function DeliveredPage() {
    const { delivered, fetchAllDelivered } = useDeliveryStore();
    const [openSummary, setOpenSummary] = useState(false);
    const [filter, setFilter] = useState("all"); // all, cash, gcash, returned

    // ---------------------
    // FETCH DELIVERED ITEMS ON LOAD
    // ---------------------
    useEffect(() => {
        fetchAllDelivered();
    }, [fetchAllDelivered]);

    // ---------------------
    // COMPUTE TOTALS
    // ---------------------
    const totals = useMemo(() => {
        const cashItems = delivered.filter(d => d.paymentMethod === "cash");
        const gcashItems = delivered.filter(d => d.paymentMethod === "gcash");
        const returnItems = delivered.filter(d => d.status === "returned");

        const cashTotal = cashItems.reduce((sum, d) => sum + (d.amount || 0), 0);
        const gcashTotal = gcashItems.reduce((sum, d) => sum + (d.amount || 0), 0);
        const returnTotal = returnItems.reduce((sum, d) => sum + (d.amount || 0), 0);

        return {
            cash: { count: cashItems.length, total: cashTotal },
            gcash: { count: gcashItems.length, total: gcashTotal },
            returned: { count: returnItems.length, total: returnTotal },
            grandTotal: cashTotal + gcashTotal + returnTotal,
            totalDelivered: delivered.length,
        };
    }, [delivered]);

    // ---------------------
    // FILTERED DELIVERED
    // ---------------------
    const filteredDelivered = useMemo(() => {
        if (filter === "all") return delivered;
        if (filter === "cash") return delivered.filter(d => d.paymentMethod === "cash");
        if (filter === "gcash") return delivered.filter(d => d.paymentMethod === "gcash");
        if (filter === "returned") return delivered.filter(d => d.status === "returned");
        return delivered;
    }, [delivered, filter]);

    // ---------------------
    // DATE FORMATTING
    // ---------------------
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const options = { year: "numeric", month: "long", day: "numeric" };
        return date.toLocaleDateString(undefined, options);
    };

    // ---------------------
    // RENDER
    // ---------------------
    if (!delivered || delivered.length === 0) {
        return <div className="card p-6 bg-base-200 text-center">No delivered items yet.</div>;
    }

    return (
        <div className="space-y-6 p-2 sm:p-4 md:p-6">

            {/* Header with Filter & Summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-semibold">Delivered</h2>

                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    {/* Filter Dropdown */}
                    <div className="dropdown">
                        <label tabIndex={0} className="btn btn-outline btn-sm">
                            Filter
                        </label>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
                            <li onClick={() => setFilter("all")}><a>All</a></li>
                            <li onClick={() => setFilter("cash")}><a>Cash</a></li>
                            <li onClick={() => setFilter("gcash")}><a>GCash</a></li>
                            <li onClick={() => setFilter("returned")}><a>Returned</a></li>
                        </ul>
                    </div>

                    {/* Summary Button */}
                    <a 
                        className="btn btn-primary btn-sm"
                        onClick={() => setOpenSummary(true)}
                    >
                        Summary
                    </a>
                </div>
            </div>

            {/* Delivered Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDelivered.map((d) => (
                    <div key={d._id} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow border border-base-200 rounded-lg">
                        <div className="card-body p-4">

                            {/* Name & Amount */}
                            <div className="flex justify-between items-center">
                                <div className="font-medium text-base">{d.customerId?.name}</div>
                                <div className="font-semibold text-base">₱{d.amount || 0}.00</div>
                            </div>

                            {/* Date */}
                            <div className="text-xs opacity-70 mt-1">
                                {formatDate(d.createdAt)}
                            </div>

                            {/* Status & Payment Badges */}
                            <div className="flex justify-between mt-2 items-center gap-2 text-sm flex-wrap">
                                <span className={`badge ${d.status === "returned" ? "badge-error" : "badge-success"} badge-outline`}>
                                    {d.status === "returned" ? "Returned" : "Delivered"}
                                </span>

                                {(d.paymentMethod === "cash" || d.paymentMethod === "gcash") && (
                                    <span className={`badge ${d.paymentMethod === "cash" ? "badge-success" : "badge-info"} badge-outline`}>
                                        {d.paymentMethod === "cash" ? "Cash" : "GCash"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* SUMMARY MODAL */}
            {openSummary && (
                <dialog className="modal modal-open">
                    <div className="modal-box space-y-4 p-6">
                        <h3 className="font-bold text-lg">Remittance Summary</h3>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span>Cash ({totals.cash.count} pax)</span>
                                <span className="text-green-500 font-bold">₱{totals.cash.total}.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>GCash ({totals.gcash.count} pax)</span>
                                <span className="text-blue-500 font-bold">₱{totals.gcash.total}.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Returned ({totals.returned.count} pax)</span>
                                <span className="text-red-500 font-bold">₱{totals.returned.total}.00</span>
                            </div>

                            <div className="divider"></div>
                            <div className="flex justify-between font-semibold text-lg">
                                <span>Grand Total</span>
                                <span>₱{totals.grandTotal}.00</span>
                            </div>
                        </div>

                        <div className="modal-action">
                            <button className="btn btn-primary w-full sm:w-auto" onClick={() => setOpenSummary(false)}>Close</button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}
