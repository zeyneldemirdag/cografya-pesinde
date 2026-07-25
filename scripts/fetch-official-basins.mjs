import fs from "node:fs/promises";

const SOURCE_URL =
  "https://cbs1.tarimorman.gov.tr/server/rest/services/TATUS_TEST/MapServer/11/query?where=1%3D1&outFields=*&outSR=4326&f=geojson";

const TARGETS = new Map([
  [25, { id: "van-basin", name: "Van Gölü Kapalı Havzası" }],
  [16, { id: "konya-closed-basin", name: "Tuz Gölü-Konya Kapalı Havzası" }],
  [10, { id: "burdur-basin", name: "Göller Yöresi-Burdur Kapalı Havzası" }],
  [11, { id: "akaracay-basin", name: "Akşehir-Eber (Akarçay) Kapalı Havzası" }],
  [24, { id: "aras-basin", name: "Aras-Kura (Hazar Denizi) Havzası" }],
]);

const sqDistance = (left, right) => {
  const dx = left[0] - right[0];
  const dy = left[1] - right[1];
  return dx * dx + dy * dy;
};

function sqSegmentDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = end[0];
      y = end[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

function simplifyStep(points, first, last, tolerance, simplified) {
  let maxDistance = tolerance;
  let index = 0;
  for (let cursor = first + 1; cursor < last; cursor += 1) {
    const distance = sqSegmentDistance(points[cursor], points[first], points[last]);
    if (distance > maxDistance) {
      index = cursor;
      maxDistance = distance;
    }
  }
  if (maxDistance <= tolerance) return;
  if (index - first > 1) simplifyStep(points, first, index, tolerance, simplified);
  simplified.push(points[index]);
  if (last - index > 1) simplifyStep(points, index, last, tolerance, simplified);
}

function simplifyRing(ring, tolerance = 0.00008) {
  const open = sqDistance(ring[0], ring.at(-1)) === 0 ? ring.slice(0, -1) : [...ring];
  if (open.length <= 4) return [...open, open[0]];
  const simplified = [open[0]];
  simplifyStep(open, 0, open.length - 1, tolerance, simplified);
  simplified.push(open.at(-1));
  if (simplified.length < 3) return [...open, open[0]];
  return [...simplified, simplified[0]];
}

function simplifyGeometry(geometry) {
  if (geometry.type === "Polygon") {
    return { ...geometry, coordinates: geometry.coordinates.map((ring) => simplifyRing(ring)) };
  }
  return {
    ...geometry,
    coordinates: geometry.coordinates.map((polygon) =>
      polygon.map((ring) => simplifyRing(ring)),
    ),
  };
}

const response = await fetch(SOURCE_URL);
if (!response.ok) throw new Error(`Resmî havza servisi ${response.status} döndürdü.`);
const source = await response.json();

const features = source.features
  .filter((feature) => TARGETS.has(feature.properties.ID))
  .map((feature) => {
    const target = TARGETS.get(feature.properties.ID);
    return {
      type: "Feature",
      properties: {
        id: target.id,
        name: target.name,
        sourceId: feature.properties.ID,
      },
      geometry: simplifyGeometry(feature.geometry),
    };
  })
  .sort((left, right) => left.properties.sourceId - right.properties.sourceId);

if (features.length !== TARGETS.size) {
  throw new Error(`Beklenen ${TARGETS.size} havzadan ${features.length} tanesi indirildi.`);
}

const output = {
  type: "FeatureCollection",
  name: "Türkiye kapalı havzaları · Tarım ve Orman Bakanlığı resmî CBS sınırları",
  source: SOURCE_URL,
  features,
};

await fs.writeFile(
  new URL("../public/data/turkey-closed-basins.geojson", import.meta.url),
  `${JSON.stringify(output)}\n`,
  "utf8",
);

console.log(`Resmî havza verisi yazıldı: ${features.length} havza.`);
