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
  assert.match(page, /agri: \[44\.2983964, 39\.7019346\]/);
  assert.match(page, /tendurek: \[43\.8669939, 39\.354844\]/);
  assert.match(page, /suphan: \[42\.8276945, 38\.9265462\]/);
  assert.match(page, /nemrut: \[42\.2554405, 38\.6546955\]/);
  assert.match(page, /erciyes: \[35\.4502248, 38\.5327397\]/);
  assert.match(page, /hasan: \[34\.1651126, 38\.1265274\]/);
  assert.match(page, /karadag: \[33\.1471169, 37\.3994076\]/);
  assert.match(page, /melendiz: \[34\.5265715, 38\.0712926\]/);
  assert.match(page, /"karacadag-ic": \[33\.7780749, 37\.7474922\]/);
  assert.match(page, /"karacadag-gd": \[39\.8290462, 37\.7114291\]/);
  assert.match(page, /"nemrut-tour": \[38\.74, 37\.98\]/);
  assert.match(page, /"nemrut-bitlis-tour": \[42\.2554405, 38\.6546955\]/);
  assert.match(page, /"erciyes-tour": \[35\.4502248, 38\.5327397\]/);
  assert.match(page, /"palandoken-tour": \[41\.2753321, 39\.8597575\]/);
  assert.match(page, /kapikule: \[26\.3605547, 41\.7179296\]/);
  assert.match(page, /ipsala: \[26\.3303661, 40\.933463\]/);
  assert.match(page, /sarp: \[41\.5479224, 41\.5190947\]/);
  assert.match(page, /gurbu: \[44\.3777801, 39\.4122129\]/);
  assert.match(page, /habur: \[42\.5685244, 37\.1501969\]/);
  assert.match(page, /cilvegozu: \[36\.6553514, 36\.2387635\]/);
  assert.match(page, /pazarkule: \[26\.4913385, 41\.6543231\]/);
  assert.match(page, /hamzabeyli: \[26\.6112448, 41\.9583809\]/);
  assert.match(page, /derekoy: \[27\.4585895, 41\.967609\]/);
  assert.match(page, /turkgozu: \[42\.81821, 41\.58718\]/);
  assert.match(page, /aktas: \[43\.19893, 41\.23457\]/);
  assert.match(page, /dilucu: \[44\.7995818, 39\.654133\]/);
  assert.match(page, /kapikoy: \[44\.3204051, 38\.4969971\]/);
  assert.match(page, /esendere: \[44\.6219355, 37\.7172977\]/);
  assert.match(page, /uzumlu: \[43\.51422, 37\.23981\]/);
  assert.match(page, /oncupinar: \[37\.08515, 36\.64618\]/);
  assert.match(page, /karkamis: \[38\.00074, 36\.82972\]/);
  assert.match(page, /cobanbey: \[37\.46996, 36\.63524\]/);
  assert.match(page, /zeytidali: \[36\.6012175, 36\.3673763\]/);
  assert.match(page, /"bolu-pass": \[31\.4140658, 40\.7473581\]/);
  assert.match(page, /"zigana-pass": \[39\.4051227, 40\.6389544\]/);
  assert.match(page, /"gulek-pass": \[34\.7858856, 37\.2853853\]/);
  assert.match(page, /"sertavul-pass": \[33\.2635938, 36\.9150187\]/);
  assert.match(page, /"belen-pass": \[36\.2252927, 36\.4812881\]/);
  assert.match(page, /"kop-pass": \[40\.5120823, 40\.0365803\]/);
  assert.match(page, /"cubuk-pass": \[30\.49694, 37\.1701959\]/);
  assert.match(page, /"bogazici-b": \[29\.0343866, 41\.0454858\]/);
  assert.match(page, /"fsm-b": \[29\.0614398, 41\.0913084\]/);
  assert.match(page, /"yss-b": \[29\.1117786, 41\.2030695\]/);
  assert.match(page, /"osmangazi-b": \[29\.5158006, 40\.7547337\]/);
  assert.match(page, /"canakkale-b": \[26\.6368129, 40\.339679\]/);
  assert.match(page, /"avrasya-t": \[28\.9981122, 41\.0059924\]/);
  assert.match(page, /"marmaray-t": \[29\.0043517, 41\.0144323\]/);
  assert.match(page, /"bolu-t": \[31\.4589139, 40\.7472274\]/);
  assert.match(page, /"ovit-t": \[40\.7844019, 40\.6211219\]/);
  assert.match(page, /"zigana-t": \[39\.4148249, 40\.6698851\]/);
  assert.match(page, /germencik: \[27\.6340167, 37\.8828558\]/);
  assert.match(page, /"buharkent-geothermal": \[28\.809483, 37\.9795937\]/);
  assert.match(page, /akkuyu: \[33\.53487, 36\.14481\]/);
  assert.match(page, /"sinop-nuclear": \[34\.9454, 42\.0968\]/);
  assert.match(page, /ataturk: \[38\.3176375, 37\.4804869\]/);
  assert.match(page, /karapinar: \[33\.59414, 37\.80037\]/);
  assert.match(page, /afsin: \[37\.0069049, 38\.3495685\]/);
  assert.match(page, /"seyitomer-energy": \[29\.8800482, 39\.5755059\]/);
  assert.match(page, /"tuncbilek-energy": \[29\.4638049, 39\.6287278\]/);
  assert.match(page, /"yatagan-energy": \[28\.100476, 37\.3283339\]/);
  assert.match(page, /"hamitabat-energy": \[27\.33877, 41\.48102\]/);
  assert.match(page, /"ambarli-energy": \[28\.6921, 40\.9834\]/);
  assert.match(page, /"ovaakca-energy": \[29\.0726225, 40\.2930382\]/);
  assert.match(page, /seyitomer: \[29\.832337, 39\.574254\]/);
  assert.match(page, /"tuncbilek-lignite": \[29\.455311, 39\.634823\]/);
  assert.match(page, /"can-lignite": \[27\.038636, 40\.023827\]/);
  assert.match(page, /"yatagan-lignite": \[28\.0529043, 37\.3416704\]/);
  assert.match(page, /"cayirhan-lignite": \[31\.695, 40\.097\]/);
  assert.match(page, /"dodurga-lignite": \[34\.758629, 40\.855953\]/);
  assert.match(page, /"afsin-mine": \[37\.082979, 38\.340685\]/);
  assert.match(page, /"soma-mine": \[27\.55082, 39\.11457\]/);
  assert.match(page, /divrigi: \[38\.102998, 39\.40934\]/);
  assert.match(page, /"hekimhan-mine": \[37\.967468, 38\.903467\]/);
  assert.match(page, /"hasancelebi-mine": \[37\.89278, 38\.95444\]/);
  assert.match(page, /"avnik-mine": \[40\.33306, 38\.65\]/);
  assert.match(page, /"mansurlu-mine": \[35\.63806, 37\.95417\]/);
  assert.match(page, /"kesikkopru-iron": \[33\.38736, 39\.34966\]/);
  assert.match(page, /murgul: \[41\.58172, 41\.24761\]/);
  assert.match(page, /"cayeli-mine": \[40\.76, 41\.04111\]/);
  assert.match(page, /"kure-mine": \[33\.68853, 41\.80509\]/);
  assert.match(page, /"maden-mine": \[39\.66481, 38\.38581\]/);
  assert.match(page, /"guleman-mine": \[39\.87504, 38\.45661\]/);
  assert.match(page, /"seydisehir-mine": \[31\.88028, 37\.28917\]/);
  assert.match(page, /"kokaksu-mine": \[31\.66667, 41\.41667\]/);
  assert.match(page, /"tavas-mine": \[28\.99695, 37\.44393\]/);
  assert.match(page, /"balya-mine": \[27\.58869, 39\.73914\]/);
  assert.match(page, /"yenice-lead-zinc": \[27\.36556, 39\.98345\]/);
  assert.match(page, /"bolkar-lead-zinc": \[34\.64155, 37\.44981\]/);
  assert.match(page, /"zamanti-lead-zinc": \[35\.46667, 38\.1\]/);
  assert.match(page, /"akdagmadeni-lead-zinc": \[35\.88783, 39\.56028\]/);
  assert.match(page, /"kirka-mine": \[30\.48667, 39\.29\]/);
  assert.match(page, /bigadic: \[28\.13627, 39\.46686\]/);
  assert.match(page, /"kestelek-boron": \[28\.56528, 39\.94778\]/);
  assert.match(page, /"emet-mine": \[29\.27765, 39\.37204\]/);
  assert.match(page, /mazidagi: \[40\.36208, 37\.50205\]/);
  assert.match(page, /const LABEL_OFFSETS/);
  assert.match(page, /data-quiz-id=\{item\.id\}/);
  assert.match(page, /geo-hit geo-hit--small-area/);
  assert.match(page, /flushSync/);
  assert.match(page, /playMapSound/);
  assert.match(page, /function shuffledFeatureIds/);
  assert.match(page, /const ids = \[\.\.\.new Set\(features\.map\(\(feature\) => feature\.id\)\)\]/);
  assert.match(page, /ids\[0\] === previousOrder\[0\]/);
  assert.match(page, /1 \+ Math\.floor\(Math\.random\(\) \* \(ids\.length - 1\)\)/);
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
  assert.match(page, /window\.scrollTo\(\{ top: 0, behavior: "auto" \}\)/);
  assert.match(page, /Ses.*açık/);
  assert.match(page, /className="geo-line-hit"/);
  assert.match(page, /"volcano", "city", "gate", "pass"/);
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
