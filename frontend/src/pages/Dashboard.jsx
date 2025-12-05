import React, { useEffect, useState } from "react";
import DeliveryMap from "../components/DeliveryMap";
import DeliveryList from "../components/DeliveryList";
import DeliveryProgress from "../components/DeliveryProgress";
import { useDeliveryStore } from "../stores/useDeliveryStore";

const Dashboard = () => {
  const {
    deliveries,
    completedCount,
    setDeliveries,
    fetchDeliveries,
    loading
  } = useDeliveryStore();

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [tracking, setTracking] = useState(false);

  // Load deliveries
  useEffect(() => {
    fetchDeliveries();
  }, []);

  // AUTO-TRACK RIDER LOCATION
  useEffect(() => {
    if (!tracking) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setRiderLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        alert("GPS Error: " + err.message);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [tracking]);

  const handleShowMyLocation = () => {
    setTracking(true);
    alert("Tracking started! Your location will auto-update.");
  };

  return (
    <div>
      <main className="p-3 md:p-6 max-w-6xl mx-auto space-y-4">
        <DeliveryProgress
          total={deliveries.length + completedCount}
          completed={completedCount}
        />

        <section className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Map</h2>

            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-primary"
                onClick={handleShowMyLocation}
              >
                My Location
              </button>

              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  if (!selectedDelivery) return alert("Select a delivery first!");
                  setRiderLocation(null);
                }}
              >
                Show Receiver
              </button>
            </div>
          </div>

          <DeliveryMap
            deliveries={deliveries}
            selectedDelivery={selectedDelivery}
            riderLocation={riderLocation}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Deliveries</h2>
          <DeliveryList
            deliveries={deliveries}
            onSelectDelivery={(d) => setSelectedDelivery(d)}
            onMarkDelivered={() => {}}
          />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
