import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const [source, styles] = [
  fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8"),
  fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8"),
];

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
    /gates: \{[\s\S]*?Ticaret Bakanlığı 2026 kara hudut kapıları \+ TCDD ana demiryolu ağı[\s\S]*?gumruk-idareleri\/hudut-kapilari\/kara-hudut-kapilari/,
  );
});

test("sınır kapıları kemerli kapı simgesi ve TCDD ana hat bilgi katmanıyla çizilir", () => {
  assert.match(source, /const RAILWAY_NETWORK_LINES: Coordinate\[\]\[\] = \[/);
  assert.match(source, /quiz\.id === "gates"[\s\S]*?railway-context-layer/);
  assert.match(source, /className="gate-glyph"/);
  assert.match(source, /TCDD ANA DEMİRYOLU AĞI/);
  assert.match(styles, /\.geo-shape--gate \{[\s\S]*?fill: #ef8b2c/);
  assert.match(styles, /\.railway-line \{[\s\S]*?stroke-dasharray: 5 2\.6/);
});

test("kapı haritası sekiz komşuyu gösterir ve yakın kapıları çağrı çizgileriyle ayırır", () => {
  assert.match(source, /quiz\.id === "neighbors" \|\| quiz\.id === "gates"[\s\S]*?"-100 -80 1200 590"/);
  assert.match(source, /quiz\.id === "gates"[\s\S]*?className="gate-neighbor-layer"/);
  assert.match(source, /Object\.entries\(NEIGHBOR_LABEL_COORDINATES\)/);
  assert.match(source, /const GATE_CALLOUT_OFFSETS: Record<string, Coordinate> = \{/);
  assert.match(source, /className="gate-callout-leader"/);
  assert.match(source, /feature\.kind === "gate"[\s\S]*?GATE_CALLOUT_OFFSETS\[feature\.id\]/);
  assert.match(styles, /\.gate-neighbor-country \{[\s\S]*?fill: #566466/);
  assert.match(styles, /\.gate-neighbor-label \{[\s\S]*?text-transform: uppercase/);
});
