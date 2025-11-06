// app/page.tsx
"use client";

import React, { useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const MapComponent = dynamic(() => import("./components/MapComponent"), { ssr: false });

export default function HomePage() {
  const mapRef = useRef<any>(null);
  const [points, setPoints] = useState<{ lat: number; lng: number }[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompute = async () => {
    if (!mapRef.current) return;
    setLoading(true);
    try {
      const res = await mapRef.current.computeRoute();
      if (res) {
        setDistance(res.distance);
        setDuration(res.duration);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    mapRef.current?.clearMap?.();
    setPoints([]);
    setDistance(null);
    setDuration(null);
  };

  return (
    <main className="min-h-screen flex flex-col md-grid md:grid-cols-[300px_1fr] lg:grid grid-cols-[300px_1fr] space-y-6 lg:space-y-0">
      <Sidebar
        points={points}
        onCompute={handleCompute}
        onClear={handleClear}
        loading={loading}
        distance={distance}
        duration={duration}
      />
      <MapComponent ref={mapRef} onPointsChange={setPoints} />
    </main>
  );
}
