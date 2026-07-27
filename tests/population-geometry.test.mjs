import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const populationAreas = JSON.parse(
  fs.readFileSync(
    new URL("../public/data/turkey-population-areas.geojson", import.meta.url),
    "utf8",
  ),
);

const exactPopulationProvinceUnions = new Map([
  ["catalca-kocaeli-pop", [34, 41, 54]],
  ["coastal-aegean-pop", [10, 45, 35, 9, 48]],
  ["antalya-pop", [7]],
  ["ankara-eskisehir-pop", [6, 26]],
  ["cukurova-gaziantep-pop", [1, 33, 80, 27]],
  ["canakkale-pop", [17]],
  ["sinop-pop", [57]],
  ["mentese-pop", [48]],
  ["erzurum-kars-pop", [25, 36, 75]],
  ["hakkari-pop", [30]],
  ["middle-east-black-sea-pop", [55, 52, 28, 61, 53, 8]],
]);

test("MEB nüfus yörelerinden idari karşılığı olanlar gerçek il poligonlarını kullanır", () => {
  for (const [id, plates] of exactPopulationProvinceUnions) {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(
      page,
      new RegExp(`regionFeature\\("${escapedId}",[^\\n]+\\[${plates.join(", ")}\\]\\)`),
      `${id}: gerçek il birleşimine bağlanmalı`,
    );
    assert.doesNotMatch(
      page,
      new RegExp(`\\bf\\("${escapedId}",[^\\n]+,\\s*"region"\\)`),
      `${id}: eski yaklaşık bölge kalmamalı`,
    );
  }
});

test("nüfus oyunları MEB'in 15 konumlu etkinliğine doğrudan bağlıdır", () => {
  assert.match(page, /population: \{[\s\S]*?page139\.html/);
  assert.match(page, /"dense-population": \{[\s\S]*?page139\.html/);
  assert.match(page, /"sparse-population": \{[\s\S]*?page139\.html/);
  assert.match(page, /features: \[\.\.\.DENSE_POPULATION_FEATURES, \.\.\.SPARSE_POPULATION_FEATURES\]/);
});

test("idari sınırı olmayan dört seyrek nüfus yöresi gerçek fiziki alan kullanır", () => {
  assert.deepEqual(
    populationAreas.features.map((feature) => feature.properties.id),
    ["population-yildiz", "population-teke", "population-taseli", "population-tuz-lake"],
  );
  for (const feature of populationAreas.features) {
    assert.equal(feature.properties.source, "MEB");
    assert.match(feature.properties.source_url, /page139\.html/);
    assert.match(feature.geometry.type, /^(Polygon|MultiPolygon)$/);
  }
  assert.match(page, /"yildiz-pop": "population-yildiz"/);
  assert.match(page, /"teke-pop": "population-teke"/);
  assert.match(page, /"taseli-pop": "population-taseli"/);
  assert.match(page, /"tuz-lake-pop": "population-tuz-lake"/);
  assert.match(page, /turkey-population-areas\.geojson/);
});
