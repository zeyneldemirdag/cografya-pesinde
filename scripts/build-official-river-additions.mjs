import { writeFile } from "node:fs/promises";

const OUTPUT = new URL("../public/data/turkey-rivers-official-extra.geojson", import.meta.url);
const USER_AGENT = "CografyaPesinde/1.0 (KPSS geography map data builder)";
const specs = [
  {
    id: "harsit",
    name: "Harşit Çayı",
    osmRelationId: 15551155,
    classificationSource: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page83.html",
    classificationNote: "MEB · Karadeniz Havzası",
  },
  {
    id: "filyos",
    name: "Filyos (Yenice) Çayı",
    osmRelationId: 1224897,
    classificationSource: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page83.html",
    classificationNote: "MEB · Karadeniz Havzası",
  },
  {
    id: "bartin",
    name: "Bartın Çayı",
    osmRelationId: 17039552,
    classificationSource: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page83.html",
    classificationNote: "MEB · Karadeniz Havzası",
  },
  {
    id: "esen",
    name: "Eşen Çayı",
    osmRelationId: 1232828,
    classificationSource: "https://orgm.meb.gov.tr/ekpssmebozel/content/magazines/pdf/cografya2.pdf",
    classificationNote: "MEB · Akdeniz Havzası",
  },
  {
    id: "koprucay",
    name: "Köprüçay",
    osmRelationId: 8928598,
    classificationSource: "https://orgm.meb.gov.tr/ekpssmebozel/content/magazines/pdf/cografya2.pdf",
    classificationNote: "MEB · Akdeniz Havzası",
  },
];

async function relationGeometry(osmRelationId) {
  const url = new URL("https://nominatim.openstreetmap.org/lookup");
  url.search = new URLSearchParams({
    osm_ids: `R${osmRelationId}`,
    format: "geojson",
    polygon_geojson: "1",
  });
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Nominatim ${response.status}: R${osmRelationId}`);
  const data = await response.json();
  const geometry = data.features?.[0]?.geometry;
  if (!["LineString", "MultiLineString"].includes(geometry?.type)) {
    throw new Error(`Akarsu çizgisi bulunamadı: R${osmRelationId}`);
  }
  return geometry.type === "LineString"
    ? { type: "MultiLineString", coordinates: [geometry.coordinates] }
    : geometry;
}

const features = [];
for (const spec of specs) {
  const geometry = await relationGeometry(spec.osmRelationId);
  features.push({
    type: "Feature",
    properties: {
      id: spec.id,
      name: spec.name,
      source: "OpenStreetMap",
      source_url: `https://www.openstreetmap.org/relation/${spec.osmRelationId}`,
      classification_source: spec.classificationSource,
      classification_note: spec.classificationNote,
    },
    geometry,
  });
  console.log(`${spec.id}: ${geometry.type} (${geometry.coordinates.length} parça)`);
  await new Promise((resolve) => setTimeout(resolve, 1100));
}

await writeFile(OUTPUT, `${JSON.stringify({ type: "FeatureCollection", features })}\n`, "utf8");
console.log(`Yazıldı: ${OUTPUT.pathname} (${features.length} akarsu)`);
