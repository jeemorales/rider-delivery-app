import React, { useState, useMemo } from "react";
import {
  Wallet,
  MapPin,
  MapPinOff,
  Phone,
  CheckCircle,
  PhoneOff, 
  Eye,
  PackageCheck,
  RotateCcw,
  Trash2,
  MoreVertical,
  Filter
} from "lucide-react";
import { useDeliveryStore } from "../stores/useDeliveryStore";
import { Toaster, toast } from "react-hot-toast";

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

  // 🔥 ONLY NEW STATE ADDED
  const [selectedAddress, setSelectedAddress] = useState("");

  const openDrawer = (delivery) => {
    setSelected(delivery);
    setPaymentType("cash");
    setShowPayment(false);
    setDrawerOpen(true);
  };

  const handleMarkDeliveredClick = () => {
    if (!selected) return;

    if (selected.amount === 0) {
      onMarkDelivered && onMarkDelivered(selected._id, "gcash");
      markAsDelivered(selected._id, "gcash");

      setDrawerOpen(false);
      setSelected(null);
      setShowPayment(false);
      return;
    }

    setShowPayment(true);
  };

  const { markAsDelivered, markAsReturned, deleteDelivery, loading } =
    useDeliveryStore();

  // const submitMark = () => {
  //   if (!selected) return;

  //   if (!paymentType) {
  //     toast.error("Please select a payment method");
  //     return;
  //   }

  //   onMarkDelivered && onMarkDelivered(selected._id, paymentType);
  //   markAsDelivered(selected._id, paymentType);

  //   setDrawerOpen(false);
  //   setSelected(null);
  //   setShowPayment(false);
  // };


  const submitMark = () => {
    if (!selected) return;

    if (!paymentType) {
      toast.error("Please select a payment method");
      return;
    }

    const confirmSubmit = window.confirm(
      "Are you sure you want to mark this delivery as delivered?"
    );

    if (!confirmSubmit) return;

    onMarkDelivered && onMarkDelivered(selected._id, paymentType);
    markAsDelivered(selected._id, paymentType);

    setDrawerOpen(false);
    setSelected(null);
    setShowPayment(false);
  };

  const handleReturn = () => {
    if (!selected) return;

    const confirmReturn = window.confirm(
      "Are you sure you want to mark this delivery as returned?"
    );

    if (!confirmReturn) return;

    onReturnDelivery && onReturnDelivery(selected._id);
    markAsReturned(selected._id);

    setDrawerOpen(false);
    setSelected(null);
    setShowPayment(false);
  };

  const handleDelete = async (deliveryId) => {
    if (loading) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this delivery?"
    );
    if (!confirmDelete) return;
    await deleteDelivery(deliveryId);
  };

  const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];

  // 🔥 NEW: GET ALL UNIQUE ADDRESSES
  const allAddresses = useMemo(() => {
    const list = safeDeliveries
      .map((d) => d.customerId?.address)
      .filter(Boolean);

    return [...new Set(list)];
  }, [safeDeliveries]);

  // 🔥 NEW: SORTING LOGIC BASED ON SELECTED ADDRESS
  const sortedDeliveries = useMemo(() => {
    if (!selectedAddress) return safeDeliveries;

    return [...safeDeliveries].sort((a, b) => {
      const addrA = a.customerId?.address || "";
      const addrB = b.customerId?.address || "";

      if (addrA === selectedAddress && addrB !== selectedAddress) return -1;
      if (addrB === selectedAddress && addrA !== selectedAddress) return 1;

      return 0;
    });
  }, [safeDeliveries, selectedAddress]);

  return (
    <div className="pb-12">

      {/* 🔥 ONLY NEW UI ADDED - FILTER SECTION */}
      <div className="mb-4 flex flex-row gap-2 items-center flex-wrap">

        <div className="flex items-center gap-2 w-full flex-nowrap">
          <Filter size={18} />

          <select
            className="select select-bordered flex-1 sm:w-64"
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
          >
            <option value="">All Addresses</option>

            {allAddresses.map((addr) => (
              <option key={addr} value={addr}>
                {addr}
              </option>
            ))}
          </select>

          {selectedAddress && (
            <button
              className="btn btn-sm btn-primary whitespace-nowrap"
              onClick={() => setSelectedAddress("")}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedDeliveries.length === 0 && (
          <div className="text-center text-sm text-base-content/60">
            No deliveries available.
          </div>
        )}

        {sortedDeliveries.map((d) => {
          const isNearest = d._id === nearestDeliveryId;
          const customer = d.customerId || {};

          return (
            <div
              key={d._id}
              className={`card shadow-lg border rounded-lg p-4 transition-all ${
                isNearest ? "border-primary bg-base-300" : "bg-base-200"
              }`}
            >
              <div className="flex justify-between gap-4">
                <div className="flex-1">

                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    {customer?.name || "No Name"}

                    {Number(customer?.lat) === 15.484995 &&
                    Number(customer?.lng) === 121.086929 ? (
                      <MapPinOff
                        size={16}
                        className="text-base-content/40"
                      />
                    ) : (
                      <MapPin
                        size={16}
                        className="text-success"
                      />
                    )}
                  </h2>

                  <p className="text-sm flex items-center gap-2 mt-1 text-base-content/70">
                    {customer?.phone ? (
                      <>
                        <Phone size={14} />
                        {customer.phone}
                      </>
                    ) : (
                      <>
                        <PhoneOff size={14} />
                        <span className="italic">No phone number</span>
                      </>
                    )}
                  </p>

                  <p className="text-sm text-base-content/60 flex items-center gap-2">
                    <MapPin size={14} />
                    {customer.address || "No address"}
                  </p>

                  {customer.remarks && (
                    <p className="text-xs mt-1 italic text-base-content/50">
                      {customer.remarks}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-sm btn-ghost">
                      <MoreVertical size={18} />
                    </label>

                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 z-[1]"
                    >
                      {Number(customer.phone) > 0 && (
                        <li>
                          <a
                            href={`tel:0${customer.phone}`}
                            className="flex items-center gap-2 text-success"
                          >
                            <Phone size={16} /> Call
                          </a>
                        </li>
                      )}
                      <li>
                        <button
                          className="text-error flex items-center gap-2"
                          onClick={() => handleDelete(d._id)}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </li>
                    </ul>
                  </div>

                  <button
                    className="btn btn-sm btn-outline flex items-center gap-1 w-full"
                    onClick={() => onSelectDelivery && onSelectDelivery(d)}
                  >
                    <Eye size={16} /> Show
                  </button>

                  <button
                    className="btn btn-sm btn-primary text-white flex items-center gap-1 w-full"
                    onClick={() => openDrawer(d)}
                  >
                    <PackageCheck size={16} /> Status
                  </button>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                {d.amount > 0 ? (
                  <span className="text-success font-small flex items-center gap-2">
                    <Wallet size={16} />
                    Amount Due:
                    <span className="font-bold">₱{d.amount}.00</span>
                  </span>
                ) : (
                  <span className="text-success font-medium flex items-center gap-2">
                    <CheckCircle size={16} />
                    Paid
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* YOUR ORIGINAL DRAWER CODE - UNTOUCHED */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-50 transition-transform ${
          drawerOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-base-100 border-t rounded-t-2xl shadow-xl p-5 max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Delivery Actions</h3>
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
                <span className="font-semibold">
                  {selected.customerId?.name || "No Name"}
                </span>
              </p>

              {!showPayment ? (
                <div className="flex flex-col sm:flex-row gap-2 mb-5">
                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleMarkDeliveredClick}
                  >
                    <CheckCircle size={16} /> Mark as Delivered
                  </button>

                  <button
                    className="btn btn-ghost flex-1"
                    onClick={handleReturn}
                  >
                    <RotateCcw size={16} /> Return
                  </button>
                </div>
              ) : (
                <>
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

                    <button
                      className="btn btn-primary"
                      onClick={submitMark}
                    >
                      Submit
                    </button>
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
