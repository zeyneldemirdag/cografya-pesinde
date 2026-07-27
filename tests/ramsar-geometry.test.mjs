import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const ramsarShapes = JSON.parse(
  fs.readFileSync(new URL("../public/data/turkey-ramsar.geojson", import.meta.url), "utf8"),
);

const exactWaterAliases = new Map([
  ["kus", "manyas"],
  ["burdur-r", "burdur"],
  ["uluabat-r", "uluabat"],
  ["seyfe-r", "seyfe"],
  ["nemrut-kaldera", "nemrut"],
  ["akyatan-r", "akyatan-set"],
  ["meke-r", "meke"],
  ["kizoren-r", "kizoren"],
]);

test("sekiz Ramsar gölü, lagünü ve maarı gerçek su poligonuna bağlıdır", () => {
  const aliases = source.match(/function lakeShapeId[\s\S]*?const aliases:[\s\S]*?\n\s*};/)?.[0] ?? "";
  for (const [featureId, waterId] of exactWaterAliases) {
    assert.match(
      aliases,
      new RegExp(`"${featureId}"|\\b${featureId}:`),
      `${featureId} su geometrisi eşlemesi eksik`,
    );
    assert.match(aliases, new RegExp(`"${waterId}"`), `${waterId} hedefi eksik`);
  }
});

test("Ramsar oyunu 14 benzersiz resmî hedef içerir", () => {
  const match = source.match(/id: "ramsar",[\s\S]*?features: \[([\s\S]*?)\n\s*\],/);
  assert.ok(match, "Ramsar oyunu bulunamadı");
  const ids = [...match[1].matchAll(/\bf\("([^"]+)"/g)].map((entry) => entry[1]);
  assert.equal(ids.length, 14);
  assert.equal(new Set(ids).size, 14);
  assert.match(
    source,
    /ramsar: \{[\s\S]*?DKMP 14 Ramsar alanı \+ korunan alan sınırları[\s\S]*?DKMP\/Menu\/31\/Sulak-Alanlar/,
  );
});

test("altı sazlık, delta ve koruma alanı gerçek OSM sınır poligonlarını kullanır", () => {
  const expected = new Set([
    "kuyucuk",
    "sultan-sazligi",
    "kizilirmak-delta",
    "goksu-delta",
    "gediz-r",
    "yumurtalik-r",
  ]);
  assert.deepEqual(
    new Set(ramsarShapes.features.map((feature) => feature.properties.id)),
    expected,
  );
  for (const feature of ramsarShapes.features) {
    assert.equal(feature.geometry.type, "Polygon");
    assert.ok(feature.geometry.coordinates[0].length >= 10, `${feature.properties.id} sınırı fazla kaba`);
    assert.match(feature.properties.osm, /^[RW]\d+$/);
  }
  assert.match(source, /fetch\(publicAsset\("\/data\/turkey-ramsar\.geojson"\)\)/);
});

test("ülke ölçeğinde küçük kalan altı Ramsar alanının geniş dokunma hedefi vardır", () => {
  const hitBlock = source.match(/const EXPANDED_AREA_HIT_IDS[\s\S]*?\n\]\);/)?.[0] ?? "";
  for (const id of [
    "kuyucuk",
    "sultan-sazligi",
    "nemrut-kaldera",
    "seyfe-r",
    "meke-r",
    "kizoren-r",
  ]) {
    assert.match(hitBlock, new RegExp(`"${id}"`), `${id} geniş dokunma hedefinden eksik`);
  }
  assert.match(source, /EXPANDED_AREA_HIT_IDS\.has\(feature\.id\)/);
});
