import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

const bridgeIds = ["bogazici-b", "fsm-b", "yss-b", "osmangazi-b", "canakkale-b"];
const tunnelIds = [
  "avrasya-t",
  "marmaray-t",
  "bolu-t",
  "ovit-t",
  "zigana-t",
  "ilgaz-t",
  "cankurtaran-t",
  "sabuncubeli-t",
  "egribel-t",
];

function lineCoordinates(id) {
  const match = page.match(new RegExp(`"${id}": \\[(\\[[^\\n]+)\\],`));
  assert.ok(match, `${id} gerçek ekseni eksik`);
  return [...match[1].matchAll(/\[(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\]/g)]
    .map((entry) => [Number(entry[1]), Number(entry[2])]);
}

test("beş köprü OSM yol eksenleriyle çizilir", () => {
  for (const id of bridgeIds) {
    const coordinates = lineCoordinates(id);
    assert.ok(coordinates.length >= 4, `${id} ekseni fazla kaba`);
  }
});

test("dokuz tünel OSM güzergâh eksenleriyle çizilir", () => {
  for (const id of tunnelIds) {
    const coordinates = lineCoordinates(id);
    assert.ok(coordinates.length >= 5, `${id} ekseni fazla kaba`);
  }
});

test("yapı eksenlerinin geniş tıklama alanı, kaplaması ve uç işaretleri vardır", () => {
  assert.match(page, /geo-line-hit geo-structure-hit/);
  assert.match(page, /structure-axis-casing/);
  assert.match(page, /STRUCTURE_CALLOUT_OFFSETS/);
  assert.match(page, /structure-callout-marker/);
  assert.match(page, /geo-shape--\$\{isBridgeAxis \? "bridge-axis" : "tunnel-axis"\}/);
  assert.match(css, /\.geo-shape--bridge-axis\s*\{/);
  assert.match(css, /\.geo-shape--tunnel-axis\s*\{/);
  assert.equal((page.match(/className="structure-axis-end"/g) ?? []).length, 2);
  assert.match(css, /\.geo-structure-hit\s*\{[\s\S]*?stroke-width:\s*24/);
  assert.match(css, /\.geo-shape--tunnel-axis\s*\{[\s\S]*?stroke-dasharray:\s*7 4/);
  assert.match(css, /\.structure-callout-marker\s*\{[\s\S]*?cursor:\s*pointer/);
});

test("İstanbul'daki beş yakın geçiş ayrılmış çağrı işaretlerine sahiptir", () => {
  const calloutBlock = page.match(/const STRUCTURE_CALLOUT_OFFSETS[\s\S]*?\n};/)?.[0] ?? "";
  for (const id of ["bogazici-b", "fsm-b", "yss-b", "avrasya-t", "marmaray-t"]) {
    assert.match(calloutBlock, new RegExp(`"${id}": \\[-?\\d+, -?\\d+\\]`), `${id} çağrısı eksik`);
  }
});
