// app/components/MapComponent.tsx
"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type LatLng = { lat: number; lng: number };
export type MapHandle = {
  computeRoute: () => Promise<{ distance: number; duration: number } | null>;
  clearMap: () => void;
};
type Props = { onPointsChange?: (points: LatLng[]) => void };

// Custom marker icon
const defaultIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapComponent = forwardRef<MapHandle, Props>(({ onPointsChange }, ref) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const pointsRef = useRef<LatLng[]>([]);

  const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;

  useImperativeHandle(ref, () => ({
    computeRoute: async () => {
      if (pointsRef.current.length < 2) return null;
      if (!apiKey) {
        alert("Missing ORS API key!");
        return null;
      }

      const start = [pointsRef.current[0].lng, pointsRef.current[0].lat];
      const end = [pointsRef.current[1].lng, pointsRef.current[1].lat];

      try {
        const res = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`
        );

        if (!res.ok) throw new Error("Route fetch failed");
        const data = await res.json();

        const coords = data.features[0].geometry.coordinates;
        const latLngs = coords.map(([lon, lat]: number[]) => L.latLng(lat, lon));
        const summary = data.features[0].properties.summary;

        // Remove old route
        routeLayerRef.current?.remove();

        // Draw new route
        routeLayerRef.current = L.polyline(latLngs, { color: "blue", weight: 5 }).addTo(
          mapRef.current!
        );

        // Fit bounds
        mapRef.current!.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40] });

        return {
          distance: summary.distance / 1000,
          duration: summary.duration / 60,
        };
      } catch (err) {
        console.error(err);
        alert("Failed to fetch route");
        return null;
      }
    },

    clearMap: () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      routeLayerRef.current?.remove();
      routeLayerRef.current = null;
      pointsRef.current = [];
      onPointsChange?.([]);
    },
  }));

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map", { center: [6.3392, 5.6174], zoom: 13 });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors',
    }).addTo(map);

    // Add click markers
    map.on("click", (e: L.LeafletMouseEvent) => {
      const latlng = { lat: e.latlng.lat, lng: e.latlng.lng };

      if (pointsRef.current.length >= 2) {
        markersRef.current.shift()?.remove();
        pointsRef.current.shift();
      }

      const marker = L.marker([latlng.lat, latlng.lng], { icon: defaultIcon }).addTo(map);
      markersRef.current.push(marker);
      pointsRef.current.push(latlng);

      onPointsChange?.([...pointsRef.current]);
    });

    // Force Leaflet to recalc size
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onPointsChange]);

  return <div id="map" className="h-screen w-full lg:h-[90%] my-auto md:rounded-2xl lg:rounded-2xl shadow-lg relative" />;
});

MapComponent.displayName = "MapComponent";
export default MapComponent;
