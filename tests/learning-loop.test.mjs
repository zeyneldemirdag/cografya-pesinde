import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("yanlış yapılan hedefler ayrı bir tekrar turunda yeniden sorulur", () => {
  assert.match(page, /const \[missedFeatureIds, setMissedFeatureIds\]/);
  assert.match(page, /questionHadWrongRef\.current = true/);
  assert.match(page, /setMissedFeatureIds\(\(ids\) => ids\.includes\(feature\.id\)/);
  assert.match(page, /resetQuiz\(activeQuizId, missedFeatureIds\)/);
  assert.match(page, /Yanlışları tekrar et · \{missedFeatureIds\.length\}/);
});

test("tekrar turunun soru sayısı yalnızca çalışılacak zayıf hedeflerden oluşur", () => {
  assert.match(page, /const \[sessionFeatureIds, setSessionFeatureIds\]/);
  assert.match(page, /const quizFeatureCount = sessionFeatureIds\.length/);
  assert.match(page, /setSessionFeatureIds\(roundIds\)/);
  assert.match(page, /\{reviewRound \? "TEKRAR" : "SORU"\}/);
});

test("tamamlanan tam turlar cihazda konu ustalığı olarak saklanır", () => {
  assert.match(page, /const MASTERY_STORAGE_KEY = "cografya-pesinde:mastery"/);
  assert.match(page, /bestAccuracy: Math\.max/);
  assert.match(page, /completedRuns: \(previous\?\.completedRuns \?\? 0\) \+ 1/);
  assert.match(page, /window\.localStorage\.setItem\(MASTERY_STORAGE_KEY/);
  assert.match(page, /En iyi %\{mastery\.bestAccuracy\} · \{mastery\.completedRuns\} tur/);
});

test("yanlış hedefler oturumlar arasında zayıf hedef olarak saklanır ve temizlenebilir", () => {
  assert.match(page, /weakFeatureIds: string\[\]/);
  assert.match(page, /\.\.\.finalMissedFeatureIds/);
  assert.match(page, /const recordReviewOutcome/);
  assert.match(page, /previous\.weakFeatureIds[\s\S]*filter\(\(id\) => !reviewedIds\.has\(id\)\)/);
  assert.match(page, /Zayıf hedefleri çalış/);
  assert.match(page, /resetQuiz\(activeQuizId, savedWeakFeatureIds\)/);
});

test("eski veya bozuk cihaz kayıtları güvenli biçimde normalleştirilir", () => {
  assert.match(page, /Number\.isFinite\(mastery\.bestAccuracy\)/);
  assert.match(page, /Array\.isArray\(mastery\.weakFeatureIds\)/);
  assert.match(page, /window\.localStorage\.removeItem\(MASTERY_STORAGE_KEY\)/);
});
