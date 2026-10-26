import React from "react";
import { Truck, CheckCircle2 } from "lucide-react";

export default function DeliveryProgress({ total = 0, completed = 0 }) {
  // Compute remaining deliveries
  const remaining = Math.max(0, total - completed);
  const isCompletedAll = total > 0 && remaining === 0;

  return (
    <div className="w-full p-4 sm:p-5 bg-base-100 rounded-3xl border border-base-200/80 shadow-xs hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left Side: Icon & Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div 
            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 transition-all ${
              isCompletedAll 
                ? "bg-success/10 text-success" 
                : "bg-primary/10 text-primary"
            }`}
          >
            {isCompletedAll ? (
              <CheckCircle2 size={22} />
            ) : (
              <Truck size={22} className="animate-pulse" />
            )}
          </div>

          <div className="truncate">
            <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50 block">
              Remaining Drops
            </span>
            <h3 className="text-sm font-semibold text-base-content/70 truncate">
              {isCompletedAll ? "All items delivered!" : "Deliveries to complete"}
            </h3>
          </div>
        </div>

        {/* Right Side: Big Bold Count Badge */}
        <div className="shrink-0">
          <div 
            className={`px-4 py-2 rounded-2xl font-black text-lg sm:text-xl flex items-baseline gap-1 shadow-2xs ${
              isCompletedAll 
                ? "bg-success/15 text-success border border-success/20" 
                : "bg-primary text-white"
            }`}
          >
            <span>{remaining}</span>
            <span className="text-xs font-medium opacity-80">
              {remaining === 1 ? "parcel" : "parcels"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}