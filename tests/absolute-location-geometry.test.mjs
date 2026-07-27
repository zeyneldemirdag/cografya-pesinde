import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

test("Türkiye'nin dört mutlak konum çizgisi etkileşimli harita sınırları içinde kalır", () => {
  const bounds = source.match(
    /const MAP_BOUNDS = \{ west: ([\d.]+), east: ([\d.]+), north: ([\d.]+), south: ([\d.]+) \}/,
  );
  assert.ok(bounds, "MAP_BOUNDS must exist");
  const [, west, east, north, south] = bounds.map(Number);

  assert.ok(west < 26, "26°E must have a west-side touch margin");
  assert.ok(east > 45, "45°E must have an east-side touch margin");
  assert.ok(north > 42, "42°N must have a north-side touch margin");
  assert.ok(south < 36, "36°N must have a south-side touch margin");

  for (const id of ["parallel-36n", "parallel-42n", "meridian-26e", "meridian-45e"]) {
    assert.match(source, new RegExp(`f\\("${id}"`), `${id} quiz feature is missing`);
    assert.match(source, new RegExp(`"${id}": \\[\\[`), `${id} real line is missing`);
  }
});

test("sıfır kalınlıklı SVG koordinat çizgilerinin en az 24 piksellik dokunma şeridi vardır", () => {
  assert.match(source, /feature\.id\.startsWith\("parallel-"\)/);
  assert.match(source, /feature\.id\.startsWith\("meridian-"\)/);
  assert.match(source, /geo-hit geo-hit--coordinate/);
  assert.match(source, /Math\.max\(maxX - minX \+ 24, 24\)/);
  assert.match(source, /Math\.max\(maxY - minY \+ 24, 24\)/);
});
