import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [page, styles] = await Promise.all([
  readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
]);

test("sanayi ve maden soruları konumu cevaptan önce söylemez", () => {
  assert.match(page, /const LOCATION_HIDDEN_QUIZ_IDS = new Set\(\[[\s\S]*"mines"[\s\S]*"textile-industry"/);
  assert.match(page, /feature\.name\.split\(" · "\)\.slice\(1\)/);
  assert.match(page, /const baseQuestionLabel = activityOnlyQuestionLabel\(quiz\.id, current\)/);
});

test("maden haritaları tür renkli element sembolleri ve açıklama anahtarı kullanır", () => {
  for (const token of ["Fe", "Cr", "Cu", "Al", "B", "P", "Na", "Tk", "L"]) {
    assert.match(page, new RegExp(`code: "${token}"`));
  }
  assert.match(page, /MINERAL_QUIZ_IDS\.has\(quiz\.id\)/);
  assert.match(page, /className="geo-shape geo-shape--mine mine-marker-disc"/);
  assert.match(page, /className="mineral-key"/);
  assert.match(styles, /\.mine-marker--iron/);
  assert.match(styles, /\.mine-marker--boron/);
});

test("genel yer şekli haritaları oluşum türünü soru kartında gösterir", () => {
  assert.match(page, /const GENERAL_FORMATION_GROUPS/);
  assert.match(page, /"lakes-all": \[[\s\S]*Tektonik göl[\s\S]*Heyelan set gölü/);
  assert.match(page, /plains: \[[\s\S]*Delta ovası[\s\S]*Karstik \(polye\) ova/);
  assert.match(page, /plateaus: \[[\s\S]*Volkanik \(lav\) platosu/);
  assert.match(page, /className="question-formation"/);
  assert.match(page, /GENERAL_FORMATION_OVERRIDES/);
  assert.match(page, /candidateName === normalizedName/);
});

test("iklim ve toprak soruları ayırt edici öğrenme ipuçları içerir", () => {
  assert.match(page, /const QUESTION_HINTS: Record<string, string>/);
  assert.match(page, /"karadeniz-cl": "Her mevsim yağışlıdır/);
  assert.match(page, /"alluvial-soil": "Akarsuların taşıyıp/);
  assert.match(page, /className="question-clue">İpucu:/);
  assert.match(styles, /\.question-card--map p\.question-clue/);
});
