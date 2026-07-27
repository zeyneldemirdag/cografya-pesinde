import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

const additions = new Map([
  ["akcakale-gate", { name: "Akçakale", coordinate: [38.95757, 36.70772] }],
  ["ceylanpinar-gate", { name: "Ceylanpınar", coordinate: [40.0548, 36.8466] }],
  ["nusaybin-gate", { name: "Nusaybin", coordinate: [41.21766, 37.06287] }],
  ["yayladagi-gate", { name: "Yayladağı", coordinate: [36.01188, 35.90087] }],
]);

function gatesBody() {
  const match = source.match(/id: "gates",[\s\S]*?features: \[([\s\S]*?)\n\s*\],/);
  assert.ok(match, "Sınır Kapıları oyunu bulunamadı");
  return match[1];
}

test("Ticaret Bakanlığı kara hudut kapıları kapsamı 23 hedeftir", () => {
  const names = [...gatesBody().matchAll(/\bf\("[^"]+",\s*"([^"]+)"/g)]
    .map((match) => match[1]);
  assert.equal(names.length, 23);
  assert.equal(new Set(names).size, 23);
  for (const { name } of additions.values()) {
    assert.ok(names.includes(name), `${name} sınır kapısı eksik`);
  }
});

test("eklenen dört kapı gerçek sınır koordinatındadır", () => {
  for (const [id, { coordinate }] of additions) {
    const pattern = new RegExp(
      `"${id}": \\[${coordinate[0]}, ${coordinate[1]}\\]`,
    );
    assert.match(source, pattern, `${id} koordinatı değişmiş veya eksik`);
  }
});

test("oyun güncel resmî Ticaret Bakanlığı tablosunu kaynak gösterir", () => {
  assert.match(
    source,
    /gates: \{[\s\S]*?Ticaret Bakanlığı 2026 kara hudut kapıları \+ MEB[\s\S]*?Kara%20Kapilarina%20ve%20Arac%20Turlerine%20Gore%20Arac%20Sayilari/,
  );
});
