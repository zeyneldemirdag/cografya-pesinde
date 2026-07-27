import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const vegetation = JSON.parse(
  fs.readFileSync(
    new URL("../public/data/turkey-vegetation-distribution.geojson", import.meta.url),
    "utf8",
  ),
);

const expectedIds = [
  "forest-shrub-map",
  "redpine-shrub-map",
  "step-meadow-map",
  "alpine-meadow-map",
];

function allCoordinates(geometry) {
  return geometry.type === "Polygon"
    ? geometry.coordinates.flat()
    : geometry.coordinates.flat(2);
}

test("genel bitki oyunu MEB haritasındaki dört formasyonu kullanır", () => {
  assert.deepEqual(
    vegetation.features.map((feature) => feature.properties.id),
    expectedIds,
  );
  for (const feature of vegetation.features) {
    assert.match(feature.geometry.type, /^(Polygon|MultiPolygon)$/);
    assert.equal(feature.properties.source, "MEB");
    assert.match(feature.properties.source_url, /ogmmateryal\.eba\.gov\.tr/);
  }
});

test("bitki formasyonları ayrıntılı Türkiye geometrileridir", () => {
  for (const feature of vegetation.features) {
    const coordinates = allCoordinates(feature.geometry);
    assert.ok(coordinates.length > 50, `${feature.properties.id}: ayrıntı`);
    for (const [lon, lat] of coordinates) {
      assert.ok(lon >= 25.4 && lon <= 44.9, `${feature.properties.id}: boylam`);
      assert.ok(lat >= 35.5 && lat <= 42.3, `${feature.properties.id}: enlem`);
    }
  }
});

test("genel formasyon haritası ile on bir kavramın alt oyunları ayrıdır", () => {
  assert.match(page, /turkey-vegetation-distribution\.geojson/);
  assert.match(page, /features: \[\.\.\.VEGETATION_DISTRIBUTION_FEATURES\]/);
  assert.match(page, /features: \[\.\.\.FOREST_VEGETATION_FEATURES\]/);
  assert.match(page, /features: \[\.\.\.SHRUB_VEGETATION_FEATURES\]/);
  assert.match(page, /features: \[\.\.\.GRASS_VEGETATION_FEATURES\]/);
  for (const id of expectedIds) {
    assert.match(page, new RegExp(`f\\("${id}"`));
  }
});
