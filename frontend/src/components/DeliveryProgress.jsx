import React from "react";
export default function DeliveryProgress({ total = 0, completed = 0 }) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="w-full p-2 bg-base-200 rounded-lg mb-2">
      <div className="flex justify-between mb-1 text-sm font-medium">
        <span>Deliveries: {completed}/{total}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full h-3 bg-base-300 rounded-full">
        <div className="h-3 bg-primary rounded-full transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
