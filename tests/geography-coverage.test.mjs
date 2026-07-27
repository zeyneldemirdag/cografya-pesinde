import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import test from "node:test";

const report = JSON.parse(
  execFileSync(process.execPath, ["scripts/audit-geography.mjs"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
  }),
);

test("hiçbir coğrafi öğe yaklaşık yedek şekle düşmez", () => {
  assert.equal(report.fallback.length, 0);
  const classified = Object.values(report.geometryCounts)
    .reduce((sum, count) => sum + count, 0);
  assert.equal(classified, report.uniqueFeatures);
});

test("genel konu haritaları alt konulardaki öğelerin tamamını kapsar", () => {
  for (const comparison of report.coverageComparisons) {
    assert.deepEqual(
      comparison.missingFromGeneral,
      [],
      `${comparison.general} içinde eksik alt konu öğeleri var`,
    );
  }
});

test("resmî MEB, DSİ ve Ticaret Bakanlığı çekirdek listeleri eksiksizdir", () => {
  for (const coverage of report.sourceCoverage) {
    assert.deepEqual(
      coverage.missing,
      [],
      `${coverage.quiz} resmî kaynak karşılaştırmasında eksik öğeler içeriyor`,
    );
  }
});

test("grup kaynağının yetersiz kaldığı oyunların konuya özel resmî kaynağı vardır", () => {
  assert.deepEqual(report.missingSourceOverrides, []);
});

test("hiçbir oyun yinelenen teknik kimlik yüzünden bir hedefi gizlemez", () => {
  assert.deepEqual(report.duplicateQuizFeatureIds, []);
});

test("kapalı havza oyunu resmî CBS sınırlarını kullanır", () => {
  const basinData = JSON.parse(
    fs.readFileSync(
      new URL("../public/data/turkey-closed-basins.geojson", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(
    basinData.features.map((feature) => feature.properties.id).sort(),
    ["akaracay-basin", "aras-basin", "burdur-basin", "konya-closed-basin", "van-basin"],
  );
  assert.equal(report.geometryCounts["exact-basin"], 5);
});

test("kara komşuları oyunu sekiz gerçek ülke poligonunu kullanır", () => {
  const neighborData = JSON.parse(
    fs.readFileSync(
      new URL("../public/data/turkey-neighbors.geojson", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(
    neighborData.features.map((feature) => feature.properties.id).sort(),
    ["armenia", "azerbaijan", "bulgaria", "georgia", "greece", "iran", "iraq", "syria"],
  );
  assert.equal(neighborData.source, "Natural Earth 1:50m Admin 0 Countries, version 5.1.1");
  assert.equal(report.geometryCounts["exact-country"], 8);
});

test("başlıca fay sistemleri MTA 2026 çizgilerini kullanır", () => {
  const faultData = JSON.parse(
    fs.readFileSync(
      new URL("../public/data/turkey-active-faults.geojson", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(
    faultData.features.map((feature) => feature.properties.id).sort(),
    ["east-anatolian-fault", "north-anatolian-fault", "west-anatolian-faults"],
  );
  assert.match(faultData.source, /MTA Türkiye Diri Fay Haritası 2026/);
  assert.ok(
    faultData.features.every(
      (feature) =>
        feature.geometry.type === "MultiLineString" &&
        feature.geometry.coordinates.length > 100,
    ),
  );
  assert.equal(report.geometryCounts["exact-fault"], 3);
});

test("karma oluşumlu ve sirk gölleri gerçek su poligonlarını kullanır", () => {
  const lakeData = JSON.parse(
    fs.readFileSync(
      new URL("../public/data/turkey-mixed-glacial-lakes.geojson", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(
    lakeData.features.map((feature) => feature.properties.id).sort(),
    ["aynali-glacial", "deligol-glacial", "kilimli-glacial", "yarisli"],
  );
  assert.ok(
    lakeData.features.every(
      (feature) =>
        /Polygon/.test(feature.geometry.type) &&
        feature.properties.classification_source.includes("ogmmateryal.eba.gov.tr"),
    ),
  );
  assert.equal(
    report.sourceCoverage.find((coverage) => coverage.quiz === "mixed-origin-lakes").expectedCount,
    6,
  );
  assert.equal(
    report.sourceCoverage.find((coverage) => coverage.quiz === "glacial-lakes").expectedCount,
    3,
  );
});
