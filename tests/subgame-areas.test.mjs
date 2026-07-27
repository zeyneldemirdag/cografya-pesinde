import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const areas = JSON.parse(
  fs.readFileSync(
    new URL("../public/data/turkey-subgame-areas.geojson", import.meta.url),
    "utf8",
  ),
);

const expectedIds = [
  "forest-black",
  "forest-med",
  "forest-west",
  "forest-interior",
  "maquis",
  "garig-veg",
  "pseudomaquis-veg",
  "hydromorphic-soil",
  "colluvial-soil",
  "regosol-soil",
  "loess-soil",
  "moraine-soil",
  "goat-toros",
];

function allCoordinates(geometry) {
  return geometry.type === "Polygon"
    ? geometry.coordinates.flat()
    : geometry.coordinates.flat(2);
}

test("toprak, bitki ve hayvancılık alt oyunlarının MEB tabanlı gerçek alanları tamdır", () => {
  assert.deepEqual(
    areas.features.map((feature) => feature.properties.id),
    expectedIds,
  );
  for (const feature of areas.features) {
    assert.equal(feature.properties.source, "MEB");
    assert.match(feature.properties.source_url, /ogmmateryal\.eba\.gov\.tr/);
    assert.ok(feature.properties.geometry_note.length > 10);
    assert.match(feature.geometry.type, /^(Polygon|MultiPolygon)$/);
  }
});

test("alt oyun alanları Türkiye koordinatlarında ve ayrıntılıdır", () => {
  for (const feature of areas.features) {
    const coordinates = allCoordinates(feature.geometry);
    assert.ok(coordinates.length >= 12, `${feature.properties.id}: ayrıntı`);
    for (const [lon, lat] of coordinates) {
      assert.ok(lon >= 25.4 && lon <= 44.9, `${feature.properties.id}: boylam`);
      assert.ok(lat >= 35.5 && lat <= 42.3, `${feature.properties.id}: enlem`);
    }
  }
});

test("zonal ve ot alt oyunları resmî dağılış alanlarına bağlanır", () => {
  assert.match(page, /const EXACT_AREA_ALIASES/);
  assert.match(page, /"terra-rossa": "terra-rossa-map"/);
  assert.match(page, /"brown-chestnut-step-soil": "brown-chestnut-step-map"/);
  assert.match(page, /step: "step-map"/);
  assert.match(page, /"anthro-step": "anthropogenic-step-map"/);
  assert.match(page, /"mountain-meadow-veg": "mountain-meadow-map"/);
  assert.match(page, /"sheep-livestock": "step-map"/);
  assert.match(page, /goat: "goat-toros"/);
  assert.match(page, /turkey-subgame-areas\.geojson/);
});

test("MEB'nin tek başlık verdiği kahverengi-kestane step iki kez sorulmaz", () => {
  assert.match(page, /f\("brown-chestnut-step-soil"/);
  assert.doesNotMatch(page, /f\("chestnut"/);
  assert.doesNotMatch(page, /f\("brown-step"/);
});

test("çok parçalı alanların dokunma hedefi görünmez merkez kutusu değil gerçek poligondur", () => {
  assert.match(page, /className="geo-exact-area-hit"/);
  assert.match(page, /d=\{lakePath\(exactArea\)\}/);
  assert.doesNotMatch(page, /exactAreaScreenBounds/);
});
