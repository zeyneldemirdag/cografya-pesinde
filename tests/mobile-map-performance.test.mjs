import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [page, styles] = await Promise.all([
  readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

test("harita geometrileri her dokunuşta yeniden hesaplanmak yerine önbelleğe alınır", () => {
  assert.match(page, /const provinceRenderData = useMemo\(/);
  assert.match(page, /const renderedFeatureShapes = useMemo\(/);
  assert.match(page, /const lakeById = useMemo\(/);
  assert.match(page, /const riverById = useMemo\(/);
  assert.match(page, /\{renderedShape\?\.hitArea\}/);
  assert.match(page, /\{renderedShape\?\.graphic\}/);
});

test("dokunmatik giriş hover yüzünden fazladan harita çizimi başlatmaz", () => {
  assert.match(
    page,
    /onPointerEnter=\{\(event\) => \{\s*if \(event\.pointerType === "mouse"\)/,
  );
  assert.match(
    page,
    /onPointerLeave=\{\(event\) => \{\s*if \(event\.pointerType === "mouse"\)/,
  );
});

test("telefonlarda pahalı SVG filtreleri ve renk animasyonları kapatılır", () => {
  assert.match(styles, /@media \(hover: none\), \(pointer: coarse\)/);
  assert.match(styles, /\.real-map,\s*\.geo-shape \{\s*filter: none !important;/);
  assert.match(styles, /\.geo-feature--wrong \.geo-shape \{\s*animation: none;/);
});

test("birbirine çok yakın Eymir ve Mogan gölleri üst üste büyütülmez", () => {
  assert.match(page, /\["eymir-set", "mogan-set"\]\.includes\(lakeShapeId\(feature\)\)/);
  assert.match(page, /\? Math\.min\(requestedMinimumDisplaySize, 4\.5\)/);
});
