import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public", "data", "turkey-agriculture-areas.geojson");
const mebSource =
  "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page30.html";

const districts = [
  {
    name: "Anamur",
    query: "Anamur, Mersin, Türkiye",
    osmId: 1827892,
  },
  {
    name: "Alanya",
    query: "Alanya, Antalya, Türkiye",
    osmId: 1726977,
  },
];

async function districtGeometry(district) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("polygon_geojson", "1");
  url.searchParams.set("polygon_threshold", "0.0005");
  url.searchParams.set("limit", "5");
  url.searchParams.set("q", district.query);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Codex-KPSS-Geography-Audit/1.0",
      "Accept-Language": "tr",
    },
  });
  if (!response.ok) throw new Error(`${district.name}: Nominatim ${response.status}`);
  const results = await response.json();
  const match = results.find(
    (item) =>
      item.osm_type === "relation" &&
      Number(item.osm_id) === district.osmId &&
      ["Polygon", "MultiPolygon"].includes(item.geojson?.type),
  );
  if (!match) throw new Error(`${district.name}: idari sınır bulunamadı`);
  return match.geojson;
}

function polygonParts(geometry) {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

const geometries = [];
for (const district of districts) {
  geometries.push(await districtGeometry(district));
  await new Promise((resolve) => setTimeout(resolve, 1100));
}

const featureCollection = {
  type: "FeatureCollection",
  name: "MEB Tarım Ürünleri Gerçek İlçe Alanları",
  features: [
    {
      type: "Feature",
      id: "banana-anamur-alanya",
      properties: {
        id: "banana-anamur-alanya",
        name: "Muz · Anamur-Alanya",
        source: "MEB + OpenStreetMap",
        source_url: mebSource,
        boundary_urls: districts.map(
          (district) => `https://www.openstreetmap.org/relation/${district.osmId}`,
        ),
        geometry_note:
          "MEB'in muz için verdiği Akdeniz mikroklima odağı; Anamur ve Alanya ilçe idari sınırlarının birleşimi",
      },
      geometry: {
        type: "MultiPolygon",
        coordinates: geometries.flatMap(polygonParts),
      },
    },
  ],
};

fs.writeFileSync(output, JSON.stringify(featureCollection));
console.log(`Yazıldı: ${output} (${featureCollection.features.length} alan)`);
