import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [page, styles] = await Promise.all([
  readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

test("ova oyunları opak dolgu ve sade koyu sınırla birbirinden ayrılır", () => {
  assert.match(page, /const isPlainQuiz = \["plains", "delta-plains", "tectonic-plains", "karstic-plains", "low-plains", "high-plains"\]/);
  assert.match(page, /isPlainQuiz \? " real-map--plains" : ""/);
  assert.match(styles, /\.real-map--plains \.geo-feature--idle \.geo-shape--plain \{[\s\S]*?fill: #9f6b43;[\s\S]*?fill-opacity: 1;[\s\S]*?stroke: #593821;[\s\S]*?stroke-width: 1\.15;/);
  assert.match(styles, /\.real-map--plains \.geo-feature--correct \.geo-shape--plain \{[\s\S]*?fill: #2fa66f/);
  assert.match(styles, /\.real-map--plains \.geo-feature--wrong \.geo-shape--plain \{[\s\S]*?fill: #eb5148/);
});

test("genel ova haritası kalabalığı azaltır, hedef koordinatını ve geniş tıklama alanını korur", () => {
  assert.match(page, /function scaleAreaPolygons\(polygons: Coordinate\[\]\[\], scale: number\)/);
  assert.match(page, /if \(quizId === "plains"\) return \.42/);
  assert.match(page, /if \(quizId === "tectonic-plains"\) return \.5/);
  assert.match(page, /if \(quizId === "karstic-plains"\) return \.64/);
  assert.match(page, /feature\.kind === "plain" \? plainAreaScaleForQuiz\(quiz\.id\) : 1/);
  assert.match(page, /scaleAreaPolygons\(sourceAreaPolygons, plainAreaScale\)/);
  assert.doesNotMatch(page, /className="general-plain-graphic"/);
  assert.match(page, /\{renderedShape\?\.hitArea\}\s*\{renderedShape\?\.graphic\}/);
});

test("ova ve plato alt oyunları aktif konunun yanında çalışma paketi olarak görünür", () => {
  assert.match(page, /label: "Ova çalışma setleri"[\s\S]*"low-plains", "high-plains"/);
  assert.match(page, /label: "Plato çalışma setleri"[\s\S]*"volcanic-plateaus"/);
  assert.match(page, /className="quiz-family-nav"/);
  assert.match(styles, /\.quiz-family-nav\s*\{/);
});

test("doğru cevap ismi haritadaki hedeflerin üstüne etiket olarak çizilmez", () => {
  assert.doesNotMatch(page, /className="geo-label/);
  assert.doesNotMatch(page, /className="label-layer/);
  assert.doesNotMatch(styles, /\.geo-label(?:\s|\{|--)/);
  assert.match(page, /<span>Son doğru<\/span>/);
  assert.match(page, /lastCorrectFeature\?\.name/);
});

test("aktif soru kartı harita panelinin üst çerçevesindedir", () => {
  const mapPanelStart = page.indexOf('<section className="map-panel"');
  const mapStageStart = page.indexOf('ref={mapStageRef}', mapPanelStart);
  const questionStart = page.indexOf('className="question-card question-card--map"');
  assert.ok(mapPanelStart >= 0);
  assert.ok(questionStart > mapPanelStart);
  assert.ok(questionStart < mapStageStart);
  assert.match(styles, /\.map-topline\s*\{[\s\S]*grid-template-columns:/);
});

test("telefon görünümünde harita ve soru öne alınır", () => {
  const mobileStyles = styles.slice(styles.indexOf("@media (max-width: 900px)"));
  assert.match(mobileStyles, /\.map-panel \{ order: 1; \}/);
  assert.match(mobileStyles, /\.progress-panel \{\s*order: 2;/);
  assert.match(mobileStyles, /\.question-card--map \{[\s\S]*grid-column: 1 \/ -1;/);
});

test("Uludağ sirk gölleri ayrı şekil ve dokunma merkezlerine dağıtılır", () => {
  const cluster = page.slice(
    page.indexOf("const CLUSTERED_MICRO_LAKES"),
    page.indexOf("function clusteredMicroLake"),
  );
  for (const id of [
    "kilimli-glacial",
    "aynali-glacial",
    "karagol-uludag-glacial",
    "buzlu-uludag-glacial",
    "heybeli-uludag-glacial",
  ]) {
    assert.match(cluster, new RegExp(`"${id}"`));
  }
  assert.match(page, /className="micro-lake-hit-box"/);
  assert.match(page, /geo-shape--clustered-lake/);
});

test("küçük göl dokunma toleransı hiçbir durumda beyaz alan olarak görünmez", () => {
  assert.match(
    styles,
    /\.micro-lake-hit-box\s*\{[\s\S]*fill: transparent !important;[\s\S]*stroke: transparent !important;/,
  );
  assert.doesNotMatch(styles, /\.geo-feature:hover \.micro-lake-hit-box/);
  assert.doesNotMatch(styles, /\.geo-feature:focus \.micro-lake-hit-box/);
});

test("şimdilik geç soruyu yanlış saymadan turun sonuna taşır", () => {
  const skipHandler = page.slice(
    page.indexOf("const skipCurrentQuestion"),
    page.indexOf("const handleSelect"),
  );
  assert.match(skipHandler, /questionOrder\.length <= 1/);
  assert.match(skipHandler, /\.\.\.order\.filter\(\(id\) => id !== current\.id\)/);
  assert.match(skipHandler, /current\.id/);
  assert.doesNotMatch(skipHandler, /setAttempts/);
  assert.match(page, /Şimdilik geç/);
  assert.match(styles, /\.skip-question\s*\{/);
});
