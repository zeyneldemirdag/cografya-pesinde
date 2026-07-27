import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

const additions = new Map([
  ["ilgaz-t", { name: "Ilgaz 15 Temmuz İstiklal Tüneli", coordinate: [33.7505896, 41.0631322] }],
  ["cankurtaran-t", { name: "Cankurtaran Tüneli", coordinate: [41.5378512, 41.3847405] }],
  ["sabuncubeli-t", { name: "Sabuncubeli Tüneli", coordinate: [27.3015543, 38.5464436] }],
  ["egribel-t", { name: "Eğribel Tüneli", coordinate: [38.3754329, 40.4522779] }],
]);

function quizBody(id) {
  const match = source.match(new RegExp(`id: "${id}",[\\s\\S]*?features: \\[([\\s\\S]*?)\\n\\s*\\],`));
  assert.ok(match, `${id} oyunu bulunamadı`);
  return match[1];
}

function namesIn(id) {
  return [...quizBody(id).matchAll(/\bf\("[^"]+",\s*"([^"]+)"/g)]
    .map((match) => match[1]);
}

test("KGM çekirdek tünel kapsamı 9 benzersiz hedeftir", () => {
  const names = namesIn("tunnels");
  assert.equal(names.length, 9);
  assert.equal(new Set(names).size, 9);
  for (const { name } of additions.values()) {
    assert.ok(names.includes(name), `${name} eksik`);
  }
});

test("köprü ve tünel birleşik oyunu 14 benzersiz hedeftir", () => {
  const names = namesIn("bridges-tunnels");
  assert.equal(names.length, 14);
  assert.equal(new Set(names).size, 14);
});

test("eklenen tüneller gerçek güzergâh orta noktalarını kullanır", () => {
  for (const [id, { coordinate }] of additions) {
    assert.match(
      source,
      new RegExp(`"${id}": \\[${coordinate[0]}, ${coordinate[1]}\\]`),
      `${id} koordinatı değişmiş veya eksik`,
    );
  }
});

test("tünel oyunu güncel resmî KGM haritasını kaynak gösterir", () => {
  assert.match(
    source,
    /tunnels: \{[\s\S]*?KGM başlıca tünel projeleri \+ tünel haritası[\s\S]*?Haritalar\/tuneller\.pdf/,
  );
});
