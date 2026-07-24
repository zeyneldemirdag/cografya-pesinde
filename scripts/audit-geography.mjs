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

const lakeData = JSON.parse(fs.readFileSync(new URL("../public/data/turkey-lakes.geojson", import.meta.url), "utf8"));
const riverData = JSON.parse(fs.readFileSync(new URL("../public/data/turkey-rivers.geojson", import.meta.url), "utf8"));
const lakeIds = new Set(lakeData.features.map((feature) => feature.properties.id));
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
  kus: "manyas",
}[id] ?? id).replace(/-(t|vl|l)$/, "");
const riverCanonical = (id) => ({
  "meric-br": "meric",
  "aras-br": "aras",
  "asi-br": "asi",
}[id] ?? id);

const classifications = features.map((feature) => {
  let geometry = "fallback";
  if (pointKeys.has(feature.id)) geometry = "verified-point";
  else if (areaKeys.has(feature.id) && ["plain", "plateau", "region", "lake"].includes(feature.kind)) geometry = "area-polygon";
  else if (distributionKeys.has(feature.id)) geometry = "distribution-polygon";
  else if (lineKeys.has(feature.id) || lineKeys.has(canonical(feature.id))) geometry = "coordinate-line";
  else if (lakeIds.has(lakeCanonical(feature.id))) geometry = "exact-lake";
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

console.log(JSON.stringify({
  featureCalls: features.length,
  uniqueFeatures: unique.size,
  geometryCounts: Object.fromEntries(Object.entries(byGeometry).map(([key, value]) => [key, value.length])),
  fallback: (byGeometry.fallback ?? []).map(({ id, name, kind }) => ({ id, name, kind })),
  conflicts,
  coverageComparisons,
}, null, 2));
