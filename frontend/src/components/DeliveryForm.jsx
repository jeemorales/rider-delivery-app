import React, { useEffect, useState } from "react";
import { User, MapPin, Phone, FileText, Navigation, Map, UserPlus } from "lucide-react";

export default function DeliveryForm({ onAddCustomer }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [remarks, setRemarks] = useState("");

  // When map click happens, DeliveryMap writes lastPickedLocation to localStorage and dispatches event
  useEffect(() => {
    function handlePicked() {
      try {
        const raw = localStorage.getItem("lastPickedLocation");
        if (!raw) return;
        const { lat: plat, lng: plng } = JSON.parse(raw);
        setLat(String(plat));
        setLng(String(plng));
      } catch (e) { /* ignore */ }
    }
    window.addEventListener("mapLocationPicked", handlePicked);
    return () => window.removeEventListener("mapLocationPicked", handlePicked);
  }, []);

  // also allow using current rider location (DeliveryMap updates __rider_location in localStorage)
  const useRiderLocation = () => {
    try {
      const raw = localStorage.getItem("__rider_location");
      if (!raw) {
        alert("Rider location not available yet.");
        return;
      }
      const { lat: rlat, lng: rlng } = JSON.parse(raw);
      setLat(String(rlat));
      setLng(String(rlng));
    } catch (e) {
      console.warn(e);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!name || !address || !phone || !lat || !lng) {
      alert("Please fill name, address, phone, and pick a location (lat/lng).");
      return;
    }
    const customer = {
      id: Date.now(),
      name,
      address,
      phone,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      remarks,
    };
    onAddCustomer && onAddCustomer(customer);

    // reset
    setName("");
    setAddress("");
    setPhone("");
    setLat("");
    setLng("");
    setRemarks("");
  };

  return (
    <form onSubmit={onSubmit} className="card bg-base-100 border border-base-200 shadow-xl p-5 sm:p-6 rounded-3xl space-y-4 max-w-xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-base-200 pb-3">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
          <UserPlus size={22} />
        </div>
        <div>
          <h3 className="font-black text-xl tracking-tight">Add Customer / Receiver</h3>
          <p className="text-xs text-base-content/60">Register delivery destination & map coordinates</p>
        </div>
      </div>

      {/* Name Field */}
      <div className="space-y-1">
        <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">Customer Name</label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" size={17} />
          <input 
            className="input input-bordered w-full pl-10 rounded-xl text-sm font-medium focus:input-primary" 
            placeholder="e.g. Juan Dela Cruz" 
            value={name} 
            onChange={(e)=>setName(e.target.value)} 
          />
        </div>
      </div>

      {/* Address Field */}
      <div className="space-y-1">
        <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">Delivery Address</label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" size={17} />
          <input 
            className="input input-bordered w-full pl-10 rounded-xl text-sm font-medium focus:input-primary" 
            placeholder="e.g. Mapalad, Santa Rosa" 
            value={address} 
            onChange={(e)=>setAddress(e.target.value)} 
          />
        </div>
      </div>

      {/* Phone Field */}
      <div className="space-y-1">
        <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">Contact Number</label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" size={17} />
          <input 
            className="input input-bordered w-full pl-10 rounded-xl text-sm font-medium focus:input-primary" 
            placeholder="09123456789" 
            value={phone} 
            onChange={(e)=>setPhone(e.target.value)} 
          />
        </div>
      </div>

      {/* Lat / Lng Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="label text-[10px] font-bold uppercase tracking-wider text-base-content/60">Latitude</label>
          <input 
            className="input input-bordered w-full rounded-xl text-xs font-mono bg-base-200/50" 
            placeholder="Lat" 
            value={lat} 
            onChange={(e)=>setLat(e.target.value)} 
          />
        </div>
        <div className="space-y-1">
          <label className="label text-[10px] font-bold uppercase tracking-wider text-base-content/60">Longitude</label>
          <input 
            className="input input-bordered w-full rounded-xl text-xs font-mono bg-base-200/50" 
            placeholder="Lng" 
            value={lng} 
            onChange={(e)=>setLng(e.target.value)} 
          />
        </div>
      </div>

      {/* Remarks Field */}
      <div className="space-y-1">
        <label className="label text-xs font-bold uppercase tracking-wider text-base-content/70">Landmark / Remarks</label>
        <div className="relative">
          <FileText className="absolute left-3.5 top-3 text-base-content/40" size={17} />
          <textarea 
            className="textarea textarea-bordered w-full pl-10 rounded-xl text-sm font-medium focus:textarea-primary h-20" 
            placeholder="e.g. Malapit sa puting gate..." 
            value={remarks} 
            onChange={(e)=>setRemarks(e.target.value)} 
          />
        </div>
      </div>

      {/* Location Helper Buttons */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button 
          type="button" 
          className="btn btn-outline btn-sm rounded-xl gap-1.5 font-bold h-11 border-base-300 hover:btn-primary" 
          onClick={useRiderLocation}
        >
          <Navigation size={15} /> Use Rider GPS
        </button>
        <button 
          type="button" 
          className="btn btn-outline btn-sm rounded-xl gap-1.5 font-bold h-11 border-base-300 hover:btn-primary" 
          onClick={()=>{
            alert("To pick on map: Click the map where the receiver is. The Lat/Lng will auto-fill here.");
          }}
        >
          <Map size={15} /> Pick on Map
        </button>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="btn btn-primary w-full rounded-xl font-bold shadow-lg shadow-primary/20 h-12 text-base normal-case mt-2"
      >
        Add Customer 🚀
      </button>
    </form>
  );
}