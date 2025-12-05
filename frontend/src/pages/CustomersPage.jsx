// src/pages/CustomersPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import toast, { Toaster } from "react-hot-toast";
import { Pencil, PackagePlus } from "lucide-react";
import { useCustomerStore } from "../stores/useCustomerStore";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Click map to pick location
function MapClickPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// List of barangay suggestions
const barangayOptions = [
  "Liwayway",
  "Barrio Militar",
  "Camptinio",
  "Cabanatuan",
  "Patalac",
  "Bangad",
  "Mapalad",
  "Malacañang"
];

export default function CustomersPage() {
  const formRef = useRef(null);
  const mapRef = useRef(null);

  const emptyForm = {
    name: "",
    address: "",
    phone: "",
    lat: "",
    lng: "",
    remarks: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [mapPick, setMapPick] = useState(null);
  const [query, setQuery] = useState("");
  const [deliverForId, setDeliverForId] = useState(null);
  const [deliveryPaymentType, setDeliveryPaymentType] = useState("");
  const [deliveryAmount, setDeliveryAmount] = useState("");
  const [saving, setSaving] = useState(false);

  // Address suggestions
  const [filteredAddresses, setFilteredAddresses] = useState([]);

  const { customers, fetchCustomers, addCustomer, updateCustomer, addDelivery } =
    useCustomerStore();

  // Fetch customers
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Whenever user picks on map
  useEffect(() => {
    if (mapPick) {
      setForm((f) => ({
        ...f,
        lat: mapPick.lat.toFixed(6),
        lng: mapPick.lng.toFixed(6),
      }));

      if (mapRef.current) {
        mapRef.current.setView([mapPick.lat, mapPick.lng], 16);
      }
    }
  }, [mapPick]);

  // Use device GPS
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        setForm((f) => ({
          ...f,
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
        }));

        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 16);
        }

        setMapPick({ lat, lng });
      },
      (err) => toast.error("GPS Error: " + err.message),
      { enableHighAccuracy: true }
    );
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      lat: Number(form.lat),
      lng: Number(form.lng),
    };

    if (editingId) {
      payload.customerId = editingId;
      await updateCustomer(payload);
      setEditingId(null);
    } else {
      await addCustomer(payload);
    }

    setForm(emptyForm);
    setMapPick(null);
    setSaving(false);
  };

  // Pre-fill edit fields
  const startEdit = (c) => {
    setEditingId(c._id);
    setForm({
      name: c.name,
      address: c.address,
      phone: c.phone,
      lat: c.lat,
      lng: c.lng,
      remarks: c.remarks || "",
    });

    if (c.lat && c.lng && mapRef.current) {
      mapRef.current.setView([c.lat, c.lng], 16);
    }

    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Filter suggestions as user types
  const handleAddressChange = (value) => {
    setForm((f) => ({ ...f, address: value }));

    if (!value) {
      setFilteredAddresses([]);
      return;
    }

    const filtered = barangayOptions.filter((b) =>
      b.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredAddresses(filtered);
  };

  // Search filter
  const filtered = customers.filter((c) => {
    const s = query.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(s) ||
      (c.address || "").toLowerCase().includes(s) ||
      String(c.phone || "").toLowerCase().includes(s)
    );
  });

  // Confirm delivery
  const confirmDelivery = async (cust) => {
    if (!deliveryPaymentType) return toast.error("Select payment status");

    // Only require amount if unpaid
    let amount = 0;
    if (deliveryPaymentType === "unpaid") {
      if (!deliveryAmount || isNaN(deliveryAmount) || Number(deliveryAmount) <= 0) {
        return toast.error("Please input a valid amount for unpaid delivery");
      }
      amount = Number(deliveryAmount);
    }

    await addDelivery({
      customerId: cust._id,
      paid: deliveryPaymentType === "paid",
      amount,
    });

    setDeliveryPaymentType("");
    setDeliveryAmount("");
    setDeliverForId(null);
  };

  return (
    <div className="space-y-6">
      {/* FORM */}
      <div ref={formRef} className="card bg-base-200 p-6 shadow-md">
        <h3 className="text-lg font-semibold">
          {editingId ? "Edit Receiver" : "Add Receiver"}
        </h3>

        <form className="space-y-3 mt-3" onSubmit={handleSubmit}>
          <input
            className="input input-bordered w-full"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          {/* Address input with suggestions */}
          <div className="relative">
            <input
              className="input input-bordered w-full"
              placeholder="Address"
              value={form.address}
              onChange={(e) => handleAddressChange(e.target.value)}
            />
            {filteredAddresses.length > 0 && (
              <div className="absolute z-10 bg-base-100 border w-full mt-1 rounded shadow">
                {filteredAddresses.map((b) => (
                  <div
                    key={b}
                    className="px-3 py-1 cursor-pointer hover:bg-base-200"
                    onClick={() => {
                      setForm((f) => ({ ...f, address: b }));
                      setFilteredAddresses([]);
                    }}
                  >
                    {b}
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            className="input input-bordered w-full"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-2">
            <input
              className="input input-bordered"
              placeholder="Latitude"
              disabled
              value={form.lat}
            />
            <input
              className="input input-bordered"
              placeholder="Longitude"
              value={form.lng}
              disabled
            />
            <a
              type="button"
              className="btn btn-primary"
              onClick={handleUseMyLocation}
            >
              Use My Location
            </a>
          </div>

          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Remarks"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />

          <button
            className="btn btn-primary w-full"
            type="submit"
            disabled={saving}
          >
            {saving
              ? editingId
                ? "Updating..."
                : "Saving..."
              : editingId
              ? "Update"
              : "Save"}
          </button>

          <a
            type="button"
            className="btn btn-ghost w-full"
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setMapPick(null);
              setFilteredAddresses([]);
            }}
          >
            Clear
          </a>
        </form>
      </div>

      {/* MAP PICKER */}
      <div className="card bg-base-200 p-4 shadow-md">
        <h3 className="font-semibold mb-2">Map Picker</h3>

        <MapContainer
          center={
            form.lat && form.lng
              ? [Number(form.lat), Number(form.lng)]
              : [14.5995, 120.9842]
          }
          zoom={13}
          className="w-full h-64 rounded"
          whenCreated={(map) => (mapRef.current = map)}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickPicker onPick={setMapPick} />

          {form.lat && form.lng && (
            <Marker position={[Number(form.lat), Number(form.lng)]}>
              <Popup>Selected Location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* CUSTOMER LIST */}
      <div className="card bg-base-200 p-4 shadow-md">
        <h3 className="font-semibold mb-2">Receivers</h3>

        <input
          className="input input-bordered w-full mb-4"
          placeholder="Search receivers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
          {filtered.map((c) => (
            <div key={c._id} className="card bg-base-100 p-3 border">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold ">{c.name}</div>
                  <div className="text-xs text-muted">{c.address}</div>
                  <div className="text-xs">{c.phone || "09**********"}</div>
                  <div className="text-xs mt-1">{c.remarks}</div>
                </div>

                <div className="flex flex-col gap-2">
                  <a className="btn btn-sm" onClick={() => startEdit(c)}>
                    <Pencil size={16} /> Edit
                  </a>

                  <a
                    className="btn btn-sm btn-success text-white"
                    onClick={() => setDeliverForId(c._id)}
                  >
                    <PackagePlus size={16} /> Deliver
                  </a>
                </div>
              </div>

              {deliverForId === c._id && (
                <div className="mt-3 p-3 bg-base-200 rounded">
                  <label className="label-text font-medium">Payment Status</label>

                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="radio"
                      className="radio radio-success"
                      checked={deliveryPaymentType === "paid"}
                      onChange={() => {
                        setDeliveryPaymentType("paid");
                        setDeliveryAmount(""); // reset amount
                      }}
                    />
                    Paid
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      className="radio radio-warning"
                      checked={deliveryPaymentType === "unpaid"}
                      onChange={() => setDeliveryPaymentType("unpaid")}
                    />
                    Unpaid
                  </label>

                  {deliveryPaymentType === "unpaid" && (
                    <input
                      type="number"
                      className="input input-bordered input-sm mt-3 w-full"
                      placeholder="Amount"
                      value={deliveryAmount}
                      onChange={(e) => setDeliveryAmount(e.target.value)}
                    />
                  )}

                  <div className="flex justify-end gap-2 mt-3">
                    <a className="btn btn-sm" onClick={() => setDeliverForId(null)}>
                      Cancel
                    </a>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => confirmDelivery(c)}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Toaster />
    </div>
  );
}
