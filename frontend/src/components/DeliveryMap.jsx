import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import axios from "../lib/axios";

// Remove default icon URLs
delete L.Icon.Default.prototype._getIconUrl;

const riderIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 15);
  }, [position, map]);
  return null;
}

export default function DeliveryMap({
  deliveries = [],
  selectedDelivery = null,
  userId,
}) {
  const [rider, setRider] = useState({ lat: null, lng: null });

  // 🔥 AUTO-FETCH RIDER LOCATION EVERY 3 SECONDS
  useEffect(() => {
    if (!userId) return;

    const fetchRiderLocation = async () => {
      try {
        const res = await axios.get(`/rider/location/${userId}`);
        if (res.data?.lat && res.data?.lng) {
          setRider({ lat: res.data.lat, lng: res.data.lng });
        }
      } catch (err) {
        console.log("Failed to fetch rider location:", err);
      }
    };

    fetchRiderLocation(); // initial load
    const interval = setInterval(fetchRiderLocation, 3000);

    return () => clearInterval(interval);
  }, [userId]);

  // Default map center
  const initialCenter =
    rider.lat && rider.lng
      ? [rider.lat, rider.lng]
      : deliveries.length && deliveries[0].customerId.lat
      ? [deliveries[0].customerId.lat, deliveries[0].customerId.lng]
      : [14.5995, 120.9842];

  // Polyline route
  const routeCoordinates = [
    rider.lat && rider.lng ? [rider.lat, rider.lng] : null,
    ...deliveries
      .filter((d) => d.customerId.lat && d.customerId.lng)
      .map((d) => [d.customerId.lat, d.customerId.lng]),
  ].filter(Boolean);

  return (
    <div className="rounded-lg overflow-hidden shadow-md h-[60vh]">
      <MapContainer center={initialCenter} zoom={14} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Rider Marker */}
        {rider.lat && rider.lng && (
          <Marker position={[rider.lat, rider.lng]} icon={riderIcon}>
            <Popup>Rider Location (Live)</Popup>
          </Marker>
        )}

        {/* Delivery Markers */}
        {deliveries.map(
          (d, idx) =>
            d.customerId.lat &&
            d.customerId.lng && (
              <Marker
                key={idx}
                position={[d.customerId.lat, d.customerId.lng]}
                icon={greenIcon}
              >
                <Popup>
                  <div>
                    <div className="font-semibold">{d.customerId.name}</div>
                    <div className="text-xs">{d.customerId.address}</div>
                    <div className="text-xs">
                      {d.amount ? `₱${d.amount}` : ""}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
        )}

        {/* Polyline */}
        {routeCoordinates.length > 1 && (
          <Polyline positions={routeCoordinates} color="blue" weight={4} />
        )}

        {/* Recenter on selected delivery */}
        {selectedDelivery &&
          selectedDelivery.customerId.lat &&
          selectedDelivery.customerId.lng && (
            <Recenter
              position={[
                selectedDelivery.customerId.lat,
                selectedDelivery.customerId.lng,
              ]}
            />
          )}
      </MapContainer>
    </div>
  );
}
