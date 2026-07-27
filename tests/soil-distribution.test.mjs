import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const soils = JSON.parse(
  fs.readFileSync(
    new URL("../public/data/turkey-soil-distribution.geojson", import.meta.url),
    "utf8",
  ),
);

const expectedIds = [
  "brown-forest-map",
  "calcareous-forest-map",
  "brown-chestnut-step-map",
  "terra-rossa-map",
  "red-calcareous-step-map",
  "rendzina-map",
  "mountain-stony-soil-map",
  "chernozem-map",
  "vertisol-map",
  "saline-alkaline-map",
  "alluvial-map",
  "coastal-dune-map",
  "podzolized-map",
];

function allCoordinates(geometry) {
  return geometry.type === "Polygon"
    ? geometry.coordinates.flat()
    : geometry.coordinates.flat(2);
}

test("genel toprak oyunu MEB dağılış haritasındaki 13 sınıfı kullanır", () => {
  assert.deepEqual(
    soils.features.map((feature) => feature.properties.id),
    expectedIds,
  );
  assert.equal(new Set(expectedIds).size, 13);
  for (const feature of soils.features) {
    assert.match(feature.geometry.type, /^(Polygon|MultiPolygon)$/);
    assert.equal(feature.properties.source, "MEB");
    assert.match(feature.properties.source_url, /ogmmateryal\.eba\.gov\.tr/);
  }
});

test("toprak alanları ayrıntılı Türkiye geometrileridir", () => {
  for (const feature of soils.features) {
    const coordinates = allCoordinates(feature.geometry);
    assert.ok(coordinates.length >= 10, `${feature.properties.id}: ayrıntı`);
    for (const [lon, lat] of coordinates) {
      assert.ok(lon >= 25.4 && lon <= 44.9, `${feature.properties.id}: boylam`);
      assert.ok(lat >= 35.5 && lat <= 42.3, `${feature.properties.id}: enlem`);
    }
  }
});

test("genel dağılış oyunu ile sınıflandırma alt oyunları birbirine karıştırılmaz", () => {
  assert.match(page, /turkey-soil-distribution\.geojson/);
  assert.match(page, /features: \[\.\.\.SOIL_DISTRIBUTION_FEATURES\]/);
  assert.match(page, /features: \[\.\.\.ZONAL_SOIL_FEATURES\]/);
  assert.match(page, /features: \[\.\.\.INTRAZONAL_SOIL_FEATURES\]/);
  assert.match(page, /features: \[\.\.\.AZONAL_SOIL_FEATURES\]/);
  for (const id of expectedIds) {
    assert.match(page, new RegExp(`f\\("${id}"`));
  }
});
