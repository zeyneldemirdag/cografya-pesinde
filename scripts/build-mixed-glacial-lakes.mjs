import { writeFile } from "node:fs/promises";

const OUTPUT = new URL("../public/data/turkey-mixed-glacial-lakes.geojson", import.meta.url);
const USER_AGENT = "CografyaPesinde/1.0 (KPSS geography map data builder)";
const specs = [
  {
    id: "yarisli",
    name: "Yarışlı Gölü",
    query: "Yarışlı Gölü, Burdur, Türkiye",
    sourceNote: "MEB karma oluşumlu göl · tektonik-karstik",
  },
  {
    id: "kilimli-glacial",
    name: "Kilimli Gölü",
    osmWayId: 23035976,
    sourceNote: "MEB sirk gölü · Uludağ",
  },
  {
    id: "aynali-glacial",
    name: "Aynalı Göl",
    osmWayId: 23035949,
    sourceNote: "MEB sirk gölü · Uludağ",
  },
  {
    id: "karagol-uludag-glacial",
    name: "Karagöl (Uludağ)",
    osmWayId: 23035969,
    classificationSource: "https://kitap.eba.gov.tr/panel/dosyalar/upload/3053/0/R_0_02_06_2022_12_28_05_595.pdf",
    sourceNote: "MEB Coğrafya 10 sirk gölü · Uludağ",
  },
  {
    id: "buzlu-uludag-glacial",
    name: "Buzlu Göl (Uludağ)",
    osmWayId: 721608608,
    classificationSource: "https://www.tarimorman.gov.tr/DKMP/Belgeler/dkmp%20resmi%20istatistik/kutuphane/58.pdf",
    sourceNote: "Tarım ve Orman Bakanlığı Uludağ Milli Parkı buzul gölü",
  },
  {
    id: "heybeli-uludag-glacial",
    name: "Heybeli Gölü (Uludağ, mevsimlik)",
    osmWayId: 721603998,
    classificationSource: "https://www.tarimorman.gov.tr/DKMP/Belgeler/dkmp%20resmi%20istatistik/kutuphane/58.pdf",
    sourceNote: "Tarım ve Orman Bakanlığı Uludağ Milli Parkı · yazın kuruyan buzul gölü",
  },
  {
    id: "deligol-glacial",
    name: "Deligöl",
    osmWayId: 29188733,
    sourceNote: "MEB sirk gölü · Kaçkar Dağları",
  },
  {
    id: "sat-ikiyaka-glacial",
    name: "Sat (İkiyaka) Buzul Gölleri",
    osmWayIds: [226710688, 1416788048, 226711484, 226711527, 226711563, 226711589],
    classificationSource: "https://hakkari.ktb.gov.tr/TR-349444/yeryuzu-sekilleri.html",
    sourceNote: "Hakkâri İl Kültür ve Turizm Müdürlüğü · Sat Gölleri",
  },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

async function osmWayPolygon(osmWayId) {
  const response = await fetch(`https://api.openstreetmap.org/api/0.6/way/${osmWayId}/full.json`, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`OSM API ${response.status}: ${osmWayId}`);
  const data = await response.json();
  const way = data.elements.find((item) => item.type === "way" && item.id === osmWayId);
  if (!way?.nodes?.length) throw new Error(`OSM way bulunamadı: ${osmWayId}`);
  const nodes = new Map(
    data.elements
      .filter((item) => item.type === "node")
      .map((node) => [node.id, [node.lon, node.lat]]),
  );
  const ring = way.nodes.map((nodeId) => nodes.get(nodeId)).filter(Boolean);
  if (ring.length < 4) throw new Error(`OSM way geometrisi eksik: ${osmWayId}`);
  const [firstX, firstY] = ring[0];
  const [lastX, lastY] = ring.at(-1);
  if (Math.abs(firstX - lastX) > 1e-7 || Math.abs(firstY - lastY) > 1e-7) ring.push(ring[0]);
  return { type: "Polygon", coordinates: [ring] };
}

const features = [];
for (const spec of specs) {
  const geometry = spec.osmWayIds
    ? {
        type: "MultiPolygon",
        coordinates: await Promise.all(spec.osmWayIds.map(async (osmWayId) => (
          (await osmWayPolygon(osmWayId)).coordinates
        ))),
      }
    : spec.osmWayId
      ? await osmWayPolygon(spec.osmWayId)
      : await searchPolygon(spec.query);
  if (!geometry) throw new Error(`Su poligonu bulunamadı: ${spec.name}`);
  features.push({
    type: "Feature",
    properties: {
      id: spec.id,
      name: spec.name,
      source: "OpenStreetMap",
      source_url: "https://www.openstreetmap.org/copyright",
      classification_source: spec.classificationSource
        ?? "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page81.html",
      classification_note: spec.sourceNote,
    },
    geometry,
  });
  console.log(`${spec.id}: ${geometry.type}`);
  await delay(1100);
}

await writeFile(OUTPUT, `${JSON.stringify({ type: "FeatureCollection", features })}\n`, "utf8");
console.log(`Yazıldı: ${OUTPUT.pathname} (${features.length} göl)`);
