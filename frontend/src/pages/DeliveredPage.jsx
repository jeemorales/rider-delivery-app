// src/pages/DeliveredPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useDeliveryStore } from "../stores/useDeliveryStore";
import { CheckCircle, Calendar, RotateCcw, PackageCheck, Trash2, Filter, Receipt } from "lucide-react";
import { Toaster } from "react-hot-toast";

export default function DeliveredPage() {
  const { delivered, fetchAllDelivered, deleteDeliveryHistory, loading } = useDeliveryStore();
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
    const options = { year: "numeric", month: "short", day: "numeric", hour: '2-digit', minute: '2-digit' };
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
  // DELETE ALL DELIVER HISTORY
  // ---------------------
  const handleClearHistory = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete ALL delivery history?"
    );

    if (!confirm) return;

    await deleteDeliveryHistory();
  };

  if (!delivered || delivered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] p-6 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-4 shadow-sm">
          <PackageCheck size={36} />
        </div>
        <h3 className="text-xl font-black tracking-tight">No delivery history yet</h3>
        <p className="text-sm text-base-content/60 mt-1">
          Completed deliveries, cash collections, and returned parcels will automatically show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-3 sm:p-6 pb-24 max-w-7xl mx-auto">

      {/* Modern Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-base-100 p-5 rounded-3xl border border-base-200 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-primary/10 text-primary rounded-xl">
              <PackageCheck size={24} />
            </span>
            <h2 className="text-2xl font-black tracking-tight">Delivery History & Logs</h2>
          </div>
          <p className="text-xs sm:text-sm text-base-content/60 pl-1">
            Monitor completed drops, track payments, and review daily remittances.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          
          {/* Filter Dropdown */}
          <div className={`dropdown ${dropdownOpen ? "dropdown-open" : ""} dropdown-end`}>
            <button
              tabIndex={0}
              className="btn btn-outline btn-sm gap-2 rounded-xl normal-case font-semibold border-base-300 h-11 px-4"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Filter size={15} className="text-primary" />
              Filter: <span className="capitalize text-primary">{filter}</span>
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow-2xl bg-base-100 rounded-2xl w-48 z-50 border border-base-200 mt-2 space-y-1"
            >
              <li onClick={() => handleFilterSelect("all")}><a className="rounded-xl font-medium">✨ All Records</a></li>
              <li onClick={() => handleFilterSelect("cash")}><a className="rounded-xl font-medium text-success">💵 Cash Payments</a></li>
              <li onClick={() => handleFilterSelect("gcash")}><a className="rounded-xl font-medium text-info">📱 GCash Payments</a></li>
              <li onClick={() => handleFilterSelect("returned")}><a className="rounded-xl font-medium text-error">↩️ Returned Parcels</a></li>
            </ul>
          </div>

          {/* Summary Button */}
          <button 
            className="btn btn-primary btn-sm rounded-xl px-5 h-11 normal-case font-bold shadow-lg shadow-primary/20 gap-2"
            onClick={() => setOpenSummary(true)}
          >
            <Receipt size={16} /> Remittance Summary
          </button>
        </div>
      </div>

      {/* Delivered Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDelivered.map((d) => {
          const isReturned = d.status === "returned";
          const isCash = d.paymentMethod === "cash";
          const isGcash = d.paymentMethod === "gcash";

          return (
            <div
              key={d._id}
              className="card bg-base-100 border border-base-200/80 shadow-md hover:shadow-xl transition-all duration-200 rounded-3xl overflow-hidden"
            >
              <div className="p-5 space-y-4">

                {/* Top Row: Customer Name & Amount */}
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-base-content/40">Customer Name</span>
                    <h3 className="font-black text-base text-base-content truncate max-w-[200px] mt-0.5">
                      {d.customerId?.name || "Unknown Customer"}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    {d.amount > 0 ? (
                      <div className="bg-base-200/60 px-3 py-1.5 rounded-2xl border border-base-200">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-base-content/50 block">Amount</span>
                        <span className="text-base font-black text-primary">
                          ₱{d.amount.toLocaleString()}.00
                        </span>
                      </div>
                    ) : (
                      <span className="badge badge-success badge-sm gap-1 text-white font-bold py-2.5 px-3 rounded-xl mt-1 shadow-xs">
                        <CheckCircle size={13} /> Paid
                      </span>
                    )}
                  </div>
                </div>

                {/* Date / Time Info */}
                <div className="flex items-center gap-2 text-xs text-base-content/60 font-medium bg-base-200/40 px-3 py-2 rounded-xl">
                  <Calendar size={14} className="text-primary shrink-0" />
                  <span>{formatDate(d.createdAt)}</span>
                </div>

                <div className="divider my-0 opacity-50"></div>

                {/* Bottom Badges: Status & Payment Method */}
                <div className="flex justify-between items-center pt-0.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-xs ${
                      isReturned
                        ? "bg-error/10 text-error border border-error/20"
                        : "bg-success/10 text-success border border-success/20"
                    }`}
                  >
                    {isReturned ? <RotateCcw size={12} /> : <CheckCircle size={12} />}
                    {isReturned ? "Returned" : "Delivered"}
                  </span>

                  {/* Payment Type Pill */}
                  {(isCash || isGcash) && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-xs ${
                        isCash
                          ? "bg-success text-white"
                          : "bg-info text-white"
                      }`}
                    >
                      {isCash ? "💵 Cash" : "📱 GCash"}
                    </span>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* SUMMARY MODAL (Upgraded Design) */}
      {openSummary && (
        <dialog className="modal modal-open backdrop-blur-xs">
          <div className="modal-box max-w-md space-y-5 p-6 sm:p-7 rounded-3xl shadow-2xl border border-base-200 bg-base-100">
            
            <div className="flex justify-between items-center border-b border-base-200 pb-4">
              <div>
                <h3 className="font-black text-2xl tracking-tight">Remittance Summary</h3>
                <p className="text-xs text-base-content/60 mt-0.5">Complete financial collection overview</p>
              </div>
              <button 
                className="btn btn-sm btn-circle btn-ghost" 
                onClick={() => setOpenSummary(false)}
              >
                ✕
              </button>
            </div>

            {/* Breakdown List */}
            <div className="space-y-3 bg-base-200/60 p-4 rounded-2xl text-sm border border-base-200/80">
              
              <div className="flex justify-between items-center font-medium">
                <span className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-success shadow-xs"></span>
                  Cash Payments ({totals.cash.count} pax)
                </span>
                <span className="text-success font-black text-base">₱{totals.cash.total.toLocaleString()}.00</span>
              </div>

              <div className="flex justify-between items-center font-medium">
                <span className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-info shadow-xs"></span>
                  GCash Payments ({totals.gcash.count} pax)
                </span>
                <span className="text-info font-black text-base">₱{totals.gcash.total.toLocaleString()}.00</span>
              </div>

              <div className="flex justify-between items-center font-medium">
                <span className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-error shadow-xs"></span>
                  Returned Items ({totals.returned.count} pax)
                </span>
                <span className="text-error font-black text-base">₱{totals.returned.total.toLocaleString()}.00</span>
              </div>

              <div className="divider my-1 opacity-60"></div>

              <div className="flex justify-between items-center text-base font-black pt-1">
                <span className="text-base-content/80">Grand Total Collection</span>
                <span className="text-primary text-xl font-black">₱{totals.grandTotal.toLocaleString()}.00</span>
              </div>
            </div>

            {/* Actions Inside Modal */}
            <div className="modal-action flex flex-col sm:flex-row gap-2.5 pt-2">
              <button 
                className="btn btn-primary w-full sm:flex-1 rounded-xl font-bold h-12 normal-case text-base shadow-md shadow-primary/20" 
                onClick={() => setOpenSummary(false)}
              >
                Close Summary
              </button>

              <button
                className="btn btn-outline btn-error w-full sm:w-auto rounded-xl gap-2 font-semibold h-12 px-5 normal-case"
                onClick={handleClearHistory}
                disabled={loading}
              >
                <Trash2 size={16} />
                Clear History
              </button>
            </div>

          </div>
        </dialog>
      )}

      <Toaster position="bottom-center" />
    </div>
  );
}