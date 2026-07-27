import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import test from "node:test";

const root = new URL("..", import.meta.url);
const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const report = JSON.parse(
  execFileSync(process.execPath, ["scripts/audit-geography.mjs"], {
    cwd: root,
    encoding: "utf8",
  }),
);

const massifIds = [
  "yildiz-m",
  "kazdagi-m",
  "uludag-m",
  "menderes-m",
  "sultandag-m",
  "alanya-anamur-m",
  "ilgaz-m",
  "tokat-m",
  "akdagmadeni-m",
  "kirsehir-m",
  "nigde-m",
  "akdag-m",
  "malatya-m",
  "bitlis-m",
];

test("MEB genel jeoloji listesindeki 14 başlıca masif alanı eksiksizdir", () => {
  const coverage = report.sourceCoverage.find((item) => item.quiz === "massifs");
  assert.equal(coverage.expectedCount, 14);
  assert.deepEqual(coverage.missing, []);
  for (const id of massifIds) {
    assert.match(source, new RegExp(`"${id}"\\s*:`));
  }
});

test("Menderes Masifi tek dev leke yerine üç alt kütleyle gösterilir", () => {
  const block = source.match(
    /"menderes-m":\s*\[([\s\S]*?)\],\s*"sultandag-m"/,
  )?.[1] ?? "";
  assert.equal((block.match(/\[\[/g) ?? []).length, 3);
});
