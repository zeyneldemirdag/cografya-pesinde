import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [layout, page, styles] = await Promise.all([
  readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

test("telefonun koyu teması sitenin ve haritanın renklerini değiştiremez", () => {
  assert.match(layout, /colorScheme: "light"/);
  assert.match(layout, /<meta name="color-scheme" content="only light" \/>/);
  assert.match(layout, /style=\{\{ colorScheme: "only light" \}\}/);
  assert.match(styles, /:root \{\s*color-scheme: only light;/);
  assert.match(styles, /html \{[\s\S]*color-scheme: only light;/);
});

test("yakınlaştırma yalnızca harita çerçevesinin içindeki katmanı dönüştürür", () => {
  assert.match(page, /const MAX_MAP_ZOOM = 4/);
  assert.match(page, /className="real-map-wrap"[\s\S]*translate3d\(\$\{mapView\.x\}px/);
  assert.match(page, /className="map-zoom-controls"/);
  assert.match(page, /if \(!event\.ctrlKey\) return;[\s\S]*event\.preventDefault\(\);/);
  assert.match(page, /addEventListener\("wheel", handleCtrlWheel, \{ passive: false \}\)/);
  assert.doesNotMatch(page, /onWheel=\{/);
  assert.match(page, /onPointerMove=\{handleMapPointerMove\}/);
  assert.match(styles, /\.map-stage \{[\s\S]*overflow: hidden;[\s\S]*touch-action: none;/);
  assert.match(styles, /\.real-map-wrap \{[\s\S]*transform-origin: center;/);
});

test("harita yakınlaştırması erişilebilir denetimlerle sıfırlanabilir", () => {
  assert.match(page, /aria-label="Haritayı uzaklaştır"/);
  assert.match(page, /aria-label="Harita yakınlaştırmasını sıfırla"/);
  assert.match(page, /aria-label="Haritayı yakınlaştır"/);
  assert.match(page, /setMapView\(DEFAULT_MAP_VIEW\)/);
});

test("normal nesne tıklaması pointer capture ile harita katmanına kaçırılmaz", () => {
  const pointerDown = page.slice(
    page.indexOf("const handleMapPointerDown"),
    page.indexOf("const handleMapPointerMove"),
  );
  const pointerMove = page.slice(
    page.indexOf("const handleMapPointerMove"),
    page.indexOf("const handleMapPointerEnd"),
  );
  assert.doesNotMatch(pointerDown, /setPointerCapture/);
  assert.match(pointerMove, /movedFromStart > 4[\s\S]*setPointerCapture/);
});
