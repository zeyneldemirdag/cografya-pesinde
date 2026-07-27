import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const pageSource = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const collection = JSON.parse(
  fs.readFileSync(new URL("../public/data/turkey-tourism-areas.geojson", import.meta.url), "utf8"),
);

const expectedIds = [
  "baskomutan-tour",
  "istiklal-tour",
  "malazgirt-tour",
  "sakarya-tour",
  "karacabey-longoz-tour",
  "igneada-longoz-tour",
  "kapadokya",
  "pamukkale",
  "gelibolu-tour",
];

function allCoordinates(geometry) {
  return geometry.type === "Polygon"
    ? geometry.coordinates.flat()
    : geometry.coordinates.flat(2);
}

test("nine tourism areas use real DKMP or OSM polygons", () => {
  assert.deepEqual(
    collection.features.map((feature) => feature.properties.id),
    expectedIds,
  );
  for (const feature of collection.features) {
    assert.ok(["Polygon", "MultiPolygon"].includes(feature.geometry.type));
    assert.ok(
      /DKMP Ekotaban CBS|OpenStreetMap/.test(feature.properties.source),
      `${feature.properties.id} should identify its geometry source`,
    );
    const coordinates = allCoordinates(feature.geometry);
    assert.ok(coordinates.length >= 50, `${feature.properties.id} should retain detailed geometry`);
    for (const [longitude, latitude] of coordinates) {
      assert.ok(longitude >= 25.5 && longitude <= 45);
      assert.ok(latitude >= 35.7 && latitude <= 42.2);
    }
  }
});

test("multi-part historic national parks retain their official pieces", () => {
  const byId = new Map(
    collection.features.map((feature) => [feature.properties.id, feature]),
  );
  assert.equal(byId.get("sakarya-tour").geometry.coordinates.length, 24);
  assert.equal(byId.get("baskomutan-tour").geometry.coordinates.length, 4);
  assert.equal(byId.get("istiklal-tour").geometry.coordinates.length, 9);
  assert.deepEqual(
    byId.get("sakarya-tour").properties.source_record_ids,
    ["38"],
  );
});

test("tourism rendering loads exact areas and removes old hand-drawn substitutes", () => {
  assert.match(pageSource, /fetch\("\/data\/turkey-tourism-areas\.geojson"\)/);
  assert.match(pageSource, /geo-shape--exact-area/);
  for (const id of expectedIds) {
    assert.doesNotMatch(
      pageSource,
      new RegExp(`\\n  "${id}": \\[\\[`),
      `${id} should not retain a hand-drawn AREA polygon`,
    );
  }
  assert.doesNotMatch(pageSource, /\n  "istiklal-tour": \[\[/);
});

test("MEB bird-tourism wetlands reuse their exact Ramsar boundaries", () => {
  assert.match(pageSource, /"izmir-bird-tour": "gediz-r"/);
  assert.match(pageSource, /"kizilirmak-bird-tour": "kizilirmak-delta"/);
});
