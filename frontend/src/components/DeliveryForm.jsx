import React, { useEffect, useState } from "react";

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
    <form onSubmit={onSubmit} className="card p-4 bg-base-200 rounded-lg space-y-3">
      <h3 className="font-semibold text-lg">Add Customer / Receiver</h3>

      <input className="input input-bordered w-full" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
      <input className="input input-bordered w-full" placeholder="Address" value={address} onChange={(e)=>setAddress(e.target.value)} />
      <input className="input input-bordered w-full" placeholder="Phone number" value={phone} onChange={(e)=>setPhone(e.target.value)} />

      <div className="grid grid-cols-2 gap-2">
        <input className="input input-bordered w-full" placeholder="Latitude" value={lat} onChange={(e)=>setLat(e.target.value)} />
        <input className="input input-bordered w-full" placeholder="Longitude" value={lng} onChange={(e)=>setLng(e.target.value)} />
      </div>

      <textarea className="textarea textarea-bordered w-full" placeholder="Remarks" value={remarks} onChange={(e)=>setRemarks(e.target.value)} />

      <div className="flex gap-2">
        <button type="button" className="btn btn-outline flex-1" onClick={useRiderLocation}>Use Rider Location</button>
        <button type="button" className="btn btn-outline flex-1" onClick={()=>{
          alert("To pick on map: Click the map where the receiver is. The Lat/Lng will auto-fill here.");
        }}>Pick on Map</button>
      </div>

      <button type="submit" className="btn btn-primary w-full">Add Customer</button>
    </form>
  );
}
