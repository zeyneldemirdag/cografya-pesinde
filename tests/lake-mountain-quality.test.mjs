import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("küçük göller gerçek su poligonu merkezinden, asgari görünür boyutta çizilir", () => {
  assert.match(page, /function lakeProjectedCoordinates\(feature: LakeFeature\)/);
  assert.match(page, /const anchor: Coordinate = \[\(minX \+ maxX\) \/ 2, \(minY \+ maxY\) \/ 2\]/);
  assert.match(page, /const scale = longestSide < 8 \? Math\.min\(8 \/ longestSide, 160\) : 1/);
  assert.match(page, /function featureHitArea\(feature: Feature, lakeShape\?: LakeFeature/);
  assert.match(page, /width=\{Math\.max\(layout\.width \+ 6, 18\)\}/);
});

test("küçük göller bağlantı çizgisi olmadan kendi gerçek merkezinde büyütülür", () => {
  assert.match(page, /displayCenter: anchor/);
  assert.doesNotMatch(page, /const LAKE_CALLOUT_OFFSETS/);
  assert.doesNotMatch(page, /x1=\{anchorX\}[\s\S]*x2=\{calloutX\}/);
  assert.match(page, /translate\(\$\{anchorX\} \$\{anchorY\}\) scale\(\$\{layout\.scale\}\)/);
});

test("dağ hedefleri aynı kimlikli göl poligonlarını kullanamaz", () => {
  const guardedLakeLookups = page.match(/feature\.kind === "lake"\s*\?\s*lakes\.find/g) ?? [];
  assert.ok(guardedLakeLookups.length >= 3);
});

test("MEB ana kıvrım kuşakları ayrı hedef ve sürekli dağ zinciridir", () => {
  assert.match(page, /id: "main-fold-belts"/);
  assert.match(page, /f\("north-anatolian-belt", "Kuzey Anadolu Dağları"/);
  assert.match(page, /f\("taurus-belt", "Toros Dağları"/);
  assert.match(page, /"north-anatolian-belt": \[[\s\S]*?\],\n  "taurus-belt": \[/);
  assert.match(page, /function samplePolyline\(points: Coordinate\[], spacing = 28\)/);
  assert.match(page, /className=\{feature\.id\.endsWith\("-belt"\) \? "mountain-belt"/);
});
