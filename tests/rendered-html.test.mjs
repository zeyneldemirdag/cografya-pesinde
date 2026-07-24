import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("KPSS harita oyunu sunucuda doğru kimlikle oluşturulur", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Coğrafya Peşinde/);
  assert.match(html, /Haritada bul/);
  assert.match(html, /Türkiye Dağları/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Starter Project/);
});

test("81 il verisi tam, benzersiz ve doğru plaka dizisindedir", async () => {
  const data = JSON.parse(
    await readFile(new URL("../public/data/turkey-provinces.geojson", import.meta.url), "utf8"),
  );
  assert.equal(data.features.length, 81);
  const plates = data.features.map((feature) => feature.properties.plate).sort((a, b) => a - b);
  assert.deepEqual(plates, Array.from({ length: 81 }, (_, index) => index + 1));
  assert.equal(new Set(data.features.map((feature) => feature.properties.name)).size, 81);
  assert.equal(
    data.features.find((feature) => feature.properties.plate === 71).properties.name,
    "Kırıkkale",
  );
});

test("gerçek göl ve akarsu şekilleri ile oyun davranışı kaynakta bulunur", async () => {
  const [lakes, rivers, page] = await Promise.all([
    readFile(new URL("../public/data/turkey-lakes.geojson", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../public/data/turkey-rivers.geojson", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.ok(lakes.features.length >= 18);
  assert.ok(lakes.features.every((feature) => /Polygon/.test(feature.geometry.type)));
  assert.equal(rivers.features.length, 20);
  assert.ok(
    rivers.features.every(
      (feature) =>
        feature.geometry.type === "MultiLineString" &&
        feature.geometry.coordinates.length > 0,
    ),
  );
  assert.match(page, /setWrongIds\(\[\]\)/);
  assert.match(page, /setCorrectIds\(nextCorrect\)/);
  assert.match(page, /id: "provinces"/);
  assert.match(page, /id: "delta-plains"/);
  assert.match(page, /id: "glacial-mountains"/);
  assert.match(page, /id: "black-sea-rivers"/);
  assert.match(page, /id: "inbound-rivers"/);
});
