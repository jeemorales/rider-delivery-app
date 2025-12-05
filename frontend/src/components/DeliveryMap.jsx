import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Remove default icon URLs
delete L.Icon.Default.prototype._getIconUrl;

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

// Component to handle map movement
function MapController({ rider, selectedDelivery }) {
  const map = useMap();

  // Auto-follow rider location
  useEffect(() => {
    if (rider.lat && rider.lng) {
      map.setView([rider.lat, rider.lng], 15);
    }
  }, [rider]);

  // Focus on selected delivery marker
  useEffect(() => {
    if (selectedDelivery?.customerId.lat) {
      map.setView(
        [selectedDelivery.customerId.lat, selectedDelivery.customerId.lng],
        16
      );
    }
  }, [selectedDelivery]);

  return null;
}

export default function DeliveryMap({
  deliveries = [],
  selectedDelivery = null,
  riderLocation = null,
}) {
  const [rider, setRider] = useState({ lat: null, lng: null });

  useEffect(() => {
    if (riderLocation) setRider(riderLocation);
  }, [riderLocation]);

  // Default center
  const initialCenter = rider.lat
    ? [rider.lat, rider.lng]
    : deliveries.length
    ? [deliveries[0].customerId.lat, deliveries[0].customerId.lng]
    : [14.5995, 120.9842];

  // Route path (optional)
  const routeCoordinates = [
    rider.lat && rider.lng ? [rider.lat, rider.lng] : null,
    ...deliveries
      .filter((d) => d.customerId.lat)
      .map((d) => [d.customerId.lat, d.customerId.lng]),
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
        {rider.lat && rider.lng && (
          <Marker position={[rider.lat, rider.lng]} icon={riderIcon}>
            <Popup>Rider Location</Popup>
          </Marker>
        )}

        {/* Delivery Markers */}
        {deliveries.map((d, idx) =>
          d.customerId.lat ? (
            <Marker
              key={idx}
              position={[d.customerId.lat, d.customerId.lng]}
              icon={greenIcon}
            >
              <Popup>
                <div>
                  <div className="font-semibold">{d.customerId.name}</div>
                  <div className="text-xs">{d.customerId.address}</div>
                  <div className="text-xs">{d.amount ? `₱${d.amount}` : ""}</div>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}

        {routeCoordinates.length > 1 && (
          <Polyline positions={routeCoordinates} color="blue" weight={4} />
        )}
      </MapContainer>
    </div>
  );
}
