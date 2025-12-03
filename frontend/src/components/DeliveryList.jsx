import React, { useState } from "react";
import { CheckCircle, Eye, PackageCheck, RotateCcw } from "lucide-react";

export default function DeliveryList({
  deliveries = [],
  nearestDeliveryId = null,
  onSelectDelivery,
  onMarkDelivered,
  onReturnDelivery, // optional handler
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [paymentType, setPaymentType] = useState("cash");

  const openDrawer = (delivery) => {
    setSelected(delivery);
    setPaymentType("cash");
    setDrawerOpen(true);
  };

  const submitMark = () => {
    if (!selected) return;
    onMarkDelivered && onMarkDelivered(selected.id, paymentType);
    setDrawerOpen(false);
    setSelected(null);
  };

  return (
    <div className="p-3">
      {/* GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deliveries.length === 0 && (
          <div className="text-center text-sm text-base-content/60">
            No deliveries available.
          </div>
        )}

        {deliveries.map((d) => {
          const isNearest = d._id === nearestDeliveryId;

          return (
            <div
              key={d._id}
              className={`card shadow-lg border rounded-lg p-4 transition-all duration-200 
                ${isNearest ? "border-primary bg-base-300" : "bg-base-200"}
              `}
            >
              <div className="flex justify-between gap-4">
                {/* INFO */}
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{d.customerId.name}</h2>
                  <p className="text-sm opacity-70">{d.customerId.address}</p>
                  <p className="text-sm">{d.customerId.phone}</p>

                  {d.customerId.remarks && (
                    <p className="text-xs mt-1 italic opacity-75">
                      {d.customerId.remarks}
                    </p>
                  )}
                </div>

                {/* BUTTONS */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => onSelectDelivery && onSelectDelivery(d)}
                  >
                    <Eye size={16} />
                    Show
                  </button>

                  <button
                    className="btn btn-sm btn-success text-white"
                    onClick={() => openDrawer(d)}
                  >
                    <PackageCheck size={16} />
                    Delivered
                  </button>

                  <button
                    className="btn btn-sm btn-warning text-white"
                    onClick={() => onReturnDelivery && onReturnDelivery(d.id)}
                  >
                    <RotateCcw size={16} />
                    Return
                  </button>
                </div>
              </div>

              {/* PAYMENT STATUS */}
              <div className="mt-3">
                {d.paid ? (
                  <span className="text-green-500 font-medium flex items-center gap-1">
                    <CheckCircle size={18} /> Paid
                  </span>
                ) : (
                  <span className="text-red-400 font-medium">
                    Amount Due: ₱{d.amount || 0}.00
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DRAWER (BOTTOM SLIDE-UP) */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-50 transition-transform duration-300 ${
          drawerOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-base-100 border-t rounded-t-2xl shadow-xl p-5 max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Mark as Delivered</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setDrawerOpen(false)}
            >
              Close
            </button>
          </div>

          {selected && (
            <>
              <p className="text-sm mb-3">
                Delivering to:{" "}
                <span className="font-semibold">{selected.name}</span>
              </p>

              {/* PAYMENT TYPE */}
              <label className="label font-semibold">Payment Type</label>
              <div className="flex gap-2 mb-5">
                <button
                  className={`btn flex-1 ${
                    paymentType === "cash" ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setPaymentType("cash")}
                >
                  Cash
                </button>

                <button
                  className={`btn flex-1 ${
                    paymentType === "gcash" ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => setPaymentType("gcash")}
                >
                  GCash
                </button>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-2">
                <button
                  className="btn"
                  onClick={() => {
                    setDrawerOpen(false);
                    setSelected(null);
                  }}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={submitMark}>
                  Submit
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
