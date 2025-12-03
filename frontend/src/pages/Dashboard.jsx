import React, { useEffect, useState } from "react";
import DeliveryMap from "../components/DeliveryMap";
import DeliveryList from "../components/DeliveryList";
import DeliveryProgress from "../components/DeliveryProgress";
import CustomersPage from "../pages/CustomersPage";
import DeliveredPage from "../pages/DeliveredPage";
import { useDeliveryStore } from "../stores/useDeliveryStore";

const Dashboard = () => {
  const {
    deliveries,
    delivered,
    completedCount,
    setDeliveries,
    addDelivery,
    completeDelivery,
    fetchDeliveries,
    loading
  } = useDeliveryStore();

  const [nearestDeliveryId, setNearestDeliveryId] = useState(null);
  const [page, setPage] = useState("dashboard");

  // Optionally load deliveries from API on first load
  useEffect(() => {
    fetchDeliveries();
  }, []);


  const markAsDelivered = (deliveryId, paymentType) => {
    const found = deliveries.find((d) => d.id === deliveryId);
    if (!found) return;

    const deliveredItem = {
      ...found,
      deliveredAt: new Date().toISOString(),
      paymentType,
    };

    completeDelivery(deliveredItem);
  };

  // -------------------------------------
  // REORDER DELIVERIES (Drag + Drop)
  // -------------------------------------
  const handleDeliveriesUpdate = (updatedList) => {
    setDeliveries(updatedList);
  };
  console.log(deliveries)

  return (
    <div>
      <main className="p-3 md:p-6 max-w-6xl mx-auto space-y-4">
        {page === "dashboard" && (
          <>
            <DeliveryProgress
              total={deliveries.length + completedCount}
              completed={completedCount}
            />

            <section>
              <h2 className="text-lg font-semibold mb-2">Map</h2>
              <DeliveryMap
                deliveries={deliveries}
                // selectedDelivery={deliveries}
                // onNearestChange={setNearestDeliveryId}
              />
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Deliveries</h2>
              <DeliveryList
                deliveries={deliveries}
                nearestDeliveryId={nearestDeliveryId}
                onSelectDelivery={(d) => setSelectedDelivery(d)}
                onMarkDelivered={markAsDelivered}
                onDeliveriesUpdate={handleDeliveriesUpdate}
              />
            </section>
          </>
        )}

      
      </main>
    </div>
  );
};

export default Dashboard;
