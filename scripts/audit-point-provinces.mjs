import fs from "node:fs";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const provinces = JSON.parse(
  fs.readFileSync(new URL("../public/data/turkey-provinces.geojson", import.meta.url), "utf8"),
).features;

function objectBody(name) {
  const start = source.indexOf(`const ${name}`);
  if (start < 0) throw new Error(`${name} bulunamadı`);
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(open + 1, index);
    }
  }
  throw new Error(`${name} kapanış parantezi bulunamadı`);
}

function coordinateRecord(name) {
  const body = objectBody(name);
  return Object.fromEntries(
    [...body.matchAll(
      /^\s*(?:"([^"]+)"|([A-Za-zÇĞİÖŞÜçğıöşü][\wÇĞİÖŞÜçğıöşü-]*))\s*:\s*\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\],?/gm,
    )].map((match) => [
      match[1] ?? match[2],
      [Number(match[3]), Number(match[4])],
    ]),
  );
}

const pointCoordinates = coordinateRecord("POINT_COORDINATES");
const functionCityCoordinates = coordinateRecord("FUNCTION_CITY_COORDINATES");
const featurePattern = /\bf\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*"([^"]+)"/g;
const features = [...source.matchAll(featurePattern)].map((match) => ({
  id: match[1],
  name: match[2],
  kind: match[7],
}));

function functionalCityCoordinate(featureId) {
  const match = featureId.match(
    /^(?:function-city|farm-city|industrial-city|mining-city|port-city|transport-trade-city|culture-admin-city|tourism-city)-(.+)$/,
  );
  return match ? functionCityCoordinates[match[1]] : undefined;
}

function pointOnSegment([x, y], [leftX, leftY], [rightX, rightY]) {
  const squaredLength = (rightX - leftX) ** 2 + (rightY - leftY) ** 2;
  if (squaredLength < 1e-16) {
    return Math.hypot(x - leftX, y - leftY) < 1e-8;
  }
  const cross = (x - leftX) * (rightY - leftY) - (y - leftY) * (rightX - leftX);
  if (Math.abs(cross) > 1e-8) return false;
  const dot = (x - leftX) * (rightX - leftX) + (y - leftY) * (rightY - leftY);
  if (dot < 0) return false;
  return dot <= squaredLength;
}

