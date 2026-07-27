import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

const expectedDamIds = [
  "keban-dam", "karakaya-dam", "ataturk-dam", "birecik-dam", "karkamis-dam",
  "kralkizi-dam", "ilisu-dam", "batman-dam", "dicle-dam", "devegecidi-dam",
  "arpacay-dam", "seyhan-dam", "catalan-dam", "sir-dam", "aslantas-dam",
  "menzelet-dam", "kartalkaya-dam", "oymapinar-dam", "demirkopru-dam",
  "kemer-dam", "adiguzel-dam", "porsuk-dam", "bayindir-dam", "sariyar-dam",
  "gokcekaya-dam", "kurtbogazi-dam", "hirfanli-dam", "derbent-dam",
  "kesikkopru-dam", "altinkaya-dam", "kapulukaya-dam", "cubuk1-dam",
  "cubuk2-dam", "almus-dam", "hasanugurlu-dam", "suatugurlu-dam",
  "kilickaya-dam", "muratli-dam", "borcka-dam", "deriner-dam",
];

function damsQuizBlock() {
  const start = source.indexOf('id: "dams"');
  assert.notEqual(start, -1, "dams quiz should exist");
  const next = source.indexOf("\n  {\n    id:", start + 10);
  return source.slice(start, next);
}

test("MEB's 40 named river dams are present once and in source order", () => {
  const ids = [...damsQuizBlock().matchAll(/f\("([^"]+-dam)"/g)]
    .map((match) => match[1]);
  assert.deepEqual(ids, expectedDamIds);
  assert.equal(new Set(ids).size, 40);
});

test("every MEB dam has a unique explicit dam-body coordinate in Turkey", () => {
  const coordinates = expectedDamIds.map((id) => {
    const match = source.match(
      new RegExp(`"${id}": \\[(-?\\d+(?:\\.\\d+)?), (-?\\d+(?:\\.\\d+)?)\\]`),
    );
    assert.ok(match, `${id} should have an explicit coordinate`);
    return [Number(match[1]), Number(match[2])];
  });

  assert.equal(
    new Set(coordinates.map(([longitude, latitude]) => `${longitude},${latitude}`)).size,
    expectedDamIds.length,
  );
  for (const [longitude, latitude] of coordinates) {
    assert.ok(longitude >= 25.5 && longitude <= 45, `longitude ${longitude} is outside Turkey`);
    assert.ok(latitude >= 35.7 && latitude <= 42.2, `latitude ${latitude} is outside Turkey`);
  }
});

test("dam scope is linked to the exact official MEB source page", () => {
  assert.match(
    source,
    /MEB kapsamı · DSİ \+ OSM gövde doğrulaması[\s\S]*cografya\/10\/unite1\/files\/basic-html\/page79\.html/,
  );
});
