import React, { useState } from "react";
import { Phone, CheckCircle, Eye, PackageCheck, RotateCcw, Trash2 } from "lucide-react";
import { useDeliveryStore } from "../stores/useDeliveryStore";
import { Toaster } from "react-hot-toast";

export default function DeliveryList({
  deliveries = [],
  nearestDeliveryId = null,
  onSelectDelivery,
  onMarkDelivered,
  onReturnDelivery,
  onDeleteDelivery,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [paymentType, setPaymentType] = useState("cash");
  const [showPayment, setShowPayment] = useState(false);

  const openDrawer = (delivery) => {
    setSelected(delivery);
    setPaymentType("cash");
    setShowPayment(false);
    setDrawerOpen(true);
  };

  const handleMarkDeliveredClick = () => setShowPayment(true);

  const { markAsDelivered, markAsReturned, deleteDelivery, loading } = useDeliveryStore();

  const submitMark = () => {
    if (!selected) return;
    onMarkDelivered && onMarkDelivered(selected._id, paymentType);
    markAsDelivered(selected._id, paymentType);
    setDrawerOpen(false);
    setSelected(null);
    setShowPayment(false);
  };

  const handleReturn = () => {
    if (!selected) return;
    onReturnDelivery && onReturnDelivery(selected._id);
    markAsReturned(selected._id);
    setDrawerOpen(false);
    setSelected(null);
    setShowPayment(false);
  };

  const handleDelete = async (deliveryId) => {
    if (loading) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this delivery?");
    if (!confirmDelete) return;
    await deleteDelivery(deliveryId);
  };

  // --- Ensure deliveries is always an array ---
  const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];

  return (
    <div className="p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safeDeliveries.length === 0 && (
          <div className="text-center text-sm text-base-content/60">
            No deliveries available.
          </div>
        )}

        {safeDeliveries.map((d) => {
          const isNearest = d._id === nearestDeliveryId;
          const customer = d.customerId || {};

          return (
            <div
              key={d._id}
              className={`card shadow-lg border rounded-lg p-4 transition-all duration-200 ${
                isNearest ? "border-primary bg-base-300" : "bg-base-200"
              }`}
            >
              <div className="flex justify-between gap-4">
                {/* INFO */}
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{customer.name || "No Name"}</h2>
                  <p className="text-sm opacity-70">{customer.address || "No Address"}</p>
                  <p className="text-sm">{customer.phone || "09*******"}</p>
                  {customer.remarks && (
                    <p className="text-xs mt-1 italic opacity-75">{customer.remarks}</p>
                  )}
                </div>

                {/* BUTTONS */}
                <div className="flex flex-col gap-2 shrink-0">
                  <a
                    className="btn btn-sm btn-outline flex items-center gap-1"
                    onClick={() => onSelectDelivery && onSelectDelivery(d)}
                  >
                    <Eye size={16} />
                    Show
                  </a>

                  <a
                    className="btn btn-sm btn-primary text-white flex items-center gap-1"
                    onClick={() => openDrawer(d)}
                  >
                    <PackageCheck size={16} />
                    Status
                  </a>

                  {/* Delete Button */}
                  <button
                    className="btn btn-sm btn-error text-white flex items-center gap-1"
                    onClick={() => handleDelete(d._id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>

              {/* PAYMENT STATUS */}
              <div className="mt-3 flex justify-between items-center">
                {d.amount > 0 ? (
                  <span className="text-red-400 font-medium">Amount Due: ₱{d.amount}.00</span>
                ) : (
                  <span className="text-green-500 font-medium flex items-center gap-1">
                    <CheckCircle size={18} /> Paid
                  </span>
                )}

                {Number(customer.phone) > 0 && (
                  <a
                    href={`tel:${customer.phone}`}
                    className="btn btn-sm btn-success text-white flex items-center gap-1"
                  >
                    <Phone size={16} />
                    Call
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DRAWER */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-50 transition-transform duration-300 ${
          drawerOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-base-100 border-t rounded-t-2xl shadow-xl p-5 max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Delivery Actions</h3>
            <a className="btn btn-ghost btn-sm" onClick={() => setDrawerOpen(false)}>
              Close
            </a>
          </div>

          {selected && (
            <>
              <p className="text-sm mb-3">
                Delivering to:{" "}
                <span className="font-semibold">{selected.customerId?.name || "No Name"}</span>
              </p>

              {!showPayment ? (
                <div className="flex flex-col sm:flex-row gap-2 mb-5">
                  <a className="btn btn-primary flex-2" onClick={handleMarkDeliveredClick}>
                    <CheckCircle size={16} /> Mark as Delivered
                  </a>
                  <a className="btn btn-ghost flex-2" onClick={handleReturn}>
                    <RotateCcw size={16} /> Return
                  </a>
                </div>
              ) : (
                <>
                  <label className="label font-semibold">Payment Type</label>
                  <div className="flex gap-2 mb-5">
                    <a
                      className={`btn flex-1 ${paymentType === "cash" ? "btn-primary" : "btn-outline"}`}
                      onClick={() => setPaymentType("cash")}
                    >
                      Cash
                    </a>
                    <a
                      className={`btn flex-1 ${paymentType === "gcash" ? "btn-primary" : "btn-outline"}`}
                      onClick={() => setPaymentType("gcash")}
                    >
                      GCash
                    </a>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      className="btn"
                      onClick={() => {
                        setDrawerOpen(false);
                        setSelected(null);
                        setShowPayment(false);
                      }}
                    >
                      Cancel
                    </button>
                    <a className="btn btn-primary" onClick={submitMark}>
                      Submit
                    </a>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
