import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

const expectedRegionPlates = {
  marmara: [10, 11, 16, 17, 22, 34, 39, 41, 54, 59, 77],
  aegean: [3, 9, 20, 35, 43, 45, 48, 64],
  med: [1, 7, 15, 31, 32, 33, 46, 80],
  black: [5, 8, 14, 19, 28, 29, 37, 52, 53, 55, 57, 60, 61, 67, 69, 74, 78, 81],
  central: [6, 18, 26, 38, 40, 42, 50, 51, 58, 66, 68, 70, 71],
  east: [4, 12, 13, 23, 24, 25, 30, 36, 44, 49, 62, 65, 75, 76],
  southeast: [2, 21, 27, 47, 56, 63, 72, 73, 79],
};

function regionsQuizBlock() {
  const start = source.indexOf('id: "regions"');
  assert.notEqual(start, -1, "regions quiz should exist");
  const next = source.indexOf("\n  {\n    id:", start + 12);
  return source.slice(start, next);
}

test("seven regions use exact province polygons instead of coarse exterior blobs", () => {
  const block = regionsQuizBlock();
  for (const [id, expectedPlates] of Object.entries(expectedRegionPlates)) {
    const match = block.match(
      new RegExp(`regionFeature\\("${id}", "[^"]+", \\[([^\\]]+)\\]\\)`),
    );
    assert.ok(match, `${id} should use regionFeature`);
    const plates = match[1].split(",").map((value) => Number(value.trim()));
    assert.deepEqual(plates, expectedPlates);
  }

  for (const id of Object.keys(expectedRegionPlates)) {
    assert.doesNotMatch(source, new RegExp(`\\n  ${id}: \\[\\[`));
  }
});

test("region polygons partition all 81 provinces once with no gaps or overlaps", () => {
  const allPlates = Object.values(expectedRegionPlates).flat();
  assert.equal(allPlates.length, 81);
  assert.equal(new Set(allPlates).size, 81);
  assert.deepEqual([...allPlates].sort((a, b) => a - b), Array.from({ length: 81 }, (_, index) => index + 1));
});

test("region quiz cites the direct official MEB geography source", () => {
  assert.match(
    source,
    /MEB · Birinci Coğrafya Kongresi ve bölge belirleme ölçütleri[\s\S]*tymm-modul-2\/files\/basic-html\/page26\.html/,
  );
});
