// app/components/Sidebar.tsx
"use client";

import React from "react";

type LatLng = { lat: number; lng: number };

type Props = {
  points: LatLng[];
  onCompute: () => void;
  onClear: () => void;
  loading?: boolean;
  distance?: number | null;
  duration?: number | null;
};

export default function Sidebar({
  points,
  onCompute,
  onClear,
  loading,
  distance,
  duration,
}: Props) {
  return (
    <aside className="z-50 w-full lg:w-72 bg-white/95 p-4 rounded-lg md:shadow-lg lg:shadow-lg space-y-4 sticky top-4 h-fit lg:h-[90vh]">
      <h2 className="text-lg font-semibold">Route Controls</h2>

      <div>
        <h3 className="text-sm font-medium text-gray-600">Selected Points</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {points.length === 0 && (
            <li className="text-gray-500">Click map to add points</li>
          )}
          {points.map((p, i) => (
            <li key={i} className="p-2 bg-gray-50 rounded border">
              <div className="font-medium">Point {i + 1}</div>
              <div className="text-xs text-gray-600">
                Lat: {p.lat.toFixed(6)}
              </div>
              <div className="text-xs text-gray-600">
                Lng: {p.lng.toFixed(6)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <button
          onClick={onCompute}
          disabled={points.length < 2 || loading}
          className="w-full py-2 px-3 bg-blue-600 disabled:bg-blue-300 text-white rounded"
        >
          {loading ? "Computing..." : "Compute Route"}
        </button>

        <button
          onClick={onClear}
          className="w-full py-2 px-3 border border-gray-300 rounded text-gray-700"
        >
          Clear Map
        </button>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-600">Route Summary</h3>
        {distance == null ? (
          <p className="text-sm text-gray-500 mt-2">No route computed yet.</p>
        ) : (
          <div className="mt-2 text-sm">
            <div>
              Distance:{" "}
              <span className="font-medium">{distance.toFixed(2)} km</span>
            </div>
            <div>
              Estimated time:{" "}
              <span className="font-medium">
                {duration != null ? duration.toFixed(2) : "--"} mins
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
