import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

function polygon(id) {
  const straitSource = source.slice(source.indexOf("const STRAIT_POLYGONS"));
  const match = straitSource.match(new RegExp(`"${id}": \\[(.*?)\\],\\n`, "s"));
  assert.ok(match, `${id} su yüzeyi poligonu bulunamadı`);
  return [...match[1].matchAll(/\[\s*([\d.]+)\s*,\s*([\d.]+)\s*\]/g)]
    .map((entry) => [Number(entry[1]), Number(entry[2])]);
}

test("oyun yalnızca Türkiye'nin iki doğal boğazını doğru adla kapsar", () => {
  assert.match(source, /title: "Türkiye'nin Boğazları"/);
  assert.doesNotMatch(source, /title: "Kanallar ve Boğazlar"/);
  assert.match(source, /f\("istanbul-strait", "İstanbul Boğazı"/);
  assert.match(source, /f\("canakkale-strait", "Çanakkale Boğazı"/);
});

test("İstanbul Boğazı kaba çizgi değil ayrıntılı su yüzeyi poligonudur", () => {
  const points = polygon("istanbul-strait");
  assert.ok(points.length >= 50);
  assert.equal(points[0][0], points.at(-1)[0]);
  assert.equal(points[0][1], points.at(-1)[1]);
  assert.ok(Math.min(...points.map(([longitude]) => longitude)) >= 28.95);
  assert.ok(Math.max(...points.map(([longitude]) => longitude)) <= 29.17);
});

test("Çanakkale Boğazı kaba çizgi değil ayrıntılı su yüzeyi poligonudur", () => {
  const points = polygon("canakkale-strait");
  assert.ok(points.length >= 90);
  assert.equal(points[0][0], points.at(-1)[0]);
  assert.equal(points[0][1], points.at(-1)[1]);
  assert.ok(Math.min(...points.map(([, latitude]) => latitude)) >= 39.98);
  assert.ok(Math.max(...points.map(([, latitude]) => latitude)) <= 40.43);
});

test("boğaz poligonları özel tıklanabilir geometri olarak çizilir", () => {
  assert.match(source, /const straitPolygon = STRAIT_POLYGONS\[feature\.id\]/);
  assert.match(source, /geo-shape--strait geo-shape--exact/);
});
