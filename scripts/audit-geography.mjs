import fs from "node:fs";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

function constantKeys(name) {
  const start = source.indexOf(`const ${name}`);
  if (start < 0) return new Set();
  const open = source.indexOf("{", start);
  let depth = 0;
  let end = open;
  for (; end < source.length; end += 1) {
    if (source[end] === "{") depth += 1;
    if (source[end] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const body = source.slice(open + 1, end);
  return new Set(
    [...body.matchAll(/^\s*(?:"([^"]+)"|([a-zA-Z][\w-]*))\s*:/gm)]
      .map((match) => match[1] ?? match[2]),
  );
}

const pointKeys = constantKeys("POINT_COORDINATES");
const areaKeys = constantKeys("AREA_POLYGONS");
const distributionKeys = constantKeys("DISTRIBUTION_POLYGONS");
const lineKeys = constantKeys("REAL_LINES");

const callPattern = /\bf\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*"([^"]+)"/g;
const features = [...source.matchAll(callPattern)].map((match) => ({
  id: match[1],
  name: match[2],
  x: Number(match[3]),
  y: Number(match[4]),
  kind: match[7],
}));

const lakeData = [
  "../public/data/turkey-lakes.geojson",
  "../public/data/turkey-lakes-extra.geojson",
  "../public/data/turkey-lakes-karstic-extra.geojson",
  "../public/data/turkey-lakes-eastern-extra.geojson",
].flatMap((path) =>
  JSON.parse(fs.readFileSync(new URL(path, import.meta.url), "utf8")).features
);
const riverData = JSON.parse(fs.readFileSync(new URL("../public/data/turkey-rivers.geojson", import.meta.url), "utf8"));
const lakeIds = new Set(lakeData.map((feature) => feature.properties.id));
const riverIds = new Set(riverData.features.map((feature) => feature.properties.id));

const canonical = (id) => id.replace(/-(f|t|vs|n|s|gl|d|br)$/, "");
const lakeCanonical = (id) => ({
  "van-vs": "van",
  "iznik-t": "iznik",
  "manyas-t": "manyas",
  "tuz-t": "tuz",
  ercis: "ercek",
  "burdur-r": "burdur",
  "uluabat-r": "uluabat",
  ulubat: "uluabat",
  "kiziloren-l": "kizoren",
  "haçli": "hacli",
  kus: "manyas",
}[id] ?? id).replace(/-(t|vl|l)$/, "");
const riverCanonical = (id) => ({
  "meric-br": "meric",
  "aras-br": "aras",
  "asi-br": "asi",
}[id] ?? id);

const classifications = features.map((feature) => {
  let geometry = "fallback";
  if (lakeIds.has(lakeCanonical(feature.id))) geometry = "exact-lake";
  else if (pointKeys.has(feature.id)) geometry = "verified-point";
  else if (areaKeys.has(feature.id) && ["plain", "plateau", "region", "lake"].includes(feature.kind)) geometry = "area-polygon";
  else if (distributionKeys.has(feature.id)) geometry = "distribution-polygon";
  else if (lineKeys.has(feature.id) || lineKeys.has(canonical(feature.id))) geometry = "coordinate-line";
  else if (feature.kind === "river" && riverIds.has(riverCanonical(feature.id))) geometry = "exact-river";
  return { ...feature, geometry };
});

const unique = new Map();
for (const feature of classifications) {
  const key = `${feature.id}|${feature.name}|${feature.kind}`;
  if (!unique.has(key)) unique.set(key, feature);
}

const byGeometry = Object.groupBy([...unique.values()], (feature) => feature.geometry);
const conflicts = Object.entries(Object.groupBy([...unique.values()], (feature) => feature.id))
  .filter(([, entries]) => new Set(entries.map((entry) => `${entry.name}|${entry.kind}`)).size > 1)
  .map(([id, entries]) => ({ id, variants: entries.map((entry) => `${entry.name} (${entry.kind})`) }));

function quizFeatureNames(id) {
  const marker = `    id: "${id}",`;
  const start = source.indexOf(marker);
  if (start < 0) return [];
  const featuresStart = source.indexOf("features: [", start);
  const open = source.indexOf("[", featuresStart);
  let depth = 0;
  let end = open;
  for (; end < source.length; end += 1) {
    if (source[end] === "[") depth += 1;
    if (source[end] === "]") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  return [...source.slice(open + 1, end).matchAll(/\b(?:f|fp)\(\s*"[^"]+"\s*,\s*"([^"]+)"/g)]
    .map((match) => match[1].split(" · ")[0]);
}

const coverageComparisons = [
  ["mountains-all", ["fold-mountains", "fault-mountains", "volcanic-mountains", "north-fold-mountains", "south-fold-mountains", "glacial-mountains"]],
  ["lakes-all", ["tectonic-lakes", "volcanic-set-lakes", "karstic-lakes", "volcanic-lakes"]],
  ["rivers", ["black-sea-rivers", "aegean-rivers", "mediterranean-rivers", "outbound-rivers", "inbound-rivers", "border-rivers"]],
  ["plains", ["delta-plains"]],
].map(([general, subtopics]) => {
  const generalNames = new Set(quizFeatureNames(general));
  const subtopicNames = [...new Set(subtopics.flatMap(quizFeatureNames))];
  return {
    general,
    subtopics,
    missingFromGeneral: subtopicNames.filter((name) => !generalNames.has(name)),
  };
});

const officialExpectations = {
  "tectonic-lakes": [
    "Manyas Gölü", "Uluabat Gölü", "İznik Gölü", "Sapanca Gölü",
    "Burdur Gölü", "Acıgöl", "Tuz Gölü", "Eber Gölü", "Akşehir Gölü",
    "Ilgın (Çavuşçu) Gölü", "Seyfe Gölü", "Hazar Gölü", "Aktaş Gölü",
  ],
  "volcanic-set-lakes": [
    "Çıldır Gölü", "Erçek Gölü", "Nazik Gölü", "Haçlı Gölü", "Balık Gölü",
  ],
  "karstic-lakes": [
    "Avlan Gölü", "Kestel Gölü", "Salda Gölü", "Kızören Obruğu",
    "Meyil Obruğu", "Çıralı Obruğu", "Hafik Gölü", "Tödürge Gölü",
  ],
  "volcanic-lakes": [
    "Nemrut Kaldera Gölü", "Meke Maarı", "Gölcük Krater Gölü",
    "Acıgöl (Karapınar)", "Nar Gölü", "Aygır (Süphan) Gölü",
  ],
  plateaus: [
    "Yazılıkaya Platosu", "Uşak-Eşme Platosu", "Gaziantep Platosu",
    "Şanlıurfa Platosu", "Erzurum-Kars Platosu", "Ardahan Platosu",
    "Teke Platosu", "Taşeli Platosu", "Haymana Platosu",
    "Cihanbeyli Platosu", "Obruk Platosu", "Uzunyayla Platosu",
    "Çatalca-Kocaeli Platosu", "Perşembe Platosu",
  ],
  plains: [
    "Çukurova", "Gediz Ovası", "Bursa Ovası", "Çarşamba Deltası",
    "Konya Ovası", "Iğdır Ovası", "Yüksekova", "Erzincan Ovası",
    "Muş Ovası", "Bafra Deltası", "Silifke Deltası", "Adapazarı Ovası",
    "Bolu Ovası", "Düzce Ovası", "Bergama Ovası", "Soma Ovası",
    "Akhisar Ovası", "Amik Ovası", "Kahramanmaraş Ovası",
    "Malatya Ovası", "Suruç Ovası", "Ceylanpınar Ovası",
  ],
  "outbound-rivers": ["Fırat", "Dicle", "Çoruh", "Kura", "Aras"],
  "inbound-rivers": ["Asi", "Meriç"],
  dams: ["Atatürk Barajı", "Keban Barajı", "Ilısu Barajı", "Karakaya Barajı", "Hirfanlı Barajı"],
  gates: [
    "Pazarkule", "İpsala", "Kapıkule", "Hamzabeyli", "Dereköy",
    "Sarp", "Türkgözü", "Çıldır-Aktaş", "Dilucu", "Gürbulak",
    "Kapıköy", "Esendere", "Habur", "Üzümlü", "Cilvegözü",
    "Öncüpınar", "Karkamış", "Çobanbey", "Zeytindalı",
  ],
  ramsar: [
    "Sultan Sazlığı", "Kuş Gölü", "Kızılırmak Deltası", "Göksu Deltası",
    "Kuyucuk Gölü", "Nemrut Kalderası", "Burdur Gölü", "Seyfe Gölü",
    "Uluabat Gölü", "Gediz Deltası", "Akyatan Lagünü",
    "Yumurtalık Lagünleri", "Meke Maarı", "Kızören Obruğu",
  ],
  mines: [
    "Zonguldak", "Divriği", "Murgul", "Çayeli", "Küre", "Maden",
    "Guleman", "Kop Dağı", "Fethiye-Köyceğiz", "Seydişehir",
    "Bigadiç", "Emet", "Kırka", "Mazıdağı", "Hekimhan",
    "Hasançelebi", "Tuz Gölü", "Çamaltı", "Seyitömer",
    "Afşin-Elbistan", "Soma", "Afyonkarahisar",
  ],
  agriculture: [
    "Çay", "Fındık", "Zeytin", "Pamuk", "Muz", "Kayısı", "Üzüm",
    "Ayçiçeği", "Şeker Pancarı", "İncir", "Antep Fıstığı",
    "Turunçgiller", "Tütün", "Çeltik", "Elma", "Kırmızı Mercimek",
    "Buğday", "Mısır",
  ],
  livestock: [
    "Büyükbaş", "Koyun", "Kıl Keçisi", "İpek Böcekçiliği",
    "Arıcılık", "Tiftik Keçisi", "Kümes Hayvancılığı", "Balıkçılık",
  ],
  "closed-basins": [
    "Van Gölü Kapalı Havzası", "Tuz Gölü Kapalı Havzası",
    "Göller Yöresi Kapalı Havzası", "Hazar Gölü Kapalı Havzası",
  ],
};

const sourceCoverage = Object.entries(officialExpectations).map(([quiz, expected]) => {
  const present = new Set(quizFeatureNames(quiz));
  return {
    quiz,
    expectedCount: expected.length,
    missing: expected.filter((name) => !present.has(name)),
  };
});

const sourceQuizKeys = constantKeys("SOURCE_BY_QUIZ");
const sourceOverrideRequired = [
  "straits", "gates", "passes", "mines", "energy", "development",
  "industry", "population", "climate", "vegetation", "soils", "tourism",
  "agriculture", "livestock", "ports", "gulfs", "bridges-tunnels",
];
const missingSourceOverrides = sourceOverrideRequired.filter((id) => !sourceQuizKeys.has(id));

console.log(JSON.stringify({
  featureCalls: features.length,
  uniqueFeatures: unique.size,
  geometryCounts: Object.fromEntries(Object.entries(byGeometry).map(([key, value]) => [key, value.length])),
  fallback: (byGeometry.fallback ?? []).map(({ id, name, kind }) => ({ id, name, kind })),
  conflicts,
  coverageComparisons,
  sourceCoverage,
  nonExactLakeTargets: [...unique.values()]
    .filter((feature) => feature.kind === "lake" && feature.geometry !== "exact-lake")
    .map(({ id, name, geometry }) => ({ id, name, geometry })),
  missingSourceOverrides,
}, null, 2));
