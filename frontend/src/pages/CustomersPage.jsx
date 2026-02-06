// src/pages/CustomersPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { MapPin, MapPinOff, Phone, PhoneOff } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import toast, { Toaster } from "react-hot-toast";
import { Pencil, PackagePlus } from "lucide-react";
import { useCustomerStore } from "../stores/useCustomerStore";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
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

// Auto-focus map on rider location
function MapController({ riderLocation }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (riderLocation?.lat && riderLocation?.lng) {
      map.setView([riderLocation.lat, riderLocation.lng], 16, { animate: true });
    }
  }, [riderLocation, map]);
  return null;
}

// List of barangay suggestions
const barangayOptions = [
  "Barrio Militar",
  "Liwayway",
  "Mapalad",
  "Malacañang",
  "Patalac",
  "Kalikid sur",
  "Kalikid norte",
  "Camptinio",
  "Bangad",
  "Bakod bayan",
  "Cabanatuan",
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

  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [mapPick, setMapPick] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null); // For live GPS
  const [query, setQuery] = useState("");
  const [deliverForId, setDeliverForId] = useState(null);
  const [deliveryPaymentType, setDeliveryPaymentType] = useState("paid");
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

  // Update form when map is clicked
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

  // Function to get device GPS and update rider location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Update rider location (map will auto-focus via MapController)
        setRiderLocation({ lat, lng });

        // Also update form fields
        setForm((f) => ({
          ...f,
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
        }));

        // Update mapPick for marker placement
        setMapPick({ lat, lng });

        toast.success("Location detected successfully!");
      },
      (err) => toast.error("GPS Error: " + err.message),
      { enableHighAccuracy: true }
    );
  };

  // Optional: Live GPS tracking every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setRiderLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const actionLabel = editingId ? "update this customer" : "add this customer";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel}?`
    );

    if (!confirmed) return;

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
      name: String(c.name ?? ""),
      address: String(c.address ?? ""),
      phone: String(c.phone ?? ""),
      lat: c.lat != null ? String(c.lat) : "",
      lng: c.lng != null ? String(c.lng) : "",
      remarks: String(c.remarks ?? ""),
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
    if (!deliveryPaymentType) {
      return toast.error("Select payment status");
    }

    const actionLabel =
      deliveryPaymentType === "paid"
        ? "mark this delivery as PAID"
        : "create a Cash on delivery";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel}?`
    );

    if (!confirmed) return;

    let amount = 0;

    if (deliveryPaymentType === "unpaid") {
      if (
        !deliveryAmount ||
        isNaN(deliveryAmount) ||
        Number(deliveryAmount) <= 0
      ) {
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
            <button
              type="button"
              className="btn btn-primary text-white"
              onClick={handleUseMyLocation}
            >
              Use My Location
            </button>
          </div>

          <input
            className="input input-bordered w-full"
            placeholder="Remarks"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />

          <button
            className="btn btn-primary text-white w-full"
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

          <button
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
          </button>
        </form>
      </div>

      {/* MAP PICKER */}
      <div className="card bg-base-200 p-4 shadow-md">
        <h3 className="font-semibold mb-2">Map Picker</h3>
        <div className="relative z-0">
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

            {/* Auto-follow rider */}
            <MapController riderLocation={riderLocation || mapPick} />

            {form.lat && form.lng && (
              <Marker position={[Number(form.lat), Number(form.lng)]}>
                <Popup>Selected Location</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>

      {/* CUSTOMER LIST */}
      <div className="card bg-base-200 p-2 pb-48 shadow-md">
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
                  {/* NAME + LOCATION STATUS */}
                  <div className="font-semibold flex items-center gap-2">
                    {c.name}

                    {Number(c.lat) === 15.484995 && Number(c.lng) === 121.086929 ? (
                      <MapPinOff
                        size={14}
                        className="text-base-content/40"
                        title="No pin location"
                      />
                    ) : (
                      <MapPin
                        size={14}
                        className="text-success"
                        title="Pin location available"
                      />
                    )}
                  </div>

                  {/* PHONE */}
                  <div className="text-xs flex items-center gap-2 mt-1 text-base-content/70">
                    {c.phone ? (
                      <>
                        <Phone size={12} />
                        {c.phone}
                      </>
                    ) : (
                      <>
                        <PhoneOff size={12} />
                        <span className="italic">No phone number</span>
                      </>
                    )}
                  </div>

                  {/* ADDRESS */}
                  <div className="text-xs flex items-center gap-2 text-base-content/60">
                    <MapPin size={12} />
                    {c.address || "No address"}
                  </div>

                  {/* REMARKS (ONLY SHOW IF EXISTS) */}
                  {c.remarks && (
                    <div className="text-xs mt-1 italic text-base-content/50">
                      {c.remarks}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button className="btn btn-sm" onClick={() => startEdit(c)}>
                    <Pencil size={16} /> Edit
                  </button>

                  <button
                    className="btn btn-sm btn-primary text-white"
                    onClick={() => setDeliverForId(c._id)}
                  >
                    <PackagePlus size={16} /> Deliver
                  </button>
                </div>
              </div>

              {deliverForId === c._id && (
                <div className="mt-3 p-3 bg-base-200 rounded">
                  <div className="font-medium mb-2">Payment Status</div>

                  {/* SEGMENTED BUTTONS */}
                  <div className="join w-full">
                    <button
                      className={`btn btn-sm join-item flex-1 border-base-400 ${
                        deliveryPaymentType === "paid"
                          ? "btn-success text-white"
                          : "btn-outline"
                      }`}
                      onClick={() => {
                        setDeliveryPaymentType("paid");
                        setDeliveryAmount("");
                      }}
                    >
                      Paid
                    </button>

                    <button
                      className={`btn btn-sm join-item flex-1 border-base-400 ${
                        deliveryPaymentType === "unpaid"
                          ? "btn-primary text-white"
                          : "btn-outline"
                      }`}
                      onClick={() => setDeliveryPaymentType("unpaid")}
                    >
                      Cash on Delivery
                    </button>
                  </div>

                  {/* AMOUNT INPUT */}
                  {deliveryPaymentType === "unpaid" && (
                    <input
                      type="number"
                      className="input input-bordered input-sm mt-3 w-full"
                      placeholder="Amount"
                      value={deliveryAmount}
                      onChange={(e) => setDeliveryAmount(e.target.value)}
                    />
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => setDeliverForId(null)}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => confirmDelivery(c)}
                      disabled={!deliveryPaymentType}
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
