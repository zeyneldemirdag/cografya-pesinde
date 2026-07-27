import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

const expected = new Map([
  ["izmit-g", { name: "İzmit Körfezi", lon: [29.1, 30.1], lat: [40.6, 40.9] }],
  ["gemlik-g", { name: "Gemlik Körfezi", lon: [28.7, 29.4], lat: [40.25, 40.55] }],
  ["gulluk-g", { name: "Güllük Körfezi", lon: [27.0, 27.7], lat: [36.9, 37.4] }],
]);

function lineCoordinates(id) {
  const match = source.match(
    new RegExp(`"${id}": \\[(.*?)\\],\\n`, "s"),
  );
  assert.ok(match, `${id} için gerçek kıyı çizgisi bulunamadı`);
  return [...match[1].matchAll(/\[\s*([\d.]+)\s*,\s*([\d.]+)\s*\]/g)]
    .map((point) => [Number(point[1]), Number(point[2])]);
}

test("MEB/HGM ana körfez kapsamı 12 hedef içeriyor", () => {
  const gulfs = source.match(/id: "gulfs",[\s\S]*?features: \[([\s\S]*?)\n\s*\],/);
  assert.ok(gulfs);
  const names = [...gulfs[1].matchAll(/\bf\("[^"]+",\s*"([^"]+)"/g)]
    .map((match) => match[1]);
  assert.equal(names.length, 12);
  for (const { name } of expected.values()) assert.ok(names.includes(name), `${name} eksik`);
});

test("eklenen körfez çizgileri doğru kıyı kutularında kalıyor", () => {
  for (const [id, bounds] of expected) {
    const coordinates = lineCoordinates(id);
    assert.ok(coordinates.length >= 8, `${id} çizgisi fazla kaba`);
    for (const [longitude, latitude] of coordinates) {
      assert.ok(
        longitude >= bounds.lon[0] && longitude <= bounds.lon[1],
        `${id} boylamı kıyı aralığı dışında: ${longitude}`,
      );
      assert.ok(
        latitude >= bounds.lat[0] && latitude <= bounds.lat[1],
        `${id} enlemi kıyı aralığı dışında: ${latitude}`,
      );
    }
  }
});
