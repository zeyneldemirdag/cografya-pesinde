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

test("kesişen akarsular renkleri birbirine karıştırmayan ayırıcı kılıfa sahiptir", () => {
  const casings = page.match(/className="geo-river-casing"/g) ?? [];
  assert.equal(casings.length, 2);
  assert.match(styles, /\.geo-river-casing\s*\{[\s\S]*stroke-width: 8\.5/);
  assert.match(styles, /\.geo-shape--exact-river\s*\{[\s\S]*stroke-width: 5\.2/);
});

test("doğru cevap aynı güncellemede bütün yanlış vurguları temizler", () => {
  assert.match(
    page,
    /flushSync\(\(\) => \{[\s\S]*setCorrectIds\(nextCorrect\)[\s\S]*setQuestionOrder[\s\S]*setWrongIds\(\[\]\)/,
  );
});
