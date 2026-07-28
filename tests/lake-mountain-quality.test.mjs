import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("küçük göller gerçek su poligonu merkezinden, asgari görünür boyutta çizilir", () => {
  assert.match(page, /function lakeProjectedCoordinates\(feature: LakeFeature\)/);
  assert.match(page, /const anchor: Coordinate = \[\(minX \+ maxX\) \/ 2, \(minY \+ maxY\) \/ 2\]/);
  assert.match(page, /const scale = longestSide < 12 \? Math\.min\(12 \/ longestSide, 240\) : 1/);
  assert.match(page, /function featureHitArea\(feature: Feature, lakeShape\?: LakeFeature/);
  assert.match(page, /width=\{Math\.max\(layout\.width \+ 8, 22\)\}/);
});

test("birbirine yakın küçük göller ayrı, gerçek konuma bağlı çağrılara sahiptir", () => {
  for (const id of [
    "kilimli-glacial",
    "aynali-glacial",
    "karagol-uludag-glacial",
    "buzlu-uludag-glacial",
    "heybeli-uludag-glacial",
    "meke",
    "acigol-karapinar",
    "kizoren",
    "meyil-lake",
    "cirali-lake",
    "hafik-lake",
    "todurge-lake",
  ]) {
    assert.match(page, new RegExp(`"${id}":? \\[`));
  }
  assert.match(page, /x1=\{anchorX\}[\s\S]*y1=\{anchorY\}[\s\S]*x2=\{calloutX\}[\s\S]*y2=\{calloutY\}/);
});

test("MEB ana kıvrım kuşakları ayrı hedef ve sürekli dağ zinciridir", () => {
  assert.match(page, /f\("north-anatolian-belt", "Kuzey Anadolu Dağları"/);
  assert.match(page, /f\("taurus-belt", "Toros Dağları"/);
  assert.match(page, /"north-anatolian-belt": \[[\s\S]*?\],\n  "taurus-belt": \[/);
  assert.match(page, /function samplePolyline\(points: Coordinate\[], spacing = 22\)/);
  assert.match(page, /className=\{feature\.id\.endsWith\("-belt"\) \? "mountain-belt"/);
});
