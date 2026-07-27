import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

const officialProvinceUnions = new Map([
  ["wheat", [42, 6, 21]],
  ["barley-ag", [42, 6, 63]],
  ["rice", [22, 55, 10]],
  ["chickpea-ag", [40, 6]],
  ["bean-ag", [42, 51]],
  ["lentil", [21, 66]],
  ["tobacco", [20, 45, 2, 55]],
  ["sugarbeet", [42, 66, 68, 26]],
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
