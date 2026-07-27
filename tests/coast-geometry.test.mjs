import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

function lineCoordinates(id, nextId) {
  const block = source.match(
    new RegExp(`"${id}":\\s*\\[([\\s\\S]*?)\\],\\s*"${nextId}"`),
  )?.[1] ?? "";
  return [...block.matchAll(/\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]/g)]
    .map((match) => [Number(match[1]), Number(match[2])]);
}

test("boyuna Akdeniz çizgisi Suriye kara sınırına taşmaz", () => {
  const coordinates = lineCoordinates("boyuna-med", "enine-aegean");
  assert.ok(coordinates.length > 20);
  assert.ok(Math.max(...coordinates.map(([longitude]) => longitude)) < 36.3);
  assert.ok(Math.min(...coordinates.map(([, latitude]) => latitude)) < 36);
});

test("enine Ege çizgisi Marmaris-Fethiye ria kesimine taşmaz", () => {
  const coordinates = lineCoordinates("enine-aegean", "ria-istanbul");
  assert.ok(coordinates.length > 30);
  assert.ok(Math.min(...coordinates.map(([, latitude]) => latitude)) >= 37.35);
  assert.match(source, /Ria Kıyı · Marmaris-Fethiye/);
});

test("küçük tombolo poligonlarının genişletilmiş dokunma alanı vardır", () => {
  assert.match(source, /feature\.id\.startsWith\("tombolo-"\)/);
  assert.match(source, /geo-hit--small-area/);
});
