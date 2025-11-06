// app/utils/fetchRoute.ts
export async function fetchRoute(start: number[], end: number[]) {
  const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
  if (!apiKey) throw new Error("Missing ORS API key");

  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ORS Error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const route = data.features?.[0];
  if (!route) throw new Error("No route found");

  const coords = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
  const summary = route.properties.summary || route.properties;

  // ✅ Convert meters → km, seconds → minutes
  const distanceKm = summary.distance ? summary.distance : 0;
  const durationMin = summary.duration ? summary.duration : 0;

  return {
    coords,
    summary: {
      distance: distanceKm,
      duration: durationMin,
    },
  };
}
