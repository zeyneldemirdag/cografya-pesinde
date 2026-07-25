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
