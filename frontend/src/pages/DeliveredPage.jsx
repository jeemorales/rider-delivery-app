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
    const options = { month: "short", day: "numeric", hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString(undefined, options);
  };

  // ---------------------
  // HANDLE FILTER SELECTION
  // ---------------------
  const handleFilterSelect = (type) => {
    setFilter(type);
    setDropdownOpen(false);
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
      <div className="flex flex-col items-center justify-center min-h-[55vh] p-4 text-center max-w-sm mx-auto">
        <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-3">
          <PackageCheck size={26} />
        </div>
        <h3 className="text-base font-bold">No delivery history yet</h3>
        <p className="text-xs text-base-content/60 mt-0.5">
          Completed deliveries and returned parcels will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 p-2.5 sm:p-4 pb-20 max-w-7xl mx-auto">

      {/* Header Banner (Compact) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-base-100 p-3.5 rounded-2xl border border-base-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
            <PackageCheck size={18} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight leading-tight">Delivery Logs</h2>
            <p className="text-[11px] text-base-content/60">
              Completed drops & remittances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Filter Dropdown */}
          <div className={`dropdown ${dropdownOpen ? "dropdown-open" : ""} dropdown-end`}>
            <button
              tabIndex={0}
              className="btn btn-outline btn-xs gap-1 rounded-lg font-semibold border-base-300 h-8 px-2.5 text-[11px]"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Filter size={12} className="text-primary" />
              <span className="capitalize text-primary">{filter}</span>
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-1 shadow-xl bg-base-100 rounded-xl w-40 z-50 border border-base-200 mt-1 space-y-0.5 text-xs"
            >
              <li onClick={() => handleFilterSelect("all")}><a className="rounded-lg py-1.5">✨ All Records</a></li>
              <li onClick={() => handleFilterSelect("cash")}><a className="rounded-lg py-1.5 text-success">💵 Cash</a></li>
              <li onClick={() => handleFilterSelect("gcash")}><a className="rounded-lg py-1.5 text-info">📱 GCash</a></li>
              <li onClick={() => handleFilterSelect("returned")}><a className="rounded-lg py-1.5 text-error">↩️ Returned</a></li>
            </ul>
          </div>

          {/* Summary Button */}
          <button 
            className="btn btn-primary btn-xs rounded-lg px-3 h-8 font-bold gap-1 text-[11px] normal-case"
            onClick={() => setOpenSummary(true)}
          >
            <Receipt size={13} /> Summary
          </button>
        </div>
      </div>

      {/* COMPRESSED DELIVERED CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {filteredDelivered.map((d) => {
          const isReturned = d.status === "returned";
          const isCash = d.paymentMethod === "cash";
          const isGcash = d.paymentMethod === "gcash";

          return (
            <div
              key={d._id}
              className="card bg-base-100 border border-base-200 shadow-2xs hover:border-base-300 transition-all rounded-xl p-2.5"
            >
              <div className="flex justify-between items-center gap-2">
                
                {/* Left side: Name, Date & Status */}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <h3 className="font-bold text-xs text-base-content truncate">
                    {d.customerId?.name || "Unknown Customer"}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-[10px] text-base-content/60">
                    <Calendar size={11} className="shrink-0 text-base-content/40" />
                    <span className="truncate">{formatDate(d.createdAt)}</span>
                  </div>

                  <div className="pt-0.5 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        isReturned
                          ? "bg-error/10 text-error"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {isReturned ? <RotateCcw size={9} /> : <CheckCircle size={9} />}
                      {isReturned ? "Returned" : "Delivered"}
                    </span>

                    {(isCash || isGcash) && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          isCash ? "bg-success text-white" : "bg-info text-white"
                        }`}
                      >
                        {isCash ? "Cash" : "GCash"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side: Amount / Paid Pill */}
                <div className="text-right shrink-0">
                  {d.amount > 0 ? (
                    <span className="text-xs font-black text-primary block">
                      ₱{d.amount.toLocaleString()}
                    </span>
                  ) : (
                    <span className="badge badge-success badge-xs text-white font-bold text-[9px] px-1.5 py-1">
                      Paid
                    </span>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* SUMMARY MODAL (Compact) */}
      {openSummary && (
        <dialog className="modal modal-open backdrop-blur-xs">
          <div className="modal-box max-w-xs space-y-3 p-4 rounded-2xl shadow-xl border border-base-200 bg-base-100">
            
            <div className="flex justify-between items-center border-b border-base-200 pb-2">
              <div>
                <h3 className="font-black text-base">Remittance Summary</h3>
                <p className="text-[10px] text-base-content/60">Collection breakdown</p>
              </div>
              <button 
                className="btn btn-xs btn-circle btn-ghost" 
                onClick={() => setOpenSummary(false)}
              >
                ✕
              </button>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2 bg-base-200/50 p-2.5 rounded-xl text-xs border border-base-200">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Cash ({totals.cash.count})
                </span>
                <span className="text-success font-bold">₱{totals.cash.total.toLocaleString()}.00</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-info"></span>
                  GCash ({totals.gcash.count})
                </span>
                <span className="text-info font-bold">₱{totals.gcash.total.toLocaleString()}.00</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  Returned ({totals.returned.count})
                </span>
                <span className="text-error font-bold">₱{totals.returned.total.toLocaleString()}.00</span>
              </div>

              <div className="divider my-1 opacity-50"></div>

              <div className="flex justify-between items-center text-xs font-black pt-0.5">
                <span>Grand Total</span>
                <span className="text-primary text-sm font-black">₱{totals.grandTotal.toLocaleString()}.00</span>
              </div>
            </div>

            {/* Actions Inside Modal */}
            <div className="modal-action flex gap-1.5 pt-1">
              <button 
                className="btn btn-primary btn-xs flex-1 rounded-lg font-bold h-8 text-xs" 
                onClick={() => setOpenSummary(false)}
              >
                Close
              </button>

              <button
                className="btn btn-outline btn-error btn-xs rounded-lg gap-1 font-medium h-8 text-xs px-2.5"
                onClick={handleClearHistory}
                disabled={loading}
              >
                <Trash2 size={12} />
                Clear
              </button>
            </div>

          </div>
        </dialog>
      )}

      <Toaster position="bottom-center" />
    </div>
  );
}