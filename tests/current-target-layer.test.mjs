import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

test("normal, komşu ülke ve 81 il katmanları güncel soruyu tıklama önceliğine alır", () => {
  const currentClassChecks = source.match(
    /feature\.id === currentFeatureId \? " geo-feature--current" : ""/g,
  ) ?? [];
  assert.equal(
    currentClassChecks.length,
    3,
    "all three interactive map layers must mark the current target",
  );
  assert.match(source, /geo-feature--country\$\{/);
  assert.match(source, /province-option--\$\{status\}\$\{/);
});
