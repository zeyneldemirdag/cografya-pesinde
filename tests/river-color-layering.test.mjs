import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [page, styles] = await Promise.all([
  readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

test("doğru akarsu yanlış akarsuyun üstünde, güncel hedef en üstte çizilir", () => {
  assert.match(page, /if \(feature\.id === currentFeatureId\) return 30/);
  assert.match(page, /if \(correctIds\.includes\(feature\.id\)\) return 20/);
  assert.match(page, /if \(wrongIds\.includes\(feature\.id\)\) return 10/);
  assert.match(page, /featureLayerPriority\(left\) - featureLayerPriority\(right\)/);
});

test("akarsular beyaz yol konturu olmadan sade çizilir", () => {
  assert.doesNotMatch(page, /geo-river-casing/);
  assert.doesNotMatch(styles, /\.geo-river-casing/);
  assert.match(styles, /\.geo-shape--exact-river\s*\{[\s\S]*stroke-width: 5\.5/);
});

test("doğru cevap aynı güncellemede bütün yanlış vurguları temizler", () => {
  assert.match(
    page,
    /flushSync\(\(\) => \{[\s\S]*setCorrectIds\(nextCorrect\)[\s\S]*setQuestionOrder[\s\S]*setWrongIds\(\[\]\)/,
  );
});

test("akarsular kopuk yan kollar yerine tek ana yatak olarak çizilir", () => {
  assert.match(page, /function primaryRiverCoordinates\(feature: RiverFeature\)/);
  assert.match(page, /const joinToleranceKm = 2\.5/);
  assert.match(page, /return primaryRiverCoordinates\(feature\)/);
  assert.match(
    page,
    /const usesRiverOverride = feature\.kind === "river"[\s\S]*\["aras", "aras-br", "coruh", "dicle"\]\.includes\(feature\.id\)/,
  );
  assert.doesNotMatch(
    page,
    /function riverPath\(feature: RiverFeature\) \{[\s\S]*?return lines[\s\S]*?\.join\(" "\)/,
  );
});
