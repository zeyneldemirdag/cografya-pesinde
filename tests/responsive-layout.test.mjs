import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("tablet ve telefon düzenleri ayrı kırılımlarda tanımlıdır", () => {
  assert.match(styles, /@media \(max-width: 1100px\)/);
  assert.match(styles, /@media \(max-width: 900px\)/);
  assert.match(styles, /@media \(max-width: 600px\)/);
  assert.match(styles, /@media \(max-width: 380px\)/);
});

test("dar ekranlarda oyun tek sütuna geçer ve harita dokunmaya uygun kalır", () => {
  assert.match(
    styles,
    /@media \(max-width: 900px\)[\s\S]*?\.game-layout \{ display: flex; flex-direction: column; \}/,
  );
  assert.match(
    styles,
    /@media \(max-width: 900px\)[\s\S]*?\.map-stage \{[\s\S]*?touch-action: pan-y;/,
  );
  assert.match(styles, /\.map-stage--zoomed \{ touch-action: none; \}/);
  assert.match(
    styles,
    /@media \(max-width: 600px\)[\s\S]*?\.quiz-grid \{ grid-template-columns: 1fr; \}/,
  );
});

test("uygulama yatay taşmayı sayfanın tamamına yaymaz", () => {
  assert.match(styles, /\.app-shell \{ min-height: 100vh; overflow-x: clip; \}/);
  assert.match(styles, /\.game-layout \{[\s\S]*?minmax\(620px, 1\.55fr\)/);
  assert.match(
    styles,
    /@media \(max-width: 1100px\)[\s\S]*?minmax\(320px, 360px\) minmax\(0, 1fr\)/,
  );
});

test("yatay telefonda soru ve harita görünür ekran yüksekliğine sığar", () => {
  assert.match(styles, /@media \(orientation: landscape\) and \(max-height: 520px\) and \(max-width: 1000px\)/);
  assert.match(styles, /height: max\(190px, calc\(100dvh - 184px\)\)/);
  assert.match(styles, /grid-template-columns: minmax\(145px, \.7fr\) minmax\(290px, 1\.5fr\) auto/);
});
