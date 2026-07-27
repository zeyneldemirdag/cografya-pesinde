import { gunzipSync } from "node:zlib";
import { writeFile } from "node:fs/promises";

const OUTPUT = new URL("../public/data/turkey-tourism-areas.geojson", import.meta.url);
const USER_AGENT = "CografyaPesinde/1.0 (KPSS geography map data builder)";
const DKMP_PAGE = "https://ekotaban.tarimorman.gov.tr/alan/38";
const DKMP_LAYER =
  "https://ekotaban.tarimorman.gov.tr/Api/Ekotaban/HMS/Alan/L/20/25.5,36,45,42/0";

const dkmpSpecs = [
  {
    id: "baskomutan-tour",
    name: "Başkomutan Tarihî Millî Parkı",
    recordIds: ["2", "2831", "2832", "5155"],
  },
  {
    id: "istiklal-tour",
    name: "İstiklal Yolu Tarihî Millî Parkı",
    recordIds: ["5227", "5228", "5229", "5230", "5231", "5232", "5233", "5234", "5235"],
  },
  {
    id: "malazgirt-tour",
    name: "Malazgirt Meydan Muharebesi Tarihî Millî Parkı",
    recordIds: ["2871"],
  },
  {
    id: "sakarya-tour",
    name: "Sakarya Meydan Muharebesi Tarihî Millî Parkı",
    recordIds: ["38"],
  },
];

const osmSpecs = [
  {
    id: "karacabey-longoz-tour",
    name: "Karacabey Longoz Ormanı",
    osmId: "R17861535",
  },
  {
    id: "igneada-longoz-tour",
    name: "İğneada Longoz Ormanları Millî Parkı",
    osmId: "R1715854",
  },
  {
    id: "kapadokya",
    name: "Göreme Millî Parkı ve Kapadokya Peribacaları",
    osmId: "R252585",
  },
  {
    id: "pamukkale",
    name: "Pamukkale Travertenleri",
    osmId: "W15494594",
  },
  {
    id: "gelibolu-tour",
    name: "Çanakkale Savaşları Gelibolu Tarihî Alanı",
    osmId: "R1715983",
  },
];

function unwrap(value) {
  const trimmed = value.trim();
  if (!trimmed.startsWith("(") || !trimmed.endsWith(")")) {
    throw new Error(`WKT parantez yapısı geçersiz: ${trimmed.slice(0, 32)}`);
  }
  return trimmed.slice(1, -1).trim();
}

function splitTopLevel(value) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (character === "," && depth === 0) {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts.filter(Boolean);
}

function coordinateRing(value) {
  return splitTopLevel(value).map((pair) => {
    const [longitude, latitude] = pair.trim().split(/\s+/).map(Number);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      throw new Error(`WKT koordinatı geçersiz: ${pair}`);
    }
    return [longitude, latitude];
  });
}

function polygonCoordinates(value) {
  return splitTopLevel(unwrap(value)).map((ring) => coordinateRing(unwrap(ring)));
}

function parseWkt(wkt) {
  const normalized = wkt.replace(/^SRID=\d+;/, "").trim();
  if (normalized.startsWith("POLYGON ")) {
    return {
      type: "Polygon",
      coordinates: polygonCoordinates(normalized.slice("POLYGON ".length)),
    };
  }
  if (normalized.startsWith("MULTIPOLYGON ")) {
    return {
      type: "MultiPolygon",
      coordinates: splitTopLevel(unwrap(normalized.slice("MULTIPOLYGON ".length)))
        .map(polygonCoordinates),
    };
  }
  throw new Error(`Desteklenmeyen WKT türü: ${normalized.slice(0, 24)}`);
}

function combinePolygonGeometries(geometries) {
  const polygons = geometries.flatMap((geometry) =>
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates
  );
  if (polygons.length === 1) return { type: "Polygon", coordinates: polygons[0] };
  return { type: "MultiPolygon", coordinates: polygons };
}

async function fetchDkmpFeatures() {
  const pageResponse = await fetch(DKMP_PAGE, { headers: { "User-Agent": USER_AGENT } });
  if (!pageResponse.ok) throw new Error(`DKMP oturumu açılamadı: HTTP ${pageResponse.status}`);
  const cookie = pageResponse.headers.getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  await pageResponse.arrayBuffer();

  const layerResponse = await fetch(DKMP_LAYER, {
    headers: {
      "User-Agent": USER_AGENT,
      Referer: DKMP_PAGE,
      "X-Requested-With": "XMLHttpRequest",
      Cookie: cookie,
    },
  });
  if (!layerResponse.ok) throw new Error(`DKMP CBS katmanı alınamadı: HTTP ${layerResponse.status}`);
  const payload = JSON.parse(
    gunzipSync(Buffer.from(await layerResponse.arrayBuffer())).toString("utf8"),
  );
  const records = new Map(payload.f.map((record) => [String(record.i), record]));

  return dkmpSpecs.map((spec) => {
    const selected = spec.recordIds.map((recordId) => {
      const record = records.get(recordId);
      if (!record) throw new Error(`${spec.name}: DKMP kaydı bulunamadı (${recordId})`);
      return parseWkt(record.g);
    });
    return {
      type: "Feature",
      properties: {
        id: spec.id,
        name: spec.name,
        source: "T.C. Tarım ve Orman Bakanlığı DKMP Ekotaban CBS",
        source_url: DKMP_PAGE,
        source_record_ids: spec.recordIds,
      },
      geometry: combinePolygonGeometries(selected),
    };
  });
}

async function fetchOsmFeatures() {
  const url = new URL("https://nominatim.openstreetmap.org/lookup");
  url.search = new URLSearchParams({
    osm_ids: osmSpecs.map((spec) => spec.osmId).join(","),
    format: "geojson",
    polygon_geojson: "1",
  });
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`OpenStreetMap geometrileri alınamadı: HTTP ${response.status}`);
  const collection = await response.json();
  const byOsmId = new Map(collection.features.map((feature) => {
    const prefix = feature.properties.osm_type === "relation" ? "R" : "W";
    return [`${prefix}${feature.properties.osm_id}`, feature];
  }));

  return osmSpecs.map((spec) => {
    const sourceFeature = byOsmId.get(spec.osmId);
    if (!sourceFeature || !["Polygon", "MultiPolygon"].includes(sourceFeature.geometry?.type)) {
      throw new Error(`${spec.name}: OSM alan geometrisi bulunamadı (${spec.osmId})`);
    }
    return {
      type: "Feature",
      properties: {
        id: spec.id,
        name: spec.name,
        source: "OpenStreetMap",
        source_url: `https://www.openstreetmap.org/${spec.osmId.startsWith("R") ? "relation" : "way"}/${spec.osmId.slice(1)}`,
      },
      geometry: sourceFeature.geometry,
    };
  });
}

const features = [
  ...await fetchDkmpFeatures(),
  ...await fetchOsmFeatures(),
];

await writeFile(
  OUTPUT,
  `${JSON.stringify({
    type: "FeatureCollection",
    name: "turkey-tourism-areas",
    features,
  })}\n`,
  "utf8",
);

console.log(`Yazıldı: ${OUTPUT.pathname} (${features.length} gerçek turizm alanı)`);
