import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const pageSource = fs.readFileSync(
  new URL("../app/page.tsx", import.meta.url),
  "utf8",
);

test("Çatalca-Kocaeli platosu Marmara Denizi üzerinden tek parça geçmez", () => {
  const multiPolygonBlock = pageSource.match(
    /const AREA_MULTI_POLYGONS[\s\S]*?const POINT_COORDINATES/,
  )?.[0] ?? "";

  assert.match(multiPolygonBlock, /catalca:\s*\[\s*\[\[/);
  assert.match(pageSource, /function areaPolygonsFor/);
});
