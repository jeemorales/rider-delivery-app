import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Remove default icon URLs
delete L.Icon.Default.prototype._getIconUrl;

// --- Custom Icons ---
const riderIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // motorbike icon
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// --- Recenter helper ---
function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 14);
  }, [position, map]);
  return null;
}

// --- Helpers ---
function getDistance(lat1, lng1, lat2, lng2) {
  const toRad = v => v * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function moveToward(current, target, step = 0.0006) {
  const latDiff = target.lat - current.lat;
  const lngDiff = target.lng - current.lng;
  const dist = Math.sqrt(latDiff*latDiff + lngDiff*lngDiff);
  if (dist < step) return target;
  return { lat: current.lat + (latDiff/dist)*step, lng: current.lng + (lngDiff/dist)*step };
}

// --- Main Component ---
export default function DeliveryMap({ deliveries = [], selectedDelivery = null, onNearestChange }) {
  const [rider, setRider] = useState({ lat: null, lng: null });
  const [gpsAvailable, setGpsAvailable] = useState(false);
  const [localDeliveries, setLocalDeliveries] = useState(deliveries);

  // Update deliveries when prop changes
  useEffect(() => setLocalDeliveries(deliveries), [deliveries]);

  // Watch GPS
  useEffect(() => {
    if (!navigator.geolocation) { setGpsAvailable(false); return; }
    const watchId = navigator.geolocation.watchPosition(
      pos => { setRider({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsAvailable(true); },
      err => { console.warn("GPS error", err.message); setGpsAvailable(false); },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Simulate rider movement if GPS unavailable
  useEffect(() => {
    if (gpsAvailable || !localDeliveries.length) return;
    const tick = setInterval(() => {
      let nearest = localDeliveries[0];
      let minDist = getDistance(rider.lat ?? 14.5995, rider.lng ?? 120.9842, nearest.customerId.lat, nearest.customerId.lng);

      for (const d of localDeliveries) {
        if (d.customerId.lat == null || d.customerId.lng == null) continue;
        const dist = getDistance(rider.lat ?? 14.5995, rider.lng ?? 120.9842, d.customerId.lat, d.customerId.lng);
        if (dist < minDist) { minDist = dist; nearest = d; }
      }

      onNearestChange && onNearestChange(nearest.customerId);
      const next = moveToward(rider.lat != null ? rider : { lat: 14.5995, lng: 120.9842 }, nearest.customerId);
      setRider(next);
    }, 1000);
    return () => clearInterval(tick);
  }, [gpsAvailable, localDeliveries, rider, onNearestChange]);

  // Prepare polyline route
  const routeCoordinates = [
    rider.lat != null && rider.lng != null ? [rider.lat, rider.lng] : null,
    ...localDeliveries.filter(d => d.customerId.lat != null && d.customerId.lng != null)
                      .map(d => [d.customerId.lat, d.customerId.lng])
  ].filter(Boolean);

  // Fallback center for map
  const initialCenter = rider.lat != null && rider.lng != null ? [rider.lat, rider.lng] : [14.5995, 120.9842];

  return (
    <div className="rounded-lg overflow-hidden shadow-md">
      <MapContainer center={initialCenter} zoom={13} className="w-full h-[60vh]">
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; OpenStreetMap contributors' 
        />

        {/* Recenter dynamically */}
        {rider.lat != null && rider.lng != null && <Recenter position={[rider.lat, rider.lng]} />}

        {/* Rider marker */}
        {rider.lat != null && rider.lng != null && (
          <Marker position={[rider.lat, rider.lng]} icon={riderIcon}>
            <Popup>{gpsAvailable ? "Your Location" : "Simulated Rider"}</Popup>
          </Marker>
        )}

        {/* Delivery markers */}
        {localDeliveries.map((d, idx) => (
          d.customerId.lat != null && d.customerId.lng != null && (
            <Marker
              key={`${idx}-${d.customerId.lat}-${d.customerId.lng}`}
              position={[d.customerId.lat, d.customerId.lng]}
              icon={greenIcon}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold">{d.customerId.name}</div>
                  <div className="text-xs text-muted">{d.customerId.address}</div>
                  <div className="text-xs">{d.amount ? `₱${d.amount}` : ""}</div>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {/* Polyline route */}
        {routeCoordinates.length > 1 && <Polyline positions={routeCoordinates} color="blue" weight={4} />}

        {/* Recenter on selected delivery */}
        {selectedDelivery && selectedDelivery.customerId.lat != null && selectedDelivery.customerId.lng != null && (
          <Recenter position={[selectedDelivery.customerId.lat, selectedDelivery.customerId.lng]} />
        )}
      </MapContainer>
    </div>
  );
}
