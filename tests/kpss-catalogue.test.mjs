import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

test("harita kataloğu KPSS ana konularına göre sınıflandırılır", () => {
  assert.match(page, /const KPSS_CATEGORIES: KpssCategory\[\]/);
  for (const title of [
    "Türkiye'nin Konumu ve Harita Bilgisi",
    "Jeolojik Yapı ve Yer Şekilleri",
    "İklim, Bitki Örtüsü ve Toprak",
    "Türkiye'nin Su Varlıkları",
    "Nüfus, Yerleşme ve Şehirler",
    "Türkiye'nin Ekonomik Coğrafyası",
    "Ulaşım ve Bağlantılar",
  ]) {
    assert.match(page, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("tüm haritaların tam bir KPSS kategorisine girmesi korunur", () => {
  assert.match(page, /CATEGORIZED_QUIZ_IDS\.size !== QUIZZES\.length/);
  assert.match(page, /CATEGORIZED_QUIZ_COUNT !== QUIZZES\.length/);
});

test("masaüstü ve mobil konu bölümü düzenleri tanımlıdır", () => {
  assert.match(page, /className="kpss-topic-section"/);
  assert.match(page, /className="kpss-topic-heading"/);
  assert.match(styles, /\.kpss-topic-heading\s*\{/);
  assert.match(styles, /@media \(max-width: 600px\)[\s\S]*\.kpss-topic-heading\s*\{/);
});

test("konu çekmecesi de KPSS kategorileriyle gruplanır", () => {
  assert.match(page, /className="drawer-topic-group"/);
  assert.match(page, /KPSS_CATALOGUE_SECTIONS\.map\(\(category\) =>/);
});