function pointInRing(point, ring) {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const currentPoint = ring[index];
    const previousPoint = ring[previous];
    if (pointOnSegment(point, previousPoint, currentPoint)) return true;
    const intersects = (currentPoint[1] > point[1]) !== (previousPoint[1] > point[1])
      && point[0] < (
        (previousPoint[0] - currentPoint[0])
        * (point[1] - currentPoint[1])
        / (previousPoint[1] - currentPoint[1])
        + currentPoint[0]
      );
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInPolygon(point, rings) {
  if (!pointInRing(point, rings[0])) return false;
  return rings.slice(1).every((hole) => !pointInRing(point, hole));
}

function pointInProvince(point, province) {
  const polygons = province.geometry.type === "Polygon"
    ? [province.geometry.coordinates]
    : province.geometry.coordinates;
  return polygons.some((polygon) => pointInPolygon(point, polygon));
}

function provinceNamesFor(point) {
  return provinces
    .filter((province) => pointInProvince(point, province))
    .map((province) => province.properties.name);
}

const pointFeatures = [...new Map(
  features
    .map((feature) => {
      const coordinate = pointCoordinates[feature.id] ?? functionalCityCoordinate(feature.id);
      return coordinate ? [feature.id, { ...feature, coordinate }] : undefined;
    })
    .filter(Boolean),
).values()].map((feature) => ({
  ...feature,
  provinces: provinceNamesFor(feature.coordinate),
}));

// Deniz üstündeki liman/köprüler, sınır kapıları ve kıyı çizgisindeki hedefler
// sadeleştirilmiş il poligonunun dışında kalabilir. Bu liste bilinçli istisnalardır;
// yeni bir dışarıda-kalan nokta eklendiğinde denetim başarısız olur.
const documentedBoundaryOrWaterIds = new Set([
  "ayvalik-industry",
  "halic-industry",
  "sinop-nuclear",
  "beldibi-tour",
  "sarp",
  "derekoy",
  "turkgozu",
  "uzumlu",
  "karkamis",
  "ceylanpinar-gate",
  "nusaybin-gate",
  "istanbul-port",
  "derince-port",
  "karasu-port",
  "zonguldak-port",
  "samsun-port",
  "kusadasi-port",
  "bodrum-port",
  "marmaris-port",
  "alanya-port",
  "bogazici-b",
  "fsm-b",
  "yss-b",
  "osmangazi-b",
  "canakkale-b",
  "avrasya-t",
  "marmaray-t",
]);

// Kullanıcının özellikle hassasiyet gösterdiği ve sınavlarda sık sorulan
// noktasal hedefler için gerçek il poligonuyla ikinci bir çapraz kontrol.
const expectedProvinces = {
  nemrut: ["Bitlis"],
  "karacadag-gd": ["Diyarbakır"],
  suphan: ["Bitlis"],
  erciyes: ["Kayseri"],
  hasan: ["Aksaray"],
  karadag: ["Karaman"],
  melendiz: ["Niğde"],
  "karacadag-ic": ["Konya"],
  kula: ["Manisa"],
  tendurek: ["Ağrı", "Van"],
  agri: ["Ağrı"],
  "kokaksu-mine": ["Zonguldak"],
  "yerkoy-salt": ["Kırşehir", "Yozgat"],
  "kilickaya-dam": ["Giresun", "Sivas"],
};

const outsideProvincePolygons = pointFeatures.filter((feature) => feature.provinces.length === 0);
const multiProvinceMatches = pointFeatures.filter((feature) => feature.provinces.length > 1);
const unexpectedOutsideProvincePolygons = outsideProvincePolygons
  .filter((feature) => !documentedBoundaryOrWaterIds.has(feature.id));
const provinceMismatches = Object.entries(expectedProvinces)
  .map(([id, expected]) => {
    const feature = pointFeatures.find((entry) => entry.id === id);
    return {
      id,
      name: feature?.name,
      coordinate: feature?.coordinate,
      expected,
      actual: feature?.provinces ?? [],
    };
  })
  .filter((entry) =>
    entry.actual.length === 0
    || !entry.actual.some((province) => entry.expected.includes(province))
  );
const provinceCounts = Object.fromEntries(
  Object.entries(Object.groupBy(
    pointFeatures.flatMap((feature) => feature.provinces),
    (province) => province,
  ))
    .map(([province, entries]) => [province, entries.length])
    .sort(([left], [right]) => left.localeCompare(right, "tr")),
);

const report = {
  pointFeatureCount: pointFeatures.length,
  coveredByProvincePolygon: pointFeatures.length - outsideProvincePolygons.length,
  documentedBoundaryOrWaterCount:
    outsideProvincePolygons.length - unexpectedOutsideProvincePolygons.length,
  unexpectedOutsideProvincePolygons,
  provinceMismatches,
  multiProvinceMatchCount: multiProvinceMatches.length,
};

if (process.argv.includes("--details")) {
  Object.assign(report, {
    outsideProvincePolygons,
    multiProvinceMatches,
    provinceCounts,
    features: pointFeatures,
  });
}

console.log(JSON.stringify(report, null, 2));

const failures = [
  ...(unexpectedOutsideProvincePolygons.length > 0
    ? [`${unexpectedOutsideProvincePolygons.length} nokta il poligonları dışında ve belgelenmemiş`]
    : []),
  ...(provinceMismatches.length > 0
    ? [`${provinceMismatches.length} kritik hedef beklenen ilde değil`]
    : []),
];

if (failures.length > 0) {
  failures.forEach((failure) => console.error(`HATA: ${failure}`));
  process.exitCode = 1;
}
