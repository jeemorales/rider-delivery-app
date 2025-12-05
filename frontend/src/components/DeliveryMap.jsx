import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Remove default icon URLs
delete L.Icon.Default.prototype._getIconUrl;

// --- Icons ---
const riderIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// --- MapController handles auto-following rider and selected delivery ---
function MapController({ rider, selectedDelivery }) {
  const map = useMap();

  // Follow rider location
  useEffect(() => {
    if (rider?.lat && rider?.lng) {
      map.setView([rider.lat, rider.lng], 15);
    }
  }, [rider, map]);

  // Focus selected delivery
  useEffect(() => {
    if (selectedDelivery?.customerId?.lat && selectedDelivery?.customerId?.lng) {
      map.setView([selectedDelivery.customerId.lat, selectedDelivery.customerId.lng], 16);
    }
  }, [selectedDelivery, map]);

  return null;
}

// --- DeliveryMap Component ---
export default function DeliveryMap({ deliveries = [], selectedDelivery = null, riderLocation = null }) {
  const [rider, setRider] = useState({ lat: null, lng: null });

  // Ensure deliveries is always an array
  const safeDeliveries = Array.isArray(deliveries) ? deliveries : [];

  // Update rider location when prop changes
  useEffect(() => {
    if (riderLocation?.lat && riderLocation?.lng) {
      setRider(riderLocation);
    }
  }, [riderLocation]);

  // Default map center
  const initialCenter = rider.lat && rider.lng
    ? [rider.lat, rider.lng]
    : safeDeliveries.length && safeDeliveries[0]?.customerId?.lat && safeDeliveries[0]?.customerId?.lng
    ? [safeDeliveries[0].customerId.lat, safeDeliveries[0].customerId.lng]
    : [14.5995, 120.9842]; // fallback Manila

  // Build route coordinates safely
  const routeCoordinates = [
    rider.lat && rider.lng ? [rider.lat, rider.lng] : null,
    ...safeDeliveries
      .filter(d => d?.customerId?.lat && d?.customerId?.lng)
      .map(d => [d.customerId.lat, d.customerId.lng]),
  ].filter(Boolean);

  return (
    <div className="rounded-lg overflow-hidden shadow-md h-[60vh]">
      <MapContainer center={initialCenter} zoom={13} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapController rider={rider} selectedDelivery={selectedDelivery} />

        {/* Rider Marker */}
        {rider?.lat && rider?.lng && (
          <Marker position={[rider.lat, rider.lng]} icon={riderIcon}>
            <Popup>Rider Location</Popup>
          </Marker>
        )}

        {/* Delivery Markers */}
        {safeDeliveries.map((d, idx) => {
          const customer = d?.customerId;
          if (!customer?.lat || !customer?.lng) return null;

          return (
            <Marker key={idx} position={[customer.lat, customer.lng]} icon={greenIcon}>
              <Popup>
                <div>
                  <div className="font-semibold">{customer.name || "No Name"}</div>
                  <div className="text-xs">{customer.address || "No Address"}</div>
                  <div className="text-xs">{d.amount ? `₱${d.amount}` : ""}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route Polyline */}
        {routeCoordinates.length > 1 && <Polyline positions={routeCoordinates} color="blue" weight={4} />}
      </MapContainer>
    </div>
  );
}
