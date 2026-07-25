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
  const [lakes, rivers, page, styles] = await Promise.all([
    readFile(new URL("../public/data/turkey-lakes.geojson", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../public/data/turkey-rivers.geojson", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
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
  assert.match(page, /if \(isLastQuestion\) setFinished\(true\)/);
  assert.match(page, /id: "provinces"/);
  assert.match(page, /id: "delta-plains"/);
  assert.match(page, /id: "tectonic-plains"/);
  assert.match(page, /id: "karstic-plains"/);
  assert.match(page, /id: "tabular-plateaus"/);
  assert.match(page, /id: "karstic-plateaus"/);
  assert.match(page, /id: "volcanic-plateaus"/);
  assert.match(page, /id: "erosion-plateaus"/);
  assert.match(page, /const TECTONIC_PLAIN_FEATURES/);
  assert.match(page, /const KARSTIC_PLAIN_FEATURES/);
  assert.match(page, /f\("pasinler-o", "Pasinler Ovası"/);
  assert.match(page, /f\("bozok", "Bozok Platosu"/);
  assert.match(page, /f\("batman-dam", "Batman Barajı · Batman Çayı"/);
  assert.match(page, /f\("kilickaya-dam", "Kılıçkaya Barajı · Kelkit Çayı"/);
  assert.match(page, /f\("cubuk1-dam", "Çubuk 1 Barajı · Çubuk Çayı"/);
  assert.match(page, /"hirfanli-dam": \[33\.5186415, 39\.273381\]/);
  assert.match(page, /MEB kapsamı · DSİ \+ OSM gövde doğrulaması/);
  assert.match(page, /id: "glacial-mountains"/);
  assert.match(page, /id: "black-sea-rivers"/);
  assert.match(page, /id: "inbound-rivers"/);
  assert.match(page, /const AREA_POLYGONS/);
  assert.match(page, /const DISTRIBUTION_POLYGONS/);
  assert.match(page, /turkey-closed-basins\.geojson/);
  assert.match(page, /geo-shape--exact-basin/);
  assert.match(page, /nemrut: \[42\.23, 38\.65\]/);
  assert.match(page, /"nemrut-tour": \[38\.74, 37\.98\]/);
  assert.match(page, /const LABEL_OFFSETS/);
  assert.match(page, /flushSync/);
  assert.match(page, /playMapSound/);
  assert.match(page, /function shuffledFeatureIds/);
  assert.match(page, /const ids = \[\.\.\.new Set\(features\.map\(\(feature\) => feature\.id\)\)\]/);
  assert.match(page, /questionOrder\.find\(\(id\) => !correctIds\.includes\(id\)\)/);
  assert.doesNotMatch(page, /questionIndex/);
  assert.match(page, /correctIds\.slice\(-1\)/);
  assert.match(page, /İsimler: \{showAllLabels \? "tümü" : "son bulunan"\}/);
  assert.match(page, /ACTIVE_QUIZ_STORAGE_KEY/);
  assert.match(page, /id: "agricultural-function-cities"/);
  assert.match(page, /id: "tourism-function-cities"/);
  assert.match(page, /id: "zonal-soils"/);
  assert.match(page, /id: "intrazonal-soils"/);
  assert.match(page, /id: "azonal-soils"/);
  assert.match(page, /id: "forest-vegetation"/);
  assert.match(page, /id: "shrub-vegetation"/);
  assert.match(page, /id: "grass-vegetation"/);
  assert.match(page, /id: "dense-population"/);
  assert.match(page, /id: "sparse-population"/);
  assert.match(page, /const DENSE_POPULATION_FEATURES/);
  assert.match(page, /const SPARSE_POPULATION_FEATURES/);
  assert.match(page, /id: "regions"/);
  assert.match(page, /1941 Türk Coğrafya Kongresi bölge haritası/);
  assert.match(page, /id: "grain-legume-crops"/);
  assert.match(page, /id: "industrial-oil-crops"/);
  assert.match(page, /id: "fruit-special-crops"/);
  assert.match(page, /id: "small-ruminant-livestock"/);
  assert.match(page, /id: "cattle-poultry-livestock"/);
  assert.match(page, /id: "other-livestock"/);
  assert.match(page, /id: "wind-energy"/);
  assert.match(page, /id: "thermal-energy"/);
  assert.match(page, /id: "other-energy"/);
  assert.match(page, /id: "metallic-mines"/);
  assert.match(page, /id: "industrial-minerals"/);
  assert.match(page, /id: "energy-raw-materials"/);
  assert.match(page, /const GRAIN_LEGUME_FEATURES/);
  assert.match(page, /const SMALL_RUMINANT_LIVESTOCK_FEATURES/);
  assert.match(page, /const WIND_ENERGY_FEATURES/);
  assert.match(page, /const METALLIC_MINE_FEATURES/);
  assert.match(styles, /\.geo-feature--correct\s*\{\s*pointer-events:\s*none;/);
  assert.match(styles, /\.geo-feature--idle \.geo-shape--plain/);
  assert.match(page, /window\.localStorage\.setItem/);
  assert.match(page, /window\.localStorage\.getItem/);
  assert.match(page, /Ses.*açık/);
  assert.match(page, /className="geo-line-hit"/);
  assert.match(page, /const usesRiverOverride/);
  assert.match(page, /f\("nemrut", "Nemrut Dağı".*"volcano"\)/);
  assert.match(page, /f\("cilo", "Cilo-Sat Dağları".*"mountain"/);
  assert.match(page, /geo-shape--distribution/);
  assert.match(page, /f\("tea", "Çay · Rize-Artvin-Trabzon".*"region"\)/);
  assert.match(page, /\n  tea: \[/);
  assert.match(page, /f\("pasture-cattle", "Mera Sığırcılığı · Kuzeydoğu Anadolu".*"region"\)/);
  assert.match(page, /\n  "freshwater-fishing": \[/);
  assert.match(
    page,
    /fp\("gap", "GAP · 9 il", 76, 65, 20, 14, \[2, 21, 27, 47, 56, 63, 72, 73, 79\]\)/,
  );
  assert.match(
    page,
    /fp\("dap", "DAP · 15 il", 79, 40, 22, 15, \[4, 12, 13, 23, 24, 25, 30, 36, 44, 49, 58, 62, 65, 75, 76\]\)/,
  );
  assert.match(
    page,
    /fp\("dokap", "DOKAP · 11 il", 69, 22, 25, 10, \[5, 8, 19, 28, 29, 52, 53, 55, 60, 61, 69\]\)/,
  );
  assert.match(
    page,
    /fp\("kop", "KOP · 8 il", 49, 57, 20, 16, \[40, 42, 50, 51, 66, 68, 70, 71\]\)/,
  );
});
