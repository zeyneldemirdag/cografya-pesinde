import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

const additions = new Map([
  ["ilgaz-pass", { name: "Ilgaz Dağı Geçidi", coordinate: [33.7449, 41.0437] }],
  ["ovit-pass", { name: "Ovit Geçidi", coordinate: [40.7811342, 40.6259079] }],
  ["egribel-pass", { name: "Eğribel Geçidi", coordinate: [38.397344, 40.456541] }],
  ["cankurtaran-pass", { name: "Cankurtaran Geçidi", coordinate: [41.5327165, 41.3939175] }],
]);

function passNames() {
  const match = source.match(/id: "passes",[\s\S]*?features: \[([\s\S]*?)\n\s*\],/);
  assert.ok(match, "Geçitler oyunu bulunamadı");
  return [...match[1].matchAll(/\bf\("[^"]+",\s*"([^"]+)"/g)]
    .map((entry) => entry[1]);
}

test("MEB/KGM çekirdek geçit kapsamı 11 benzersiz hedeftir", () => {
  const names = passNames();
  assert.equal(names.length, 11);
  assert.equal(new Set(names).size, 11);
  for (const { name } of additions.values()) {
    assert.ok(names.includes(name), `${name} eksik`);
  }
});

test("eklenen geçitler gerçek dağ geçidi koordinatlarını kullanır", () => {
  for (const [id, { coordinate }] of additions) {
    assert.match(
      source,
      new RegExp(`"${id}": \\[${coordinate[0]}, ${coordinate[1]}\\]`),
      `${id} koordinatı değişmiş veya eksik`,
    );
  }
});

test("oyun MEB sınav kapsamı ve KGM yol ağını kaynak gösterir", () => {
  assert.match(
    source,
    /passes: \{[\s\S]*?MEB sınav kapsamı \+ KGM · 11 çekirdek geçit[\s\S]*?page183\.html/,
  );
});
