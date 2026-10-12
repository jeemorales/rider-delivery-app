import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import DeliveryMap from "../components/DeliveryMap";
import DeliveryList from "../components/DeliveryList";
import DeliveryProgress from "../components/DeliveryProgress";
import { useDeliveryStore } from "../stores/useDeliveryStore";

// Helper: Haversine Formula para sa distansya (in meters)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000;
};

// Global AudioContext for iOS Safari Compatibility
let iosAudioCtx = null;

const Dashboard = () => {
  const {
    deliveries,
    completedCount,
    setDeliveries,
    fetchDeliveries,
  } = useDeliveryStore();

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(true);
  const [alertedIds, setAlertedIds] = useState(new Set());
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [activeProximityAlert, setActiveProximityAlert] = useState(null);

  // Reference for the HTML audio element (Fixed Audio Implementation)
  const audioAlarmRef = useRef(null);

  // Load initial deliveries
  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  // Unlock iOS Safari Audio restriction on first user tap
  const handleUnlockAudio = () => {
    if (!iosAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        iosAudioCtx = new AudioContext();
      }
    }
    if (iosAudioCtx && iosAudioCtx.state === "suspended") {
      iosAudioCtx.resume();
    }
    
    // Fixed: Initialize HTML audio element upon first interaction to unlock it
    if (audioAlarmRef.current) {
      audioAlarmRef.current.play().then(() => {
        // Successful dummy play, audio is now unlocked for this tab
        audioAlarmRef.current.pause();
        audioAlarmRef.current.currentTime = 0;
        setIsAudioUnlocked(true);
      }).catch((error) => {
        console.log("Audio unlock failed, will try on next tap.", error);
      });
    }

    // Still include dummy utterance as a fallback for voice synthesis
    if ("speechSynthesis" in window) {
      const dummyUtterance = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(dummyUtterance);
    }
  };

  // REAL-TIME GPS TRACKING & PROXIMITY TRIGGER (Fixed: Immediate Real-time Sorting)
  useEffect(() => {
    let watchId;
    if (navigator.geolocation && isTracking) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const currentLat = pos.coords.latitude;
          const currentLng = pos.coords.longitude;
          const newLoc = { lat: currentLat, lng: currentLng };

          setRiderLocation(newLoc);

          // Calculate distance and update sorting IMMEDIATELY in state, without waiting for useMemo
          setDeliveries((prevDeliveries) => {
            if (!prevDeliveries) return [];
            
            // Map the distances based on the NEW location
            const updated = prevDeliveries.map((item) => {
              const itemLat = item.location?.lat ?? item.lat;
              const itemLng = item.location?.lng ?? item.lng;
              const hasValidCoords = itemLat != null && itemLng != null;
              const distanceMeters = hasValidCoords
                ? calculateDistance(currentLat, currentLng, itemLat, itemLng)
                : Infinity;

              return { ...item, distanceMeters, hasValidCoords };
            });

            // Re-order the entire list instantly
            return updated.sort((a, b) => {
              if (a.hasValidCoords && b.hasValidCoords) {
                return a.distanceMeters - b.distanceMeters;
              }
              if (a.hasValidCoords && !b.hasValidCoords) return -1;
              if (!a.hasValidCoords && b.hasValidCoords) return 1;
              return 0;
            });
          });

          // Proximity Alerts logic
          // (Wait for state update to trigger these to avoid race conditions with setDeliveries)
          setTimeout(() => {
            useDeliveryStore.getState().deliveries.forEach((item) => {
              if (item.hasValidCoords && item.distanceMeters <= 150 && !alertedIds.has(item._id)) {
                // Play HTML Beep Sound
                if (audioAlarmRef.current) {
                  audioAlarmRef.current.play().catch(e => console.log("Proximity audio blocked.", e));
                }

                // Speak via iOS Speech Synthesis
                if ("speechSynthesis" in window) {
                  const utterance = new SpeechSynthesisUtterance(
                    `Malapit ka na kay ${item.customerName || "Customer"}. Ihanda ang parcel.`
                  );
                  utterance.lang = "tl-PH";
                  window.speechSynthesis.speak(utterance);
                }

                // Show Grab-Style Pop-up Modal
                setActiveProximityAlert({ ...item, distanceMeters: item.distanceMeters });
                setAlertedIds((prev) => new Set(prev).add(item._id));
              }
            });
          }, 100);

        },
        (err) => console.error("iOS GPS Tracking Error:", err),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, alertedIds, setDeliveries]);

  // SMART SORTING (Removed as logic was moved into watchPosition state update)
  // We use the raw 'deliveries' state directly now because it is already sorted by watchPosition.

  // Navigation Intent for iOS (Opens Apple Maps / Google Maps)
  const openExternalNavigation = (lat, lng) => {
    if (lat && lng) {
      window.open(`https://maps.apple.com/?daddr=${lat},${lng}`, "_blank");
    }
  };

  const handleRecenter = useCallback(() => {
    handleUnlockAudio();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setRiderLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });
    }
  }, []);

  const markAsDelivered = (deliveryId, paymentType) => {
    const found = deliveries.find((d) => d._id === deliveryId);
    if (!found) return;

    const deliveredItem = {
      ...found,
      deliveredAt: new Date().toISOString(),
      paymentType,
    };

    setDeliveries(
      deliveries.map((d) => (d._id === deliveryId ? deliveredItem : d))
    );
    setActiveProximityAlert(null);
  };

  return (
    <main 
      onClick={handleUnlockAudio} 
      className="p-3 md:p-6 max-w-6xl mx-auto space-y-4 relative"
    >
      {/* Fixed: Invisible HTML Audio Element */}
      <audio 
        ref={audioAlarmRef} 
        src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" 
        preload="auto" 
      />

      {/* iOS Safari Audio Status Banner */}
      {!isAudioUnlocked && (
        <div className="bg-primary/10 border border-primary text-primary p-2.5 rounded-xl text-xs flex justify-between items-center">
          <span>🔊 Tap anywhere to enable iPhone audio & voice alerts</span>
          <button onClick={handleUnlockAudio} className="btn btn-xs btn-primary">Enable Audio</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-base-100 p-3 rounded-xl border border-base-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isTracking ? 'bg-success' : 'bg-warning'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isTracking ? 'bg-success' : 'bg-warning'}`}></span>
          </span>
          <h1 className="text-base font-bold">Rider Smart Dispatch Radar</h1>
        </div>

        <button
          onClick={() => {
            handleUnlockAudio();
            setIsTracking(!isTracking);
          }}
          className={`btn btn-xs ${isTracking ? 'btn-outline btn-success' : 'btn-outline btn-warning'}`}
        >
          {isTracking ? "🟢 Live GPS Radar Active" : "⏸️ Tracking Paused"}
        </button>
      </div>

      <DeliveryProgress
        total={deliveries.length + completedCount}
        completed={completedCount}
      />

      {/* Map Section */}
      <section className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Live Route Radar</h2>
          <button
            className="btn btn-sm btn-primary shadow-sm"
            onClick={handleRecenter}
          >
            🎯 Recenter
          </button>
        </div>

        <div className="relative z-0 rounded-xl overflow-hidden border border-base-200">
          <DeliveryMap
            deliveries={deliveries} // Using direct, watchPosition-sorted deliveries
            selectedDelivery={selectedDelivery}
            riderLocation={riderLocation}
          />
        </div>
      </section>

      {/* Queue Section (Fixed: Dynamically updates real-time) */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">
            Deliveries Queue ({deliveries.length})
          </h2>
          <span className="text-xs badge badge-primary font-mono">
            Auto-Sorted by Nearest
          </span>
        </div>

        <DeliveryList
          deliveries={deliveries} // Using direct, watchPosition-sorted deliveries
          onSelectDelivery={(d) => {
            handleUnlockAudio();
            setSelectedDelivery(d);
          }}
          onMarkDelivered={markAsDelivered}
          onDeliveriesUpdate={setDeliveries}
        />
      </section>

      {/* 🚨 PROXIMITY POP-UP MODAL */}
      {activeProximityAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-base-100 border-2 border-primary w-full max-w-lg rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="badge badge-error animate-pulse text-white font-bold">
                  NEARBY DROP-OFF
                </span>
                <span className="text-xs font-mono font-bold text-primary">
                  {Math.round(activeProximityAlert.distanceMeters || 100)}m Away
                </span>
              </div>
              <button
                onClick={() => setActiveProximityAlert(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-base-content">
                {activeProximityAlert.customerName || "Customer Name"}
              </h3>
              <p className="text-sm text-base-content/70">
                📍 {activeProximityAlert.address || "Address unavailable"}
              </p>
              <p className="text-xs text-primary font-bold mt-1">
                📦 Parcel Details: {activeProximityAlert.parcelDetails || "Standard Package"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  const lat = activeProximityAlert.location?.lat ?? activeProximityAlert.lat;
                  const lng = activeProximityAlert.location?.lng ?? activeProximityAlert.lng;
                  openExternalNavigation(lat, lng);
                }}
                className="btn btn-outline btn-primary btn-sm w-full gap-1"
              >
                🗺️ Apple Maps
              </button>

              <a
                href={`tel:${activeProximityAlert.phone || ""}`}
                className="btn btn-outline btn-secondary btn-sm w-full gap-1"
              >
                📞 Call Customer
              </a>
            </div>

            <button
              onClick={() => markAsDelivered(activeProximityAlert._id, "COD")}
              className="btn btn-success btn-block text-white font-bold text-base shadow-lg"
            >
              ✅ Mark as Delivered
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
