import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import DeliveryMap from "../components/DeliveryMap";
import DeliveryList from "../components/DeliveryList";
import DeliveryProgress from "../components/DeliveryProgress";
import { useDeliveryStore } from "../stores/useDeliveryStore";
import { Navigation, Radio, MapPin, Phone, ShieldAlert, CheckCircle2, Volume2, Target } from "lucide-react";

// Helper: Extractor para sa Latitude at Longitude
const extractLatLng = (item) => {
  if (!item) return { lat: null, lng: null };

  let lat = item.lat ?? item.latitude ?? item.location?.lat ?? item.location?.latitude;
  let lng = item.lng ?? item.longitude ?? item.location?.lng ?? item.location?.longitude;

  if ((lat == null || lng == null) && Array.isArray(item.location?.coordinates)) {
    lng = item.location.coordinates[0];
    lat = item.location.coordinates[1];
  }

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  return {
    lat: !isNaN(parsedLat) ? parsedLat : null,
    lng: !isNaN(parsedLng) ? parsedLng : null,
  };
};

// Haversine Formula para sa distansya sa metro
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

  const audioAlarmRef = useRef(null);

  // Initial fetch at agad na kunin ang GPS location sa unang pasok
  useEffect(() => {
    fetchDeliveries();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setRiderLocation({
            lat: parseFloat(pos.coords.latitude),
            lng: parseFloat(pos.coords.longitude),
          });
        },
        (err) => console.error("Initial GPS Error:", err),
        { enableHighAccuracy: true }
      );
    }
  }, [fetchDeliveries]);

  // Unlock iOS Safari Audio
  const handleUnlockAudio = () => {
    if (!iosAudioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) iosAudioCtx = new AudioContext();
    }
    if (iosAudioCtx && iosAudioCtx.state === "suspended") {
      iosAudioCtx.resume();
    }
    
    if (audioAlarmRef.current) {
      audioAlarmRef.current.play().then(() => {
        audioAlarmRef.current.pause();
        audioAlarmRef.current.currentTime = 0;
        setIsAudioUnlocked(true);
      }).catch((error) => console.log("Audio unlock retry needed:", error));
    }

    if ("speechSynthesis" in window) {
      const dummyUtterance = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(dummyUtterance);
    }
  };

  const triggerAudioBeep = () => {
    try {
      if (!iosAudioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        iosAudioCtx = new AudioContext();
      }
      if (iosAudioCtx.state === "suspended") iosAudioCtx.resume();

      const oscillator = iosAudioCtx.createOscillator();
      const gainNode = iosAudioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, iosAudioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.3, iosAudioCtx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(iosAudioCtx.destination);

      oscillator.start();
      oscillator.stop(iosAudioCtx.currentTime + 0.6);
    } catch (e) {
      console.error("iOS Audio Error:", e);
    }
  };

  // REAL-TIME GPS WATCHER & PROXIMITY TRIGGER
  useEffect(() => {
    let watchId;
    if (navigator.geolocation && isTracking) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const currentLat = parseFloat(pos.coords.latitude);
          const currentLng = parseFloat(pos.coords.longitude);

          if (!isNaN(currentLat) && !isNaN(currentLng)) {
            setRiderLocation({ lat: currentLat, lng: currentLng });
          }

          // Proximity check para sa pop-up
          if (deliveries && deliveries.length > 0) {
            deliveries.forEach((item) => {
              const { lat: itemLat, lng: itemLng } = extractLatLng(item);

              if (itemLat != null && itemLng != null) {
                const dist = calculateDistance(currentLat, currentLng, itemLat, itemLng);

                if (dist <= 150 && !alertedIds.has(item._id) && item.status !== "completed") {
                  if (audioAlarmRef.current) {
                    audioAlarmRef.current.play().catch(e => console.log("Audio play blocked", e));
                  }
                  triggerAudioBeep();

                  if ("speechSynthesis" in window) {
                    const utterance = new SpeechSynthesisUtterance(
                      `Malapit ka na kay ${item.customerName || item.name || "Customer"}. Ihanda ang parcel.`
                    );
                    utterance.lang = "tl-PH";
                    window.speechSynthesis.speak(utterance);
                  }

                  setActiveProximityAlert({ ...item, distanceMeters: dist });
                  setAlertedIds((prev) => new Set(prev).add(item._id));
                }
              }
            });
          }
        },
        (err) => console.error("GPS Tracking Error:", err),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, deliveries, alertedIds]);

  // 🎯 STRICT REAL-TIME DISTANCE SORTING (Inuuna ang pinakamalapit sa rider)
  const sortedDeliveries = useMemo(() => {
    if (!deliveries) return [];

    const activeDeliveries = deliveries.filter(
      (item) => item.status !== "completed" && item.status !== "returned"
    );

    return [...activeDeliveries]
      .map((item) => {
        const { lat: itemLat, lng: itemLng } = extractLatLng(item);
        const hasValidCoords = itemLat != null && itemLng != null;

        let distanceMeters = Infinity;
        if (hasValidCoords && riderLocation?.lat != null && riderLocation?.lng != null) {
          distanceMeters = calculateDistance(
            riderLocation.lat,
            riderLocation.lng,
            itemLat,
            itemLng
          );
        }

        return {
          ...item,
          lat: itemLat,
          lng: itemLng,
          distanceMeters,
          hasValidCoords,
        };
      })
      .sort((a, b) => {
        if (a.hasValidCoords && b.hasValidCoords) {
          return a.distanceMeters - b.distanceMeters; // Pinakamalapit ang mauuna
        }
        if (a.hasValidCoords && !b.hasValidCoords) return -1;
        if (!a.hasValidCoords && b.hasValidCoords) return 1;
        return 0;
      });
  }, [deliveries, riderLocation]);

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
          lat: parseFloat(pos.coords.latitude),
          lng: parseFloat(pos.coords.longitude),
        });
      });
    }
  }, []);

  const markAsDelivered = (deliveryId, paymentType) => {
    const found = deliveries.find((d) => d._id === deliveryId);
    if (!found) return;

    const deliveredItem = {
      ...found,
      status: "completed",
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
      className="p-3 sm:p-6 max-w-7xl mx-auto space-y-5 relative pb-28"
    >
      <audio 
        ref={audioAlarmRef} 
        src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" 
        preload="auto" 
      />

      {/* iOS Audio Activation Banner */}
      {!isAudioUnlocked && (
        <div className="bg-primary/10 border border-primary/30 text-primary p-3 rounded-2xl text-xs flex justify-between items-center shadow-md animate-pulse">
          <span className="flex items-center gap-2 font-bold">
            <Volume2 size={16} /> Tap anywhere to enable iPhone audio & voice alerts
          </span>
          <button onClick={handleUnlockAudio} className="btn btn-xs btn-primary rounded-xl px-3 font-bold">
            Enable Audio
          </button>
        </div>
      )}

      {/* Header Status Bar (Rider App Vibe) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-base-100 p-4 sm:p-5 rounded-3xl border border-base-200 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
            <Radio size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`relative flex h-2.5 w-2.5`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isTracking ? 'bg-success' : 'bg-warning'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isTracking ? 'bg-success' : 'bg-warning'}`}></span>
              </span>
              <h1 className="text-lg font-black tracking-tight">Rider Smart Dispatch Radar</h1>
            </div>
            <p className="text-xs text-base-content/60">Live proximity tracking & automated nearest-route queue</p>
          </div>
        </div>

        <button
          onClick={() => {
            handleUnlockAudio();
            setIsTracking(!isTracking);
          }}
          className={`btn btn-sm rounded-xl font-bold gap-2 normal-case px-4 ${isTracking ? 'btn-success text-white shadow-md shadow-success/20' : 'btn-warning text-white'}`}
        >
          {isTracking ? "🟢 Live GPS Radar Active" : "⏸️ Tracking Paused"}
        </button>
      </div>

      <DeliveryProgress
        total={deliveries.length + completedCount}
        completed={completedCount}
      />

      {/* Map Section */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
            <Navigation className="text-primary" size={20} /> Live Route Radar
          </h2>
          <button
            className="btn btn-sm btn-primary rounded-xl px-4 gap-1.5 font-bold shadow-md shadow-primary/20"
            onClick={handleRecenter}
          >
            <Target size={15} /> Recenter GPS
          </button>
        </div>

        <div className="relative z-0 rounded-3xl overflow-hidden border border-base-200 shadow-xl">
          <DeliveryMap
            deliveries={sortedDeliveries}
            selectedDelivery={selectedDelivery}
            riderLocation={riderLocation}
          />
        </div>
      </section>

      {/* Queue Section */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              Deliveries Queue
            </h2>
            <span className="badge badge-primary font-mono text-xs font-bold px-2.5 py-2">
              {sortedDeliveries.length} Active
            </span>
          </div>
          <span className="text-[11px] font-mono badge badge-ghost font-bold text-primary">
            ⚡ Auto-Sorted by Nearest
          </span>
        </div>

        <DeliveryList
          deliveries={sortedDeliveries}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-base-100 border-2 border-primary w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-base-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="badge badge-error animate-pulse text-white font-black text-xs px-3 py-2">
                  🚨 NEARBY DROP-OFF
                </span>
                <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
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

            <div className="space-y-1.5 bg-base-200/50 p-4 rounded-2xl border border-base-200">
              <h3 className="text-xl font-black text-base-content">
                {activeProximityAlert.customerName || activeProximityAlert.name || "Customer Name"}
              </h3>
              <p className="text-sm text-base-content/80 flex items-center gap-1.5 font-medium">
                <MapPin size={15} className="text-primary shrink-0" /> {activeProximityAlert.address || "Address unavailable"}
              </p>
              <p className="text-xs text-primary font-bold pt-1">
                📦 Parcel Details: {activeProximityAlert.parcelDetails || "Standard Package"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => {
                  const { lat, lng } = extractLatLng(activeProximityAlert);
                  openExternalNavigation(lat, lng);
                }}
                className="btn btn-outline btn-primary btn-sm rounded-xl gap-1.5 font-bold h-11"
              >
                🗺️ Open Maps
              </button>

              <a
                href={`tel:${activeProximityAlert.phone || ""}`}
                className="btn btn-outline btn-secondary btn-sm rounded-xl gap-1.5 font-bold h-11"
              >
                <Phone size={15} /> Call Customer
              </a>
            </div>

            <button
              onClick={() => markAsDelivered(activeProximityAlert._id, "COD")}
              className="btn btn-success btn-block rounded-xl text-white font-bold text-base shadow-lg shadow-success/20 h-12 normal-case gap-2"
            >
              <CheckCircle2 size={20} /> Mark as Delivered (Cash / GCash)
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Dashboard;