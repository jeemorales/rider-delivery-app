// src/pages/CustomersPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { MapPin, MapPinOff, Phone, PhoneOff, Search, UserPlus, Pencil, PackagePlus, Navigation, X, Check, ShieldCheck } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import toast, { Toaster } from "react-hot-toast";
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
  }, [fetchCustomers]);

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

        setRiderLocation({ lat, lng });

        setForm((f) => ({
          ...f,
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
        }));

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
    }, 10000);

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
    <div className="space-y-6 max-w-7xl mx-auto p-3 sm:p-6 pb-28">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 rounded-3xl border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2 text-base-content">
            <UserPlus className="text-primary" size={28} />
            Receiver Management
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-1">
            Register delivery destinations, pin map locations, and dispatch orders quickly.
          </p>
        </div>
        <div className="badge badge-primary badge-outline font-mono text-xs px-3 py-2 font-bold">
          Total Receivers: {customers.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: FORM & MAP PICKER */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* FORM CARD */}
          <div ref={formRef} className="card bg-base-100 border border-base-200 shadow-xl p-5 sm:p-6 rounded-3xl">
            <div className="flex justify-between items-center mb-4 border-b border-base-200 pb-3">
              <h3 className="font-black text-lg flex items-center gap-2">
                {editingId ? <Pencil size={18} className="text-warning" /> : <UserPlus size={18} className="text-primary" />}
                {editingId ? "Edit Receiver Details" : "Add New Receiver"}
              </h3>
              {editingId && (
                <span className="badge badge-warning badge-sm font-bold text-white">Editing Mode</span>
              )}
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">Receiver Name</label>
                <input
                  className="input input-bordered w-full rounded-xl text-sm font-medium"
                  placeholder="e.g. Juan Dela Cruz"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Address input with suggestions */}
              <div className="relative">
                <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">Delivery Address / Barangay</label>
                <input
                  className="input input-bordered w-full rounded-xl text-sm font-medium"
                  placeholder="e.g. Mapalad, Santa Rosa"
                  value={form.address}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  required
                />
                {filteredAddresses.length > 0 && (
                  <div className="absolute z-20 bg-base-100 border border-base-200 w-full mt-1 rounded-2xl shadow-xl overflow-hidden">
                    {filteredAddresses.map((b) => (
                      <div
                        key={b}
                        className="px-4 py-2.5 cursor-pointer hover:bg-primary/10 text-sm font-medium transition-colors"
                        onClick={() => {
                          setForm((f) => ({ ...f, address: b }));
                          setFilteredAddresses([]);
                        }}
                      >
                        📍 {b}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">Contact Number</label>
                <input
                  className="input input-bordered w-full rounded-xl text-sm font-medium"
                  placeholder="09123456789"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              {/* Coordinates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="label text-[10px] font-bold uppercase text-base-content/60">Latitude</label>
                  <input
                    className="input input-bordered input-sm w-full rounded-lg text-xs font-mono bg-base-200/50"
                    placeholder="Lat"
                    disabled
                    value={form.lat}
                  />
                </div>
                <div>
                  <label className="label text-[10px] font-bold uppercase text-base-content/60">Longitude</label>
                  <input
                    className="input input-bordered input-sm w-full rounded-lg text-xs font-mono bg-base-200/50"
                    placeholder="Lng"
                    disabled
                    value={form.lng}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary w-full rounded-lg gap-1 font-bold text-white shadow-sm"
                    onClick={handleUseMyLocation}
                  >
                    <Navigation size={13} /> GPS Pin
                  </button>
                </div>
              </div>

              <div>
                <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">Landmark / Remarks</label>
                <input
                  className="input input-bordered w-full rounded-xl text-sm font-medium"
                  placeholder="e.g. Malapit sa puting gate / Tapat ng tindahan"
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  className="btn btn-primary w-full rounded-xl font-bold shadow-lg shadow-primary/20 text-base normal-case"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? editingId
                      ? "Updating Receiver..."
                      : "Saving Receiver..."
                    : editingId
                    ? "Update Receiver"
                    : "Save Receiver"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn btn-outline w-full rounded-xl font-medium"
                    onClick={() => {
                      setForm(emptyForm);
                      setEditingId(null);
                      setMapPick(null);
                      setFilteredAddresses([]);
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* MAP PICKER CARD */}
          <div className="card bg-base-100 border border-base-200 shadow-xl p-4 sm:p-5 rounded-3xl">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm flex items-center gap-1.5 text-base-content/80">
                <MapPin size={16} className="text-primary" /> Pin Location on Map
              </h3>
              <span className="text-[11px] text-base-content/50 italic">Click anywhere to select pin</span>
            </div>
            <div className="relative z-0 rounded-2xl overflow-hidden border border-base-200 shadow-inner">
              <MapContainer
                center={
                  form.lat && form.lng
                    ? [Number(form.lat), Number(form.lng)]
                    : [15.484995, 121.086929]
                }
                zoom={14}
                className="w-full h-72 rounded-2xl"
                whenCreated={(map) => (mapRef.current = map)}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickPicker onPick={setMapPick} />
                <MapController riderLocation={riderLocation || mapPick} />

                {form.lat && form.lng && (
                  <Marker position={[Number(form.lat), Number(form.lng)]}>
                    <Popup>Selected Destination Pin</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CUSTOMER LIST & DISPATCH */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="card bg-base-100 border border-base-200 shadow-xl p-4 sm:p-6 rounded-3xl space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="font-black text-xl flex items-center gap-2">
                Receivers Directory 
                <span className="badge badge-neutral badge-sm font-mono">{filtered.length}</span>
              </h3>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
                <input
                  className="input input-bordered input-sm w-full pl-10 rounded-xl text-sm font-medium"
                  placeholder="Search name, address, phone..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Customers Grid */}
            <div className="grid gap-3 grid-cols-1">
              {filtered.length === 0 ? (
                <div className="text-center py-12 bg-base-200/50 rounded-2xl border border-dashed border-base-300">
                  <p className="text-sm font-medium text-base-content/60">No receivers found matching your search.</p>
                </div>
              ) : (
                filtered.map((c) => (
                  <div key={c._id} className="card bg-base-100 border border-base-200/80 shadow-sm hover:shadow-md transition-all rounded-2xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      
                      <div className="space-y-1">
                        {/* NAME + LOCATION STATUS */}
                        <div className="font-black text-base flex items-center gap-2">
                          {c.name}
                          {Number(c.lat) === 15.484995 && Number(c.lng) === 121.086929 ? (
                            <span className="badge badge-error badge-outline badge-xs gap-1 font-medium">
                              <MapPinOff size={10} /> No Pin
                            </span>
                          ) : (
                            <span className="badge badge-success badge-outline badge-xs gap-1 font-medium">
                              <MapPin size={10} /> Pinned
                            </span>
                          )}
                        </div>

                        {/* ADDRESS */}
                        <div className="text-xs flex items-center gap-1.5 text-base-content/70 font-medium">
                          <MapPin size={13} className="text-primary shrink-0" />
                          <span>{c.address || "No address provided"}</span>
                        </div>

                        {/* PHONE */}
                        <div className="text-xs flex items-center gap-1.5 text-base-content/60">
                          {c.phone ? (
                            <>
                              <Phone size={13} className="text-success shrink-0" />
                              <span className="font-mono">{c.phone}</span>
                            </>
                          ) : (
                            <>
                              <PhoneOff size={13} className="text-base-content/30 shrink-0" />
                              <span className="italic text-base-content/40">No phone number</span>
                            </>
                          )}
                        </div>

                        {/* REMARKS */}
                        {c.remarks && (
                          <div className="text-xs mt-1 italic bg-base-200/60 px-2.5 py-1 rounded-lg text-base-content/70 border border-base-200">
                            📝 {c.remarks}
                          </div>
                        )}
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
                        <button className="btn btn-sm btn-outline rounded-xl gap-1 flex-1 sm:flex-none font-medium" onClick={() => startEdit(c)}>
                          <Pencil size={14} /> Edit
                        </button>

                        <button
                          className="btn btn-sm btn-primary rounded-xl gap-1 flex-1 sm:flex-none font-bold text-white shadow-sm"
                          onClick={() => setDeliverForId(c._id)}
                        >
                          <PackagePlus size={14} /> Deliver
                        </button>
                      </div>
                    </div>

                    {/* DELIVER DISPATCH ACCORDION BOX */}
                    {deliverForId === c._id && (
                      <div className="mt-3 p-4 bg-base-200/70 border border-base-300 rounded-2xl space-y-3 animate-in fade-in duration-200">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs uppercase tracking-wider text-base-content/70">Payment Status & Dispatch</span>
                          <button 
                            className="btn btn-xs btn-circle btn-ghost" 
                            onClick={() => setDeliverForId(null)}
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* SEGMENTED BUTTONS */}
                        <div className="join w-full shadow-xs">
                          <button
                            className={`btn btn-sm join-item flex-1 font-bold ${
                              deliveryPaymentType === "paid"
                                ? "btn-success text-white"
                                : "btn-outline border-base-300"
                            }`}
                            onClick={() => {
                              setDeliveryPaymentType("paid");
                              setDeliveryAmount("");
                            }}
                          >
                            <Check size={14} /> Paid (GCash / Settled)
                          </button>

                          <button
                            className={`btn btn-sm join-item flex-1 font-bold ${
                              deliveryPaymentType === "unpaid"
                                ? "btn-primary text-white"
                                : "btn-outline border-base-300"
                            }`}
                            onClick={() => setDeliveryPaymentType("unpaid")}
                          >
                            <ShieldCheck size={14} /> Cash on Delivery (COD)
                          </button>
                        </div>

                        {/* AMOUNT INPUT */}
                        {deliveryPaymentType === "unpaid" && (
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-base-content/50">₱</span>
                            <input
                              type="number"
                              className="input input-bordered input-sm pl-8 w-full rounded-xl font-bold"
                              placeholder="Enter collection amount (e.g. 350)"
                              value={deliveryAmount}
                              onChange={(e) => setDeliveryAmount(e.target.value)}
                            />
                          </div>
                        )}

                        {/* ACTION BUTTONS */}
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            className="btn btn-sm btn-ghost rounded-xl font-medium"
                            onClick={() => setDeliverForId(null)}
                          >
                            Cancel
                          </button>

                          <button
                            className="btn btn-sm btn-primary rounded-xl px-5 font-bold text-white shadow-md"
                            onClick={() => confirmDelivery(c)}
                            disabled={!deliveryPaymentType}
                          >
                            Confirm Dispatch 🚀
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>

      <Toaster position="bottom-center" />
    </div>
  );
}