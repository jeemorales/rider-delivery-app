import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

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

// AUTO-FOCUS MAP POSITION
function AutoFocus({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16, { animate: true });
    }
  }, [position, map]);
  return null;
}

export default function DeliveryMap({ deliveries = [], selectedDelivery = null, riderLocation = null }) {
  const initialCenter =
    riderLocation?.lat
      ? [riderLocation.lat, riderLocation.lng]
      : deliveries.length && deliveries[0].customerId.lat
      ? [deliveries[0].customerId.lat, deliveries[0].customerId.lng]
      : [14.5995, 120.9842];

  const routeCoordinates = [
    riderLocation?.lat ? [riderLocation.lat, riderLocation.lng] : null,
    ...deliveries
      .filter((d) => d.customerId.lat && d.customerId.lng)
      .map((d) => [d.customerId.lat, d.customerId.lng]),
  ].filter(Boolean);

  return (
    <div className="rounded-lg overflow-hidden shadow-md h-[60vh]">
      <MapContainer center={initialCenter} zoom={13} className="w-full h-full">
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Rider Marker */}
        {riderLocation?.lat && (
          <>
            <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
              <Popup>Rider Location</Popup>
            </Marker>

            {/* Auto-focus rider */}
            <AutoFocus position={[riderLocation.lat, riderLocation.lng]} />
          </>
        )}

        {/* Delivery Markers */}
        {deliveries.map((d, i) =>
          d.customerId.lat ? (
            <Marker
              key={i}
              position={[d.customerId.lat, d.customerId.lng]}
              icon={greenIcon}
            >
              <Popup>
                <div className="font-semibold">{d.customerId.name}</div>
                <div className="text-xs">{d.customerId.address}</div>
                <div className="text-xs">{d.amount ? `₱${d.amount}` : ""}</div>
              </Popup>
            </Marker>
          ) : null
        )}

        {/* Auto-focus selected receiver */}
        {selectedDelivery?.customerId.lat && (
          <AutoFocus
            position={[
              selectedDelivery.customerId.lat,
              selectedDelivery.customerId.lng,
            ]}
          />
        )}

        {/* Polyline path */}
        {routeCoordinates.length > 1 && (
          <Polyline positions={routeCoordinates} color="blue" weight={4} />
        )}
      </MapContainer>
    </div>
  );
}
