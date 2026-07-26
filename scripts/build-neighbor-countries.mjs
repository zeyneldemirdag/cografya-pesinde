import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const sourcePath = process.argv[2];
if (!sourcePath) {
  throw new Error("Usage: node scripts/build-neighbor-countries.mjs <Natural Earth countries GeoJSON>");
}

const source = JSON.parse(await readFile(resolve(sourcePath), "utf8"));
const countries = new Map([
  ["GRC", ["greece", "Yunanistan"]],
  ["BGR", ["bulgaria", "Bulgaristan"]],
  ["GEO", ["georgia", "Gürcistan"]],
  ["ARM", ["armenia", "Ermenistan"]],
  ["AZE", ["azerbaijan", "Azerbaycan · Nahçıvan"]],
  ["IRN", ["iran", "İran"]],
  ["IRQ", ["iraq", "Irak"]],
  ["SYR", ["syria", "Suriye"]],
]);

const features = source.features
  .filter((feature) => countries.has(feature.properties.ADM0_A3))
  .map((feature) => {
    const [id, name] = countries.get(feature.properties.ADM0_A3);
    return {
      type: "Feature",
      properties: {
        id,
        name,
        iso3: feature.properties.ADM0_A3,
        source: "Natural Earth 1:50m Admin 0 Countries",
      },
      geometry: feature.geometry,
    };
  });

if (features.length !== countries.size) {
  throw new Error(`Expected ${countries.size} neighbors, found ${features.length}`);
}

await writeFile(
  resolve("public/data/turkey-neighbors.geojson"),
  `${JSON.stringify({
    type: "FeatureCollection",
    name: "turkey-neighbor-countries",
    source: "Natural Earth 1:50m Admin 0 Countries, version 5.1.1",
    features,
  })}\n`,
  "utf8",
);

console.log(`Wrote ${features.length} neighboring countries.`);
