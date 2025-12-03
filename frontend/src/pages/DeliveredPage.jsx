import React, { useState, useMemo } from "react";

export default function DeliveredPage({ delivered = [], onUpdate }) {
  const [openSummary, setOpenSummary] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selected, setSelected] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editPaymentType, setEditPaymentType] = useState("cash");

  // Compute totals
  const totals = useMemo(() => {
    const cashItems = delivered.filter((d) => d.paymentType === "cash");
    const gcashItems = delivered.filter((d) => d.paymentType === "gcash");
    const returnItems = delivered.filter((d) => d.paymentType === "return");

    const cash = {
      count: cashItems.length,
      total: cashItems.reduce((sum, d) => sum + (d.amount || 0), 0),
    };

    const gcash = {
      count: gcashItems.length,
      total: gcashItems.reduce((sum, d) => sum + (d.amount || 0), 0),
    };

    const returned = {
      count: returnItems.length,
      total: returnItems.reduce((sum, d) => sum + (d.amount || 0), 0),
    };

    return {
      cash,
      gcash,
      returned,
      totalDelivered: delivered.length,
    };
  }, [delivered]);

  // ---------------------
  // OPEN EDIT MODAL
  // ---------------------
  const openEditModal = (item) => {
    setSelected(item);
    setEditAmount(item.amount);
    setEditPaymentType(item.paymentType);
    setOpenEdit(true);
  };

  // ---------------------
  // SAVE EDIT
  // ---------------------
  const handleSaveEdit = () => {
    const updated = {
      ...selected,
      amount: Number(editAmount),
      paymentType: editPaymentType,
    };

    onUpdate(updated); // parent handles state update

    setOpenEdit(false);
  };

  // ---------------------
  // RENDER
  // ---------------------
  if (!delivered || delivered.length === 0) {
    return <div className="card p-4 bg-base-200">No delivered items yet.</div>;
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Delivered</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setOpenSummary(true)}>
          Remit
        </button>
      </div>

      {/* Delivered Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {delivered.map((d) => (
          <div key={d.id} className="card bg-base-100 shadow-md">
            <div className="card-body p-4">

              {/* Info */}
              <div className="flex justify-between">
                <div>
                  <div className="font-medium text-base">{d.name}</div>
                  <div className="text-xs opacity-70">{d.address}</div>
                  <div className="text-xs">Amount: ₱{d.amount}</div>
                  <div className="text-xs">Phone: {d.phone || "-"}</div>
                  <div className="text-xs opacity-70">
                    Remarks: {d.remarks || "-"}
                  </div>
                </div>

                <div className="text-right text-xs">
                  <div>{new Date(d.deliveredAt).toLocaleString()}</div>

                  <div className="mt-2 font-semibold text-sm">
                    {d.paymentType === "cash" && (
                      <span className="text-green-300">Cash</span>
                    )}
                    {d.paymentType === "gcash" && (
                      <span className="text-blue-300">GCash</span>
                    )}
                    {d.paymentType === "return" && (
                      <span className="text-red-300">Return</span>
                    )}
                  </div>
                </div>
              </div>

              {/* EDIT BUTTON */}
              <div className="flex justify-end">
                <button
                  onClick={() => openEditModal(d)}
                  className="btn btn-sm btn-outline btn-primary"
                >
                  Edit
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* --------------------- */}
      {/* SUMMARY MODAL */}
      {/* --------------------- */}
      {openSummary && (
        <dialog className="modal modal-open">
          <div className="modal-box space-y-4">

            <h3 className="font-bold text-lg">Remittance Summary</h3>

            <div className="space-y-2 text-sm">

              <div className="flex justify-between">
                <span>Total Cash ({totals.cash.count} pax)</span>
                <span className="text-green-300 font-bold">₱{totals.cash.total}.00</span>
              </div>

              <div className="flex justify-between">
                <span>Total GCash ({totals.gcash.count} pax)</span>
                <span className="text-blue-300 font-bold">₱{totals.gcash.total}.00</span>
              </div>

              <div className="flex justify-between">
                <span>Total Returned ({totals.returned.count} pax)</span>
                <span className="text-red-300 font-bold">₱{totals.returned.total}.00</span>
              </div>

              <div className="divider"></div>

              <div className="flex justify-between font-semibold">
                <span>Total Deliveries ({totals.totalDelivered} pax)</span>
                <span>
                  ₱
                  {totals.cash.total +
                    totals.gcash.total +
                    totals.returned.total}
                  .00
                </span>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-primary" onClick={() => setOpenSummary(false)}>
                Close
              </button>
            </div>

          </div>
        </dialog>
      )}

      {/* --------------------- */}
      {/* EDIT MODAL (MODAL B) */}
      {/* --------------------- */}
      {openEdit && (
        <dialog className="modal modal-open">
          <div className="modal-box space-y-4">

            <h3 className="font-bold text-lg">Edit Delivery</h3>

            {/* Amount */}
            <div>
              <label className="label text-sm">Amount</label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>

            {/* Payment Type */}
            <div>
              <label className="label text-sm">Payment Type</label>
              <select
                className="select select-bordered w-full"
                value={editPaymentType}
                onChange={(e) => setEditPaymentType(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="gcash">GCash</option>
                <option value="return">Return</option>
              </select>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setOpenEdit(false)}>
                Cancel
              </button>

              <button className="btn btn-primary" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>

          </div>
        </dialog>
      )}
    </div>
  );
}
