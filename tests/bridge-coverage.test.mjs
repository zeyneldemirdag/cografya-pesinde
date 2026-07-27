import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

const expected = [
  "15 Temmuz Şehitler Köprüsü",
  "Fatih Sultan Mehmet Köprüsü",
  "Yavuz Sultan Selim Köprüsü",
  "Osmangazi Köprüsü",
  "1915 Çanakkale Köprüsü",
];

test("KGM'nin güncel ana köprü kapsamı beş benzersiz hedeftir", () => {
  const match = source.match(/id: "bridges",[\s\S]*?features: \[([\s\S]*?)\n\s*\],/);
  assert.ok(match, "Başlıca Köprüler oyunu bulunamadı");
  const names = [...match[1].matchAll(/\bf\("[^"]+",\s*"([^"]+)"/g)]
    .map((entry) => entry[1]);
  assert.deepEqual(names, expected);
  assert.equal(new Set(names).size, expected.length);
});

test("köprü oyunu beş yapıyı birlikte sayan güncel KGM kaynağına bağlıdır", () => {
  assert.match(
    source,
    /bridges: \{[\s\S]*?KGM 2026 ana boğaz ve körfez köprüleri[\s\S]*?GormeEngelliDetay\.aspx\?d=1952/,
  );
});
