import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const agricultureAreas = JSON.parse(
  fs.readFileSync(
    new URL("../public/data/turkey-agriculture-areas.geojson", import.meta.url),
    "utf8",
  ),
);

const officialProvinceUnions = new Map([
  ["wheat", [42, 6, 21]],
  ["barley-ag", [42, 6, 63]],
  ["corn", [1, 33, 80, 31, 63, 21, 47, 27, 72, 73, 56, 79, 9, 35, 45, 20]],
  ["rice", [22, 55, 10]],
  ["chickpea-ag", [40, 6]],
  ["bean-ag", [42, 51]],
  ["lentil", [21, 66]],
  ["tobacco", [20, 45, 2, 55]],
  ["sugarbeet", [42, 66, 68, 26]],
  ["cotton", [63, 1, 33, 31, 80, 9, 35, 45, 76]],
  ["sunflower", [59, 42, 22, 39]],
  ["peanut-ag", [1, 80]],
  ["soybean-ag", [1, 33, 55]],
  ["olive", [45, 9, 16, 10]],
  ["hazelnut", [52, 28, 54]],
  ["tea", [53, 8, 61]],
  ["grape", [45, 20, 33]],
  ["pistachio", [27, 63]],
  ["citrus", [1, 31, 33, 7]],
  ["apricot", [44]],
  ["fig", [9]],
  ["apple", [32]],
  ["angora-goat", [6, 18, 26, 38, 40, 42, 50, 51, 58, 66, 68, 70, 71, 2, 21, 27, 47, 56, 63, 72, 73, 79]],
  ["pasture-cattle", [25, 36, 4, 75]],
  ["stable-cattle", [10, 11, 16, 17, 22, 34, 39, 41, 54, 59, 77, 3, 9, 20, 35, 43, 45, 48, 64, 1, 7, 15, 31, 32, 33, 46, 80, 6, 18, 26, 38, 40, 42, 50, 51, 58, 66, 68, 70, 71]],
  ["poultry", [14, 54, 10, 45]],
  ["silkworm", [21, 63, 7, 16]],
  ["beekeeping", [36, 13, 30, 53, 52, 6, 48, 25, 42]],
]);

test("MEB'in il adı verdiği tarım ve hayvancılık hedefleri gerçek il birleşimleridir", () => {
  for (const [id, plates] of officialProvinceUnions) {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(
      page,
      new RegExp(`regionFeature\\("${escapedId}",[^\\n]+\\[${plates.join(", ")}\\]\\)`),
      `${id}: MEB il listesi gerçek il poligonlarına bağlanmalı`,
    );
  }
});

test("eski geniş dikdörtgen bölge tanımları il hedefleri için kullanılmaz", () => {
  for (const id of officialProvinceUnions.keys()) {
    const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.doesNotMatch(
      page,
      new RegExp(`\\bf\\("${escapedId}",[^\\n]+,\\s*"region"\\)`),
      `${id}: yaklaşık f() bölgesi kalmamalı`,
    );
  }
});

test("çakışan üretim illerinde güncel soru en üst tıklama katmanına alınır", () => {
  assert.match(page, /if \(left\.id === currentFeatureId\) return 1;/);
  assert.match(page, /if \(right\.id === currentFeatureId\) return -1;/);
});

test("tarım ve hayvancılık kaynakları doğrudan MEB konu özetlerine bağlıdır", () => {
  assert.match(page, /"grain-legume-crops": \{[\s\S]*?page28\.html/);
  assert.match(page, /"industrial-oil-crops": \{[\s\S]*?page29\.html/);
  assert.match(page, /"fruit-special-crops": \{[\s\S]*?page30\.html/);
  assert.match(page, /"other-livestock": \{[\s\S]*?page32\.html/);
});

test("muz hedefi Anamur ve Alanya'nın gerçek ilçe sınırlarından oluşur", () => {
  assert.equal(agricultureAreas.features.length, 1);
  const [banana] = agricultureAreas.features;
  assert.equal(banana.properties.id, "banana-anamur-alanya");
  assert.equal(banana.geometry.type, "MultiPolygon");
  assert.ok(banana.geometry.coordinates.length >= 2);
  assert.deepEqual(banana.properties.boundary_urls, [
    "https://www.openstreetmap.org/relation/1827892",
    "https://www.openstreetmap.org/relation/1726977",
  ]);
  assert.match(banana.properties.source_url, /page30\.html/);
  assert.match(page, /banana: "banana-anamur-alanya"/);
  assert.match(page, /turkey-agriculture-areas\.geojson/);
});
