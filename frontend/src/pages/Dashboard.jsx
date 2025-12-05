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

  const [page, setPage] = useState("dashboard");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);

  // Load deliveries
  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Mark delivery as delivered
  const markAsDelivered = (deliveryId, paymentType) => {
    const found = deliveries.find((d) => d._id === deliveryId);
    if (!found) return;

    const deliveredItem = {
      ...found,
      deliveredAt: new Date().toISOString(),
      paymentType,
    };

    setDeliveries(prev =>
      prev.map(d => d._id === deliveryId ? deliveredItem : d)
    );
  };

  return (
    <div>
      <main className="p-3 md:p-6 max-w-6xl mx-auto space-y-4">
        {page === "dashboard" && (
          <>
            <DeliveryProgress
              total={deliveries.length + completedCount}
              completed={completedCount}
            />

            <section className="space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Map</h2>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) =>
                          setRiderLocation({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                          }),
                        (err) => alert("GPS Error: " + err.message)
                      );
                    } else alert("GPS not available");
                  }}
                >
                  My Location
                </button>
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
                onMarkDelivered={markAsDelivered}
                onDeliveriesUpdate={setDeliveries}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
