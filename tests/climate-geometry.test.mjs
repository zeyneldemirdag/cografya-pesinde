import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const climate = JSON.parse(
  fs.readFileSync(
    new URL("../public/data/turkey-climate-zones.geojson", import.meta.url),
    "utf8",
  ),
);

const expectedIds = [
  "akdeniz-cl",
  "akdeniz-karasal-gecis-cl",
  "karadeniz-cl",
  "akdeniz-karadeniz-gecis-cl",
  "karasal-karadeniz-gecis-cl",
  "karasal-cl",
  "karasal-sert-gecis-cl",
];

function allCoordinates(geometry) {
  return geometry.type === "Polygon"
    ? geometry.coordinates.flat()
    : geometry.coordinates.flat(2);
}

test("MEB iklim haritasındaki yedi ana ve geçiş kuşağı eksiksizdir", () => {
  assert.deepEqual(
    climate.features.map((feature) => feature.properties.id),
    expectedIds,
  );
  assert.equal(new Set(expectedIds).size, 7);
  for (const feature of climate.features) {
    assert.match(feature.geometry.type, /^(Polygon|MultiPolygon)$/);
    assert.equal(feature.properties.source, "MEB");
    assert.match(feature.properties.source_url, /ogmmateryal\.eba\.gov\.tr/);
  }
});

test("iklim geometrileri ayrıntılı ve Türkiye koordinatları içindedir", () => {
  for (const feature of climate.features) {
    const coordinates = allCoordinates(feature.geometry);
    assert.ok(
      coordinates.length > 60,
      `${feature.properties.id} yeterince ayrıntılı değil`,
    );
    for (const [lon, lat] of coordinates) {
      assert.ok(lon >= 25.4 && lon <= 44.9, `${feature.properties.id}: boylam`);
      assert.ok(lat >= 35.5 && lat <= 42.3, `${feature.properties.id}: enlem`);
    }
  }
});

test("uygulama resmî iklim geometrisini yükler ve eski kaba dört şekli kullanmaz", () => {
  assert.match(page, /turkey-climate-zones\.geojson/);
  for (const id of expectedIds) {
    assert.match(page, new RegExp(`f\\("${id}"`));
  }
  assert.doesNotMatch(page, /f\("sert-karasal-cl"/);
  assert.doesNotMatch(page, /"karadeniz-cl": \[/);
  assert.doesNotMatch(page, /"akdeniz-cl": \[/);
  assert.doesNotMatch(page, /"karasal-cl": \[/);
});
