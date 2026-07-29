import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [page, styles] = await Promise.all([
  readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

test("nokta ve küçük göl hedefleri yakınlaştırmadan bağımsız dokunma alanı kullanır", () => {
  assert.match(page, /className="geo-hit geo-hit--point"[\s\S]*vectorEffect="non-scaling-stroke"/);
  assert.match(page, /className="micro-lake-hit-box"[\s\S]*vectorEffect="non-scaling-stroke"/);
  assert.match(page, /className="geo-lake-hit"[\s\S]*vectorEffect="non-scaling-stroke"/);
  assert.match(styles, /\.geo-hit \{[\s\S]*stroke-width: 18;[\s\S]*vector-effect: non-scaling-stroke;/);
});

test("yalnızca sorulan hedefin görünmez dokunma toleransı daha geniştir", () => {
  assert.match(
    styles,
    /\.geo-feature--current \.geo-hit--point,[\s\S]*\.geo-feature--current \.micro-lake-hit-box \{[\s\S]*stroke-width: 34;/,
  );
  assert.match(
    styles,
    /\.geo-feature--current \.geo-lake-hit \{[\s\S]*stroke-width: 28;/,
  );
});
