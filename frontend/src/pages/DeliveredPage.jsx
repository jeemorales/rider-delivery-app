// src/pages/DeliveredPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useDeliveryStore } from "../stores/useDeliveryStore";
import { CheckCircle } from "lucide-react";


export default function DeliveredPage() {
  const { delivered, fetchAllDelivered } = useDeliveryStore();
  const [openSummary, setOpenSummary] = useState(false);
  const [filter, setFilter] = useState("all"); // all, cash, gcash, returned
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
  // HANDLE FILTER SELECTION
  // ---------------------
  const handleFilterSelect = (type) => {
    setFilter(type);
    setDropdownOpen(false); // close dropdown after selection
  };

  // ---------------------
  // RENDER
  // ---------------------
  if (!delivered || delivered.length === 0) {
    return (
      <div className="card p-6 bg-base-200 text-center text-lg font-medium">
        No delivered items yet.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 md:p-6">

      {/* Header with Filter & Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold">Delivered</h2>

        <div className="flex gap-2 flex-wrap sm:flex-nowrap relative">

          {/* Filter Dropdown */}
          <div className={`dropdown ${dropdownOpen ? "dropdown-open" : ""}`}>
            <button
              tabIndex={0}
              className="btn btn-outline btn-sm"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Filter
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-36 z-50"
            >
              <li onClick={() => handleFilterSelect("all")}><a>All</a></li>
              <li onClick={() => handleFilterSelect("cash")}><a>Cash</a></li>
              <li onClick={() => handleFilterSelect("gcash")}><a>GCash</a></li>
              <li onClick={() => handleFilterSelect("returned")}><a>Returned</a></li>
            </ul>
          </div>

          {/* Summary Button */}
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setOpenSummary(true)}
          >
            Summary
          </button>
        </div>
      </div>

      {/* Delivered Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredDelivered.map((d) => (
          <div
            key={d._id}
            className="card bg-base-100 border border-base-200 shadow-md rounded-lg"
          >
            <div className="p-3">

              {/* Name & Amount */}
              <div className="flex justify-between items-center">
                <div className="font-medium text-sm truncate">
                  {d.customerId?.name}
                </div>

                {d.amount > 0 ? (
                  <div className="text-sm font-semibold">
                    ₱{d.amount}.00
                  </div>
                ) : (
                  <div className="text-success text-xs font-medium flex items-center gap-1">
                    <CheckCircle size={14} />
                    Paid
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="text-[11px] text-base-content/60 mt-0.5">
                {formatDate(d.createdAt)}
              </div>

              {/* Status & Payment (Compact Pills) */}
              <div className="flex justify-between items-center gap-2 text-[11px] mt-1">
                <span
                  className={`px-2 py-0.5 rounded-full border ${
                    d.status === "returned"
                      ? "border-error text-error"
                      : "border-success text-success"
                  }`}
                >
                  {d.status === "returned" ? "Returned" : "Delivered"}
                </span>

                {(d.paymentMethod === "cash" || d.paymentMethod === "gcash") && (
                  <span
                    className={`px-2 py-0.5 rounded-full ${
                      d.paymentMethod === "cash"
                        ? "bg-success text-white"
                        : "bg-info text-white"
                    }`}
                  >
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
