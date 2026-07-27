import { writeFile } from "node:fs/promises";

const OUTPUT = new URL("../public/data/turkey-natural-set-lakes.geojson", import.meta.url);
const USER_AGENT = "CografyaPesinde/1.0 (KPSS geography map data builder)";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const specs = [
  { id: "abant-set", name: "Abant Gölü", query: "Abant Gölü, Bolu, Türkiye", center: [31.277, 40.606], radius: 2500 },
  { id: "yedigoller-set", name: "Yedigöller", center: [31.748, 40.943], radius: 3200, group: true },
  { id: "borabay-set", name: "Boraboy Gölü", query: "Boraboy Gölü, Amasya, Türkiye", center: [36.14, 40.805], radius: 2500 },
  { id: "zinav-set", name: "Zinav Gölü", query: "Zinav Gölü, Tokat, Türkiye", center: [37.2725, 40.448], radius: 2500 },
  { id: "sera-set", name: "Sera Gölü", query: "Sera Gölü, Akçaabat, Trabzon, Türkiye", center: [39.61, 40.982], radius: 1800 },
  { id: "tortum-set", name: "Tortum Gölü", query: "Tortum Gölü, Erzurum, Türkiye", center: [41.6356, 40.6248], radius: 7000 },
  { id: "marmara-set", name: "Marmara Gölü", query: "Marmara Gölü, Manisa, Türkiye", center: [27.9, 38.62], radius: 9000 },
  { id: "bafa-set", name: "Bafa (Çamiçi) Gölü", query: "Bafa Gölü, Aydın, Türkiye", center: [27.45, 37.5], radius: 9000 },
  { id: "koycegiz-set", name: "Köyceğiz Gölü", query: "Köyceğiz Gölü, Muğla, Türkiye", center: [28.63, 36.9], radius: 9000 },
  { id: "uzungol-set", name: "Uzungöl", query: "Uzungöl, Çaykara, Trabzon, Türkiye", center: [40.3, 40.62], radius: 2200 },
  { id: "eymir-set", name: "Eymir Gölü", query: "Eymir Gölü, Ankara, Türkiye", center: [32.84, 39.83], radius: 3500 },
  { id: "mogan-set", name: "Mogan Gölü", query: "Mogan Gölü, Ankara, Türkiye", center: [32.78, 39.77], radius: 6500 },
  { id: "buyukcekmece-set", name: "Büyükçekmece Gölü", query: "Büyükçekmece Gölü, İstanbul, Türkiye", center: [28.57, 41.04], radius: 7500 },
  { id: "kucukcekmece-set", name: "Küçükçekmece Gölü", query: "Küçükçekmece Gölü, İstanbul, Türkiye", center: [28.74, 41.0], radius: 6000 },
  { id: "durusu-set", name: "Durusu (Terkos) Gölü", query: "Durusu Gölü, İstanbul, Türkiye", center: [28.57, 41.35], radius: 9000 },
  { id: "akyatan-set", name: "Akyatan Lagünü", query: "Akyatan Gölü, Adana, Türkiye", center: [35.3, 36.6], radius: 9000 },
];

function ringArea(ring) {
  return Math.abs(ring.reduce((sum, [x, y], index) => {
    const [nextX, nextY] = ring[(index + 1) % ring.length];
    return sum + x * nextY - nextX * y;
  }, 0) / 2);
}

function polygonArea(geometry) {
  if (geometry.type === "Polygon") return ringArea(geometry.coordinates[0]);
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.reduce((sum, polygon) => sum + ringArea(polygon[0]), 0);
  }
  return 0;
}

async function searchPolygon(query) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({
    q: query,
    format: "geojson",
    polygon_geojson: "1",
    limit: "8",
    countrycodes: "tr",
  });
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`Nominatim ${response.status}: ${query}`);
  const collection = await response.json();
  return collection.features
    .filter((feature) => ["Polygon", "MultiPolygon"].includes(feature.geometry?.type))
    .sort((left, right) => polygonArea(right.geometry) - polygonArea(left.geometry))[0]?.geometry;
}

async function nearbyWaterPolygons([longitude, latitude], radius) {
  const query = `[out:json][timeout:60];way["natural"="water"](around:${radius},${latitude},${longitude});out geom;`;
  let data;
  let lastError;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": USER_AGENT,
        },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(75_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = await response.json();
      break;
    } catch (error) {
      lastError = error;
      console.warn(`Overpass yeniden denenecek (${endpoint}): ${error.message}`);
    }
  }
  if (!data) throw new Error(`Overpass başarısız: ${longitude},${latitude}; ${lastError?.message}`);
  return data.elements
    .filter((element) => element.type === "way" && element.geometry?.length >= 4)
    .map((element) => element.geometry.map((point) => [point.lon, point.lat]))
    .filter((ring) => {
      const [firstX, firstY] = ring[0];
      const [lastX, lastY] = ring.at(-1);
      return Math.abs(firstX - lastX) < 1e-7 && Math.abs(firstY - lastY) < 1e-7;
    })
    .sort((left, right) => ringArea(right) - ringArea(left));
}

async function buildFeature(spec) {
  let geometry;
  if (!spec.group) {
    geometry = await searchPolygon(spec.query);
    await delay(1100);
  }
  if (!geometry) {
    const rings = await nearbyWaterPolygons(spec.center, spec.radius);
    if (rings.length === 0) throw new Error(`Su poligonu bulunamadı: ${spec.name}`);
    geometry = spec.group
      ? { type: "MultiPolygon", coordinates: rings.slice(0, 12).map((ring) => [ring]) }
      : { type: "Polygon", coordinates: [rings[0]] };
  }
  return {
    type: "Feature",
    properties: {
      id: spec.id,
      name: spec.name,
      source: "OpenStreetMap",
      source_url: "https://www.openstreetmap.org/copyright",
    },
    geometry,
  };
}

const features = [];
for (const spec of specs) {
  const feature = await buildFeature(spec);
  features.push(feature);
  console.log(`${spec.id}: ${feature.geometry.type}`);
}

await writeFile(OUTPUT, `${JSON.stringify({ type: "FeatureCollection", features })}\n`, "utf8");
console.log(`Yazıldı: ${OUTPUT.pathname} (${features.length} göl)`);
