"use client";

import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";

type FeatureKind =
  | "mountain"
  | "volcano"
  | "lake"
  | "river"
  | "plain"
  | "plateau"
  | "region"
  | "city"
  | "landmark"
  | "route"
  | "gate"
  | "pass"
  | "mine"
  | "energy"
  | "dam"
  | "port"
  | "bridge"
  | "tunnel"
  | "fault"
  | "country"
  | "province";

type Feature = {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  kind: FeatureKind;
  plate?: number;
  plates?: number[];
};

type Quiz = {
  id: string;
  group: string;
  title: string;
  eyebrow: string;
  description: string;
  color: string;
  icon: string;
  features: Feature[];
};

const f = (
  id: string,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  kind: FeatureKind,
  r = 0,
): Feature => ({ id, name, x, y, w, h, kind, r });

const NEIGHBOR_COUNTRY_FEATURES: Feature[] = [
  f("greece", "Yunanistan", 0, 0, 8, 8, "country"),
  f("bulgaria", "Bulgaristan", 0, 0, 8, 8, "country"),
  f("georgia", "Gürcistan", 0, 0, 8, 8, "country"),
  f("armenia", "Ermenistan", 0, 0, 8, 8, "country"),
  f("azerbaijan", "Azerbaycan · Nahçıvan", 0, 0, 8, 8, "country"),
  f("iran", "İran", 0, 0, 8, 8, "country"),
  f("iraq", "Irak", 0, 0, 8, 8, "country"),
  f("syria", "Suriye", 0, 0, 8, 8, "country"),
];

const ACTIVE_FAULT_FEATURES: Feature[] = [
  f("north-anatolian-fault", "Kuzey Anadolu Fay Zonu", 50, 50, 8, 4, "fault"),
  f("east-anatolian-fault", "Doğu Anadolu Fay Zonu", 50, 50, 8, 4, "fault"),
  f("west-anatolian-faults", "Batı Anadolu Fay Sistemi", 50, 50, 8, 4, "fault"),
];

const ABSOLUTE_LOCATION_FEATURES: Feature[] = [
  f("parallel-36n", "36° Kuzey Paraleli", 50, 50, 8, 4, "route"),
  f("parallel-42n", "42° Kuzey Paraleli", 50, 50, 8, 4, "route"),
  f("meridian-26e", "26° Doğu Meridyeni", 50, 50, 8, 4, "route"),
  f("meridian-45e", "45° Doğu Meridyeni", 50, 50, 8, 4, "route"),
];

const NATURAL_GAS_PIPELINE_FEATURES: Feature[] = [
  f("pipeline-west-line", "Batı Hattı · Malkoçlar-Ankara", 50, 50, 8, 4, "route"),
  f("pipeline-blue-stream", "Mavi Akım · Samsun-Ankara", 50, 50, 8, 4, "route"),
  f("pipeline-iran-turkey", "İran-Türkiye · Doğubayazıt-Ankara", 50, 50, 8, 4, "route"),
  f("pipeline-bte", "Bakü-Tiflis-Erzurum (BTE)", 50, 50, 8, 4, "route"),
  f("pipeline-tanap", "TANAP · Posof-İpsala", 50, 50, 8, 4, "route"),
  f("pipeline-turkstream", "TürkAkım · Kıyıköy-Lüleburgaz", 50, 50, 8, 4, "route"),
];

const OIL_PIPELINE_FEATURES: Feature[] = [
  f("pipeline-btc", "Bakü-Tiflis-Ceyhan (BTC)", 50, 50, 8, 4, "route"),
  f("pipeline-iraq-turkey", "Irak-Türkiye · Kerkük-Ceyhan", 50, 50, 8, 4, "route"),
];

const BLACK_SEA_EXTRA_RIVER_FEATURES: Feature[] = [
  f("harsit", "Harşit Çayı", 72, 22, 10, 3, "river"),
  f("filyos", "Filyos (Yenice) Çayı", 35, 18, 10, 3, "river"),
  f("bartin", "Bartın Çayı", 34, 16, 8, 3, "river"),
];

const MEDITERRANEAN_EXTRA_RIVER_FEATURES: Feature[] = [
  f("esen", "Eşen Çayı", 26, 72, 8, 3, "river"),
  f("koprucay", "Köprüçay", 34, 70, 8, 3, "river"),
];

const LANDSLIDE_SET_LAKE_FEATURES: Feature[] = [
  f("abant-set", "Abant Gölü", 31, 29, 5, 4, "lake"),
  f("yedigoller-set", "Yedigöller", 34, 22, 5, 4, "lake"),
  f("borabay-set", "Boraboy Gölü", 58, 26, 5, 4, "lake"),
  f("zinav-set", "Zinav Gölü", 63, 30, 5, 4, "lake"),
  f("sera-set", "Sera Gölü", 75, 20, 5, 4, "lake"),
  f("tortum-set", "Tortum Gölü", 83, 25, 6, 5, "lake"),
];

const ALLUVIAL_SET_LAKE_FEATURES: Feature[] = [
  f("marmara-set", "Marmara Gölü", 20, 51, 6, 5, "lake"),
  f("bafa-set", "Bafa (Çamiçi) Gölü", 18, 62, 6, 5, "lake"),
  f("koycegiz-set", "Köyceğiz Gölü", 24, 70, 6, 5, "lake"),
  f("uzungol-set", "Uzungöl", 78, 18, 5, 4, "lake"),
  f("eymir-set", "Eymir Gölü", 47, 45, 5, 4, "lake"),
  f("mogan-set", "Mogan Gölü", 47, 47, 5, 5, "lake"),
];

const COASTAL_SET_LAKE_FEATURES: Feature[] = [
  f("buyukcekmece-set", "Büyükçekmece Gölü", 10, 27, 6, 5, "lake"),
  f("kucukcekmece-set", "Küçükçekmece Gölü", 11, 27, 6, 5, "lake"),
  f("durusu-set", "Durusu (Terkos) Gölü", 10, 20, 6, 5, "lake"),
  f("akyatan-set", "Akyatan Lagünü", 57, 72, 7, 5, "lake"),
];

const MIXED_ORIGIN_LAKE_FEATURES: Feature[] = [
  f("beysehir", "Beyşehir Gölü", 40, 65, 6, 8, "lake", 14),
  f("egirdir", "Eğirdir Gölü", 36, 64, 4, 9, "lake", -8),
  f("yarisli", "Yarışlı Gölü", 30, 65, 5, 4, "lake"),
  f("sugla", "Suğla Gölü", 42, 68, 5, 4, "lake"),
  f("kovada", "Kovada Gölü", 35, 62, 5, 4, "lake"),
  f("van", "Van Gölü", 80, 51, 10, 7, "lake", -8),
];

const GLACIAL_LAKE_FEATURES: Feature[] = [
  f("kilimli-glacial", "Kilimli Gölü", 22, 34, 5, 4, "lake"),
  f("aynali-glacial", "Aynalı Göl", 22, 34, 5, 4, "lake"),
  f("karagol-uludag-glacial", "Karagöl (Uludağ)", 22, 34, 5, 4, "lake"),
  f("buzlu-uludag-glacial", "Buzlu Göl (Uludağ)", 22, 34, 5, 4, "lake"),
  f("heybeli-uludag-glacial", "Heybeli Gölü (Uludağ, mevsimlik)", 22, 34, 5, 4, "lake"),
  f("deligol-glacial", "Deligöl", 78, 18, 5, 4, "lake"),
  f("sat-ikiyaka-glacial", "Sat (İkiyaka) Buzul Gölleri", 90, 65, 6, 5, "lake"),
];

const p = (plate: number, name: string): Feature => ({
  id: `province-${plate}`,
  name,
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  kind: "province",
  plate,
});

const fp = (
  id: string,
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  plates: number[],
): Feature => ({ ...f(id, name, x, y, w, h, "region"), plates });

const regionFeature = (
  id: string,
  name: string,
  plates: number[],
): Feature => fp(id, name, 50, 50, 0, 0, plates);

let mapAudioContext: AudioContext | null = null;

function playMapSound(kind: "correct" | "wrong") {
  const AudioContextClass = window.AudioContext;
  mapAudioContext ??= new AudioContextClass();
  const context = mapAudioContext;
  const now = context.currentTime;
  const tones = kind === "correct"
    ? [{ frequency: 620, start: 0, duration: .055 }, { frequency: 900, start: .065, duration: .075 }]
    : [{ frequency: 190, start: 0, duration: .09 }];

  tones.forEach(({ frequency, start, duration }) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = kind === "correct" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, now + start);
    gain.gain.setValueAtTime(.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(.075, now + start + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, now + start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now + start);
    oscillator.stop(now + start + duration + .01);
  });
}

const INDUSTRY_CENTRES: Feature[] = [
  f("istanbul-industry", "İstanbul · Gıda, tekstil, kimya, makine", 50, 50, 5, 4, "city"),
  f("izmir-industry", "İzmir · Gıda, tekstil, kimya, makine", 50, 50, 5, 4, "city"),
  f("bursa-industry", "Bursa · Tekstil, otomotiv, mobilya", 50, 50, 5, 4, "city"),
  f("ankara-industry", "Ankara · Tekstil, makine, savunma", 50, 50, 5, 4, "city"),
  f("adana-industry", "Adana · Gıda, tekstil, makine", 50, 50, 5, 4, "city"),
  f("gaziantep-industry", "Gaziantep · Tekstil, deterjan, beyaz eşya", 50, 50, 5, 4, "city"),
  f("konya-industry", "Konya · Gıda, traktör, alüminyum", 50, 50, 5, 4, "city"),
  f("erzurum-industry", "Erzurum · Et ve et ürünleri", 50, 50, 5, 4, "city"),
  f("balikesir-industry", "Balıkesir · Gıda, kâğıt, kimya", 50, 50, 5, 4, "city"),
  f("kars-industry", "Kars · Et ve et ürünleri", 50, 50, 5, 4, "city"),
  f("canakkale-industry", "Çanakkale · Su ürünleri", 50, 50, 5, 4, "city"),
  f("trabzon-industry", "Trabzon · Su ürünleri", 50, 50, 5, 4, "city"),
  f("edirne-industry", "Edirne · Ayçiçeği yağı", 50, 50, 5, 4, "city"),
  f("tekirdag-industry", "Tekirdağ · Yağ, deri, ilaç, cam, traktör", 50, 50, 5, 4, "city"),
  f("edremit-industry", "Edremit · Zeytinyağı", 50, 50, 5, 4, "city"),
  f("ayvalik-industry", "Ayvalık · Zeytinyağı", 50, 50, 5, 4, "city"),
  f("gemlik-industry", "Gemlik · Zeytinyağı, ipek, gübre", 50, 50, 5, 4, "city"),
  f("rize-industry", "Rize · Çay", 50, 50, 5, 4, "city"),
  f("denizli-industry", "Denizli · Pamuklu dokuma", 50, 50, 5, 4, "city"),
  f("aydin-industry", "Aydın · Pamuklu dokuma", 50, 50, 5, 4, "city"),
  f("antalya-industry", "Antalya · Tekstil, ferro-krom, yat", 50, 50, 5, 4, "city"),
  f("manisa-industry", "Manisa · Tekstil, beyaz eşya, tuğla-kiremit", 50, 50, 5, 4, "city"),
  f("kayseri-industry", "Kayseri · Tekstil, mobilya, beyaz eşya", 50, 50, 5, 4, "city"),
  f("hereke-industry", "Hereke · Yünlü dokuma ve halı", 50, 50, 5, 4, "city"),
  f("usak-industry", "Uşak · Tekstil, deri, tuğla-kiremit", 50, 50, 5, 4, "city"),
  f("isparta-industry", "Isparta · Yünlü dokuma ve halı", 50, 50, 5, 4, "city"),
  f("bolu-industry", "Bolu · Deri", 50, 50, 5, 4, "city"),
  f("kastamonu-industry", "Kastamonu · Kereste ve mobilya", 50, 50, 5, 4, "city"),
  f("duzce-industry", "Düzce · Kereste ve parke", 50, 50, 5, 4, "city"),
  f("izmit-industry", "İzmit · Kâğıt, rafineri, kimya, lastik", 50, 50, 5, 4, "city"),
  f("caycuma-industry", "Çaycuma · Kâğıt", 50, 50, 5, 4, "city"),
  f("dalaman-industry", "Dalaman · Kâğıt", 50, 50, 5, 4, "city"),
  f("taskopru-industry", "Taşköprü · Kâğıt", 50, 50, 5, 4, "city"),
  f("aliaga-industry", "Aliağa · Rafineri ve gübre", 50, 50, 5, 4, "city"),
  f("kirikkale-industry", "Kırıkkale · Rafineri ve savunma", 50, 50, 5, 4, "city"),
  f("batman-industry", "Batman · Rafineri", 50, 50, 5, 4, "city"),
  f("bandirma-industry", "Bandırma · Gübre", 50, 50, 5, 4, "city"),
  f("iskenderun-industry", "İskenderun · Gübre ve demir-çelik", 50, 50, 5, 4, "city"),
  f("ceyhan-industry", "Ceyhan · Gübre", 50, 50, 5, 4, "city"),
  f("mersin-industry", "Mersin · Gübre ve cam", 50, 50, 5, 4, "city"),
  f("kutahya-industry", "Kütahya · Gübre, tuğla-kiremit, seramik", 50, 50, 5, 4, "city"),
  f("samsun-industry", "Samsun · Gübre", 50, 50, 5, 4, "city"),
  f("adapazari-industry", "Adapazarı · Lastik, otomotiv, traktör, lokomotif", 50, 50, 5, 4, "city"),
  f("kirsehir-industry", "Kırşehir · Lastik", 50, 50, 5, 4, "city"),
  f("kirklareli-industry", "Kırklareli · Cam", 50, 50, 5, 4, "city"),
  f("eskisehir-industry", "Eskişehir · Cam, seramik, lokomotif, bor", 50, 50, 5, 4, "city"),
  f("afyon-industry", "Afyonkarahisar · Tuğla ve kiremit", 50, 50, 5, 4, "city"),
  f("tokat-industry", "Tokat · Tuğla ve kiremit", 50, 50, 5, 4, "city"),
  f("can-industry", "Çan · Seramik", 50, 50, 5, 4, "city"),
  f("bozuyuk-industry", "Bozüyük · Seramik", 50, 50, 5, 4, "city"),
  f("sogut-industry", "Söğüt · Seramik", 50, 50, 5, 4, "city"),
  f("sivas-industry", "Sivas · Lokomotif", 50, 50, 5, 4, "city"),
  f("golcuk-industry", "Gölcük · Tersane", 50, 50, 5, 4, "city"),
  f("tuzla-industry", "Tuzla · Tersane", 50, 50, 5, 4, "city"),
  f("pendik-industry", "Pendik · Tersane", 50, 50, 5, 4, "city"),
  f("halic-industry", "Haliç · Tersane", 50, 50, 5, 4, "city"),
  f("bodrum-industry", "Bodrum · Yat sanayisi", 50, 50, 5, 4, "city"),
  f("maden-industry", "Maden · Bakır işletmesi", 50, 50, 5, 4, "city"),
  f("kirka-industry", "Kırka · Bor işletmesi", 50, 50, 5, 4, "city"),
  f("eregli-industry", "Karadeniz Ereğli · Demir-çelik", 50, 50, 5, 4, "city"),
  f("seydisehir-industry", "Seydişehir · Alüminyum", 50, 50, 5, 4, "city"),
  f("cankiri-industry", "Çankırı · Savunma sanayisi", 50, 50, 5, 4, "city"),
];

const industrySubset = (ids: string[]) =>
  INDUSTRY_CENTRES.filter((feature) => ids.includes(feature.id));

const INDUSTRY_FOOD_FEATURES = industrySubset([
  "konya-industry", "izmir-industry", "erzurum-industry", "balikesir-industry",
  "kars-industry", "canakkale-industry", "trabzon-industry", "edirne-industry",
  "tekirdag-industry", "edremit-industry", "ayvalik-industry", "gemlik-industry",
  "adana-industry", "istanbul-industry", "rize-industry",
]);

const INDUSTRY_TEXTILE_FEATURES = industrySubset([
  "adana-industry", "izmir-industry", "denizli-industry", "aydin-industry",
  "antalya-industry", "manisa-industry", "gaziantep-industry", "istanbul-industry",
  "bursa-industry", "kayseri-industry", "hereke-industry", "usak-industry",
  "isparta-industry", "ankara-industry", "bolu-industry", "tekirdag-industry",
]);

const INDUSTRY_CHEMICAL_FEATURES = industrySubset([
  "kastamonu-industry", "tekirdag-industry", "bursa-industry", "izmir-industry",
  "ankara-industry", "duzce-industry", "istanbul-industry", "kayseri-industry",
  "izmit-industry", "caycuma-industry", "dalaman-industry", "balikesir-industry",
  "taskopru-industry", "aliaga-industry", "kirikkale-industry", "batman-industry",
  "bandirma-industry", "iskenderun-industry", "ceyhan-industry", "mersin-industry",
  "kutahya-industry", "gemlik-industry", "samsun-industry", "gaziantep-industry",
  "adapazari-industry", "kirsehir-industry", "kirklareli-industry",
  "eskisehir-industry", "afyon-industry", "usak-industry", "tokat-industry",
  "manisa-industry", "can-industry", "bozuyuk-industry", "sogut-industry",
]);

const INDUSTRY_MACHINE_FEATURES = industrySubset([
  "bursa-industry", "izmir-industry", "istanbul-industry", "izmit-industry",
  "adapazari-industry", "ankara-industry", "tekirdag-industry", "konya-industry",
  "gaziantep-industry", "manisa-industry", "eskisehir-industry", "sivas-industry",
  "golcuk-industry", "tuzla-industry", "pendik-industry", "halic-industry",
  "antalya-industry", "bodrum-industry", "maden-industry", "kirka-industry",
  "eregli-industry", "seydisehir-industry", "kirikkale-industry", "cankiri-industry",
  "iskenderun-industry",
]);

const FUNCTION_CITY_GENERAL_FEATURES: Feature[] = [
  f("function-city-soke", "Söke · Tarım", 50, 50, 5, 4, "city"),
  f("function-city-osmaniye", "Osmaniye · Tarım", 50, 50, 5, 4, "city"),
  f("function-city-akhisar", "Akhisar · Tarım", 50, 50, 5, 4, "city"),
  f("function-city-rize", "Rize · Tarım", 50, 50, 5, 4, "city"),
  f("function-city-bafra", "Bafra · Tarım", 50, 50, 5, 4, "city"),
  f("function-city-malatya", "Malatya · Tarım, askerî", 50, 50, 5, 4, "city"),
  f("function-city-istanbul", "İstanbul · Sanayi, liman, ulaşım, ticaret, kültür, turizm", 50, 50, 5, 4, "city"),
  f("function-city-kocaeli", "Kocaeli · Sanayi, liman", 50, 50, 5, 4, "city"),
  f("function-city-bursa", "Bursa · Sanayi", 50, 50, 5, 4, "city"),
  f("function-city-iskenderun", "İskenderun · Sanayi, liman", 50, 50, 5, 4, "city"),
  f("function-city-eregli", "Karadeniz Ereğli · Sanayi", 50, 50, 5, 4, "city"),
  f("function-city-soma", "Soma · Maden", 50, 50, 5, 4, "city"),
  f("function-city-batman", "Batman · Maden", 50, 50, 5, 4, "city"),
  f("function-city-zonguldak", "Zonguldak · Maden", 50, 50, 5, 4, "city"),
  f("function-city-elbistan", "Elbistan · Maden", 50, 50, 5, 4, "city"),
  f("function-city-murgul", "Murgul · Maden", 50, 50, 5, 4, "city"),
  f("function-city-izmir", "İzmir · Liman, ulaşım, ticaret, kültür", 50, 50, 5, 4, "city"),
  f("function-city-mersin", "Mersin · Liman", 50, 50, 5, 4, "city"),
  f("function-city-samsun", "Samsun · Liman", 50, 50, 5, 4, "city"),
  f("function-city-trabzon", "Trabzon · Liman", 50, 50, 5, 4, "city"),
  f("function-city-sinop", "Sinop · Liman", 50, 50, 5, 4, "city"),
  f("function-city-kayseri", "Kayseri · Ulaşım, ticaret", 50, 50, 5, 4, "city"),
  f("function-city-konya", "Konya · Ulaşım, ticaret", 50, 50, 5, 4, "city"),
  f("function-city-erzurum", "Erzurum · Ulaşım", 50, 50, 5, 4, "city"),
  f("function-city-ankara", "Ankara · Ticaret, idari, kültür", 50, 50, 5, 4, "city"),
  f("function-city-gaziantep", "Gaziantep · Ticaret", 50, 50, 5, 4, "city"),
  f("function-city-eskisehir", "Eskişehir · Kültür", 50, 50, 5, 4, "city"),
  f("function-city-golcuk", "Gölcük · Askerî", 50, 50, 5, 4, "city"),
  f("function-city-polatli", "Polatlı · Askerî", 50, 50, 5, 4, "city"),
  f("function-city-erzincan", "Erzincan · Askerî", 50, 50, 5, 4, "city"),
  f("function-city-antalya", "Antalya · Turizm", 50, 50, 5, 4, "city"),
  f("function-city-marmaris", "Marmaris · Turizm", 50, 50, 5, 4, "city"),
  f("function-city-kusadasi", "Kuşadası · Turizm", 50, 50, 5, 4, "city"),
  f("function-city-nevsehir", "Nevşehir · Turizm", 50, 50, 5, 4, "city"),
];

const AGRICULTURAL_FUNCTION_CITIES: Feature[] = [
  f("farm-city-soke", "Söke", 50, 50, 5, 4, "city"),
  f("farm-city-osmaniye", "Osmaniye", 50, 50, 5, 4, "city"),
  f("farm-city-akhisar", "Akhisar", 50, 50, 5, 4, "city"),
  f("farm-city-rize", "Rize", 50, 50, 5, 4, "city"),
  f("farm-city-bafra", "Bafra", 50, 50, 5, 4, "city"),
  f("farm-city-malatya", "Malatya", 50, 50, 5, 4, "city"),
];

const INDUSTRIAL_FUNCTION_CITIES: Feature[] = [
  f("industrial-city-istanbul", "İstanbul", 50, 50, 5, 4, "city"),
  f("industrial-city-kocaeli", "Kocaeli", 50, 50, 5, 4, "city"),
  f("industrial-city-bursa", "Bursa", 50, 50, 5, 4, "city"),
  f("industrial-city-iskenderun", "İskenderun", 50, 50, 5, 4, "city"),
  f("industrial-city-eregli", "Karadeniz Ereğli", 50, 50, 5, 4, "city"),
];

const MINING_FUNCTION_CITIES: Feature[] = [
  f("mining-city-soma", "Soma", 50, 50, 5, 4, "city"),
  f("mining-city-batman", "Batman", 50, 50, 5, 4, "city"),
  f("mining-city-zonguldak", "Zonguldak", 50, 50, 5, 4, "city"),
  f("mining-city-elbistan", "Elbistan", 50, 50, 5, 4, "city"),
  f("mining-city-murgul", "Murgul", 50, 50, 5, 4, "city"),
];

const PORT_FUNCTION_CITIES: Feature[] = [
  f("port-city-iskenderun", "İskenderun", 50, 50, 5, 4, "city"),
  f("port-city-istanbul", "İstanbul", 50, 50, 5, 4, "city"),
  f("port-city-izmir", "İzmir", 50, 50, 5, 4, "city"),
  f("port-city-mersin", "Mersin", 50, 50, 5, 4, "city"),
  f("port-city-kocaeli", "Kocaeli", 50, 50, 5, 4, "city"),
  f("port-city-samsun", "Samsun", 50, 50, 5, 4, "city"),
  f("port-city-trabzon", "Trabzon", 50, 50, 5, 4, "city"),
  f("port-city-sinop", "Sinop", 50, 50, 5, 4, "city"),
];

const TRANSPORT_TRADE_FUNCTION_CITIES: Feature[] = [
  f("transport-trade-city-izmir", "İzmir", 50, 50, 5, 4, "city"),
  f("transport-trade-city-kayseri", "Kayseri", 50, 50, 5, 4, "city"),
  f("transport-trade-city-konya", "Konya", 50, 50, 5, 4, "city"),
  f("transport-trade-city-erzurum", "Erzurum", 50, 50, 5, 4, "city"),
  f("transport-trade-city-istanbul", "İstanbul", 50, 50, 5, 4, "city"),
  f("transport-trade-city-ankara", "Ankara", 50, 50, 5, 4, "city"),
  f("transport-trade-city-gaziantep", "Gaziantep", 50, 50, 5, 4, "city"),
];

const CULTURE_ADMIN_MILITARY_FUNCTION_CITIES: Feature[] = [
  f("culture-admin-city-ankara", "Ankara", 50, 50, 5, 4, "city"),
  f("culture-admin-city-eskisehir", "Eskişehir", 50, 50, 5, 4, "city"),
  f("culture-admin-city-istanbul", "İstanbul", 50, 50, 5, 4, "city"),
  f("culture-admin-city-izmir", "İzmir", 50, 50, 5, 4, "city"),
  f("culture-admin-city-golcuk", "Gölcük", 50, 50, 5, 4, "city"),
  f("culture-admin-city-polatli", "Polatlı", 50, 50, 5, 4, "city"),
  f("culture-admin-city-malatya", "Malatya", 50, 50, 5, 4, "city"),
  f("culture-admin-city-erzincan", "Erzincan", 50, 50, 5, 4, "city"),
];

const TOURISM_FUNCTION_CITIES: Feature[] = [
  f("tourism-city-antalya", "Antalya", 50, 50, 5, 4, "city"),
  f("tourism-city-marmaris", "Marmaris", 50, 50, 5, 4, "city"),
  f("tourism-city-kusadasi", "Kuşadası", 50, 50, 5, 4, "city"),
  f("tourism-city-nevsehir", "Nevşehir", 50, 50, 5, 4, "city"),
  f("tourism-city-istanbul", "İstanbul", 50, 50, 5, 4, "city"),
];

const ZONAL_SOIL_FEATURES: Feature[] = [
  f("terra-rossa", "Terra Rossa", 39, 71, 47, 10, "region"),
  f("brown-forest", "Kahverengi Orman Toprağı", 55, 23, 55, 10, "region"),
  f("podzol-soil", "Podzol", 58, 17, 45, 8, "region"),
  f("cherno", "Çernezyom", 83, 30, 18, 11, "region"),
  f("chestnut", "Kestane Renkli Bozkır Toprağı", 55, 45, 36, 17, "region"),
  f("brown-step", "Kahverengi Bozkır Toprağı", 54, 56, 40, 18, "region"),
];

const INTRAZONAL_SOIL_FEATURES: Feature[] = [
  f("hydromorphic-soil", "Hidromorfik Toprak", 40, 55, 18, 12, "region"),
  f("halomorphic-soil", "Halomorfik Toprak", 58, 49, 24, 14, "region"),
  f("rendzina-soil", "Rendzina · Kalsimorfik", 48, 48, 30, 17, "region"),
  f("vertisol-soil", "Vertisol · Kalsimorfik", 35, 46, 30, 17, "region"),
];

const AZONAL_SOIL_FEATURES: Feature[] = [
  f("alluvial-soil", "Alüvyal Toprak", 52, 56, 44, 17, "region"),
  f("colluvial-soil", "Kolüvyal Toprak", 42, 64, 40, 12, "region"),
  f("lithosol-soil", "Litosol", 56, 48, 44, 16, "region"),
  f("regosol-soil", "Regosol", 58, 48, 36, 16, "region"),
  f("loess-soil", "Lös", 76, 66, 18, 10, "region"),
  f("moraine-soil", "Moren", 70, 30, 35, 12, "region"),
];

const FOREST_VEGETATION_FEATURES: Feature[] = [
  f("forest-black", "Kuzey Anadolu Ormanları", 61, 20, 55, 10, "region"),
  f("forest-med", "Akdeniz Ormanları", 46, 66, 48, 10, "region"),
  f("forest-west", "Batı Anadolu Ormanları", 23, 47, 20, 22, "region"),
  f("forest-interior", "İç Bölge Ormanları", 61, 44, 45, 15, "region"),
];

const SHRUB_VEGETATION_FEATURES: Feature[] = [
  f("maquis", "Maki", 35, 69, 50, 11, "region"),
  f("garig-veg", "Garig (Frigana)", 31, 71, 42, 9, "region"),
  f("pseudomaquis-veg", "Psödomaki", 60, 20, 54, 7, "region"),
];

const GRASS_VEGETATION_FEATURES: Feature[] = [
  f("step", "Bozkır", 54, 48, 45, 24, "region"),
  f("anthro-step", "Antropojen Bozkır", 31, 45, 20, 14, "region"),
  f("meadow", "Çayır · Erzurum-Kars-Ardahan", 83, 32, 22, 15, "region"),
  f("alpine-meadow-veg", "Alpin Çayır", 69, 27, 45, 12, "region"),
];

const DENSE_POPULATION_FEATURES: Feature[] = [
  f("catalca-kocaeli-pop", "Çatalca-Kocaeli Yarımadası · Sık", 20, 27, 20, 10, "region"),
  f("coastal-aegean-pop", "Kıyı Ege · Sık", 18, 53, 15, 25, "region"),
  f("antalya-pop", "Antalya Yöresi · Sık", 28, 70, 11, 8, "region"),
  f("ankara-eskisehir-pop", "Ankara-Eskişehir Yöresi · Sık", 42, 43, 20, 12, "region"),
  f("cukurova-gaziantep-pop", "Çukurova-Gaziantep Yöresi · Sık", 61, 66, 24, 10, "region"),
  f("middle-east-black-sea-pop", "Orta ve Doğu Karadeniz Kıyıları · Sık", 69, 20, 34, 8, "region"),
];

const SPARSE_POPULATION_FEATURES: Feature[] = [
  f("yildiz-pop", "Yıldız Dağları · Seyrek", 9, 17, 17, 10, "region"),
  f("canakkale-pop", "Çanakkale Çevresi · Seyrek", 10, 37, 12, 15, "region"),
  f("sinop-pop", "Sinop Çevresi · Seyrek", 48, 16, 12, 8, "region"),
  f("mentese-pop", "Menteşe Yöresi · Seyrek", 20, 67, 14, 14, "region"),
  f("teke-pop", "Teke Yöresi · Seyrek", 28, 66, 13, 14, "region"),
  f("taseli-pop", "Taşeli Yöresi · Seyrek", 43, 69, 18, 11, "region"),
  f("tuz-lake-pop", "Tuz Gölü Çevresi · Seyrek", 46, 50, 17, 14, "region"),
  f("erzurum-kars-pop", "Erzurum-Kars Yöresi · Seyrek", 82, 31, 21, 18, "region"),
  f("hakkari-pop", "Hakkâri Yöresi · Seyrek", 90, 67, 13, 12, "region"),
];

const GRAIN_LEGUME_FEATURES: Feature[] = [
  f("wheat", "Buğday · Konya-Ankara-Diyarbakır", 52, 49, 35, 18, "region"),
  f("barley-ag", "Arpa · Konya-Ankara-Şanlıurfa", 53, 53, 34, 16, "region"),
  f("corn", "Mısır · Çukurova-Amik-GAP-Kıyı Ege", 54, 59, 48, 20, "region"),
  f("rice", "Çeltik · Edirne-Samsun-Balıkesir", 35, 34, 40, 18, "region"),
  f("chickpea-ag", "Nohut · Kırşehir-Ankara", 49, 43, 18, 11, "region"),
  f("bean-ag", "Fasulye · Konya-Niğde", 51, 59, 18, 11, "region"),
  f("lentil", "Mercimek · Diyarbakır-Yozgat", 65, 53, 31, 15, "region"),
];

const INDUSTRIAL_OIL_CROP_FEATURES: Feature[] = [
  f("tobacco", "Tütün · Denizli-Manisa-Adıyaman-Samsun", 44, 48, 46, 20, "region"),
  f("sugarbeet", "Şeker Pancarı · Konya-Yozgat-Aksaray-Eskişehir", 49, 51, 30, 18, "region"),
  f("cotton", "Pamuk · Şanlıurfa-Çukurova-Kıyı Ege-Iğdır", 59, 60, 57, 17, "region"),
  f("sunflower", "Ayçiçeği · Trakya-Konya", 28, 36, 40, 17, "region"),
  f("peanut-ag", "Yer Fıstığı · Adana-Osmaniye", 59, 66, 14, 8, "region"),
  f("soybean-ag", "Soya Fasulyesi · Adana-Mersin-Samsun", 54, 50, 42, 18, "region"),
];

const FRUIT_SPECIAL_CROP_FEATURES: Feature[] = [
  f("olive", "Zeytin · Manisa-Aydın-Bursa-Balıkesir", 23, 49, 20, 24, "region"),
  f("hazelnut", "Fındık · Ordu-Giresun-Sakarya", 60, 21, 38, 8, "region"),
  f("tea", "Çay · Rize-Artvin-Trabzon", 79, 19, 18, 7, "region"),
  f("grape", "Üzüm · Manisa-Denizli-Mersin", 36, 56, 40, 18, "region"),
  f("pistachio", "Antep Fıstığı · Gaziantep-Şanlıurfa", 72, 67, 15, 9, "region"),
  f("citrus", "Turunçgiller · Akdeniz-Ege kıyıları", 46, 71, 51, 9, "region"),
  f("banana", "Muz · Anamur-Alanya", 39, 74, 14, 6, "region"),
  f("apricot", "Kayısı · Malatya", 68, 51, 8, 6, "region"),
  f("fig", "İncir · Aydın", 18, 59, 8, 6, "region"),
  f("apple", "Elma · Isparta", 35, 63, 8, 6, "region"),
];

const SMALL_RUMINANT_LIVESTOCK_FEATURES: Feature[] = [
  f("sheep-livestock", "Koyun · İç Kesim Bozkırları", 52, 49, 46, 25, "region"),
  f("goat", "Kıl Keçisi · Toroslar", 46, 70, 42, 9, "region"),
  f("angora-goat", "Tiftik Keçisi · İç ve Güneydoğu Anadolu", 58, 53, 43, 19, "region"),
];

const CATTLE_POULTRY_LIVESTOCK_FEATURES: Feature[] = [
  f("pasture-cattle", "Mera Sığırcılığı · Kuzeydoğu Anadolu", 83, 32, 20, 15, "region"),
  f("stable-cattle", "Ahır Sığırcılığı · Marmara-Ege-Akdeniz-İç Anadolu", 43, 50, 58, 35, "region"),
  f("poultry", "Kümes Hayvancılığı · Bolu-Sakarya-Balıkesir-Manisa", 30, 35, 26, 17, "region"),
];

const OTHER_LIVESTOCK_FEATURES: Feature[] = [
  f("silkworm", "İpek Böcekçiliği · Diyarbakır-Şanlıurfa-Antalya-Bursa", 53, 53, 61, 32, "region"),
  f("beekeeping", "Arıcılık · 9 il", 58, 42, 70, 42, "region"),
  f("sea-fishing", "Deniz Balıkçılığı · Karadeniz-Boğazlar-Marmara", 51, 20, 78, 10, "region"),
  f("freshwater-fishing", "Tatlı Su Balıkçılığı · 5 göl", 51, 49, 55, 31, "region"),
];

const WIND_ENERGY_FEATURES: Feature[] = [
  f("cesme", "İzmir-Çeşme · Rüzgâr", 14, 54, 7, 6, "energy"),
  f("balikesir-wind", "Balıkesir-Bandırma · Rüzgâr", 50, 50, 7, 6, "energy"),
  f("manisa-wind", "Manisa-Akhisar · Rüzgâr", 50, 50, 7, 6, "energy"),
  f("hatay-wind", "Hatay-Belen · Rüzgâr", 50, 50, 7, 6, "energy"),
  f("osmaniye-wind", "Osmaniye-Bahçe · Rüzgâr", 50, 50, 7, 6, "energy"),
  f("istanbul-wind", "İstanbul-Çatalca · Rüzgâr", 50, 50, 7, 6, "energy"),
  f("canakkale-wind", "Çanakkale-Ezine · Rüzgâr", 50, 50, 7, 6, "energy"),
  f("dinar-wind", "Dinar · Rüzgâr", 50, 50, 7, 6, "energy"),
];

const THERMAL_ENERGY_FEATURES: Feature[] = [
  f("catalagzi-energy", "Çatalağzı · Taş Kömürü Termik", 50, 50, 7, 6, "energy"),
  f("soma-energy", "Soma · Linyit Termik", 50, 50, 7, 6, "energy"),
  f("seyitomer-energy", "Seyitömer · Linyit Termik", 50, 50, 7, 6, "energy"),
  f("tuncbilek-energy", "Tunçbilek · Linyit Termik", 50, 50, 7, 6, "energy"),
  f("yatagan-energy", "Yatağan · Linyit Termik", 50, 50, 7, 6, "energy"),
  f("afsin", "Afşin-Elbistan · Linyit Termik", 65, 52, 7, 6, "energy"),
  f("hamitabat-energy", "Hamitabat · Doğal Gaz Termik", 50, 50, 7, 6, "energy"),
  f("ambarli-energy", "Ambarlı · Doğal Gaz Termik", 50, 50, 7, 6, "energy"),
  f("ovaakca-energy", "Ovaakça · Doğal Gaz Termik", 50, 50, 7, 6, "energy"),
];

const OTHER_ENERGY_FEATURES: Feature[] = [
  f("germencik", "Germencik · Jeotermal", 20, 56, 7, 6, "energy"),
  f("buharkent-geothermal", "Buharkent · Jeotermal", 50, 50, 7, 6, "energy"),
  f("akkuyu", "Akkuyu · Nükleer", 47, 76, 7, 6, "energy"),
  f("sinop-nuclear", "Sinop-İnceburun · Nükleer (planlanan)", 50, 50, 7, 6, "energy"),
  f("ataturk", "Atatürk Barajı · Hidroelektrik", 72, 63, 7, 6, "energy"),
  f("deriner-energy", "Deriner · Hidroelektrik", 50, 50, 7, 6, "energy"),
  f("karapinar", "Karapınar · Güneş", 50, 62, 7, 6, "energy"),
];

const METALLIC_MINE_FEATURES: Feature[] = [
  f("divrigi", "Divriği · Demir", 68, 45, 7, 6, "mine"),
  f("hasancelebi-mine", "Hasançelebi · Demir", 67, 47, 7, 6, "mine"),
  f("hekimhan-mine", "Hekimhan · Demir (Deveci)", 67, 48, 7, 6, "mine"),
  f("avnik-mine", "Avnik · Demir", 50, 50, 7, 6, "mine"),
  f("mansurlu-mine", "Feke-Mansurlu · Demir (Attepe)", 50, 50, 7, 6, "mine"),
  f("kesikkopru-iron", "Kesikköprü · Demir", 50, 50, 7, 6, "mine"),
  f("guleman-mine", "Guleman · Krom", 71, 53, 7, 6, "mine"),
  f("chrome-sivas-kop", "Sivas-Erzincan-Kop Kuşağı · Krom", 69, 39, 24, 10, "region"),
  f("chrome-fethiye-denizli", "Fethiye-Köyceğiz-Denizli Kuşağı · Krom", 24, 65, 16, 12, "region"),
  f("chrome-mersin-kayseri", "Mersin-Adana-Kayseri Kuşağı · Krom", 53, 61, 25, 15, "region"),
  f("chrome-bursa-eskisehir", "Bursa-Kütahya-Eskişehir Kuşağı · Krom", 30, 40, 18, 13, "region"),
  f("chrome-iskenderun-gaziantep", "İskenderun-Gaziantep Kuşağı · Krom", 68, 67, 17, 9, "region"),
  f("murgul", "Murgul · Bakır (Çakmakkaya)", 86, 24, 7, 6, "mine"),
  f("cayeli-mine", "Çayeli · Bakır (Madenköy)", 78, 21, 7, 6, "mine"),
  f("kure-mine", "Küre · Bakır (Aşıköy)", 39, 17, 7, 6, "mine"),
  f("maden-mine", "Maden · Bakır (Ergani)", 70, 54, 7, 6, "mine"),
  f("seydisehir-mine", "Seydişehir · Boksit (Mortaş)", 41, 64, 7, 6, "mine"),
  f("kokaksu-mine", "Kokaksu · Boksit", 50, 50, 7, 6, "mine"),
  f("payas-mine", "Payas · Dörtyol-Payas ve Hassa-İslahiye Boksit Sahaları", 50, 50, 13, 9, "region"),
  f("tavas-mine", "Tavas · Manganez (Ulukent)", 50, 50, 7, 6, "mine"),
  f("balya-mine", "Balya · Kurşun-Çinko", 50, 50, 7, 6, "mine"),
  f("yenice-lead-zinc", "Yenice · Kurşun-Çinko (Arapuçan)", 50, 50, 7, 6, "mine"),
  f("keban-lead-zinc", "Keban · Kurşun-Çinko Maden Sahası", 50, 50, 9, 7, "region"),
  f("bolkar-lead-zinc", "Bolkar Dağları · Kurşun-Çinko (Madenköy)", 50, 50, 7, 6, "mine"),
  f("zamanti-lead-zinc", "Zamantı · Kurşun-Çinko (Yahyalı-Çamardı Cevher Bölgesi)", 50, 50, 7, 6, "region"),
  f("akdagmadeni-lead-zinc", "Akdağmadeni · Kurşun-Çinko (Başçatak)", 50, 50, 7, 6, "mine"),
  f("east-black-sea-lead-zinc", "Doğu Karadeniz Kuşağı · Kurşun-Çinko", 78, 21, 22, 7, "region"),
];

const INDUSTRIAL_MINERAL_FEATURES: Feature[] = [
  f("kirka-mine", "Kırka · Bor (Açık İşletme)", 31, 42, 7, 6, "mine"),
  f("bigadic", "Bigadiç · Bor (Açık İşletme)", 17, 40, 7, 6, "mine"),
  f("kestelek-boron", "Kestelek · Bor Madeni", 50, 50, 7, 6, "mine"),
  f("emet-mine", "Emet · Bor (Espey Ocağı)", 26, 41, 7, 6, "mine"),
  f("mazidagi", "Mazıdağı · Fosfat İşletmesi", 78, 65, 7, 6, "mine"),
  f("adiyaman-phosphate", "Adıyaman · Fosfat Zuhurları (Tut-Pembeğli-Palanlı)", 50, 50, 12, 8, "region"),
  f("bingol-phosphate", "Bingöl · Fosfat (Genç-Avnik-Arduvan Sahaları)", 50, 50, 7, 6, "region"),
  f("sanliurfa-phosphate", "Şanlıurfa · Fosfat (Bozova)", 50, 50, 7, 6, "mine"),
  f("bitlis-phosphate", "Bitlis · Fosfat Zuhurları (Bitlis Masifi)", 50, 50, 13, 9, "region"),
  f("cankiri-salt", "Çankırı · Kaya Tuzu (Balıbağı)", 50, 50, 7, 6, "mine"),
  f("gulsehir-salt", "Gülşehir · Kaya Tuzu (Tuzköy)", 50, 50, 7, 6, "mine"),
  f("yerkoy-salt", "Yerköy · Sekili Kaya Tuzu Sahası", 50, 50, 7, 6, "mine"),
  f("tuzluca-salt", "Tuzluca · Tuz Dağı ve Mağaraları", 50, 50, 7, 6, "mine"),
  f("tuzgolu-mine", "Tuz Gölü · Tuz (Yavşan Tuzlası)", 50, 51, 7, 6, "mine"),
  f("camalti-mine", "Çamaltı · Deniz Tuzu", 14, 52, 7, 6, "mine"),
  f("marmara-island-marble", "Marmara Adası · Mermer (Saraylar-Ocaklar)", 50, 50, 10, 7, "region"),
  f("balikesir-marble", "Balıkesir · Mermer (Manyas)", 50, 50, 11, 8, "region"),
  f("bursa-marble", "Bursa · Doğal Taş (Gemlik-Orhaneli)", 50, 50, 13, 9, "region"),
  f("bilecik-marble", "Bilecik · Mermer (Söğüt-Bozüyük)", 50, 50, 13, 8, "region"),
  f("mugla-marble", "Muğla · Mermer (Milas-Yatağan-Kavaklıdere)", 50, 50, 18, 10, "region"),
  f("afyon-mermer", "Afyonkarahisar · Mermer (İscehisar)", 33, 52, 10, 7, "region"),
  f("burdur-marble", "Burdur · Mermer (Bucak)", 50, 50, 10, 7, "region"),
  f("denizli-marble", "Denizli · Traverten-Mermer (Honaz-Kaklık)", 50, 50, 13, 8, "region"),
  f("oltu-stone", "Oltu · Oltu Taşı (Dutlu Dağı)", 50, 50, 9, 7, "region"),
  f("eskisehir-meerschaum", "Eskişehir · Lüle Taşı Sahaları", 50, 50, 14, 9, "region"),
];

const ENERGY_RAW_MATERIAL_FEATURES: Feature[] = [
  f("zonguldak", "Ereğli-Zonguldak-Amasra · Taş Kömürü Havzası", 31, 20, 20, 8, "region"),
  f("afsin-mine", "Afşin-Elbistan · Linyit", 65, 52, 8, 6, "region"),
  f("soma-mine", "Soma · Linyit", 18, 44, 7, 6, "region"),
  f("tuncbilek-lignite", "Tunçbilek · Linyit", 50, 50, 7, 6, "region"),
  f("seyitomer", "Seyitömer · Linyit", 25, 44, 7, 6, "region"),
  f("tavsanli-lignite", "Tavşanlı · Değirmisaz Linyit Havzası", 50, 50, 10, 7, "region"),
  f("can-lignite", "Çan · Linyit", 50, 50, 7, 6, "region"),
  f("yatagan-lignite", "Yatağan · Linyit", 50, 50, 7, 6, "region"),
  f("celtek-lignite", "Çeltek · İstasyon ve Tersakan Batısı Linyit Sahası", 50, 50, 7, 6, "region"),
  f("nallihan-lignite", "Nallıhan · Batı Kesimi Linyit Zuhurları", 50, 50, 10, 7, "region"),
  f("cayirhan-lignite", "Çayırhan · Linyit", 50, 50, 7, 6, "region"),
  f("dodurga-lignite", "Dodurga · Linyit", 50, 50, 7, 6, "region"),
  f("askale-lignite", "Aşkale · Kükürtlü Linyit Sahası", 50, 50, 7, 6, "region"),
];

const NATURAL_TOURISM_FEATURES: Feature[] = [
  f("uludag-tour", "Uludağ · Bursa", 50, 50, 8, 5, "mountain"),
  f("kartalkaya-tour", "Kartalkaya · Bolu", 50, 50, 8, 5, "mountain"),
  f("erciyes-tour", "Erciyes · Kayseri", 50, 50, 7, 6, "volcano"),
  f("palandoken-tour", "Palandöken · Erzurum", 50, 50, 8, 5, "mountain"),
  f("kackar-tour", "Kaçkar · Dağları Millî Parkı (Rize-Artvin-Erzurum)", 50, 50, 12, 5, "mountain"),
  f("beydaglari-tour", "Beydağları · Antalya", 50, 50, 11, 5, "mountain"),
  f("nemrut-bitlis-tour", "Nemrut Dağı ve Kalderası · Bitlis", 50, 50, 7, 6, "volcano"),
  f("agri-tour", "Ağrı Dağı · Ağrı-Iğdır", 50, 50, 7, 6, "volcano"),
  f("anzer-tour", "Anzer Yaylası · Rize", 50, 50, 8, 5, "plateau"),
  f("ayder-tour", "Ayder Yaylası · Rize", 50, 50, 8, 5, "plateau"),
  f("kadirga-tour", "Kadırga Yaylası · Trabzon-Gümüşhane", 50, 50, 8, 5, "plateau"),
  f("persembe-tour", "Perşembe Yaylası · Ordu", 50, 50, 8, 5, "plateau"),
  f("saklikent-tour", "Saklıkent ve Beydağı · Antalya", 50, 50, 5, 4, "city"),
  f("camliyayla-tour", "Çamlıyayla · Mersin", 50, 50, 5, 4, "city"),
  f("horzum-tour", "Horzum Yaylası · Adana", 50, 50, 5, 4, "city"),
  f("tekir-tour", "Tekir Yaylası · Adana", 50, 50, 5, 4, "city"),
  f("karacabey-longoz-tour", "Karacabey Longozu · Bursa", 50, 50, 10, 7, "region"),
  f("igneada-longoz-tour", "İğneada Longozu · Longoz Ormanları (Kırklareli)", 50, 50, 10, 7, "region"),
  f("izmir-bird-tour", "İzmir Kuş Cenneti · Gediz Deltası", 50, 50, 10, 7, "region"),
  f("manyas-bird-tour", "Manyas Kuş Cenneti · Balıkesir", 50, 50, 8, 6, "lake"),
  f("kizilirmak-bird-tour", "Kızılırmak Deltası Kuş Cenneti · Samsun", 50, 50, 12, 8, "region"),
  f("kapadokya", "Kapadokya Peribacaları · Nevşehir", 50, 50, 13, 9, "region"),
  f("pamukkale", "Pamukkale Travertenleri · Denizli", 50, 50, 8, 6, "region"),
  f("akcali-tour", "Akçalı Travertenleri · Van", 50, 50, 5, 4, "city"),
  f("karain-tour", "Karain Mağarası · Antalya", 50, 50, 5, 4, "city"),
  f("damlatas-tour", "Damlataş Mağarası · Antalya", 50, 50, 5, 4, "city"),
  f("dim-tour", "Dim Mağarası · Antalya", 50, 50, 5, 4, "city"),
  f("beldibi-tour", "Beldibi Mağarası · Antalya", 50, 50, 5, 4, "city"),
  f("insuyu-tour", "İnsuyu Mağarası · Burdur", 50, 50, 5, 4, "city"),
  f("gilindire-tour", "Gilindire Mağarası · Mersin", 50, 50, 5, 4, "city"),
  f("ballica-tour", "Ballıca Mağarası · Tokat", 50, 50, 5, 4, "city"),
  f("golcuk-geotour", "Gölcük Kalderası · Isparta", 50, 50, 7, 5, "lake"),
  f("kula-geotour", "Kula Volkanik Alanı · Kula-Salihli UNESCO Global Jeoparkı", 50, 50, 13, 9, "region"),
  f("meke-geotour", "Meke Gölü · Konya", 50, 50, 7, 5, "lake"),
  f("acigol-geotour", "Acıgöl Maarı · Konya", 50, 50, 7, 5, "lake"),
];

const CULTURAL_TOURISM_FEATURES: Feature[] = [
  f("ayasofya-tour", "Ayasofya · İstanbul", 50, 50, 6, 5, "landmark"),
  f("sultanahmet-tour", "Sultan Ahmet Camii · İstanbul", 50, 50, 6, 5, "landmark"),
  f("topkapi-tour", "Topkapı Sarayı · İstanbul", 50, 50, 6, 5, "landmark"),
  f("dolmabahce-tour", "Dolmabahçe Sarayı · İstanbul", 50, 50, 6, 5, "landmark"),
  f("meryemana-tour", "Meryem Ana Evi · İzmir", 50, 50, 6, 5, "landmark"),
  f("gokmedrese-tour", "Gök Medrese · Sivas", 50, 50, 6, 5, "landmark"),
  f("selimiye-tour", "Selimiye Camii · Edirne", 50, 50, 6, 5, "landmark"),
  f("ishakpasa-tour", "İshak Paşa Sarayı · Ağrı", 50, 50, 6, 5, "landmark"),
  f("gobeklitepe-tour", "Göbeklitepe · Şanlıurfa", 50, 50, 6, 5, "landmark"),
  f("catalhoyuk-tour", "Çatalhöyük · Konya", 50, 50, 6, 5, "landmark"),
  f("alacahoyuk-tour", "Alacahöyük · Çorum", 50, 50, 6, 5, "landmark"),
  f("hattusas-tour", "Hattuşaş · Çorum", 50, 50, 6, 5, "landmark"),
  f("arslantepe-tour", "Arslantepe · Malatya", 50, 50, 6, 5, "landmark"),
  f("efes", "Efes · İzmir", 50, 50, 6, 5, "landmark"),
  f("gelibolu-tour", "Çanakkale Savaşları Gelibolu Tarihî Alanı", 50, 50, 12, 8, "region"),
  f("baskomutan-tour", "Başkomutan Tarihî Millî Parkı · Afyonkarahisar-Kütahya", 50, 50, 14, 9, "region"),
  f("istiklal-tour", "İstiklal Yolu Tarihî Millî Parkı · İnebolu-Kastamonu-Çankırı-Ankara", 50, 50, 13, 5, "route"),
  f("malazgirt-tour", "Malazgirt Meydan Muharebesi Tarihî Millî Parkı · Muş", 50, 50, 10, 7, "region"),
  f("sakarya-tour", "Sakarya Meydan Muharebesi Tarihî Millî Parkı · Polatlı-Haymana", 50, 50, 14, 9, "region"),
  f("safranbolu", "Safranbolu Tarihî Kenti · Karabük", 50, 50, 8, 6, "region"),
  f("sumela", "Sümela Manastırı · Trabzon", 50, 50, 6, 5, "landmark"),
  f("nemrut-tour", "Nemrut Dağı Ören Yeri · Adıyaman", 50, 50, 6, 5, "landmark"),
];

const TECTONIC_PLAIN_FEATURES: Feature[] = [
  f("gonen-o", "Gönen Ovası", 50, 50, 7, 4, "plain"),
  f("inegol-o", "İnegöl Ovası", 50, 50, 7, 4, "plain"),
  f("bursa-o", "Bursa Ovası", 22, 35, 8, 4, "plain"),
  f("yenisehir-o", "Yenişehir Ovası", 50, 50, 7, 4, "plain"),
  f("orhangazi-o", "Orhangazi Ovası", 50, 50, 7, 4, "plain"),
  f("pamukova-o", "Pamukova", 50, 50, 7, 4, "plain"),
  f("gemlik-o", "Gemlik Ovası", 50, 50, 7, 4, "plain"),
  f("adapazari-o", "Adapazarı Ovası", 29, 29, 8, 4, "plain"),
  f("bolu-o", "Bolu Ovası", 34, 28, 7, 4, "plain"),
  f("duzce-o", "Düzce Ovası", 31, 27, 7, 4, "plain"),
  f("tosya-o", "Tosya Ovası", 50, 50, 7, 4, "plain"),
  f("suluova-o", "Suluova", 50, 50, 7, 4, "plain"),
  f("niksar-o", "Niksar Ovası", 50, 50, 7, 4, "plain"),
  f("tasova-o", "Taşova", 50, 50, 7, 4, "plain"),
  f("turhal-o", "Turhal Ovası", 50, 50, 7, 4, "plain"),
  f("vezirkopru-o", "Vezirköprü Ovası", 50, 50, 7, 4, "plain"),
  f("erbaa-o", "Erbaa Ovası", 50, 50, 7, 4, "plain"),
  f("erzincan-o", "Erzincan Ovası", 70, 42, 10, 5, "plain"),
  f("erzurum", "Erzurum Ovası", 77, 37, 12, 6, "plain"),
  f("pasinler-o", "Pasinler Ovası", 50, 50, 8, 4, "plain"),
  f("bakircay-o", "Bakırçay Ovası", 16, 46, 10, 4, "plain", -4),
  f("gediz-o", "Gediz Ovası", 20, 52, 12, 5, "plain", -4),
  f("kucukmenderes-o", "Küçük Menderes Ovası", 19, 56, 11, 4, "plain", 3),
  f("buyukmenderes-o", "Büyük Menderes Ovası", 22, 61, 13, 4, "plain", 5),
  f("ankara-o", "Ankara Ovası", 50, 50, 8, 5, "plain"),
  f("kayseri-o", "Kayseri Ovası", 50, 50, 9, 5, "plain"),
  f("aksaray-o", "Aksaray Ovası", 50, 50, 8, 5, "plain"),
  f("cubuk-o", "Çubuk Ovası", 50, 50, 7, 4, "plain"),
  f("eskisehir-o", "Eskişehir Ovası", 50, 50, 9, 4, "plain"),
  f("develi-o", "Develi Ovası", 50, 50, 8, 5, "plain"),
  f("konya", "Konya Ovası", 47, 59, 15, 9, "plain"),
  f("amik", "Amik Ovası", 62, 75, 9, 5, "plain"),
  f("afsin-o", "Afşin Ovası", 50, 50, 8, 4, "plain"),
  f("elbistan-o", "Elbistan Ovası", 50, 50, 9, 5, "plain"),
  f("maras-o", "Kahramanmaraş Ovası", 64, 59, 9, 4, "plain"),
  f("malatya-o", "Malatya Ovası", 68, 52, 9, 4, "plain"),
  f("elazig-o", "Elazığ Ovası", 50, 50, 8, 4, "plain"),
  f("bingol-o", "Bingöl Ovası", 50, 50, 7, 4, "plain"),
  f("mus-o", "Muş Ovası", 78, 54, 10, 5, "plain"),
  f("karliova-o", "Karlıova", 50, 50, 7, 4, "plain"),
  f("malazgirt-o", "Malazgirt Ovası", 50, 50, 8, 4, "plain"),
  f("harran", "Harran (Altınbaşak) Ovası", 72, 71, 12, 7, "plain"),
  f("suruc-o", "Suruç Ovası", 71, 69, 8, 4, "plain"),
  f("ceylanpinar-o", "Ceylanpınar Ovası", 78, 71, 10, 4, "plain"),
  f("igdir-o", "Iğdır Ovası", 91, 41, 7, 5, "plain"),
  f("yuksekova-o", "Yüksekova", 89, 68, 8, 4, "plain"),
  f("bergama-o", "Bergama Ovası", 16, 46, 7, 4, "plain"),
  f("soma-o", "Soma Ovası", 18, 44, 7, 4, "plain"),
  f("akhisar-o", "Akhisar Ovası", 20, 48, 7, 4, "plain"),
];

const DELTA_PLAIN_FEATURES: Feature[] = [
  f("bafra-d", "Bafra Deltası · Kızılırmak", 54, 18, 8, 4, "plain"),
  f("carsamba-d", "Çarşamba Deltası · Yeşilırmak", 61, 20, 8, 4, "plain"),
  f("cukur-d", "Çukurova · Seyhan-Ceyhan", 57, 71, 13, 6, "plain"),
  f("silifke-d", "Silifke Deltası · Göksu", 47, 75, 8, 4, "plain"),
  f("menemen-d", "Menemen Deltası · Gediz", 15, 51, 7, 4, "plain"),
  f("selcuk-d", "Selçuk Deltası · Küçük Menderes", 18, 57, 7, 4, "plain"),
  f("balat-d", "Balat Deltası · Büyük Menderes", 20, 61, 7, 4, "plain"),
  f("meric-d", "Meriç Deltası", 7, 34, 7, 4, "plain"),
];

const KARSTIC_PLAIN_FEATURES: Feature[] = [
  f("elmali-o", "Elmalı Ovası", 50, 50, 7, 4, "plain"),
  f("korkuteli-o", "Korkuteli Ovası", 50, 50, 7, 4, "plain"),
  f("gembos-o", "Gembos Ovası", 50, 50, 7, 4, "plain"),
  f("kestel-o", "Kestel Ovası", 50, 50, 7, 4, "plain"),
  f("kocaova-o", "Kocaova", 50, 50, 7, 4, "plain"),
  f("acipayam-o", "Acıpayam Ovası", 50, 50, 7, 4, "plain"),
  f("mugla-o", "Muğla Ovası", 50, 50, 7, 4, "plain"),
  f("tefenni-o", "Tefenni Ovası", 50, 50, 7, 4, "plain"),
  f("golhisar-o", "Gölhisar Ovası", 50, 50, 7, 4, "plain"),
  f("bozova-karst-o", "Bozova Ovası", 50, 50, 7, 4, "plain"),
];

const OTHER_PLAIN_FEATURES: Feature[] = [
  f("antalya-o", "Antalya Ovası", 50, 50, 9, 5, "plain"),
  f("ergene-o", "Ergene Ovası", 50, 50, 10, 6, "plain"),
  f("merzifon-o", "Merzifon Ovası", 50, 50, 7, 4, "plain"),
  f("ceyhan-o", "Ceyhan Ovası", 50, 50, 8, 4, "plain"),
];

const ALL_PLAIN_FEATURES: Feature[] = [
  ...TECTONIC_PLAIN_FEATURES,
  ...DELTA_PLAIN_FEATURES,
  ...KARSTIC_PLAIN_FEATURES,
  ...OTHER_PLAIN_FEATURES,
];

const TABULAR_PLATEAU_FEATURES: Feature[] = [
  f("bozok", "Bozok Platosu", 57, 43, 14, 9, "plateau"),
  f("obruk", "Obruk Platosu", 49, 59, 13, 8, "plateau"),
  f("gaziantep", "Gaziantep Platosu", 68, 67, 12, 7, "plateau"),
  f("haymana", "Haymana Platosu", 43, 46, 11, 7, "plateau"),
  f("cihanbeyli", "Cihanbeyli Platosu", 45, 53, 12, 7, "plateau"),
  f("uzunyayla", "Uzunyayla Platosu", 63, 48, 12, 8, "plateau"),
  f("yazilikaya", "Yazılıkaya Platosu", 29, 44, 11, 8, "plateau"),
  f("usak-esme", "Uşak-Eşme Platosu", 25, 52, 12, 8, "plateau"),
  f("sanliurfa-p", "Şanlıurfa Platosu", 75, 69, 13, 7, "plateau"),
];

const KARSTIC_PLATEAU_FEATURES: Feature[] = [
  f("teke", "Teke Platosu", 31, 69, 12, 8, "plateau"),
  f("taspinar", "Taşeli Platosu", 44, 70, 14, 7, "plateau"),
];

const VOLCANIC_PLATEAU_FEATURES: Feature[] = [
  f("erzurum-kars", "Erzurum-Kars Platosu", 82, 32, 16, 10, "plateau"),
  f("ardahan-p", "Ardahan Platosu", 87, 26, 10, 7, "plateau"),
];

const EROSION_PLATEAU_FEATURES: Feature[] = [
  f("catalca", "Çatalca-Kocaeli Platosu", 19, 25, 17, 8, "plateau"),
  f("persembe-p", "Perşembe Platosu", 62, 23, 11, 7, "plateau"),
];

const ALL_PLATEAU_FEATURES: Feature[] = [
  ...TABULAR_PLATEAU_FEATURES,
  ...KARSTIC_PLATEAU_FEATURES,
  ...VOLCANIC_PLATEAU_FEATURES,
  ...EROSION_PLATEAU_FEATURES,
];

const QUIZZES: Quiz[] = [
  {
    id: "mountains-all",
    group: "Dağlar",
    title: "Türkiye Dağları",
    eyebrow: "Dağlar · Tümü",
    description: "Kıvrım, kırık ve volkanik dağları birlikte bul.",
    color: "#e85c4a",
    icon: "▲",
    features: [
      f("yildiz", "Yıldız Dağları", 14, 19, 8, 5, "mountain", 4),
      f("kure", "Küre Dağları", 39, 17, 9, 5, "mountain", 2),
      f("canik", "Canik Dağları", 58, 19, 9, 5, "mountain", 5),
      f("kackar", "Kaçkar Dağları", 78, 18, 9, 5, "mountain", -6),
      f("bolu-d", "Bolu Dağları", 29, 23, 8, 5, "mountain", -4),
      f("ilgaz", "Ilgaz Dağları", 42, 25, 8, 5, "mountain"),
      f("koroglu", "Köroğlu Dağları", 35, 29, 8, 5, "mountain"),
      f("giresun", "Giresun Dağları", 66, 22, 8, 5, "mountain"),
      f("mescit", "Mescit Dağları", 76, 29, 7, 5, "mountain"),
      f("kop-dagi", "Kop Dağları", 73, 34, 7, 5, "mountain"),
      f("bey", "Bey Dağları", 32, 71, 8, 5, "mountain", -4),
      f("sultan", "Sultan Dağları", 38, 62, 8, 5, "mountain"),
      f("bolkar", "Bolkar Dağları", 49, 71, 8, 5, "mountain", 2),
      f("aladag", "Aladağlar", 58, 66, 7, 5, "mountain", -6),
      f("nur", "Nur Dağları", 62, 70, 6, 7, "mountain"),
      f("sundiken", "Sündiken Dağları", 31, 38, 8, 5, "mountain"),
      f("elmadag", "Elmadağ", 45, 42, 7, 5, "mountain"),
      f("munzur", "Munzur Dağları", 69, 46, 8, 5, "mountain", -4),
      f("mercan", "Mercan Dağları", 71, 41, 8, 5, "mountain"),
      f("hakkari", "Hakkâri Dağları", 84, 69, 8, 6, "mountain", -8),
      f("madra", "Madra Dağları", 14, 43, 6, 5, "mountain", 18),
      f("yunt", "Yunt Dağları", 19, 49, 6, 5, "mountain", 18),
      f("bozdag", "Bozdağlar", 19, 55, 7, 5, "mountain", 13),
      f("aydin-d", "Aydın Dağları", 23, 61, 7, 5, "mountain", 8),
      f("mentese", "Menteşe Dağları", 18, 67, 7, 6, "mountain", -15),
      f("kaz", "Kaz Dağı", 13, 39, 9, 5, "mountain", 15),
      f("uludag", "Uludağ", 22, 34, 7, 5, "mountain"),
      f("malatya", "Malatya Dağları", 69, 54, 8, 5, "mountain"),
      f("cilo", "Cilo-Sat Dağları", 88, 69, 8, 6, "mountain", -8),
      f("agri", "Ağrı Dağı", 88, 40, 5, 8, "volcano"),
      f("tendurek", "Tendürek Dağı", 84, 46, 5, 8, "volcano"),
      f("suphan", "Süphan Dağı", 78, 50, 5, 8, "volcano"),
      f("nemrut", "Nemrut Dağı", 74, 53, 5, 8, "volcano"),
      f("erciyes", "Erciyes Dağı", 57, 51, 5, 8, "volcano"),
      f("hasan", "Hasan Dağı", 50, 58, 5, 8, "volcano"),
      f("karadag", "Karadağ", 46, 64, 5, 7, "volcano"),
      f("melendiz", "Melendiz Dağı", 53, 57, 5, 7, "volcano"),
      f("karacadag-ic", "Karacadağ (İç Anadolu)", 42, 49, 5, 7, "volcano"),
      f("karacadag-gd", "Karacadağ (Güneydoğu)", 73, 61, 5, 7, "volcano"),
      f("kula", "Kula Volkanları", 22, 52, 5, 7, "volcano"),
    ],
  },
  {
    id: "fold-mountains",
    group: "Dağlar",
    title: "Kıvrım Dağları",
    eyebrow: "Dağlar · Alt konu",
    description: "Kuzey Anadolu ve Toros kıvrım sistemlerini ayırt et.",
    color: "#ef6d59",
    icon: "≋",
    features: [
      f("kure-f", "Küre Dağları", 35, 17, 15, 5, "mountain", 2),
      f("canik-f", "Canik Dağları", 56, 19, 14, 5, "mountain", 5),
      f("kackar-f", "Kaçkar Dağları", 76, 18, 13, 5, "mountain", -6),
      f("ilgaz-f", "Ilgaz Dağları", 42, 25, 9, 5, "mountain"),
      f("koroglu-f", "Köroğlu Dağları", 35, 29, 9, 5, "mountain"),
      f("giresun-f", "Giresun Dağları", 66, 22, 9, 5, "mountain"),
      f("bey", "Bey Dağları", 31, 70, 13, 5, "mountain", -4),
      f("sultan-f", "Sultan Dağları", 38, 62, 9, 5, "mountain"),
      f("bolkar", "Bolkar Dağları", 51, 70, 13, 5, "mountain", 2),
      f("aladag-f", "Aladağlar", 58, 66, 9, 5, "mountain"),
      f("nur-f", "Nur Dağları", 62, 70, 7, 6, "mountain"),
      f("sundiken-f", "Sündiken Dağları", 31, 38, 9, 5, "mountain"),
      f("elmadag-f", "Elmadağ", 45, 42, 8, 5, "mountain"),
      f("munzur-f", "Munzur Dağları", 69, 46, 9, 5, "mountain"),
      f("mercan-f", "Mercan Dağları", 71, 41, 9, 5, "mountain"),
      f("hakkari", "Hakkâri Dağları", 82, 69, 13, 6, "mountain", -8),
    ],
  },
  {
    id: "fault-mountains",
    group: "Dağlar",
    title: "Kırık Dağlar",
    eyebrow: "Dağlar · Alt konu",
    description: "Ege’deki horst sistemini ve MEB’in kırık dağ örneği olarak verdiği Nur (Amanos) Dağları’nı bul.",
    color: "#bf6657",
    icon: "⌁",
    features: [
      f("kaz", "Kaz Dağı", 13, 39, 9, 5, "mountain", 15),
      f("madra-f", "Madra Dağları", 15, 44, 9, 5, "mountain", 18),
      f("yunt-f", "Yunt Dağları", 18, 49, 9, 5, "mountain", 18),
      f("bozdag-f", "Bozdağlar", 20, 55, 11, 5, "mountain", 13),
      f("aydin-f", "Aydın Dağları", 22, 61, 11, 5, "mountain", 8),
      f("mentese-f", "Menteşe Dağları", 19, 66, 11, 6, "mountain", -15),
      f("nur", "Nur Dağları", 62, 70, 7, 6, "mountain"),
    ],
  },
  {
    id: "volcanic-mountains",
    group: "Dağlar",
    title: "Volkanik Dağlar",
    eyebrow: "Dağlar · Alt konu",
    description: "Türkiye’nin volkanik konilerini haritada yakala.",
    color: "#d94b41",
    icon: "◆",
    features: [
      f("agri-v", "Ağrı Dağı", 88, 39, 5, 9, "volcano"),
      f("tendurek", "Tendürek Dağı", 84, 46, 5, 8, "volcano"),
      f("suphan", "Süphan Dağı", 78, 50, 5, 8, "volcano"),
      f("nemrut", "Nemrut Dağı", 74, 53, 5, 8, "volcano"),
      f("erciyes-v", "Erciyes Dağı", 57, 52, 5, 8, "volcano"),
      f("hasan", "Hasan Dağı", 50, 58, 5, 8, "volcano"),
      f("karadag", "Karadağ", 46, 64, 5, 7, "volcano"),
      f("melendiz", "Melendiz Dağı", 53, 57, 5, 7, "volcano"),
      f("karacadag-ic", "Karacadağ (İç Anadolu)", 42, 49, 5, 7, "volcano"),
      f("karacadag-gd", "Karacadağ (Güneydoğu)", 73, 61, 5, 7, "volcano"),
      f("kula", "Kula Volkanları", 22, 52, 5, 7, "volcano"),
    ],
  },
  {
    id: "lakes-all",
    group: "Göller",
    title: "Türkiye Gölleri",
    eyebrow: "Göller · Tümü",
    description: "Oluşum türleri karışık gölleri şekilleriyle bul.",
    color: "#33a9cc",
    icon: "◒",
    features: [
      f("tuz", "Tuz Gölü", 49, 52, 7, 9, "lake", 8),
      f("iznik", "İznik Gölü", 21, 32, 6, 4, "lake"),
      f("manyas", "Manyas Gölü", 17, 31, 5, 4, "lake"),
      f("uluabat", "Uluabat Gölü", 19, 35, 5, 3, "lake"),
      f("sapanca", "Sapanca Gölü", 25, 31, 5, 3, "lake"),
      f("burdur", "Burdur Gölü", 33, 62, 5, 5, "lake"),
      f("aksehir", "Akşehir Gölü", 39, 58, 5, 4, "lake"),
      f("eber", "Eber Gölü", 37, 58, 5, 4, "lake"),
      f("hazar", "Hazar Gölü", 71, 54, 6, 3, "lake", -10),
      f("cildir", "Çıldır Gölü", 87, 27, 5, 4, "lake"),
      f("salda", "Salda Gölü", 31, 63, 4, 4, "lake"),
      f("ercis", "Erçek Gölü", 86, 49, 4, 4, "lake"),
      f("acigol-t", "Acıgöl", 29, 61, 5, 4, "lake"),
      f("seyfe-t", "Seyfe Gölü", 54, 46, 5, 4, "lake"),
      f("ilgin", "Ilgın (Çavuşçu) Gölü", 40, 56, 4, 4, "lake"),
      f("aktas-lake", "Aktaş Gölü", 89, 25, 4, 4, "lake"),
      f("nazik", "Nazik Gölü", 78, 46, 5, 4, "lake"),
      f("balik", "Balık Gölü", 88, 40, 4, 3, "lake"),
      f("haçli", "Haçlı Gölü", 76, 49, 4, 3, "lake"),
      f("avlan", "Avlan Gölü", 31, 69, 5, 4, "lake"),
      f("kestel-l", "Kestel Gölü", 28, 64, 5, 4, "lake"),
      f("kiziloren-l", "Kızören Obruğu", 51, 52, 5, 4, "lake"),
      f("nemrut-vl", "Nemrut Kaldera Gölü", 75, 51, 5, 4, "lake"),
      f("meke-vl", "Meke Maarı", 48, 61, 5, 4, "lake"),
      f("golcuk-vl", "Gölcük Krater Gölü", 34, 61, 5, 4, "lake"),
      f("acigol-karapinar", "Acıgöl (Karapınar)", 49, 62, 4, 4, "lake"),
      f("nar-lake", "Nar Gölü", 52, 57, 4, 4, "lake"),
      f("aygir", "Aygır (Süphan) Gölü", 79, 48, 4, 4, "lake"),
      f("meyil-lake", "Meyil Obruğu", 49, 59, 4, 4, "lake"),
      f("cirali-lake", "Çıralı Obruğu", 50, 60, 4, 4, "lake"),
      f("hafik-lake", "Hafik Gölü", 65, 39, 4, 4, "lake"),
      f("todurge-lake", "Tödürge Gölü", 66, 39, 4, 4, "lake"),
      ...LANDSLIDE_SET_LAKE_FEATURES,
      ...ALLUVIAL_SET_LAKE_FEATURES,
      ...COASTAL_SET_LAKE_FEATURES,
      ...MIXED_ORIGIN_LAKE_FEATURES,
      ...GLACIAL_LAKE_FEATURES,
    ],
  },
  {
    id: "tectonic-lakes",
    group: "Göller",
    title: "Tektonik Göller",
    eyebrow: "Göller · Alt konu",
    description: "Faylanma ve çöküntü alanlarında oluşan gölleri seç.",
    color: "#268eb9",
    icon: "≈",
    features: [
      f("iznik-t", "İznik Gölü", 21, 32, 6, 4, "lake"),
      f("sapanca", "Sapanca Gölü", 25, 31, 5, 3, "lake"),
      f("manyas-t", "Manyas Gölü", 17, 31, 5, 4, "lake"),
      f("ulubat", "Uluabat Gölü", 19, 35, 5, 3, "lake"),
      f("tuz-t", "Tuz Gölü", 49, 52, 7, 9, "lake", 8),
      f("burdur-t", "Burdur Gölü", 33, 62, 5, 5, "lake"),
      f("aksehir-t", "Akşehir Gölü", 39, 58, 5, 4, "lake"),
      f("eber-t", "Eber Gölü", 37, 58, 5, 4, "lake"),
      f("acigol-t", "Acıgöl", 29, 61, 5, 4, "lake"),
      f("hazar", "Hazar Gölü", 71, 54, 6, 3, "lake", -10),
      f("seyfe-t", "Seyfe Gölü", 54, 46, 5, 4, "lake"),
      f("ilgin", "Ilgın (Çavuşçu) Gölü", 40, 56, 4, 4, "lake"),
      f("aktas-lake", "Aktaş Gölü", 89, 25, 4, 4, "lake"),
    ],
  },
  {
    id: "volcanic-set-lakes",
    group: "Göller",
    title: "Volkanik Set Gölleri",
    eyebrow: "Göller · Alt konu",
    description: "Lavların akarsu önünü kapattığı gölleri bul.",
    color: "#5aa8c8",
    icon: "●",
    features: [
      f("cildir", "Çıldır Gölü", 87, 27, 5, 4, "lake"),
      f("nazik", "Nazik Gölü", 78, 46, 5, 4, "lake"),
      f("ercis", "Erçek Gölü", 86, 49, 4, 4, "lake"),
      f("balik", "Balık Gölü", 88, 40, 4, 3, "lake"),
      f("haçli", "Haçlı Gölü", 76, 49, 4, 3, "lake"),
    ],
  },
  {
    id: "landslide-set-lakes",
    group: "Göller",
    title: "Heyelan Set Gölleri",
    eyebrow: "Göller · Doğal set · Heyelan",
    description: "MEB listesindeki heyelanla vadi önü kapanması sonucu oluşan gölleri gerçek kıyı şekilleriyle bul.",
    color: "#4d9e91",
    icon: "◒",
    features: [...LANDSLIDE_SET_LAKE_FEATURES],
  },
  {
    id: "alluvial-set-lakes",
    group: "Göller",
    title: "Alüvyal Set Gölleri",
    eyebrow: "Göller · Doğal set · Alüvyal",
    description: "MEB listesindeki alüvyal birikimlerle önü kapanan gölleri gerçek kıyı şekilleriyle bul.",
    color: "#6cae70",
    icon: "◓",
    features: [...ALLUVIAL_SET_LAKE_FEATURES],
  },
  {
    id: "coastal-set-lakes",
    group: "Göller",
    title: "Kıyı Set Gölleri",
    eyebrow: "Göller · Doğal set · Lagün",
    description: "Kıyı oku ve kordonlarının koy önlerini kapatmasıyla oluşan MEB örneklerini gerçek lagün şekilleriyle bul.",
    color: "#2b9eb3",
    icon: "◔",
    features: [...COASTAL_SET_LAKE_FEATURES],
  },
  {
    id: "mixed-origin-lakes",
    group: "Göller",
    title: "Karma Oluşumlu Göller",
    eyebrow: "Göller · Karma oluşum",
    description: "MEB listesindeki tektonik-karstik ve tektonik-volkanik oluşumlu gölleri gerçek kıyı şekilleriyle bul.",
    color: "#5976b8",
    icon: "◑",
    features: [...MIXED_ORIGIN_LAKE_FEATURES],
  },
  {
    id: "glacial-lakes",
    group: "Göller",
    title: "Sirk (Buzul) Gölleri",
    eyebrow: "Göller · Buzul aşındırması",
    description: "MEB ile Uludağ Milli Parkı envanterindeki başlıca sirk göllerini gerçek su yüzeylerine tıklayarak bul. Heybeli, yazın kuruyan mevsimlik göl olarak ayrıştırılır.",
    color: "#4f83c2",
    icon: "❄",
    features: [...GLACIAL_LAKE_FEATURES],
  },
  {
    id: "rivers",
    group: "Sular",
    title: "Akarsular",
    eyebrow: "Sular · Akarsular",
    description: "Kaynağından ağzına uzanan akarsu hatlarını seç.",
    color: "#2670d8",
    icon: "↝",
    features: [
      f("kizilirmak", "Kızılırmak", 48, 34, 24, 3, "river", 17),
      f("yesilirmak", "Yeşilırmak", 60, 27, 16, 3, "river", -8),
      f("sakarya", "Sakarya", 33, 35, 18, 3, "river", -22),
      f("firat", "Fırat", 70, 48, 22, 3, "river", 55),
      f("dicle", "Dicle", 79, 58, 18, 3, "river", 25),
      f("seyhan", "Seyhan", 55, 64, 12, 3, "river", 75),
      f("ceyhan", "Ceyhan", 60, 63, 12, 3, "river", 70),
      f("asi", "Asi", 62, 72, 10, 3, "river", 78),
      f("gediz", "Gediz", 20, 51, 16, 3, "river", -5),
      f("buyukmenderes", "Büyük Menderes", 23, 61, 18, 3, "river", 8),
      f("kucukmenderes", "Küçük Menderes", 20, 56, 14, 3, "river", 3),
      f("bakircay", "Bakırçay", 17, 46, 12, 3, "river", -4),
      f("meric", "Meriç", 7, 29, 5, 12, "river", 82),
      f("aras", "Aras", 87, 38, 13, 3, "river", -2),
      f("kura", "Kura", 88, 29, 11, 3, "river", 8),
      f("arpacay", "Arpaçay", 88, 29, 8, 3, "river", 75),
      f("coruh", "Çoruh", 84, 24, 12, 3, "river", -18),
      f("goksu", "Göksu", 48, 69, 12, 3, "river", 72),
      f("manavgat", "Manavgat", 36, 71, 9, 3, "river", 80),
      f("aksu", "Aksu", 34, 71, 9, 3, "river", 80),
      f("dalaman", "Dalaman Çayı", 25, 68, 10, 3, "river", 70),
      f("susurluk", "Susurluk (Simav) Çayı", 20, 38, 14, 3, "river", 35),
      f("mutludere-br", "Mutludere (Rezve)", 9, 15, 8, 5, "river"),
      f("hezil-br", "Hezil Çayı", 85, 68, 8, 5, "river"),
      ...BLACK_SEA_EXTRA_RIVER_FEATURES,
      ...MEDITERRANEAN_EXTRA_RIVER_FEATURES,
    ],
  },
  {
    id: "black-sea-rivers",
    group: "Sular",
    title: "Karadeniz'e Dökülen Akarsular",
    eyebrow: "Sular · Alt konu",
    description: "Sularını Karadeniz'e ulaştıran başlıca akarsuları gerçek yataklarında bul.",
    color: "#2c6fa8",
    icon: "↟",
    features: [
      f("sakarya", "Sakarya", 33, 35, 18, 3, "river"),
      f("kizilirmak", "Kızılırmak", 48, 34, 24, 3, "river"),
      f("yesilirmak", "Yeşilırmak", 60, 27, 16, 3, "river"),
      f("coruh", "Çoruh", 84, 24, 12, 3, "river"),
      ...BLACK_SEA_EXTRA_RIVER_FEATURES,
    ],
  },
  {
    id: "aegean-rivers",
    group: "Sular",
    title: "Ege Denizi'ne Dökülen Akarsular",
    eyebrow: "Sular · Alt konu",
    description: "Ege kıyısına ulaşan başlıca akarsuları kuzeyden güneye bul.",
    color: "#367fbd",
    icon: "↙",
    features: [
      f("meric", "Meriç", 7, 29, 5, 12, "river"),
      f("bakircay", "Bakırçay", 17, 46, 12, 3, "river"),
      f("gediz", "Gediz", 20, 51, 16, 3, "river"),
      f("kucukmenderes", "Küçük Menderes", 20, 56, 14, 3, "river"),
      f("buyukmenderes", "Büyük Menderes", 23, 61, 18, 3, "river"),
    ],
  },
  {
    id: "mediterranean-rivers",
    group: "Sular",
    title: "Akdeniz'e Dökülen Akarsular",
    eyebrow: "Sular · Alt konu",
    description: "Akdeniz'e ulaşan başlıca akarsuları batıdan doğuya bul.",
    color: "#2f82c5",
    icon: "↡",
    features: [
      f("dalaman", "Dalaman Çayı", 25, 68, 10, 3, "river"),
      f("aksu", "Aksu", 34, 71, 9, 3, "river"),
      f("manavgat", "Manavgat", 36, 71, 9, 3, "river"),
      f("goksu", "Göksu", 48, 69, 12, 3, "river"),
      f("seyhan", "Seyhan", 55, 64, 12, 3, "river"),
      f("ceyhan", "Ceyhan", 60, 63, 12, 3, "river"),
      f("asi", "Asi", 62, 72, 10, 3, "river"),
      ...MEDITERRANEAN_EXTRA_RIVER_FEATURES,
    ],
  },
  {
    id: "outbound-rivers",
    group: "Sular",
    title: "Türkiye'den Doğup Sınır Dışına Çıkan Akarsular",
    eyebrow: "Sular · Sınır aşan sular",
    description: "Türkiye'den doğup başka ülkelerde denize ulaşan akarsuları bul.",
    color: "#4a6fb4",
    icon: "↗",
    features: [
      f("coruh", "Çoruh · Karadeniz", 84, 24, 12, 3, "river"),
      f("aras", "Aras · Hazar Denizi", 87, 38, 13, 3, "river"),
      f("kura", "Kura · Hazar Denizi", 88, 29, 11, 3, "river"),
      f("firat", "Fırat · Basra Körfezi", 70, 48, 22, 3, "river"),
      f("dicle", "Dicle · Basra Körfezi", 79, 58, 18, 3, "river"),
    ],
  },
  {
    id: "inbound-rivers",
    group: "Sular",
    title: "Yurt Dışından Doğup Türkiye'de Denize Ulaşanlar",
    eyebrow: "Sular · Sınır aşan sular",
    description: "Kaynağı sınır dışında olup Türkiye kıyılarında denize dökülen akarsuları bul.",
    color: "#5b6dc0",
    icon: "↘",
    features: [
      f("meric", "Meriç · Bulgaristan'dan doğar", 7, 29, 5, 12, "river"),
      f("asi", "Asi · Lübnan'dan doğar", 62, 72, 10, 3, "river"),
    ],
  },
  {
    id: "plains",
    group: "Yer şekilleri",
    title: "Ovalar",
    eyebrow: "Yer şekilleri · Ovalar",
    description: "Türkiye’nin önemli ova alanlarını seç.",
    color: "#90a947",
    icon: "▬",
    features: [...ALL_PLAIN_FEATURES],
  },
  {
    id: "plateaus",
    group: "Yer şekilleri",
    title: "Platolar",
    eyebrow: "Yer şekilleri · Platolar",
    description: "Aşınım ve lav platolarını alanlarıyla tanı.",
    color: "#b58654",
    icon: "▱",
    features: [...ALL_PLATEAU_FEATURES],
  },
  {
    id: "straits",
    group: "Ulaşım",
    title: "Türkiye'nin Boğazları",
    eyebrow: "Ulaşım · Boğazlar",
    description: "İstanbul ve Çanakkale boğazlarını gerçek su yüzeyi poligonlarına tıklayarak bul.",
    color: "#7257c7",
    icon: "⌁",
    features: [
      f("istanbul-strait", "İstanbul Boğazı", 16, 23, 3, 7, "river", 80),
      f("canakkale-strait", "Çanakkale Boğazı", 10, 33, 3, 8, "river", 65),
    ],
  },
  {
    id: "gates",
    group: "Ulaşım",
    title: "Sınır Kapıları",
    eyebrow: "Ulaşım · Sınır kapıları",
    description: "Ticaret Bakanlığının resmî kara hudut kapılarını gerçek sınır koordinatlarında seç.",
    color: "#ef9b3d",
    icon: "▣",
    features: [
      f("kapikule", "Kapıkule", 7, 24, 5, 5, "gate"),
      f("ipsala", "İpsala", 7, 31, 5, 5, "gate"),
      f("sarp", "Sarp", 89, 22, 5, 5, "gate"),
      f("gurbu", "Gürbulak", 92, 42, 5, 5, "gate"),
      f("habur", "Habur", 83, 72, 5, 5, "gate"),
      f("cilvegozu", "Cilvegözü", 63, 76, 5, 5, "gate"),
      f("pazarkule", "Pazarkule", 6, 23, 5, 5, "gate"),
      f("hamzabeyli", "Hamzabeyli", 7, 17, 5, 5, "gate"),
      f("derekoy", "Dereköy", 12, 16, 5, 5, "gate"),
      f("turkgozu", "Türkgözü", 86, 18, 5, 5, "gate"),
      f("aktas", "Çıldır-Aktaş", 87, 23, 5, 5, "gate"),
      f("dilucu", "Dilucu", 94, 39, 5, 5, "gate"),
      f("kapikoy", "Kapıköy", 91, 56, 5, 5, "gate"),
      f("esendere", "Esendere", 94, 67, 5, 5, "gate"),
      f("uzumlu", "Üzümlü", 86, 74, 5, 5, "gate"),
      f("oncupinar", "Öncüpınar", 64, 72, 5, 5, "gate"),
      f("karkamis", "Karkamış", 70, 74, 5, 5, "gate"),
      f("cobanbey", "Çobanbey", 67, 73, 5, 5, "gate"),
      f("zeytidali", "Zeytindalı", 65, 75, 5, 5, "gate"),
      f("akcakale-gate", "Akçakale", 73, 75, 5, 5, "gate"),
      f("ceylanpinar-gate", "Ceylanpınar", 78, 75, 5, 5, "gate"),
      f("nusaybin-gate", "Nusaybin", 83, 74, 5, 5, "gate"),
      f("yayladagi-gate", "Yayladağı", 61, 77, 5, 5, "gate"),
    ],
  },
  {
    id: "passes",
    group: "Ulaşım",
    title: "Türkiye'nin Başlıca Geçitleri",
    eyebrow: "Ulaşım · Geçitler",
    description: "MEB sınav kapsamındaki başlıca geçitleri gerçek geçit koordinatında seç.",
    color: "#d98b38",
    icon: "⌃",
    features: [
      f("bolu-pass", "Bolu Dağı Geçidi", 50, 50, 5, 4, "pass"),
      f("zigana-pass", "Zigana Geçidi", 70, 28, 6, 5, "pass"),
      f("gulek-pass", "Gülek Geçidi", 54, 69, 6, 5, "pass"),
      f("sertavul-pass", "Sertavul Geçidi", 48, 71, 6, 5, "pass"),
      f("belen-pass", "Belen Geçidi", 62, 73, 6, 5, "pass"),
      f("kop-pass", "Kop Geçidi", 73, 36, 6, 5, "pass"),
      f("cubuk-pass", "Çubuk Beli Geçidi", 50, 50, 5, 4, "pass"),
      f("ilgaz-pass", "Ilgaz Dağı Geçidi", 50, 29, 5, 4, "pass"),
      f("ovit-pass", "Ovit Geçidi", 76, 28, 5, 4, "pass"),
      f("egribel-pass", "Eğribel Geçidi", 67, 31, 5, 4, "pass"),
      f("cankurtaran-pass", "Cankurtaran Geçidi", 86, 23, 5, 4, "pass"),
    ],
  },
  {
    id: "ramsar",
    group: "Çevre",
    title: "Ramsar Alanları",
    eyebrow: "Çevre · Sulak alanlar",
    description: "Uluslararası öneme sahip sulak alanları keşfet.",
    color: "#278e82",
    icon: "◉",
    features: [
      f("sultan-sazligi", "Sultan Sazlığı", 58, 53, 7, 6, "region"),
      f("kus", "Kuş Gölü", 17, 31, 6, 5, "region"),
      f("kizilirmak-delta", "Kızılırmak Deltası", 54, 18, 8, 5, "region"),
      f("goksu-delta", "Göksu Deltası", 49, 74, 8, 5, "region"),
      f("kuyucuk", "Kuyucuk Gölü", 86, 31, 5, 4, "region"),
      f("nemrut-kaldera", "Nemrut Kalderası", 75, 51, 6, 5, "region"),
      f("burdur-r", "Burdur Gölü", 33, 62, 5, 4, "region"),
      f("seyfe-r", "Seyfe Gölü", 54, 46, 5, 4, "region"),
      f("uluabat-r", "Uluabat Gölü", 19, 35, 5, 4, "region"),
      f("gediz-r", "Gediz Deltası", 14, 54, 5, 4, "region"),
      f("akyatan-r", "Akyatan Lagünü", 57, 72, 5, 4, "region"),
      f("yumurtalik-r", "Yumurtalık Lagünleri", 61, 70, 5, 4, "region"),
      f("meke-r", "Meke Maarı", 49, 62, 5, 4, "region"),
      f("kizoren-r", "Kızören Obruğu", 46, 57, 5, 4, "region"),
    ],
  },
  {
    id: "massifs",
    group: "Jeoloji",
    title: "Masif Alanları",
    eyebrow: "Jeoloji · Eski kütleler",
    description: "Türkiye’nin eski ve dirençli kara kütlelerini bul.",
    color: "#8d6e63",
    icon: "⬢",
    features: [
      f("yildiz-m", "Yıldız Masifi", 12, 22, 10, 7, "region"),
      f("kazdagi-m", "Kazdağı Masifi", 13, 40, 9, 7, "region"),
      f("uludag-m", "Uludağ Masifi", 20, 34, 7, 6, "region"),
      f("menderes-m", "Menderes Masifi", 22, 57, 14, 10, "region"),
      f("sultandag-m", "Sultandağ Masifi", 37, 54, 8, 6, "region"),
      f("alanya-anamur-m", "Alanya-Anamur Masifi", 43, 74, 13, 6, "region"),
      f("ilgaz-m", "Ilgaz Masifi", 49, 29, 9, 6, "region"),
      f("tokat-m", "Tokat Masifi", 59, 35, 10, 7, "region"),
      f("akdagmadeni-m", "Akdağmadeni Masifi", 57, 42, 9, 7, "region"),
      f("kirsehir-m", "Kırşehir Masifi", 53, 46, 13, 10, "region"),
      f("nigde-m", "Niğde Masifi", 55, 57, 8, 7, "region"),
      f("akdag-m", "Akdağ Masifi", 66, 51, 9, 7, "region"),
      f("malatya-m", "Malatya Masifi", 69, 55, 10, 7, "region"),
      f("bitlis-m", "Bitlis Masifi", 77, 62, 16, 8, "region"),
    ],
  },
  {
    id: "mines",
    group: "Ekonomi",
    title: "Madenler",
    eyebrow: "Ekonomi · Madenler · Tümü",
    description: "MEB tablosundaki madenleri gerçek çıkarım sahaları ve maden kuşaklarıyla eşleştir.",
    color: "#c57735",
    icon: "⬟",
    features: [...METALLIC_MINE_FEATURES, ...INDUSTRIAL_MINERAL_FEATURES, ...ENERGY_RAW_MATERIAL_FEATURES],
  },
  {
    id: "metallic-mines",
    group: "Ekonomi",
    title: "Metalik Madenler",
    eyebrow: "Ekonomi · Madenler · Metalik",
    description: "Demir, krom, bakır, boksit, manganez ve kurşun-çinko sahalarını bul.",
    color: "#9a6542",
    icon: "◆",
    features: [...METALLIC_MINE_FEATURES],
  },
  {
    id: "industrial-minerals",
    group: "Ekonomi",
    title: "Endüstriyel Mineraller ve Taşlar",
    eyebrow: "Ekonomi · Madenler · Endüstriyel",
    description: "Bor, fosfat, tuz, mermer, Oltu taşı ve lüle taşı merkezlerini bul.",
    color: "#ba844a",
    icon: "◇",
    features: [...INDUSTRIAL_MINERAL_FEATURES],
  },
  {
    id: "energy-raw-materials",
    group: "Ekonomi",
    title: "Taş Kömürü ve Linyit Havzaları",
    eyebrow: "Ekonomi · Madenler · Enerji hammaddesi",
    description: "MEB'in verdiği taş kömürü havzası ile başlıca linyit çıkarım merkezlerini bul.",
    color: "#5e5b58",
    icon: "⬢",
    features: [...ENERGY_RAW_MATERIAL_FEATURES],
  },
  {
    id: "energy",
    group: "Ekonomi",
    title: "Başlıca Enerji Santralleri",
    eyebrow: "Ekonomi · Enerji · Tümü",
    description: "MEB'de adı geçen başlıca enerji üretim merkezlerini gerçek konumlarında bul.",
    color: "#dcaa24",
    icon: "ϟ",
    features: [...WIND_ENERGY_FEATURES, ...THERMAL_ENERGY_FEATURES, ...OTHER_ENERGY_FEATURES],
  },
  {
    id: "wind-energy",
    group: "Ekonomi",
    title: "Rüzgâr Enerjisi Merkezleri",
    eyebrow: "Ekonomi · Enerji · Rüzgâr",
    description: "MEB'in öne çıkardığı rüzgâr enerjisi illerini ve Dinar örneğini bul.",
    color: "#4ca5aa",
    icon: "≋",
    features: [...WIND_ENERGY_FEATURES],
  },
  {
    id: "thermal-energy",
    group: "Ekonomi",
    title: "Termik Santraller",
    eyebrow: "Ekonomi · Enerji · Termik",
    description: "Taş kömürü, linyit ve doğal gazla çalışan başlıca termik santralleri bul.",
    color: "#a85b3e",
    icon: "♨",
    features: [...THERMAL_ENERGY_FEATURES],
  },
  {
    id: "other-energy",
    group: "Ekonomi",
    title: "Hidroelektrik, Güneş, Jeotermal ve Nükleer",
    eyebrow: "Ekonomi · Enerji · Diğer kaynaklar",
    description: "Yenilenebilir ve nükleer enerji örneklerini gerçek tesis noktalarında bul.",
    color: "#d2a12d",
    icon: "☀",
    features: [...OTHER_ENERGY_FEATURES],
  },
  {
    id: "natural-gas-pipelines",
    group: "Ekonomi",
    title: "Doğal Gaz Boru Hatları",
    eyebrow: "Ekonomi · Enerji ulaşımı · Doğal gaz",
    description: "ETKB ve BOTAŞ güzergâhlarına göre Türkiye'nin başlıca uluslararası doğal gaz boru hatlarını bul.",
    color: "#168b83",
    icon: "⌁",
    features: [...NATURAL_GAS_PIPELINE_FEATURES],
  },
  {
    id: "oil-pipelines",
    group: "Ekonomi",
    title: "Ham Petrol Boru Hatları",
    eyebrow: "Ekonomi · Enerji ulaşımı · Petrol",
    description: "ETKB ve BOTAŞ güzergâhlarına göre Türkiye'deki iki ana uluslararası ham petrol boru hattını bul.",
    color: "#7b624c",
    icon: "⌇",
    features: [...OIL_PIPELINE_FEATURES],
  },
  {
    id: "development",
    group: "Ekonomi",
    title: "Kalkınma Projeleri",
    eyebrow: "Ekonomi · Bölgesel projeler",
    description: "Bölgesel kalkınma projelerinin kapsadığı alanı seç.",
    color: "#e06d2f",
    icon: "↗",
    features: [
      fp("gap", "GAP · 9 il", 76, 65, 20, 14, [2, 21, 27, 47, 56, 63, 72, 73, 79]),
      fp("dap", "DAP · 15 il", 79, 40, 22, 15, [4, 12, 13, 23, 24, 25, 30, 36, 44, 49, 58, 62, 65, 75, 76]),
      fp("dokap", "DOKAP · 11 il", 69, 22, 25, 10, [5, 8, 19, 28, 29, 52, 53, 55, 60, 61, 69]),
      fp("kop", "KOP · 8 il", 49, 57, 20, 16, [40, 42, 50, 51, 66, 68, 70, 71]),
    ],
  },
  {
    id: "industry",
    group: "Ekonomi",
    title: "Türkiye Sanayi Merkezleri",
    eyebrow: "Ekonomi · Sanayi · Tümü",
    description: "MEB'de adı geçen şehir, ilçe ve tesis merkezlerini kendi gerçek konumlarında bul.",
    color: "#c93b45",
    icon: "▥",
    features: [...INDUSTRY_CENTRES],
  },
  {
    id: "food-industry",
    group: "Ekonomi",
    title: "Gıda Sanayisi Merkezleri",
    eyebrow: "Ekonomi · Sanayi · Gıda",
    description: "Et, su ürünleri, yağ ve çay sanayisinin MEB'de verilen başlıca merkezlerini bul.",
    color: "#c96c35",
    icon: "◉",
    features: [...INDUSTRY_FOOD_FEATURES],
  },
  {
    id: "textile-industry",
    group: "Ekonomi",
    title: "Dokuma, Giyim ve Deri Sanayisi",
    eyebrow: "Ekonomi · Sanayi · Tekstil",
    description: "Pamuklu-yünlü dokuma, halı, hazır giyim ve deri merkezlerini bul.",
    color: "#9c4f87",
    icon: "⌗",
    features: [...INDUSTRY_TEXTILE_FEATURES],
  },
  {
    id: "chemical-industry",
    group: "Ekonomi",
    title: "Kimya, Orman ve Toprağa Dayalı Sanayi",
    eyebrow: "Ekonomi · Sanayi · Kimya ve malzeme",
    description: "Rafineri, gübre, kâğıt, cam, seramik ve diğer malzeme sanayisi merkezlerini bul.",
    color: "#4d7e9d",
    icon: "⬡",
    features: [...INDUSTRY_CHEMICAL_FEATURES],
  },
  {
    id: "machine-industry",
    group: "Ekonomi",
    title: "Makine, Maden İşleme ve Savunma Sanayisi",
    eyebrow: "Ekonomi · Sanayi · Makine ve maden",
    description: "Otomotiv, tersane, maden işleme, lokomotif ve savunma sanayisi merkezlerini bul.",
    color: "#6b6578",
    icon: "⚙",
    features: [...INDUSTRY_MACHINE_FEATURES],
  },
  {
    id: "population",
    group: "Beşerî",
    title: "Nüfusun Sık ve Seyrek Olduğu Yerler",
    eyebrow: "Beşerî coğrafya · Nüfus · Tümü",
    description: "MEB haritasındaki sık ve seyrek nüfuslu yöreleri birlikte bul.",
    color: "#8eaa46",
    icon: "●",
    features: [...DENSE_POPULATION_FEATURES, ...SPARSE_POPULATION_FEATURES],
  },
  {
    id: "dense-population",
    group: "Beşerî",
    title: "Sık Nüfuslu Yöreler",
    eyebrow: "Beşerî coğrafya · Nüfus · Sık",
    description: "Ulaşım, sanayi, ticaret, tarım ve turizmle nüfuslanan başlıca yöreleri bul.",
    color: "#54a76b",
    icon: "●",
    features: [...DENSE_POPULATION_FEATURES],
  },
  {
    id: "sparse-population",
    group: "Beşerî",
    title: "Seyrek Nüfuslu Yöreler",
    eyebrow: "Beşerî coğrafya · Nüfus · Seyrek",
    description: "Dağlık, karstik, kurak veya ekonomik etkinliği sınırlı başlıca yöreleri bul.",
    color: "#b98b45",
    icon: "○",
    features: [...SPARSE_POPULATION_FEATURES],
  },
  {
    id: "climate",
    group: "Doğal",
    title: "İklim Bölgeleri",
    eyebrow: "Doğal coğrafya · İklim",
    description: "İklim tiplerinin etkili olduğu örnek alanları bul.",
    color: "#ef8b2d",
    icon: "☼",
    features: [
      f("karadeniz-cl", "Karadeniz İklimi", 59, 20, 58, 10, "region"),
      f("akdeniz-cl", "Akdeniz İklimi", 45, 70, 55, 11, "region"),
      f("karasal-cl", "Karasal İklim", 58, 45, 50, 25, "region"),
      f("sert-karasal-cl", "Sert Karasal İklim", 84, 32, 22, 15, "region"),
    ],
  },
  {
    id: "vegetation",
    group: "Doğal",
    title: "Bitki Örtüsü",
    eyebrow: "Doğal coğrafya · Bitkiler · Tümü",
    description: "MEB kapsamındaki orman, çalı ve ot topluluklarının Türkiye'deki yayılışını bul.",
    color: "#4d9660",
    icon: "♣",
    features: [...FOREST_VEGETATION_FEATURES, ...SHRUB_VEGETATION_FEATURES, ...GRASS_VEGETATION_FEATURES],
  },
  {
    id: "forest-vegetation",
    group: "Doğal",
    title: "Türkiye'nin Orman Bölgeleri",
    eyebrow: "Doğal coğrafya · Bitkiler · Ağaç",
    description: "Kuzey Anadolu, Akdeniz, Batı Anadolu ve İç Bölge ormanlarını bul.",
    color: "#31714a",
    icon: "♠",
    features: [...FOREST_VEGETATION_FEATURES],
  },
  {
    id: "shrub-vegetation",
    group: "Doğal",
    title: "Çalı Toplulukları",
    eyebrow: "Doğal coğrafya · Bitkiler · Çalı",
    description: "Maki, garig ve psödomakinin MEB'de verilen yayılış kuşaklarını bul.",
    color: "#5d8c4c",
    icon: "♣",
    features: [...SHRUB_VEGETATION_FEATURES],
  },
  {
    id: "grass-vegetation",
    group: "Doğal",
    title: "Ot Toplulukları",
    eyebrow: "Doğal coğrafya · Bitkiler · Ot",
    description: "Bozkır, antropojen bozkır, çayır ve alpin çayır alanlarını bul.",
    color: "#7b9b48",
    icon: "⌇",
    features: [...GRASS_VEGETATION_FEATURES],
  },
  {
    id: "soils",
    group: "Doğal",
    title: "Türkiye Toprakları",
    eyebrow: "Doğal coğrafya · Topraklar · Tümü",
    description: "MEB kapsamındaki zonal, intrazonal ve azonal toprakları gerçek örnek alanlarıyla bul.",
    color: "#986846",
    icon: "≋",
    features: [...ZONAL_SOIL_FEATURES, ...INTRAZONAL_SOIL_FEATURES, ...AZONAL_SOIL_FEATURES],
  },
  {
    id: "zonal-soils",
    group: "Doğal",
    title: "Zonal Topraklar",
    eyebrow: "Doğal coğrafya · Topraklar · Zonal",
    description: "İklim ve bitki örtüsünün izini taşıyan yerli toprakların Türkiye'deki yayılışını bul.",
    color: "#986846",
    icon: "◫",
    features: [...ZONAL_SOIL_FEATURES],
  },
  {
    id: "intrazonal-soils",
    group: "Doğal",
    title: "İntrazonal Topraklar",
    eyebrow: "Doğal coğrafya · Topraklar · İntrazonal",
    description: "Ana materyal ve taban suyu etkisinin baskın olduğu toprakların MEB örneklerini bul.",
    color: "#86654f",
    icon: "◩",
    features: [...INTRAZONAL_SOIL_FEATURES],
  },
  {
    id: "azonal-soils",
    group: "Doğal",
    title: "Azonal Topraklar",
    eyebrow: "Doğal coğrafya · Topraklar · Azonal",
    description: "Akarsu, rüzgâr, buzul ve yamaç süreçleriyle taşınıp biriken veya genç kalan toprakları bul.",
    color: "#a5784d",
    icon: "◧",
    features: [...AZONAL_SOIL_FEATURES],
  },
  {
    id: "agriculture",
    group: "Ekonomi",
    title: "Başlıca Tarım Ürünleri",
    eyebrow: "Ekonomi · Tarım · Tümü",
    description: "MEB kapsamındaki tarım ürünlerini başlıca gerçek üretim odaklarıyla eşleştir.",
    color: "#79a43e",
    icon: "✳",
    features: [...GRAIN_LEGUME_FEATURES, ...INDUSTRIAL_OIL_CROP_FEATURES, ...FRUIT_SPECIAL_CROP_FEATURES],
  },
  {
    id: "grain-legume-crops",
    group: "Ekonomi",
    title: "Tahıllar ve Baklagiller",
    eyebrow: "Ekonomi · Tarım · Tahıl ve baklagil",
    description: "Buğdaydan mercimeğe başlıca tahıl ve baklagil üretim odaklarını bul.",
    color: "#c89d43",
    icon: "≋",
    features: [...GRAIN_LEGUME_FEATURES],
  },
  {
    id: "industrial-oil-crops",
    group: "Ekonomi",
    title: "Sanayi ve Yağ Bitkileri",
    eyebrow: "Ekonomi · Tarım · Sanayi ve yağ",
    description: "Tütün, pamuk, ayçiçeği ve diğer sanayi bitkilerinin üretim odaklarını bul.",
    color: "#9f7342",
    icon: "✺",
    features: [...INDUSTRIAL_OIL_CROP_FEATURES],
  },
  {
    id: "fruit-special-crops",
    group: "Ekonomi",
    title: "Meyveler ve Özel Ürünler",
    eyebrow: "Ekonomi · Tarım · Meyve ve özel ürün",
    description: "Zeytin, çay, fındık, turunçgil ve diğer özel ürünlerin başlıca alanlarını bul.",
    color: "#4d9a58",
    icon: "✿",
    features: [...FRUIT_SPECIAL_CROP_FEATURES],
  },
  {
    id: "livestock",
    group: "Ekonomi",
    title: "Başlıca Hayvancılık Alanları",
    eyebrow: "Ekonomi · Hayvancılık · Tümü",
    description: "MEB kapsamındaki hayvancılık türlerini gerçek yayılış alanlarıyla eşleştir.",
    color: "#aa7748",
    icon: "♜",
    features: [
      ...SMALL_RUMINANT_LIVESTOCK_FEATURES,
      ...CATTLE_POULTRY_LIVESTOCK_FEATURES,
      ...OTHER_LIVESTOCK_FEATURES,
    ],
  },
  {
    id: "small-ruminant-livestock",
    group: "Ekonomi",
    title: "Küçükbaş Hayvancılık",
    eyebrow: "Ekonomi · Hayvancılık · Küçükbaş",
    description: "Koyun, kıl keçisi ve tiftik keçisinin yayılış alanlarını bul.",
    color: "#b68755",
    icon: "♞",
    features: [...SMALL_RUMINANT_LIVESTOCK_FEATURES],
  },
  {
    id: "cattle-poultry-livestock",
    group: "Ekonomi",
    title: "Sığır ve Kümes Hayvancılığı",
    eyebrow: "Ekonomi · Hayvancılık · Büyükbaş ve kümes",
    description: "Mera ve ahır sığırcılığı ile başlıca kümes hayvancılığı alanlarını ayırt et.",
    color: "#8b6e50",
    icon: "♝",
    features: [...CATTLE_POULTRY_LIVESTOCK_FEATURES],
  },
  {
    id: "other-livestock",
    group: "Ekonomi",
    title: "Diğer Hayvancılık ve Su Ürünleri",
    eyebrow: "Ekonomi · Hayvancılık · Diğer",
    description: "İpek böcekçiliği, arıcılık ve su ürünleri alanlarını bul.",
    color: "#3d8791",
    icon: "≋",
    features: [...OTHER_LIVESTOCK_FEATURES],
  },
  {
    id: "ports",
    group: "Ulaşım",
    title: "Türkiye'nin Başlıca Limanları",
    eyebrow: "Ulaşım · Deniz yolu",
    description: "MEB'in güncel lojistik coğrafyası listesindeki 21 limanı, gerçek liman tesisi noktasında bul.",
    color: "#357ca6",
    icon: "⚓",
    features: [
      f("haydarpasa-port", "Haydarpaşa Limanı", 50, 50, 5, 4, "port"),
      f("istanbul-port", "İstanbul Limanı", 50, 50, 5, 4, "port"),
      f("derince-port", "İzmit Derince Limanı", 50, 50, 5, 4, "port"),
      f("bandirma-port", "Bandırma Limanı", 50, 50, 5, 4, "port"),
      f("ambarli-port", "Ambarlı Limanı", 50, 50, 5, 4, "port"),
      f("gemlik-port", "Gemlik Limanı", 50, 50, 5, 4, "port"),
      f("karasu-port", "Karasu Limanı", 50, 50, 5, 4, "port"),
      f("eregli-port", "Karadeniz Ereğli Limanı", 50, 50, 5, 4, "port"),
      f("zonguldak-port", "Zonguldak Limanı", 50, 50, 5, 4, "port"),
      f("sinop-port", "Sinop Limanı", 50, 50, 5, 4, "port"),
      f("samsun-port", "Samsun Limanı", 50, 50, 5, 4, "port"),
      f("trabzon-port", "Trabzon Limanı", 50, 50, 5, 4, "port"),
      f("izmir-port", "İzmir Limanı", 50, 50, 5, 4, "port"),
      f("kusadasi-port", "Kuşadası Limanı", 50, 50, 5, 4, "port"),
      f("bodrum-port", "Bodrum Limanı", 50, 50, 5, 4, "port"),
      f("marmaris-port", "Marmaris Limanı", 50, 50, 5, 4, "port"),
      f("fethiye-port", "Fethiye Limanı", 50, 50, 5, 4, "port"),
      f("antalya-port", "Antalya Limanı", 50, 50, 5, 4, "port"),
      f("alanya-port", "Alanya Limanı", 50, 50, 5, 4, "port"),
      f("mersin-port", "Mersin Limanı", 50, 50, 5, 4, "port"),
      f("iskenderun-port", "İskenderun Limanı", 50, 50, 5, 4, "port"),
    ],
  },
  {
    id: "marmara-ports",
    group: "Ulaşım",
    title: "Marmara Limanları",
    eyebrow: "Ulaşım · Deniz yolu · Alt konu",
    description: "MEB haritasındaki başlıca Marmara limanlarını bul.",
    color: "#4e83a5",
    icon: "⚓",
    features: [
      f("haydarpasa-port", "Haydarpaşa Limanı", 50, 50, 5, 4, "port"),
      f("istanbul-port", "İstanbul Limanı", 50, 50, 5, 4, "port"),
      f("derince-port", "İzmit Derince Limanı", 50, 50, 5, 4, "port"),
      f("bandirma-port", "Bandırma Limanı", 50, 50, 5, 4, "port"),
      f("ambarli-port", "Ambarlı Limanı", 50, 50, 5, 4, "port"),
      f("gemlik-port", "Gemlik Limanı", 50, 50, 5, 4, "port"),
    ],
  },
  {
    id: "black-sea-ports",
    group: "Ulaşım",
    title: "Karadeniz Limanları",
    eyebrow: "Ulaşım · Deniz yolu · Alt konu",
    description: "MEB haritasındaki başlıca Karadeniz limanlarını bul.",
    color: "#287b8d",
    icon: "⚓",
    features: [
      f("karasu-port", "Karasu Limanı", 50, 50, 5, 4, "port"),
      f("eregli-port", "Karadeniz Ereğli Limanı", 50, 50, 5, 4, "port"),
      f("zonguldak-port", "Zonguldak Limanı", 50, 50, 5, 4, "port"),
      f("sinop-port", "Sinop Limanı", 50, 50, 5, 4, "port"),
      f("samsun-port", "Samsun Limanı", 50, 50, 5, 4, "port"),
      f("trabzon-port", "Trabzon Limanı", 50, 50, 5, 4, "port"),
    ],
  },
  {
    id: "aegean-ports",
    group: "Ulaşım",
    title: "Ege Limanları",
    eyebrow: "Ulaşım · Deniz yolu · Alt konu",
    description: "MEB haritasındaki başlıca Ege limanlarını bul.",
    color: "#397ba7",
    icon: "⚓",
    features: [
      f("izmir-port", "İzmir Limanı", 50, 50, 5, 4, "port"),
      f("kusadasi-port", "Kuşadası Limanı", 50, 50, 5, 4, "port"),
      f("bodrum-port", "Bodrum Limanı", 50, 50, 5, 4, "port"),
      f("marmaris-port", "Marmaris Limanı", 50, 50, 5, 4, "port"),
      f("fethiye-port", "Fethiye Limanı", 50, 50, 5, 4, "port"),
    ],
  },
  {
    id: "mediterranean-ports",
    group: "Ulaşım",
    title: "Akdeniz Limanları",
    eyebrow: "Ulaşım · Deniz yolu · Alt konu",
    description: "MEB haritasındaki başlıca Akdeniz limanlarını bul.",
    color: "#377c9a",
    icon: "⚓",
    features: [
      f("antalya-port", "Antalya Limanı", 50, 50, 5, 4, "port"),
      f("alanya-port", "Alanya Limanı", 50, 50, 5, 4, "port"),
      f("mersin-port", "Mersin Limanı", 50, 50, 5, 4, "port"),
      f("iskenderun-port", "İskenderun Limanı", 50, 50, 5, 4, "port"),
    ],
  },
  {
    id: "dams",
    group: "Sular",
    title: "Barajlar",
    eyebrow: "Sular · Barajlar",
    description: "MEB listesindeki başlıca barajları, gerçek baraj gövdesi koordinatında bul.",
    color: "#3b8aa1",
    icon: "▰",
    features: [
      f("keban-dam", "Keban Barajı · Fırat", 50, 50, 5, 4, "dam"),
      f("karakaya-dam", "Karakaya Barajı · Fırat", 50, 50, 5, 4, "dam"),
      f("ataturk-dam", "Atatürk Barajı · Fırat", 50, 50, 5, 4, "dam"),
      f("birecik-dam", "Birecik Barajı · Fırat", 50, 50, 5, 4, "dam"),
      f("karkamis-dam", "Karkamış Barajı · Fırat", 50, 50, 5, 4, "dam"),
      f("kralkizi-dam", "Kralkızı Barajı · Dicle", 50, 50, 5, 4, "dam"),
      f("ilisu-dam", "Ilısu Barajı · Dicle", 50, 50, 5, 4, "dam"),
      f("batman-dam", "Batman Barajı · Batman Çayı", 50, 50, 5, 4, "dam"),
      f("dicle-dam", "Dicle Barajı · Dicle", 50, 50, 5, 4, "dam"),
      f("devegecidi-dam", "Devegeçidi Barajı · Devegeçidi Çayı", 50, 50, 5, 4, "dam"),
      f("arpacay-dam", "Arpaçay Barajı · Arpaçay", 50, 50, 5, 4, "dam"),
      f("seyhan-dam", "Seyhan Barajı · Seyhan", 50, 50, 5, 4, "dam"),
      f("catalan-dam", "Çatalan Barajı · Seyhan", 50, 50, 5, 4, "dam"),
      f("sir-dam", "Sır Barajı · Ceyhan", 50, 50, 5, 4, "dam"),
      f("aslantas-dam", "Aslantaş Barajı · Ceyhan", 50, 50, 5, 4, "dam"),
      f("menzelet-dam", "Menzelet Barajı · Ceyhan", 50, 50, 5, 4, "dam"),
      f("kartalkaya-dam", "Kartalkaya Barajı · Aksu Çayı", 50, 50, 5, 4, "dam"),
      f("oymapinar-dam", "Oymapınar Barajı · Manavgat", 50, 50, 5, 4, "dam"),
      f("demirkopru-dam", "Demirköprü Barajı · Gediz", 50, 50, 5, 4, "dam"),
      f("kemer-dam", "Kemer Barajı · Akçay", 50, 50, 5, 4, "dam"),
      f("adiguzel-dam", "Adıgüzel Barajı · Büyük Menderes", 50, 50, 5, 4, "dam"),
      f("porsuk-dam", "Porsuk Barajı · Porsuk Çayı", 50, 50, 5, 4, "dam"),
      f("bayindir-dam", "Bayındır Barajı · Bayındır Çayı", 50, 50, 5, 4, "dam"),
      f("sariyar-dam", "Sarıyar (Hasan Polatkan) Barajı · Sakarya", 50, 50, 5, 4, "dam"),
      f("gokcekaya-dam", "Gökçekaya Barajı · Sakarya", 50, 50, 5, 4, "dam"),
      f("kurtbogazi-dam", "Kurtboğazı Barajı · Kurtboğazı Çayı", 50, 50, 5, 4, "dam"),
      f("hirfanli-dam", "Hirfanlı Barajı · Kızılırmak", 50, 50, 5, 4, "dam"),
      f("derbent-dam", "Derbent Barajı · Kızılırmak", 50, 50, 5, 4, "dam"),
      f("kesikkopru-dam", "Kesikköprü Barajı · Kızılırmak", 50, 50, 5, 4, "dam"),
      f("altinkaya-dam", "Altınkaya Barajı · Kızılırmak", 50, 50, 5, 4, "dam"),
      f("kapulukaya-dam", "Kapulukaya Barajı · Kızılırmak", 50, 50, 5, 4, "dam"),
      f("cubuk1-dam", "Çubuk 1 Barajı · Çubuk Çayı", 50, 50, 5, 4, "dam"),
      f("cubuk2-dam", "Çubuk 2 Barajı · Çubuk Çayı", 50, 50, 5, 4, "dam"),
      f("almus-dam", "Almus Barajı · Yeşilırmak", 50, 50, 5, 4, "dam"),
      f("hasanugurlu-dam", "Hasan Uğurlu Barajı · Yeşilırmak", 50, 50, 5, 4, "dam"),
      f("suatugurlu-dam", "Suat Uğurlu Barajı · Yeşilırmak", 50, 50, 5, 4, "dam"),
      f("kilickaya-dam", "Kılıçkaya Barajı · Kelkit Çayı", 50, 50, 5, 4, "dam"),
      f("muratli-dam", "Muratlı Barajı · Çoruh", 50, 50, 5, 4, "dam"),
      f("borcka-dam", "Borçka Barajı · Çoruh", 50, 50, 5, 4, "dam"),
      f("deriner-dam", "Deriner Barajı · Çoruh", 50, 50, 5, 4, "dam"),
    ],
  },
  {
    id: "regions",
    group: "Türkiye",
    title: "Coğrafi Bölgeler",
    eyebrow: "Türkiye · 7 bölge",
    description: "Türkiye'nin yedi coğrafi bölgesini, illerin çoğunlukla yer aldığı bölge sınıflamasıyla gerçek il sınırları üzerinde tanı.",
    color: "#6851a8",
    icon: "⬡",
    features: [
      regionFeature("marmara", "Marmara Bölgesi", [10, 11, 16, 17, 22, 34, 39, 41, 54, 59, 77]),
      regionFeature("aegean", "Ege Bölgesi", [3, 9, 20, 35, 43, 45, 48, 64]),
      regionFeature("med", "Akdeniz Bölgesi", [1, 7, 15, 31, 32, 33, 46, 80]),
      regionFeature("black", "Karadeniz Bölgesi", [5, 8, 14, 19, 28, 29, 37, 52, 53, 55, 57, 60, 61, 67, 69, 74, 78, 81]),
      regionFeature("central", "İç Anadolu Bölgesi", [6, 18, 26, 38, 40, 42, 50, 51, 58, 66, 68, 70, 71]),
      regionFeature("east", "Doğu Anadolu Bölgesi", [4, 12, 13, 23, 24, 25, 30, 36, 44, 49, 62, 65, 75, 76]),
      regionFeature("southeast", "Güneydoğu Anadolu Bölgesi", [2, 21, 27, 47, 56, 63, 72, 73, 79]),
    ],
  },
  {
    id: "tourism",
    group: "Ekonomi",
    title: "Turizm Merkezleri",
    eyebrow: "Ekonomi · Turizm · Tümü",
    description: "MEB kapsamındaki doğal, kültürel ve tarihî turizm varlıklarının tamamını bul.",
    color: "#b14784",
    icon: "✦",
    features: [
      ...NATURAL_TOURISM_FEATURES,
      ...CULTURAL_TOURISM_FEATURES,
    ],
  },
  {
    id: "natural-tourism",
    group: "Ekonomi",
    title: "Doğal Turizm Varlıkları",
    eyebrow: "Ekonomi · Turizm · Doğal",
    description: "Dağ, yayla, sulak alan, mağara, traverten ve jeoturizm merkezlerini bul.",
    color: "#328d72",
    icon: "♧",
    features: [...NATURAL_TOURISM_FEATURES],
  },
  {
    id: "cultural-tourism",
    group: "Ekonomi",
    title: "Kültürel ve Tarihî Turizm",
    eyebrow: "Ekonomi · Turizm · Kültürel",
    description: "Mimari eserleri, ören yerlerini ve tarihî millî parkları gerçek konumlarında bul.",
    color: "#9a5a9d",
    icon: "✦",
    features: [...CULTURAL_TOURISM_FEATURES],
  },
  {
    id: "cities",
    group: "Türkiye",
    title: "Fonksiyonlarına Göre Şehirler",
    eyebrow: "Türkiye · Şehir fonksiyonları · Tümü",
    description: "MEB'in verdiği tarım, sanayi, maden, liman, ulaşım, ticaret, idari, kültür, askerî ve turizm şehirlerini bul.",
    color: "#6847bd",
    icon: "⌂",
    features: [...FUNCTION_CITY_GENERAL_FEATURES],
  },
  {
    id: "agricultural-function-cities",
    group: "Türkiye",
    title: "Tarım Şehirleri",
    eyebrow: "Türkiye · Şehir fonksiyonları · Tarım",
    description: "Tarım ürünlerinin üretimi, işlenmesi ve pazarlanmasıyla öne çıkan MEB örneklerini bul.",
    color: "#4f8c55",
    icon: "⌁",
    features: [...AGRICULTURAL_FUNCTION_CITIES],
  },
  {
    id: "industrial-function-cities",
    group: "Türkiye",
    title: "Sanayi Şehirleri",
    eyebrow: "Türkiye · Şehir fonksiyonları · Sanayi",
    description: "Sanayi faaliyetleriyle öne çıkan MEB şehir örneklerini bul.",
    color: "#6d6578",
    icon: "⚙",
    features: [...INDUSTRIAL_FUNCTION_CITIES],
  },
  {
    id: "mining-function-cities",
    group: "Türkiye",
    title: "Maden Şehirleri",
    eyebrow: "Türkiye · Şehir fonksiyonları · Maden",
    description: "Maden çıkarımı ve işlenmesiyle gelişen MEB şehir örneklerini bul.",
    color: "#8c6546",
    icon: "◆",
    features: [...MINING_FUNCTION_CITIES],
  },
  {
    id: "port-function-cities",
    group: "Türkiye",
    title: "Liman Şehirleri",
    eyebrow: "Türkiye · Şehir fonksiyonları · Liman",
    description: "Liman işleviyle öne çıkan MEB şehir örneklerini kıyıdaki gerçek merkezlerinde bul.",
    color: "#327e96",
    icon: "≋",
    features: [...PORT_FUNCTION_CITIES],
  },
  {
    id: "transport-trade-function-cities",
    group: "Türkiye",
    title: "Ulaşım ve Ticaret Şehirleri",
    eyebrow: "Türkiye · Şehir fonksiyonları · Ulaşım ve ticaret",
    description: "Ulaşım kavşağı veya ticaret merkezi olan MEB şehir örneklerini bul.",
    color: "#a36a37",
    icon: "↗",
    features: [...TRANSPORT_TRADE_FUNCTION_CITIES],
  },
  {
    id: "culture-admin-military-function-cities",
    group: "Türkiye",
    title: "Kültür, İdari ve Askerî Şehirler",
    eyebrow: "Türkiye · Şehir fonksiyonları · Yönetim ve kültür",
    description: "Kültür, idari ve askerî fonksiyonlarla öne çıkan MEB şehir örneklerini bul.",
    color: "#7650a3",
    icon: "◎",
    features: [...CULTURE_ADMIN_MILITARY_FUNCTION_CITIES],
  },
  {
    id: "tourism-function-cities",
    group: "Türkiye",
    title: "Turizm Şehirleri",
    eyebrow: "Türkiye · Şehir fonksiyonları · Turizm",
    description: "Turizm işleviyle öne çıkan MEB şehir örneklerini bul.",
    color: "#b14784",
    icon: "✦",
    features: [...TOURISM_FUNCTION_CITIES],
  },
  {
    id: "north-fold-mountains",
    group: "Dağlar",
    title: "Kuzey Anadolu Kıvrım Dağları",
    eyebrow: "Dağlar · Kuzey kuşağı",
    description: "Karadeniz kıyı kuşağındaki kıvrım dağlarını batıdan doğuya bul.",
    color: "#6d4a78",
    icon: "≋",
    features: [
      f("kure-n", "Küre Dağları", 39, 17, 9, 5, "mountain"),
      f("bolu-n", "Bolu Dağları", 29, 23, 8, 5, "mountain"),
      f("ilgaz-n", "Ilgaz Dağları", 42, 25, 8, 5, "mountain"),
      f("koroglu-n", "Köroğlu Dağları", 35, 29, 8, 5, "mountain"),
      f("canik-n", "Canik Dağları", 58, 19, 9, 5, "mountain"),
      f("giresun-n", "Giresun Dağları", 66, 22, 8, 5, "mountain"),
      f("kackar-n", "Kaçkar Dağları", 78, 18, 9, 5, "mountain"),
    ],
  },
  {
    id: "south-fold-mountains",
    group: "Dağlar",
    title: "Güney Anadolu Kıvrım Dağları",
    eyebrow: "Dağlar · Toros kuşağı",
    description: "Toros sisteminin batı, orta ve güneydoğu uzantılarını bul.",
    color: "#744768",
    icon: "≋",
    features: [
      f("bey-s", "Bey Dağları", 32, 71, 8, 5, "mountain"),
      f("sultan-s", "Sultan Dağları", 38, 62, 8, 5, "mountain"),
      f("bolkar-s", "Bolkar Dağları", 49, 71, 8, 5, "mountain"),
      f("aladag-s", "Aladağlar", 58, 66, 7, 5, "mountain"),
      f("nur-s", "Nur Dağları", 62, 70, 6, 7, "mountain"),
      f("malatya-s", "Malatya Dağları", 67, 54, 8, 5, "mountain"),
      f("hakkari-s", "Hakkâri Dağları", 84, 69, 8, 6, "mountain"),
    ],
  },
  {
    id: "glacial-mountains",
    group: "Dağlar",
    title: "Buzul Şekilleri Görülen Dağlar",
    eyebrow: "Dağlar · Buzullaşma",
    description: "Güncel veya Kuvaterner buzullaşma izleri taşıyan yüksek dağları bul.",
    color: "#4f78a8",
    icon: "❄",
    features: [
      f("agri-gl", "Ağrı Dağı", 88, 40, 5, 8, "volcano"),
      f("cilo-gl", "Cilo-Sat Dağları", 86, 68, 9, 5, "mountain"),
      f("kackar-gl", "Kaçkar Dağları", 78, 18, 9, 5, "mountain"),
      f("suphan-gl", "Süphan Dağı", 78, 50, 5, 8, "volcano"),
      f("erciyes-gl", "Erciyes Dağı", 57, 52, 5, 8, "volcano"),
      f("aladag-gl", "Aladağlar", 58, 66, 7, 5, "mountain"),
      f("bolkar-gl", "Bolkar Dağları", 49, 71, 8, 5, "mountain"),
      f("munzur-gl", "Munzur Dağları", 69, 46, 8, 5, "mountain"),
      f("uludag-gl", "Uludağ", 23, 35, 7, 5, "mountain"),
    ],
  },
  {
    id: "karstic-lakes",
    group: "Göller",
    title: "Karstik Göller",
    eyebrow: "Göller · Alt konu",
    description: "Kalkerli arazilerde çözünme çanaklarında oluşan gölleri bul. Kestel, günümüzde su yüzeyi olmayan kurumuş polye tabanı olarak gösterilir.",
    color: "#2d9bbd",
    icon: "◌",
    features: [
      f("salda", "Salda Gölü", 31, 63, 4, 4, "lake"),
      f("avlan", "Avlan Gölü", 32, 72, 4, 4, "lake"),
      f("kestel-l", "Kestel Gölü", 31, 66, 4, 4, "lake"),
      f("kiziloren-l", "Kızören Obruğu", 48, 59, 4, 4, "lake"),
      f("meyil-lake", "Meyil Obruğu", 49, 59, 4, 4, "lake"),
      f("cirali-lake", "Çıralı Obruğu", 50, 60, 4, 4, "lake"),
      f("hafik-lake", "Hafik Gölü", 65, 39, 4, 4, "lake"),
      f("todurge-lake", "Tödürge Gölü", 66, 39, 4, 4, "lake"),
    ],
  },
  {
    id: "volcanic-lakes",
    group: "Göller",
    title: "Volkanik Göller",
    eyebrow: "Göller · Krater, kaldera ve maar",
    description: "Volkanik çanakları dolduran krater, kaldera ve maar göllerini bul.",
    color: "#367fa7",
    icon: "◉",
    features: [
      f("nemrut-vl", "Nemrut Kaldera Gölü", 75, 51, 5, 4, "lake"),
      f("meke-vl", "Meke Maarı", 49, 62, 4, 4, "lake"),
      f("golcuk-vl", "Gölcük Krater Gölü", 34, 62, 4, 4, "lake"),
      f("acigol-karapinar", "Acıgöl (Karapınar)", 49, 62, 4, 4, "lake"),
      f("nar-lake", "Nar Gölü", 52, 57, 4, 4, "lake"),
      f("aygir", "Aygır (Süphan) Gölü", 79, 48, 4, 4, "lake"),
    ],
  },
  {
    id: "delta-plains",
    group: "Yer şekilleri",
    title: "Delta Ovaları",
    eyebrow: "Yer şekilleri · Alt konu",
    description: "Akarsuların denize taşıdığı alüvyonlarla oluşan delta ovalarını bul.",
    color: "#6d9e4b",
    icon: "▽",
    features: [...DELTA_PLAIN_FEATURES],
  },
  {
    id: "tectonic-plains",
    group: "Yer şekilleri",
    title: "Tektonik Ovalar",
    eyebrow: "Yer şekilleri · Ovalar · Oluşum",
    description: "Fay kuşaklarındaki çöküntü alanlarında oluşan başlıca tektonik ovaları bul.",
    color: "#7d9b47",
    icon: "⌁",
    features: [...TECTONIC_PLAIN_FEATURES],
  },
  {
    id: "karstic-plains",
    group: "Yer şekilleri",
    title: "Karstik (Polye) Ovaları",
    eyebrow: "Yer şekilleri · Ovalar · Oluşum",
    description: "Batı Akdeniz ve Göller Yöresi’ndeki karstik polye tabanlarını bul.",
    color: "#82a55a",
    icon: "◌",
    features: [...KARSTIC_PLAIN_FEATURES],
  },
  {
    id: "tabular-plateaus",
    group: "Yer şekilleri",
    title: "Tabaka Düzlüğü Platoları",
    eyebrow: "Yer şekilleri · Platolar · Oluşum",
    description: "Yatay ya da az eğimli sert tabakaların akarsularca parçalandığı platoları bul.",
    color: "#aa7c50",
    icon: "▰",
    features: [...TABULAR_PLATEAU_FEATURES],
  },
  {
    id: "karstic-plateaus",
    group: "Yer şekilleri",
    title: "Karstik Platolar",
    eyebrow: "Yer şekilleri · Platolar · Oluşum",
    description: "Kalkerli Toros arazilerindeki Teke ve Taşeli platolarını ayırt et.",
    color: "#9d7858",
    icon: "◫",
    features: [...KARSTIC_PLATEAU_FEATURES],
  },
  {
    id: "volcanic-plateaus",
    group: "Yer şekilleri",
    title: "Volkanik (Lav) Platolar",
    eyebrow: "Yer şekilleri · Platolar · Oluşum",
    description: "Doğu Anadolu’daki lav örtülerinin akarsularla yarıldığı yüksek platoları bul.",
    color: "#9a654f",
    icon: "◆",
    features: [...VOLCANIC_PLATEAU_FEATURES],
  },
  {
    id: "erosion-plateaus",
    group: "Yer şekilleri",
    title: "Aşınım Düzlüğü Platoları",
    eyebrow: "Yer şekilleri · Platolar · Oluşum",
    description: "Eski aşınım yüzeylerinin yükselip akarsularla yarıldığı platoları bul.",
    color: "#8b765d",
    icon: "≋",
    features: [...EROSION_PLATEAU_FEATURES],
  },
  {
    id: "gulfs",
    group: "Ulaşım",
    title: "Körfezler",
    eyebrow: "Ulaşım · Kıyılar",
    description: "Türkiye kıyılarındaki başlıca körfezleri gerçek kıyı konumlarında bul.",
    color: "#327f9f",
    icon: "◡",
    features: [
      f("saros", "Saros Körfezi", 8, 34, 7, 4, "lake"),
      f("izmit-g", "İzmit Körfezi", 25, 40, 6, 4, "lake"),
      f("gemlik-g", "Gemlik Körfezi", 23, 44, 6, 4, "lake"),
      f("edremit-g", "Edremit Körfezi", 13, 43, 7, 4, "lake"),
      f("candarli-g", "Çandarlı Körfezi", 15, 49, 6, 4, "lake"),
      f("izmir-g", "İzmir Körfezi", 14, 54, 6, 4, "lake"),
      f("kusadasi-g", "Kuşadası Körfezi", 17, 59, 6, 4, "lake"),
      f("gulluk-g", "Güllük Körfezi", 19, 64, 6, 4, "lake"),
      f("gokova-g", "Gökova Körfezi", 21, 68, 8, 4, "lake"),
      f("antalya-g", "Antalya Körfezi", 35, 74, 11, 4, "lake"),
      f("mersin-g", "Mersin Körfezi", 51, 76, 11, 4, "lake"),
      f("iskenderun-g", "İskenderun Körfezi", 62, 74, 8, 4, "lake"),
    ],
  },
  {
    id: "coast-types",
    group: "Yer şekilleri",
    title: "Kıyı Tipleri",
    eyebrow: "Yer şekilleri · Kıyılar",
    description: "Dağların uzanışı ve deniz basmasına göre oluşan kıyı tiplerini örnek alanlarında bul.",
    color: "#2f8196",
    icon: "≋",
    features: [
      f("boyuna-black", "Boyuna Kıyı · Karadeniz", 58, 18, 55, 4, "river"),
      f("boyuna-med", "Boyuna Kıyı · Akdeniz", 46, 76, 45, 4, "river"),
      f("enine-aegean", "Enine Kıyı · Ege", 15, 53, 8, 25, "river"),
      f("ria-istanbul", "Ria Kıyı · İstanbul Boğazı", 14, 24, 8, 8, "river"),
      f("ria-canakkale", "Ria Kıyı · Çanakkale Boğazı", 10, 36, 8, 8, "river"),
      f("ria-mentese", "Ria Kıyı · Marmaris-Fethiye", 22, 68, 10, 5, "river"),
      f("dalmacya-teke", "Dalmaçya Kıyı · Teke", 31, 73, 10, 4, "river"),
      f("limanli-marmara", "Limanlı Kıyı · İstanbul çevresi", 16, 25, 8, 4, "river"),
      f("kalankli-teke", "Kalanklı Kıyı · Teke", 35, 74, 15, 4, "river"),
      f("kalankli-taseli", "Kalanklı Kıyı · Taşeli", 46, 75, 15, 4, "river"),
      f("tombolo-kapidag", "Tombolo · Kapıdağ", 18, 32, 5, 4, "region"),
      f("tombolo-sinop", "Tombolo · Sinop", 51, 17, 5, 4, "region"),
    ],
  },
  {
    id: "border-rivers",
    group: "Sular",
    title: "Sınır Oluşturan Akarsular",
    eyebrow: "Sular · Siyasi sınırlar",
    description: "Türkiye sınırının bir bölümünü oluşturan akarsuları bul.",
    color: "#356fc1",
    icon: "↝",
    features: [
      f("meric-br", "Meriç", 6, 28, 4, 10, "river"),
      f("mutludere-br", "Mutludere (Rezve)", 8, 20, 5, 4, "river"),
      f("arpacay", "Arpaçay", 88, 29, 8, 3, "river", 75),
      f("aras-br", "Aras", 88, 37, 12, 3, "river"),
      f("asi-br", "Asi", 61, 78, 4, 7, "river"),
      f("hezil-br", "Hezil Çayı", 84, 72, 5, 4, "river"),
    ],
  },
  {
    id: "closed-basins",
    group: "Sular",
    title: "Kapalı Havzalar",
    eyebrow: "Sular · Havzalar",
    description: "Sularını denize ulaştıramayan başlıca kapalı havzaları alanlarıyla bul.",
    color: "#3c78a8",
    icon: "◎",
    features: [
      f("van-basin", "Van Gölü Kapalı Havzası", 81, 51, 15, 13, "region"),
      f("konya-closed-basin", "Tuz Gölü-Konya Kapalı Havzası", 49, 57, 23, 20, "region"),
      f("burdur-basin", "Göller Yöresi-Burdur Kapalı Havzası", 34, 64, 16, 15, "region"),
      f("akaracay-basin", "Akşehir-Eber (Akarçay) Kapalı Havzası", 37, 56, 12, 9, "region"),
      f("aras-basin", "Aras-Kura (Hazar Denizi) Havzası", 86, 34, 18, 13, "region"),
      f("hazar-lake-basin", "Hazar Gölü Kapalı Havzası", 68, 51, 9, 8, "region"),
    ],
  },
  {
    id: "bridges-tunnels",
    group: "Ulaşım",
    title: "Köprüler ve Tüneller",
    eyebrow: "Ulaşım · Büyük projeler",
    description: "Önemli boğaz geçişlerini, köprüleri ve dağ tünellerini bul.",
    color: "#7861bf",
    icon: "⌒",
    features: [
      f("bogazici-b", "15 Temmuz Şehitler Köprüsü", 50, 50, 5, 4, "bridge"),
      f("fsm-b", "Fatih Sultan Mehmet Köprüsü", 50, 50, 5, 4, "bridge"),
      f("yss-b", "Yavuz Sultan Selim Köprüsü", 50, 50, 5, 4, "bridge"),
      f("osmangazi-b", "Osmangazi Köprüsü", 50, 50, 5, 4, "bridge"),
      f("canakkale-b", "1915 Çanakkale Köprüsü", 50, 50, 5, 4, "bridge"),
      f("avrasya-t", "Avrasya Tüneli", 50, 50, 5, 4, "tunnel"),
      f("marmaray-t", "Marmaray", 50, 50, 5, 4, "tunnel"),
      f("bolu-t", "Bolu Dağı Tüneli", 50, 50, 5, 4, "tunnel"),
      f("ovit-t", "Ovit Tüneli", 50, 50, 5, 4, "tunnel"),
      f("zigana-t", "Yeni Zigana Tüneli", 50, 50, 5, 4, "tunnel"),
      f("ilgaz-t", "Ilgaz 15 Temmuz İstiklal Tüneli", 50, 50, 5, 4, "tunnel"),
      f("cankurtaran-t", "Cankurtaran Tüneli", 50, 50, 5, 4, "tunnel"),
      f("sabuncubeli-t", "Sabuncubeli Tüneli", 50, 50, 5, 4, "tunnel"),
      f("egribel-t", "Eğribel Tüneli", 50, 50, 5, 4, "tunnel"),
    ],
  },
  {
    id: "bridges",
    group: "Ulaşım",
    title: "Başlıca Köprüler",
    eyebrow: "Ulaşım · Büyük projeler · Alt konu",
    description: "Boğaz ve körfez geçişlerindeki başlıca köprüleri gerçek orta noktalarında bul.",
    color: "#7161b7",
    icon: "⌒",
    features: [
      f("bogazici-b", "15 Temmuz Şehitler Köprüsü", 50, 50, 5, 4, "bridge"),
      f("fsm-b", "Fatih Sultan Mehmet Köprüsü", 50, 50, 5, 4, "bridge"),
      f("yss-b", "Yavuz Sultan Selim Köprüsü", 50, 50, 5, 4, "bridge"),
      f("osmangazi-b", "Osmangazi Köprüsü", 50, 50, 5, 4, "bridge"),
      f("canakkale-b", "1915 Çanakkale Köprüsü", 50, 50, 5, 4, "bridge"),
    ],
  },
  {
    id: "tunnels",
    group: "Ulaşım",
    title: "Başlıca Tüneller",
    eyebrow: "Ulaşım · Büyük projeler · Alt konu",
    description: "Başlıca boğaz ve dağ tünellerini gerçek güzergâh orta noktalarında bul.",
    color: "#6757a9",
    icon: "∩",
    features: [
      f("avrasya-t", "Avrasya Tüneli", 50, 50, 5, 4, "tunnel"),
      f("marmaray-t", "Marmaray", 50, 50, 5, 4, "tunnel"),
      f("bolu-t", "Bolu Dağı Tüneli", 50, 50, 5, 4, "tunnel"),
      f("ovit-t", "Ovit Tüneli", 50, 50, 5, 4, "tunnel"),
      f("zigana-t", "Yeni Zigana Tüneli", 50, 50, 5, 4, "tunnel"),
      f("ilgaz-t", "Ilgaz 15 Temmuz İstiklal Tüneli", 50, 50, 5, 4, "tunnel"),
      f("cankurtaran-t", "Cankurtaran Tüneli", 50, 50, 5, 4, "tunnel"),
      f("sabuncubeli-t", "Sabuncubeli Tüneli", 50, 50, 5, 4, "tunnel"),
      f("egribel-t", "Eğribel Tüneli", 50, 50, 5, 4, "tunnel"),
    ],
  },
  {
    id: "absolute-location",
    group: "Türkiye",
    title: "Türkiye'nin Mutlak Konumu",
    eyebrow: "Türkiye · Matematik konum",
    description: "Türkiye'yi sınırlayan iki paralel ve iki meridyeni tam derece çizgileri üzerinde bul.",
    color: "#386f9d",
    icon: "⌗",
    features: [...ABSOLUTE_LOCATION_FEATURES],
  },
  {
    id: "fault-systems",
    group: "Jeoloji",
    title: "Türkiye'nin Başlıca Fay Sistemleri",
    eyebrow: "Jeoloji · Tektonizma",
    description: "Kuzey, Doğu ve Batı Anadolu fay sistemlerini MTA'nın 2026 diri fay çizgileri üzerinde bul.",
    color: "#bc463c",
    icon: "⌁",
    features: [...ACTIVE_FAULT_FEATURES],
  },
  {
    id: "neighbors",
    group: "Türkiye",
    title: "Türkiye'nin Kara Komşuları",
    eyebrow: "Türkiye · Siyasi konum",
    description: "Sekiz kara komşusunu, sınırın dışındaki gerçek ülke poligonuna tıklayarak bul.",
    color: "#397c83",
    icon: "◎",
    features: [...NEIGHBOR_COUNTRY_FEATURES],
  },
  {
    id: "provinces",
    group: "Türkiye",
    title: "81 İl",
    eyebrow: "Türkiye · İl sınırları",
    description: "İlleri noktayla değil, gerçek idari sınır poligonuna tıklayarak bul.",
    color: "#6847bd",
    icon: "81",
    features: [
      p(1, "Adana"), p(2, "Adıyaman"), p(3, "Afyonkarahisar"), p(4, "Ağrı"),
      p(5, "Amasya"), p(6, "Ankara"), p(7, "Antalya"), p(8, "Artvin"),
      p(9, "Aydın"), p(10, "Balıkesir"), p(11, "Bilecik"), p(12, "Bingöl"),
      p(13, "Bitlis"), p(14, "Bolu"), p(15, "Burdur"), p(16, "Bursa"),
      p(17, "Çanakkale"), p(18, "Çankırı"), p(19, "Çorum"), p(20, "Denizli"),
      p(21, "Diyarbakır"), p(22, "Edirne"), p(23, "Elazığ"), p(24, "Erzincan"),
      p(25, "Erzurum"), p(26, "Eskişehir"), p(27, "Gaziantep"), p(28, "Giresun"),
      p(29, "Gümüşhane"), p(30, "Hakkâri"), p(31, "Hatay"), p(32, "Isparta"),
      p(33, "Mersin"), p(34, "İstanbul"), p(35, "İzmir"), p(36, "Kars"),
      p(37, "Kastamonu"), p(38, "Kayseri"), p(39, "Kırklareli"), p(40, "Kırşehir"),
      p(41, "Kocaeli"), p(42, "Konya"), p(43, "Kütahya"), p(44, "Malatya"),
      p(45, "Manisa"), p(46, "Kahramanmaraş"), p(47, "Mardin"), p(48, "Muğla"),
      p(49, "Muş"), p(50, "Nevşehir"), p(51, "Niğde"), p(52, "Ordu"),
      p(53, "Rize"), p(54, "Sakarya"), p(55, "Samsun"), p(56, "Siirt"),
      p(57, "Sinop"), p(58, "Sivas"), p(59, "Tekirdağ"), p(60, "Tokat"),
      p(61, "Trabzon"), p(62, "Tunceli"), p(63, "Şanlıurfa"), p(64, "Uşak"),
      p(65, "Van"), p(66, "Yozgat"), p(67, "Zonguldak"), p(68, "Aksaray"),
      p(69, "Bayburt"), p(70, "Karaman"), p(71, "Kırıkkale"), p(72, "Batman"),
      p(73, "Şırnak"), p(74, "Bartın"), p(75, "Ardahan"), p(76, "Iğdır"),
      p(77, "Yalova"), p(78, "Karabük"), p(79, "Kilis"), p(80, "Osmaniye"),
      p(81, "Düzce"),
    ],
  },
];

const GROUPS = ["Tümü", ...Array.from(new Set(QUIZZES.map((quiz) => quiz.group)))];
const TOTAL_LOCATIONS = QUIZZES.reduce((sum, quiz) => sum + quiz.features.length, 0);

type SourceRef = { label: string; url: string };

const SOURCE_BY_GROUP: Record<string, SourceRef> = {
  "Dağlar": {
    label: "MEB yer şekilleri + HGM",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page76.html",
  },
  "Göller": {
    label: "MEB göl sınıfları + DSİ",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page81.html",
  },
  "Sular": {
    label: "DSİ su kaynakları + MEB",
    url: "https://dsi.gov.tr/Sayfa/Detay/754",
  },
  "Yer şekilleri": {
    label: "MEB yer şekilleri + HGM",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page76.html",
  },
  "Ulaşım": {
    label: "HGM + KGM resmî haritaları",
    url: "https://www.kgm.gov.tr/Sayfalar/KGM/SiteTr/Root/Haritalarr.aspx",
  },
  "Çevre": {
    label: "DKMP korunan alan verileri",
    url: "https://www.tarimorman.gov.tr/DKMP/Menu/18/Korunan-Alan-Istatistikleri",
  },
  "Jeoloji": {
    label: "MTA jeoloji verileri + MEB",
    url: "https://www.mta.gov.tr/v3.0/",
  },
  "Ekonomi": {
    label: "MEB + ilgili bakanlık verileri",
    url: "https://www.tarimorman.gov.tr/Konular/Bitkisel-Uretim",
  },
  "Beşerî": {
    label: "TÜİK nüfus verileri",
    url: "https://data.tuik.gov.tr/",
  },
  "Doğal": {
    label: "MGM iklim verileri + MEB",
    url: "https://www.mgm.gov.tr/iklim/iklim-siniflandirmalari.aspx",
  },
  "Türkiye": {
    label: "HGM idari ve fiziki haritaları",
    url: "https://www.harita.gov.tr/urunler/indirilebilir-urunler/14",
  },
};

const SOURCE_BY_QUIZ: Record<string, SourceRef> = {
  ramsar: {
    label: "DKMP 14 Ramsar alanı + korunan alan sınırları",
    url: "https://www.tarimorman.gov.tr/DKMP/Menu/31/Sulak-Alanlar",
  },
  cities: {
    label: "MEB fonksiyonlarına göre şehirler",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page19.html",
  },
  "agricultural-function-cities": {
    label: "MEB tarım şehirleri",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page19.html",
  },
  "industrial-function-cities": {
    label: "MEB sanayi şehirleri",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page19.html",
  },
  "mining-function-cities": {
    label: "MEB maden şehirleri",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page19.html",
  },
  "port-function-cities": {
    label: "MEB liman şehirleri",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page19.html",
  },
  "transport-trade-function-cities": {
    label: "MEB ulaşım ve ticaret şehirleri",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page19.html",
  },
  "culture-admin-military-function-cities": {
    label: "MEB kültür, idari ve askerî şehirler",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page19.html",
  },
  "tourism-function-cities": {
    label: "MEB turizm şehirleri",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page19.html",
  },
  "glacial-mountains": {
    label: "MEB Türkiye'de buzullaşma",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page75.html",
  },
  "landslide-set-lakes": {
    label: "MEB heyelan set gölleri · gerçek OSM su poligonları",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page81.html",
  },
  "alluvial-set-lakes": {
    label: "MEB alüvyal set gölleri · gerçek OSM su poligonları",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page81.html",
  },
  "coastal-set-lakes": {
    label: "MEB kıyı set gölleri · gerçek OSM lagün poligonları",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page81.html",
  },
  "mixed-origin-lakes": {
    label: "MEB karma oluşumlu göller · gerçek OSM su poligonları",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page81.html",
  },
  "glacial-lakes": {
    label: "MEB konu özeti + Coğrafya 10 · gerçek OSM su poligonları",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page81.html",
  },
  "karstic-lakes": {
    label: "MEB karstik göller · Kestel kurumuş polye olarak ayrıştırıldı",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page81.html",
  },
  plains: {
    label: "MEB tektonik, delta ve karstik ova listeleri",
    url: "https://orgm.meb.gov.tr/ekpssmebozel/content/magazines/pdf/cografya2.pdf",
  },
  "tectonic-plains": {
    label: "MEB fay kuşaklarına göre tektonik ovalar",
    url: "https://orgm.meb.gov.tr/ekpssmebozel/content/magazines/pdf/cografya2.pdf",
  },
  "delta-plains": {
    label: "MEB akarsu-delta eşleştirmeleri",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap/defterim/10/cografya/files/basic-html/page37.html",
  },
  "karstic-plains": {
    label: "MEB Türkiye'nin başlıca polye ovaları",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap/cografya/10/unite1/files/basic-html/page46.html",
  },
  plateaus: {
    label: "MEB Türkiye'nin platoları",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page76.html",
  },
  "tabular-plateaus": {
    label: "MEB sert tabakalı plato örnekleri",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap/calisma_defteri/f2/10/cografya/files/basic-html/page18.html",
  },
  "karstic-plateaus": {
    label: "MEB karstik platolar",
    url: "https://orgm.meb.gov.tr/ekpssmebozel/content/magazines/pdf/cografya2.pdf",
  },
  "volcanic-plateaus": {
    label: "MEB volkanik platolar",
    url: "https://orgm.meb.gov.tr/ekpssmebozel/content/magazines/pdf/cografya2.pdf",
  },
  "erosion-plateaus": {
    label: "MEB aşınım düzlüğü platoları",
    url: "https://orgm.meb.gov.tr/ekpssmebozel/content/magazines/pdf/cografya2.pdf",
  },
  massifs: {
    label: "MEB TYT + Genel Jeoloji · 14 başlıca masif",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page61.html",
  },
  straits: {
    label: "MEB Türkiye'de Yer Alan Denizler ve Boğazlar + HGM",
    url: "https://orgm.meb.gov.tr/ekpssmebozel/content/magazines/pdf/cografya1.pdf",
  },
  gates: {
    label: "Ticaret Bakanlığı 2026 kara hudut kapıları + MEB",
    url: "https://ticaret.gov.tr/data/61efa03313b876476cc9f9b0/Kara%20Kapilarina%20ve%20Arac%20Turlerine%20Gore%20Arac%20Sayilari..pdf",
  },
  passes: {
    label: "MEB sınav kapsamı + KGM · 11 çekirdek geçit",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap/konu-pekistirme/ayt/cografya/files/basic-html/page183.html",
  },
  "fault-systems": {
    label: "MTA Türkiye Diri Fay Haritası 2026 · 1/25.000",
    url: "https://tdfh.mta.gov.tr/",
  },
  "absolute-location": {
    label: "MEB Türkiye'nin mutlak konumu · 36°–42° K / 26°–45° D",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page23.html",
  },
  neighbors: {
    label: "MEB kara ve deniz komşuları haritası · Natural Earth sınırları",
    url: "https://ttkb.meb.gov.tr/www/haritalar/icerik/739",
  },
  mines: {
    label: "MEB Türkiye’de madenler · s. 34-35",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page34.html",
  },
  "metallic-mines": {
    label: "MEB metalik maden çıkarım yerleri · s. 34",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page34.html",
  },
  "industrial-minerals": {
    label: "MEB endüstriyel mineraller ve taşlar · s. 34",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page34.html",
  },
  "energy-raw-materials": {
    label: "MEB taş kömürü ve linyit merkezleri · s. 35",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page35.html",
  },
  energy: {
    label: "MEB Türkiye’de enerji kaynakları · s. 35-36",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page35.html",
  },
  "wind-energy": {
    label: "MEB rüzgâr enerjisi alanları · s. 36",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page36.html",
  },
  "thermal-energy": {
    label: "MEB termik santral merkezleri · s. 35",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page35.html",
  },
  "other-energy": {
    label: "MEB enerji santrali örnekleri · s. 8, 35-36",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap/calisma_defteri/f3/11/cografya/files/basic-html/page8.html",
  },
  "natural-gas-pipelines": {
    label: "ETKB + BOTAŞ başlıca doğal gaz boru hattı güzergâhları",
    url: "https://www.enerji.gov.tr/bilgi-merkezi-dogal-gaz-boru-hatlari",
  },
  "oil-pipelines": {
    label: "ETKB + BOTAŞ ham petrol boru hattı güzergâhları",
    url: "https://www.enerji.gov.tr/bilgi-merkezi-haritalar",
  },
  dams: {
    label: "MEB kapsamı · DSİ + OSM gövde doğrulaması",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap/cografya/10/unite1/files/basic-html/page79.html",
  },
  development: {
    label: "Sanayi Bakanlığı bölgesel kalkınma",
    url: "https://www.sanayi.gov.tr/bolgesel-kalkinma-faaliyetleri",
  },
  industry: {
    label: "MEB Türkiye'de sanayi + Sanayi Bakanlığı",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page37.html",
  },
  "food-industry": {
    label: "MEB gıda sanayisi merkezleri",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page37.html",
  },
  "textile-industry": {
    label: "MEB dokuma, giyim ve deri sanayisi",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page38.html",
  },
  "chemical-industry": {
    label: "MEB kimya, orman ve toprağa dayalı sanayi",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page38.html",
  },
  "machine-industry": {
    label: "MEB makine, maden işleme ve savunma sanayisi",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page39.html",
  },
  population: {
    label: "MEB Türkiye’de nüfus etkinliği",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap/defterim/10/cografya/files/basic-html/page139.html",
  },
  "dense-population": {
    label: "MEB sık nüfuslu yöreler",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap/defterim/10/cografya/files/basic-html/page139.html",
  },
  "sparse-population": {
    label: "MEB seyrek nüfuslu yöreler",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap/defterim/10/cografya/files/basic-html/page139.html",
  },
  regions: {
    label: "MEB · 1941 Birinci Coğrafya Kongresi'nin 7 bölgesi",
    url: "https://orgm.meb.gov.tr/meb_iys_dosyalar/2023_12/21151051_cografya1.pdf",
  },
  climate: {
    label: "MEB Türkiye iklim tipleri + MGM",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page48.html",
  },
  vegetation: {
    label: "MEB Türkiye bitki toplulukları",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page90.html",
  },
  "forest-vegetation": {
    label: "MEB Türkiye orman bölgeleri",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page90.html",
  },
  "shrub-vegetation": {
    label: "MEB Türkiye çalı toplulukları",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page91.html",
  },
  "grass-vegetation": {
    label: "MEB Türkiye ot toplulukları",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page91.html",
  },
  soils: {
    label: "MEB Türkiye toprakları",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page85.html",
  },
  "zonal-soils": {
    label: "MEB Türkiye zonal toprakları",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page85.html",
  },
  "intrazonal-soils": {
    label: "MEB Türkiye intrazonal toprakları",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page86.html",
  },
  "azonal-soils": {
    label: "MEB Türkiye azonal toprakları",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page86.html",
  },
  tourism: {
    label: "MEB Türkiye turizmi + Kültür Portalı",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page86.html",
  },
  "natural-tourism": {
    label: "MEB kapsamı · DKMP alan doğrulaması",
    url: "https://www.tarimorman.gov.tr/DKMP/Menu/27/Milli-Parklar%3B",
  },
  "cultural-tourism": {
    label: "MEB kültürel varlıklar ve ören yerleri",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page86.html",
  },
  agriculture: {
    label: "MEB Türkiye’de tarım ürünleri · s. 28-30",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page28.html",
  },
  "grain-legume-crops": {
    label: "MEB tahıllar ve baklagiller",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page28.html",
  },
  "industrial-oil-crops": {
    label: "MEB sanayi ve yağ bitkileri",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page29.html",
  },
  "fruit-special-crops": {
    label: "MEB meyveler ve özel ürünler",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page30.html",
  },
  livestock: {
    label: "MEB Türkiye’de hayvancılık · s. 32",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page32.html",
  },
  "small-ruminant-livestock": {
    label: "MEB küçükbaş hayvancılık",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page32.html",
  },
  "cattle-poultry-livestock": {
    label: "MEB büyükbaş ve kümes hayvancılığı",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page32.html",
  },
  "other-livestock": {
    label: "MEB arıcılık, ipek böcekçiliği ve su ürünleri",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page32.html",
  },
  "closed-basins": {
    label: "Tarım ve Orman Bakanlığı resmî havza sınırları + MEB",
    url: "https://cbs1.tarimorman.gov.tr/server/rest/services/TATUS_TEST/MapServer/11",
  },
  ports: {
    label: "MEB güncel Türkiye lojistik coğrafyası · 21 liman",
    url: "https://meslek.meb.gov.tr/upload/dersmateryali/pdf/UH2024TU0924.pdf",
  },
  "marmara-ports": {
    label: "MEB Marmara Denizi'ndeki 6 liman",
    url: "https://meslek.meb.gov.tr/upload/dersmateryali/pdf/UH2024TU0924.pdf",
  },
  "black-sea-ports": {
    label: "MEB Karadeniz'deki 6 liman",
    url: "https://meslek.meb.gov.tr/upload/dersmateryali/pdf/UH2024TU0924.pdf",
  },
  "aegean-ports": {
    label: "MEB Ege Denizi'ndeki 5 liman",
    url: "https://meslek.meb.gov.tr/upload/dersmateryali/pdf/UH2024TU0924.pdf",
  },
  "mediterranean-ports": {
    label: "MEB Akdeniz'deki 4 liman",
    url: "https://meslek.meb.gov.tr/upload/dersmateryali/pdf/UH2024TU0924.pdf",
  },
  gulfs: {
    label: "HGM fiziki harita + kıyı verileri",
    url: "https://www.harita.gov.tr/urun/turkiye-fiziki-haritasi-dilsiz/273",
  },
  "coast-types": {
    label: "MEB Türkiye kıyı tipleri",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page75.html",
  },
  "bridges-tunnels": {
    label: "KGM başlıca köprüler + tünel projeleri",
    url: "https://www.kgm.gov.tr/Sayfalar/KGM/SiteTr/Projeler/TunelProjeleri.aspx?Yil=2010",
  },
  bridges: {
    label: "KGM 2026 ana boğaz ve körfez köprüleri",
    url: "https://www.kgm.gov.tr/Sayfalar/KGM/SiteTr/Root/GormeEngelliDetay.aspx?d=1952",
  },
  tunnels: {
    label: "KGM başlıca tünel projeleri + tünel haritası",
    url: "https://www.kgm.gov.tr/SiteCollectionImages/KGMimages/Haritalar/tuneller.pdf",
  },
};

const ACTIVE_QUIZ_STORAGE_KEY = "cografya-pesinde:active-quiz";

function shuffledFeatureIds(features: Feature[], previousOrder: string[] = []) {
  const ids = [...new Set(features.map((feature) => feature.id))];
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];
  }
  if (ids.length > 1 && ids[0] === previousOrder[0]) {
    const swapIndex = 1 + Math.floor(Math.random() * (ids.length - 1));
    [ids[0], ids[swapIndex]] = [ids[swapIndex], ids[0]];
  }
  return ids;
}

type Coordinate = [number, number];
type ProvinceFeature = {
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: Coordinate[][] | Coordinate[][][];
  };
  properties: { name: string; plate: number };
};

type LakeFeature = {
  geometry: ProvinceFeature["geometry"];
  properties: { id: string; name: string };
};

type BasinFeature = LakeFeature;
type NeighborFeature = LakeFeature;

type RiverFeature = {
  geometry: {
    type: "LineString" | "MultiLineString";
    coordinates: Coordinate[] | Coordinate[][];
  };
  properties: { id: string; name: string };
};
type FaultFeature = RiverFeature;

const MAP_BOUNDS = { west: 25.55, east: 44.85, north: 42.15, south: 35.75 };
const NEIGHBOR_LABEL_COORDINATES: Record<string, Coordinate> = {
  greece: [25.2, 40.45],
  bulgaria: [26.9, 42.55],
  georgia: [42.05, 42.45],
  armenia: [44.15, 40.55],
  azerbaijan: [45.1, 39.55],
  iran: [45.45, 38.35],
  iraq: [43.45, 36.45],
  syria: [38.1, 35.55],
};
const MAP_COLORS = ["#ead9a2", "#c4d89b", "#e9bd7b", "#c7d8ca", "#d4c1dc", "#f1cf9f", "#b8d6c7"];

function ovalArea(
  longitude: number,
  latitude: number,
  longitudeRadius: number,
  latitudeRadius: number,
  rotationDegrees = 0,
): Coordinate[] {
  const rotation = rotationDegrees * Math.PI / 180;
  const basinProfile = [0.9, 1.04, 0.96, 1.08, 0.93, 1.02, 0.88, 1.06, 0.95, 1.03, 0.91, 1.07, 0.94, 1.01, 0.89, 1.05];
  return basinProfile.map((radiusFactor, index) => {
    const angle = index * Math.PI * 2 / basinProfile.length;
    const x = Math.cos(angle) * longitudeRadius * radiusFactor;
    const y = Math.sin(angle) * latitudeRadius * radiusFactor;
    return [
      longitude + x * Math.cos(rotation) - y * Math.sin(rotation),
      latitude + x * Math.sin(rotation) + y * Math.cos(rotation),
    ];
  });
}

const AREA_POLYGONS: Record<string, Coordinate[]> = {
  cukur: [[34.3, 37.0], [34.8, 36.8], [35.6, 36.7], [36.3, 36.8], [36.1, 37.1], [35.4, 37.3], [34.7, 37.2]],
  konya: [[31.5, 38.4], [32.0, 37.8], [32.8, 37.5], [33.8, 37.7], [34.1, 38.2], [33.5, 38.7], [32.4, 38.8]],
  erzurum: [[40.6, 40.0], [41.0, 39.8], [41.8, 39.8], [42.2, 40.0], [41.8, 40.3], [41.0, 40.3]],
  harran: [[38.4, 37.3], [38.7, 36.8], [39.4, 36.7], [39.8, 37.1], [39.5, 37.5], [38.8, 37.5]],
  bafra: [[35.6, 41.5], [35.9, 41.3], [36.3, 41.4], [36.4, 41.7], [36.0, 41.8], [35.7, 41.7]],
  carsamba: [[36.2, 41.2], [36.5, 41.0], [37.0, 41.1], [37.3, 41.4], [36.8, 41.6], [36.3, 41.5]],
  gediz: [[27.0, 38.7], [27.3, 38.4], [28.2, 38.4], [28.7, 38.6], [28.3, 38.9], [27.5, 38.9]],
  "gediz-o": [[27.0, 38.7], [27.3, 38.4], [28.2, 38.4], [28.7, 38.6], [28.3, 38.9], [27.5, 38.9]],
  bakircay: [[26.7, 39.2], [27.0, 38.9], [27.8, 38.9], [28.1, 39.1], [27.7, 39.4], [27.0, 39.4]],
  "bakircay-o": [[26.7, 39.2], [27.0, 38.9], [27.8, 38.9], [28.1, 39.1], [27.7, 39.4], [27.0, 39.4]],
  kucukmenderes: [[27.0, 38.2], [27.4, 37.9], [28.2, 38.0], [28.6, 38.2], [28.1, 38.4], [27.4, 38.4]],
  "kucukmenderes-o": [[27.0, 38.2], [27.4, 37.9], [28.2, 38.0], [28.6, 38.2], [28.1, 38.4], [27.4, 38.4]],
  "buyukmenderes-o": [[27.1, 37.8], [27.7, 37.5], [28.8, 37.5], [29.5, 37.7], [29.0, 38.0], [27.8, 38.0]],
  silifke: [[33.6, 36.4], [33.8, 36.2], [34.2, 36.2], [34.4, 36.4], [34.1, 36.6], [33.7, 36.6]],
  "erzincan-o": [[38.7, 39.7], [39.0, 39.5], [39.7, 39.5], [40.0, 39.7], [39.7, 39.9], [39.0, 39.9]],
  "mus-o": [[40.9, 38.8], [41.3, 38.5], [42.1, 38.5], [42.4, 38.8], [42.0, 39.0], [41.3, 39.0]],
  "igdir-o": [[43.5, 39.9], [43.8, 39.7], [44.6, 39.7], [44.8, 39.9], [44.5, 40.1], [43.8, 40.1]],
  amik: [[36.0, 36.5], [36.2, 36.2], [36.7, 36.2], [36.9, 36.5], [36.6, 36.8], [36.2, 36.8]],
  "bursa-o": [[28.72, 40.28], [28.82, 40.08], [29.34, 40.08], [29.47, 40.22], [29.31, 40.36], [28.9, 40.38]],
  "yuksekova-o": [[43.98, 37.72], [44.08, 37.48], [44.55, 37.43], [44.7, 37.6], [44.52, 37.78], [44.15, 37.82]],
  "adapazari-o": [[30.12, 40.88], [30.28, 40.65], [30.78, 40.61], [30.91, 40.79], [30.72, 40.95], [30.3, 40.99]],
  "bolu-o": [[31.42, 40.78], [31.53, 40.57], [31.91, 40.56], [32.02, 40.72], [31.87, 40.85], [31.57, 40.86]],
  "duzce-o": [[30.98, 40.95], [31.08, 40.75], [31.43, 40.72], [31.53, 40.88], [31.39, 41.0], [31.12, 41.02]],
  "bergama-o": [[26.98, 39.2], [27.08, 39.0], [27.42, 38.98], [27.52, 39.14], [27.37, 39.27], [27.1, 39.28]],
  "soma-o": [[27.43, 39.28], [27.5, 39.08], [27.83, 39.02], [27.91, 39.18], [27.76, 39.32], [27.53, 39.35]],
  "akhisar-o": [[27.62, 39.06], [27.72, 38.82], [28.08, 38.78], [28.2, 38.96], [28.03, 39.12], [27.76, 39.15]],
  "maras-o": [[36.72, 37.75], [36.82, 37.48], [37.24, 37.4], [37.39, 37.59], [37.22, 37.79], [36.91, 37.85]],
  "malatya-o": [[37.93, 38.52], [38.05, 38.25], [38.55, 38.2], [38.69, 38.4], [38.52, 38.57], [38.13, 38.61]],
  "suruc-o": [[37.91, 37.15], [38.03, 36.88], [38.53, 36.84], [38.66, 37.03], [38.48, 37.2], [38.09, 37.23]],
  "ceylanpinar-o": [[39.71, 37.04], [39.85, 36.76], [40.43, 36.72], [40.57, 36.91], [40.35, 37.08], [39.92, 37.12]],
  "gonen-o": ovalArea(27.65, 40.1, .35, .15, -10),
  "inegol-o": ovalArea(29.51, 40.08, .3, .13, 8),
  "yenisehir-o": ovalArea(29.65, 40.26, .32, .13, -4),
  "orhangazi-o": ovalArea(29.31, 40.49, .2, .1, 5),
  "pamukova-o": ovalArea(30.16, 40.51, .34, .12, -8),
  "gemlik-o": ovalArea(29.16, 40.42, .22, .11, -5),
  "tosya-o": ovalArea(34.04, 41.02, .38, .12, -8),
  "suluova-o": ovalArea(35.65, 40.82, .35, .16, 4),
  "niksar-o": ovalArea(36.93, 40.57, .42, .13, -8),
  "tasova-o": ovalArea(36.32, 40.76, .3, .12, -8),
  "turhal-o": ovalArea(36.08, 40.39, .32, .13, -4),
  "vezirkopru-o": ovalArea(35.46, 41.15, .34, .18, 6),
  "erbaa-o": ovalArea(36.57, 40.67, .32, .12, -5),
  "pasinler-o": ovalArea(41.67, 39.95, .48, .16, 2),
  "ankara-o": ovalArea(32.85, 39.94, .45, .23, -5),
  "kayseri-o": ovalArea(35.46, 38.73, .5, .24, 2),
  "aksaray-o": ovalArea(33.85, 38.37, .45, .24, -4),
  "cubuk-o": ovalArea(33.09, 40.2, .3, .14, 8),
  "eskisehir-o": ovalArea(30.52, 39.77, .48, .18, -3),
  "develi-o": ovalArea(35.49, 38.32, .38, .22, 2),
  "afsin-o": ovalArea(36.92, 38.25, .3, .15, -4),
  "elbistan-o": ovalArea(37.22, 38.24, .4, .19, 2),
  "elazig-o": ovalArea(39.22, 38.67, .35, .16, -6),
  "bingol-o": ovalArea(40.5, 38.88, .3, .15, 5),
  "karliova-o": ovalArea(40.99, 39.3, .28, .14, -5),
  "malazgirt-o": ovalArea(42.55, 39.15, .4, .18, 3),
  "elmali-o": ovalArea(29.92, 36.74, .32, .18, 2),
  "korkuteli-o": ovalArea(30.19, 37.06, .3, .18, -4),
  "gembos-o": ovalArea(32.58, 37.55, .3, .13, 12),
  "kestel-o": ovalArea(30.51, 37.42, .18, .1, 4),
  "kocaova-o": ovalArea(30.18, 37.43, .2, .11, -6),
  "acipayam-o": ovalArea(29.42, 37.42, .3, .2, -8),
  "mugla-o": ovalArea(28.37, 37.2, .27, .16, 5),
  "tefenni-o": ovalArea(29.9, 37.33, .28, .17, -5),
  "golhisar-o": ovalArea(29.55, 37.15, .28, .18, -8),
  "bozova-karst-o": ovalArea(30.285, 37.215, .2, .12, 5),
  "antalya-o": ovalArea(30.75, 36.9, .55, .25, -2),
  "ergene-o": ovalArea(27.45, 41.2, .85, .35, -4),
  "merzifon-o": ovalArea(35.5, 40.78, .3, .14, 3),
  "ceyhan-o": ovalArea(35.82, 37.03, .4, .2, 2),
  bozok: [[34.45, 40.08], [34.48, 39.65], [34.86, 39.28], [35.45, 39.18], [35.98, 39.42], [36.02, 39.9], [35.62, 40.16], [35.02, 40.2]],
  obruk: [[32.35, 38.55], [32.52, 37.95], [33.02, 37.7], [33.7, 37.72], [34.03, 38.12], [33.82, 38.58], [33.22, 38.78], [32.68, 38.7]],
  taspinar: [[32.15, 37.22], [32.42, 36.72], [33.02, 36.42], [33.72, 36.43], [34.22, 36.72], [34.0, 37.12], [33.4, 37.4], [32.7, 37.4]],
  gaziantep: [[36.55, 37.48], [36.72, 37.02], [37.2, 36.72], [37.82, 36.72], [38.28, 37.0], [38.12, 37.46], [37.6, 37.7], [37.0, 37.68]],
  "erzurum-kars": [[40.65, 40.82], [40.82, 40.02], [41.4, 39.62], [42.2, 39.48], [43.05, 39.72], [43.48, 40.2], [43.28, 40.82], [42.62, 41.08], [41.68, 41.05]],
  haymana: [[31.62, 39.62], [31.88, 39.08], [32.42, 38.9], [33.02, 39.02], [33.3, 39.4], [32.96, 39.72], [32.28, 39.82]],
  cihanbeyli: [[31.72, 39.12], [31.92, 38.55], [32.42, 38.25], [33.02, 38.32], [33.34, 38.72], [33.08, 39.08], [32.46, 39.32]],
  uzunyayla: [[35.5, 39.25], [35.72, 38.72], [36.2, 38.4], [36.78, 38.42], [37.18, 38.8], [37.02, 39.28], [36.52, 39.5], [35.92, 39.48]],
  yazilikaya: [[29.12, 39.58], [29.38, 39.08], [29.9, 38.82], [30.48, 38.9], [30.88, 39.25], [30.62, 39.62], [30.02, 39.82], [29.48, 39.78]],
  "usak-esme": [[28.35, 38.82], [28.62, 38.3], [29.12, 38.02], [29.68, 38.12], [30.02, 38.48], [29.8, 38.88], [29.22, 39.05], [28.72, 39.02]],
  teke: [[28.9, 37.25], [29.08, 36.68], [29.52, 36.28], [30.08, 36.18], [30.72, 36.42], [30.92, 36.88], [30.58, 37.3], [29.98, 37.5], [29.38, 37.48]],
  "sanliurfa-p": [[37.15, 37.48], [37.42, 36.95], [38.05, 36.62], [39.0, 36.55], [39.92, 36.78], [40.22, 37.22], [39.78, 37.58], [38.82, 37.75], [37.78, 37.7]],
  "ardahan-p": [[42.25, 41.45], [42.48, 40.92], [42.98, 40.7], [43.48, 40.78], [43.72, 41.15], [43.42, 41.55], [42.82, 41.72]],
  "persembe-p": [[36.9, 41.08], [37.12, 40.78], [37.58, 40.62], [38.02, 40.72], [38.3, 41.0], [38.02, 41.24], [37.48, 41.34], [37.05, 41.28]],
  "seyfe-t": [[34.34, 39.24], [34.38, 39.15], [34.52, 39.13], [34.57, 39.2], [34.51, 39.28], [34.39, 39.3]],
  balik: [[43.49, 39.82], [43.55, 39.74], [43.66, 39.75], [43.69, 39.84], [43.6, 39.91], [43.51, 39.89]],
  "haçli": [[41.43, 39.12], [41.47, 39.03], [41.61, 39.02], [41.66, 39.1], [41.58, 39.18], [41.47, 39.19]],
  kuyucuk: [[43.42, 40.78], [43.44, 40.72], [43.53, 40.71], [43.56, 40.76], [43.51, 40.82], [43.44, 40.83]],
  "nemrut-kaldera": [[42.15, 38.69], [42.18, 38.6], [42.28, 38.58], [42.34, 38.64], [42.3, 38.73], [42.21, 38.75]],
  "seyfe-r": [[34.34, 39.24], [34.38, 39.15], [34.52, 39.13], [34.57, 39.2], [34.51, 39.28], [34.39, 39.3]],
  "gediz-r": [[26.72, 38.62], [26.82, 38.48], [27.0, 38.42], [27.16, 38.5], [27.06, 38.64], [26.88, 38.69]],
  "akyatan-r": [[35.16, 36.67], [35.24, 36.55], [35.47, 36.54], [35.55, 36.62], [35.43, 36.7], [35.25, 36.72]],
  "yumurtalik-r": [[35.58, 36.81], [35.65, 36.7], [35.82, 36.68], [35.9, 36.77], [35.8, 36.86], [35.65, 36.87]],
  "meke-r": [[33.61, 37.7], [33.62, 37.66], [33.68, 37.65], [33.7, 37.69], [33.67, 37.73], [33.63, 37.73]],
  "kizoren-r": [[33.28, 38.24], [33.29, 38.2], [33.35, 38.19], [33.37, 38.23], [33.34, 38.27], [33.3, 38.27]],
  alluvial: [[34.3, 37.0], [34.8, 36.8], [35.6, 36.7], [36.3, 36.8], [36.1, 37.1], [35.4, 37.3], [34.7, 37.2]],
  "ataturk-dam": [[38.25, 37.53], [38.3, 37.42], [38.42, 37.39], [38.48, 37.49], [38.4, 37.57], [38.3, 37.59]],
  keban: [[38.72, 38.88], [38.78, 38.72], [38.95, 38.66], [39.03, 38.78], [38.95, 38.93], [38.82, 38.98]],
  karakaya: [[38.42, 38.57], [38.52, 38.43], [38.72, 38.38], [38.82, 38.5], [38.72, 38.63], [38.53, 38.68]],
  hirfanli: [[33.45, 39.23], [33.5, 39.08], [33.7, 39.02], [33.82, 39.14], [33.72, 39.28], [33.55, 39.32]],
  altinkaya: [[35.93, 41.25], [36.0, 41.12], [36.18, 41.08], [36.28, 41.18], [36.17, 41.3], [36.02, 41.34]],
  deriner: [[41.78, 41.23], [41.84, 41.13], [42.0, 41.11], [42.08, 41.2], [41.99, 41.3], [41.84, 41.31]],
  borcka: [[41.64, 41.4], [41.7, 41.32], [41.82, 41.33], [41.86, 41.41], [41.79, 41.48], [41.68, 41.48]],
  ilisu: [[41.73, 37.66], [41.77, 37.49], [42.03, 37.43], [42.16, 37.55], [42.05, 37.7], [41.85, 37.75]],
  avlan: [[29.93, 36.59], [29.96, 36.52], [30.07, 36.52], [30.1, 36.59], [30.04, 36.65], [29.96, 36.64]],
  "kestel-l": [[30.41, 37.43], [30.44, 37.38], [30.51, 37.38], [30.53, 37.42], [30.49, 37.46], [30.43, 37.46]],
  "kovada-l": [[30.82, 37.66], [30.84, 37.59], [30.94, 37.58], [30.98, 37.65], [30.92, 37.71], [30.85, 37.71]],
  "kiziloren-l": [[33.28, 38.24], [33.29, 38.2], [33.35, 38.19], [33.37, 38.23], [33.34, 38.27], [33.3, 38.27]],
  "nemrut-vl": [[42.15, 38.69], [42.18, 38.6], [42.28, 38.58], [42.34, 38.64], [42.3, 38.73], [42.21, 38.75]],
  "meke-vl": [[33.61, 37.7], [33.62, 37.66], [33.68, 37.65], [33.7, 37.69], [33.67, 37.73], [33.63, 37.73]],
  "golcuk-vl": [[30.46, 37.75], [30.47, 37.7], [30.54, 37.69], [30.56, 37.74], [30.52, 37.78], [30.48, 37.78]],
  "bafra-d": [[35.6, 41.5], [35.9, 41.3], [36.3, 41.4], [36.4, 41.7], [36.0, 41.8], [35.7, 41.7]],
  "carsamba-d": [[36.2, 41.2], [36.5, 41.0], [37.0, 41.1], [37.3, 41.4], [36.8, 41.6], [36.3, 41.5]],
  "cukur-d": [[34.3, 37.0], [34.8, 36.8], [35.6, 36.7], [36.3, 36.8], [36.1, 37.1], [35.4, 37.3], [34.7, 37.2]],
  "silifke-d": [[33.6, 36.4], [33.8, 36.2], [34.2, 36.2], [34.4, 36.4], [34.1, 36.6], [33.7, 36.6]],
  "menemen-d": [[26.72, 38.62], [26.82, 38.48], [27.0, 38.42], [27.16, 38.5], [27.06, 38.64], [26.88, 38.69]],
  "selcuk-d": [[27.18, 37.98], [27.25, 37.86], [27.45, 37.84], [27.55, 37.93], [27.46, 38.03], [27.28, 38.05]],
  "balat-d": [[27.12, 37.64], [27.2, 37.48], [27.42, 37.44], [27.55, 37.54], [27.46, 37.67], [27.25, 37.72]],
  "meric-d": [[26.02, 40.78], [26.08, 40.66], [26.25, 40.63], [26.35, 40.71], [26.28, 40.82], [26.1, 40.86]],
  "sultan-sazligi": [[35.15, 38.3], [35.18, 38.15], [35.4, 38.12], [35.48, 38.25], [35.37, 38.36], [35.2, 38.38]],
  "kizilirmak-delta": [[35.6, 41.5], [35.9, 41.3], [36.3, 41.4], [36.4, 41.7], [36.0, 41.8], [35.7, 41.7]],
  "goksu-delta": [[33.6, 36.4], [33.8, 36.2], [34.2, 36.2], [34.4, 36.4], [34.1, 36.6], [33.7, 36.6]],
  "tombolo-kapidag": [[27.756, 40.352], [27.821, 40.343], [27.867, 40.369], [27.842, 40.407], [27.773, 40.408], [27.742, 40.379]],
  "tombolo-sinop": [[35.127, 42.008], [35.168, 42.005], [35.181, 42.019], [35.16, 42.034], [35.13, 42.028]],
};

const AREA_MULTI_POLYGONS: Record<string, Coordinate[][]> = {
  catalca: [
    [[27.45, 41.48], [27.55, 41.08], [28.02, 40.87], [28.72, 40.9], [29.02, 41.18], [28.78, 41.52], [28.18, 41.68], [27.7, 41.65]],
    [[29.05, 41.18], [29.2, 40.78], [29.75, 40.62], [30.35, 40.7], [30.65, 40.98], [30.42, 41.28], [29.82, 41.42], [29.3, 41.38]],
  ],
};

const DISTRIBUTION_POLYGONS: Record<string, Coordinate[][]> = {
  "anzer-tour": [
    [[40.445, 40.565], [40.475, 40.535], [40.535, 40.532], [40.588, 40.56], [40.595, 40.605], [40.55, 40.635], [40.485, 40.632], [40.448, 40.605]],
  ],
  "ayder-tour": [
    [[41.045, 40.94], [41.07, 40.918], [41.118, 40.92], [41.148, 40.945], [41.142, 40.978], [41.108, 40.997], [41.065, 40.988], [41.042, 40.965]],
  ],
  "kadirga-tour": [
    [[39.26, 40.705], [39.29, 40.675], [39.35, 40.67], [39.405, 40.695], [39.412, 40.733], [39.37, 40.765], [39.31, 40.767], [39.268, 40.742]],
  ],
  "persembe-tour": [
    [[37.215, 40.612], [37.255, 40.575], [37.33, 40.572], [37.395, 40.605], [37.4, 40.65], [37.35, 40.682], [37.275, 40.68], [37.222, 40.655]],
  ],
  "gelibolu-tour": [
    [[26.14, 40.03], [26.2, 39.98], [26.31, 40.02], [26.38, 40.14], [26.4, 40.3], [26.34, 40.42], [26.24, 40.39], [26.17, 40.25]],
  ],
  "baskomutan-tour": [
    [[30.23, 38.61], [30.32, 38.55], [30.46, 38.58], [30.55, 38.69], [30.5, 38.8], [30.35, 38.83], [30.24, 38.75]],
    [[29.8, 38.78], [29.9, 38.72], [30.05, 38.75], [30.14, 38.86], [30.08, 38.96], [29.92, 38.98], [29.82, 38.9]],
  ],
  "malazgirt-tour": [
    [[42.43, 39.09], [42.48, 39.055], [42.57, 39.07], [42.61, 39.13], [42.58, 39.2], [42.49, 39.215], [42.43, 39.17]],
  ],
  "sakarya-tour": [
    [[31.94, 39.35], [32.08, 39.24], [32.32, 39.23], [32.58, 39.34], [32.72, 39.52], [32.61, 39.7], [32.34, 39.78], [32.08, 39.68], [31.95, 39.52]],
  ],
  safranbolu: [
    [[32.665, 41.235], [32.68, 41.225], [32.705, 41.23], [32.715, 41.25], [32.702, 41.27], [32.678, 41.27], [32.663, 41.252]],
  ],
  "karacabey-longoz-tour": [
    [[28.25, 40.355], [28.31, 40.325], [28.405, 40.335], [28.475, 40.39], [28.455, 40.45], [28.36, 40.475], [28.275, 40.43]],
  ],
  "igneada-longoz-tour": [
    [[27.9, 41.78], [27.95, 41.745], [28.025, 41.77], [28.055, 41.835], [28.02, 41.9], [27.955, 41.91], [27.91, 41.86]],
  ],
  "izmir-bird-tour": [
    [[26.78, 38.425], [26.84, 38.39], [26.94, 38.405], [27.035, 38.46], [27.025, 38.525], [26.94, 38.57], [26.84, 38.545], [26.79, 38.49]],
  ],
  "kizilirmak-bird-tour": [
    [[35.72, 41.54], [35.84, 41.47], [36.05, 41.48], [36.23, 41.57], [36.25, 41.7], [36.1, 41.78], [35.88, 41.78], [35.72, 41.69]],
  ],
  kapadokya: [
    [[34.62, 38.54], [34.69, 38.48], [34.82, 38.49], [34.96, 38.55], [35.02, 38.65], [34.94, 38.73], [34.78, 38.75], [34.66, 38.68]],
  ],
  pamukkale: [
    [[29.095, 37.89], [29.115, 37.875], [29.145, 37.885], [29.158, 37.915], [29.145, 37.942], [29.112, 37.948], [29.092, 37.925]],
  ],
  "kula-geotour": [
    [[28.14, 38.46], [28.25, 38.4], [28.45, 38.42], [28.66, 38.51], [28.75, 38.64], [28.66, 38.74], [28.45, 38.77], [28.25, 38.68]],
  ],
  "adiyaman-phosphate": [
    [[37.82, 37.735], [37.875, 37.705], [37.95, 37.735], [37.985, 37.79], [37.945, 37.84], [37.87, 37.835]],
    [[38.245, 37.79], [38.285, 37.775], [38.345, 37.8], [38.37, 37.845], [38.33, 37.88], [38.27, 37.865]],
  ],
  "bitlis-phosphate": [
    [[41.87, 38.28], [41.95, 38.16], [42.12, 38.12], [42.3, 38.23], [42.34, 38.42], [42.22, 38.56], [42.03, 38.55], [41.9, 38.43]],
  ],
  "marmara-island-marble": [
    [[27.59, 40.625], [27.625, 40.605], [27.69, 40.615], [27.73, 40.65], [27.705, 40.682], [27.64, 40.692], [27.6, 40.67]],
  ],
  "balikesir-marble": [
    [[27.82, 40.025], [27.865, 39.965], [27.96, 39.94], [28.06, 39.975], [28.1, 40.045], [28.045, 40.105], [27.94, 40.125], [27.85, 40.09]],
  ],
  "bursa-marble": [
    [[29.04, 40.405], [29.09, 40.365], [29.18, 40.37], [29.235, 40.42], [29.205, 40.475], [29.115, 40.495], [29.055, 40.46]],
    [[28.88, 39.9], [28.92, 39.84], [29.02, 39.815], [29.085, 39.86], [29.075, 39.93], [29.0, 39.985], [28.91, 39.965]],
  ],
  "bilecik-marble": [
    [[29.94, 39.89], [29.99, 39.845], [30.105, 39.86], [30.225, 39.955], [30.255, 40.025], [30.19, 40.07], [30.075, 40.03], [29.98, 39.96]],
  ],
  "mugla-marble": [
    [[27.68, 37.29], [27.735, 37.235], [27.84, 37.25], [27.9, 37.315], [27.865, 37.37], [27.76, 37.39], [27.695, 37.35]],
    [[28.04, 37.325], [28.085, 37.285], [28.175, 37.3], [28.215, 37.36], [28.17, 37.41], [28.085, 37.4]],
    [[28.275, 37.42], [28.32, 37.38], [28.41, 37.395], [28.455, 37.45], [28.42, 37.51], [28.33, 37.515], [28.285, 37.475]],
  ],
  "afyon-mermer": [
    [[30.65, 38.845], [30.69, 38.79], [30.78, 38.795], [30.855, 38.84], [30.84, 38.9], [30.765, 38.94], [30.68, 38.915]],
  ],
  "burdur-marble": [
    [[30.49, 37.445], [30.535, 37.39], [30.625, 37.385], [30.69, 37.435], [30.675, 37.5], [30.605, 37.54], [30.525, 37.515]],
  ],
  "denizli-marble": [
    [[29.16, 37.765], [29.215, 37.7], [29.32, 37.69], [29.43, 37.745], [29.49, 37.82], [29.44, 37.88], [29.33, 37.9], [29.22, 37.86]],
  ],
  "oltu-stone": [
    [[42.015, 40.605], [42.045, 40.575], [42.115, 40.585], [42.17, 40.625], [42.145, 40.685], [42.08, 40.705], [42.025, 40.67]],
  ],
  "eskisehir-meerschaum": [
    [[30.205, 39.722], [30.225, 39.705], [30.275, 39.716], [30.282, 39.755], [30.252, 39.782], [30.212, 39.765]],
    [[30.81, 39.89], [30.84, 39.876], [30.885, 39.9], [30.878, 39.94], [30.842, 39.953], [30.812, 39.93]],
    [[30.745, 39.65], [30.782, 39.64], [30.82, 39.67], [30.812, 39.71], [30.775, 39.722], [30.742, 39.692]],
  ],
  "catalca-kocaeli-pop": [
    [[27.45, 41.55], [28.35, 41.38], [29.15, 41.18], [30.15, 41.18], [30.82, 40.92], [30.55, 40.55], [29.55, 40.62], [28.65, 40.78], [27.8, 40.92]],
  ],
  "coastal-aegean-pop": [
    [[26.65, 39.42], [27.18, 39.34], [27.78, 39.15], [28.15, 39.2], [28.0, 38.94], [27.42, 38.88], [26.82, 39.03]],
    [[26.65, 38.72], [27.22, 38.66], [28.2, 38.4], [28.72, 38.48], [28.48, 38.17], [27.68, 38.22], [26.85, 38.44]],
    [[26.85, 38.22], [27.32, 38.05], [28.42, 37.72], [29.12, 37.65], [28.78, 37.36], [27.85, 37.55], [27.08, 37.82]],
  ],
  "antalya-pop": [
    [[30.2, 36.94], [30.45, 36.62], [30.93, 36.5], [31.3, 36.63], [31.18, 36.94], [30.75, 37.08], [30.35, 37.08]],
  ],
  "ankara-eskisehir-pop": [
    [[29.75, 39.95], [30.18, 39.52], [30.78, 39.38], [31.2, 39.62], [30.92, 39.98], [30.25, 40.08]],
    [[31.55, 40.12], [32.15, 39.72], [33.08, 39.58], [33.82, 39.82], [33.62, 40.18], [32.72, 40.3], [31.95, 40.28]],
  ],
  "cukurova-gaziantep-pop": [
    [[34.18, 37.15], [34.7, 36.82], [35.55, 36.67], [36.25, 36.82], [36.15, 37.15], [35.42, 37.35], [34.65, 37.32]],
    [[36.55, 37.45], [36.92, 36.88], [37.72, 36.72], [38.35, 36.98], [38.15, 37.48], [37.45, 37.68], [36.82, 37.68]],
  ],
  "middle-east-black-sea-pop": [
    [[34.75, 41.48], [35.55, 41.63], [36.45, 41.55], [37.35, 41.28], [37.18, 40.98], [36.32, 41.1], [35.48, 41.22]],
    [[37.3, 41.3], [38.28, 41.42], [39.42, 41.2], [40.45, 41.08], [41.55, 41.28], [41.38, 40.9], [40.35, 40.72], [39.28, 40.88], [38.2, 41.0]],
  ],
  "yildiz-pop": [
    [[25.9, 41.72], [26.45, 42.08], [27.45, 42.1], [28.55, 41.92], [29.0, 41.45], [28.28, 41.18], [27.35, 41.27], [26.45, 41.35]],
  ],
  "canakkale-pop": [
    [[25.7, 40.45], [26.05, 39.82], [26.72, 39.42], [27.5, 39.55], [27.62, 40.05], [27.15, 40.52], [26.4, 40.72]],
  ],
  "sinop-pop": [
    [[34.2, 41.62], [34.65, 41.98], [35.25, 42.12], [35.82, 41.82], [35.68, 41.45], [35.05, 41.35], [34.45, 41.42]],
  ],
  "mentese-pop": [
    [[27.25, 37.52], [27.72, 36.82], [28.48, 36.42], [29.2, 36.58], [29.35, 37.18], [28.92, 37.72], [28.15, 37.88], [27.55, 37.82]],
  ],
  "teke-pop": [
    [[28.85, 37.32], [29.18, 36.65], [29.72, 36.25], [30.35, 36.25], [30.52, 36.58], [30.15, 37.05], [29.72, 37.5], [29.18, 37.52]],
  ],
  "taseli-pop": [
    [[31.18, 37.22], [31.7, 36.48], [32.55, 36.08], [33.72, 36.05], [34.35, 36.38], [34.02, 36.85], [33.2, 37.22], [32.18, 37.42]],
  ],
  "tuz-lake-pop": [
    [[32.35, 39.08], [32.72, 38.38], [33.42, 37.92], [34.18, 38.08], [34.72, 38.62], [34.45, 39.18], [33.65, 39.52], [32.88, 39.45]],
  ],
  "erzurum-kars-pop": [
    [[39.9, 40.82], [40.35, 39.82], [41.18, 39.35], [42.25, 39.32], [43.38, 39.72], [43.85, 40.48], [43.45, 41.18], [42.55, 41.52], [41.38, 41.42], [40.48, 41.22]],
  ],
  "hakkari-pop": [
    [[41.95, 37.82], [42.42, 37.18], [43.18, 36.75], [44.2, 36.58], [44.82, 36.92], [44.48, 37.5], [43.78, 37.88], [42.85, 38.05]],
  ],
  wheat: [
    [[31.0, 38.95], [31.6, 37.75], [32.8, 37.35], [34.2, 37.7], [34.55, 38.55], [33.7, 39.05], [32.2, 39.2]],
    [[31.25, 40.25], [31.8, 39.45], [32.8, 39.15], [33.75, 39.5], [33.55, 40.2], [32.55, 40.5]],
    [[38.9, 38.75], [39.35, 37.75], [40.45, 37.3], [41.5, 37.65], [41.4, 38.45], [40.45, 38.95], [39.45, 39.0]],
  ],
  "barley-ag": [
    [[31.2, 39.0], [31.75, 37.85], [32.9, 37.45], [34.0, 37.8], [34.25, 38.55], [33.4, 38.95], [32.1, 39.15]],
    [[31.45, 40.15], [31.85, 39.5], [32.75, 39.25], [33.55, 39.55], [33.35, 40.15], [32.5, 40.38]],
    [[37.4, 37.55], [37.8, 36.8], [38.9, 36.55], [40.0, 36.8], [39.8, 37.45], [38.8, 37.75]],
  ],
  corn: [
    [[34.25, 37.18], [34.75, 36.75], [35.65, 36.62], [36.35, 36.82], [36.12, 37.22], [35.35, 37.38], [34.62, 37.35]],
    [[35.85, 36.72], [36.05, 36.25], [36.65, 36.1], [36.95, 36.45], [36.65, 36.82], [36.2, 36.88]],
    [[37.25, 37.55], [37.7, 36.85], [38.85, 36.55], [40.05, 36.85], [39.75, 37.45], [38.7, 37.72]],
    [[26.75, 38.75], [27.15, 37.85], [28.25, 37.55], [29.0, 37.9], [28.62, 38.55], [27.65, 38.85]],
    [[35.55, 41.7], [35.9, 41.25], [36.65, 41.05], [37.25, 41.3], [36.9, 41.65], [36.15, 41.82]],
  ],
  rice: [
    [[25.75, 41.75], [26.0, 40.75], [26.75, 40.55], [27.0, 41.15], [26.7, 41.75]],
    [[35.55, 41.72], [35.9, 41.25], [36.65, 41.1], [37.15, 41.42], [36.75, 41.72], [36.05, 41.82]],
    [[27.15, 40.4], [27.55, 39.75], [28.25, 39.7], [28.6, 40.1], [28.18, 40.45], [27.55, 40.55]],
  ],
  "chickpea-ag": [
    [[32.0, 40.05], [32.35, 39.25], [33.1, 38.95], [33.85, 39.25], [33.7, 39.9], [33.0, 40.2]],
    [[33.3, 39.75], [33.65, 38.95], [34.45, 38.65], [35.15, 39.0], [35.0, 39.65], [34.2, 39.95]],
  ],
  "bean-ag": [
    [[31.2, 38.75], [31.75, 37.75], [32.8, 37.4], [33.6, 37.85], [33.35, 38.65], [32.35, 39.0]],
    [[33.75, 38.25], [34.05, 37.45], [34.8, 37.2], [35.25, 37.72], [34.95, 38.3], [34.3, 38.48]],
  ],
  lentil: [
    [[38.85, 38.8], [39.3, 37.75], [40.4, 37.25], [41.5, 37.6], [41.35, 38.45], [40.35, 38.92], [39.35, 39.0]],
    [[34.25, 40.15], [34.55, 39.25], [35.45, 38.95], [36.2, 39.4], [36.0, 40.0], [35.1, 40.3]],
  ],
  tobacco: [
    [[27.35, 39.2], [27.75, 38.45], [28.65, 38.15], [29.25, 38.55], [28.95, 39.15], [28.1, 39.4]],
    [[28.45, 38.2], [28.85, 37.35], [29.75, 37.1], [30.25, 37.7], [29.9, 38.25], [29.05, 38.48]],
    [[37.65, 38.15], [38.05, 37.45], [38.85, 37.25], [39.35, 37.8], [39.0, 38.3], [38.3, 38.5]],
    [[35.55, 41.65], [35.95, 41.15], [36.65, 41.05], [37.1, 41.38], [36.75, 41.72], [36.05, 41.8]],
  ],
  sugarbeet: [
    [[30.0, 40.05], [30.4, 39.25], [31.25, 39.0], [31.8, 39.45], [31.55, 40.1], [30.75, 40.3]],
    [[31.25, 38.9], [31.8, 37.75], [32.95, 37.4], [34.15, 37.8], [34.25, 38.65], [33.3, 39.05], [32.1, 39.1]],
    [[34.2, 40.2], [34.6, 39.25], [35.5, 39.0], [36.25, 39.45], [36.0, 40.1], [35.1, 40.35]],
  ],
  cotton: [
    [[37.3, 37.55], [37.75, 36.8], [38.9, 36.55], [40.15, 36.85], [39.8, 37.5], [38.75, 37.78]],
    [[34.25, 37.15], [34.75, 36.75], [35.65, 36.62], [36.35, 36.82], [36.1, 37.2], [35.35, 37.38], [34.6, 37.35]],
    [[26.7, 38.72], [27.1, 37.85], [28.2, 37.55], [29.0, 37.9], [28.65, 38.55], [27.65, 38.85]],
    [[43.4, 40.15], [43.7, 39.65], [44.5, 39.55], [44.85, 39.9], [44.5, 40.2], [43.8, 40.32]],
  ],
  sunflower: [
    [[25.7, 42.05], [26.1, 40.75], [27.2, 40.45], [28.3, 40.65], [29.1, 41.2], [28.75, 41.85], [27.5, 42.1], [26.4, 42.2]],
    [[31.35, 38.9], [31.8, 37.85], [32.9, 37.5], [34.0, 37.85], [34.15, 38.65], [33.25, 39.0], [32.1, 39.1]],
  ],
  "peanut-ag": [
    [[34.35, 37.2], [34.8, 36.72], [35.7, 36.62], [36.55, 36.9], [36.25, 37.35], [35.4, 37.5], [34.65, 37.42]],
  ],
  "soybean-ag": [
    [[33.9, 37.15], [34.45, 36.68], [35.5, 36.55], [36.35, 36.78], [36.1, 37.2], [35.1, 37.38], [34.3, 37.35]],
    [[35.55, 41.68], [35.9, 41.2], [36.65, 41.08], [37.2, 41.38], [36.8, 41.7], [36.05, 41.82]],
  ],
  olive: [
    [[26.2, 39.8], [26.65, 38.2], [27.55, 37.1], [28.55, 36.75], [29.0, 37.25], [28.55, 38.1], [27.9, 39.15], [27.0, 40.0]],
    [[27.2, 40.55], [27.5, 39.65], [28.45, 39.4], [29.25, 39.85], [29.1, 40.45], [28.25, 40.75]],
  ],
  hazelnut: [
    [[30.2, 41.35], [31.0, 41.55], [32.0, 41.45], [33.0, 41.25], [33.0, 40.85], [32.0, 40.85], [31.0, 41.0], [30.3, 41.05]],
    [[36.7, 41.25], [37.6, 41.4], [38.7, 41.2], [39.6, 41.0], [39.45, 40.65], [38.5, 40.72], [37.6, 40.9], [36.8, 40.95]],
  ],
  tea: [
    [[39.45, 41.15], [40.25, 41.28], [41.15, 41.2], [42.05, 41.45], [42.0, 41.05], [41.15, 40.75], [40.2, 40.82], [39.5, 40.9]],
  ],
  grape: [
    [[27.2, 39.25], [27.65, 38.45], [28.65, 38.2], [29.25, 38.65], [28.9, 39.25], [28.0, 39.45]],
    [[28.45, 38.2], [28.9, 37.35], [29.8, 37.15], [30.25, 37.75], [29.9, 38.3], [29.05, 38.5]],
    [[33.75, 36.85], [34.15, 36.3], [34.9, 36.1], [35.35, 36.55], [35.05, 36.95], [34.35, 37.05]],
  ],
  pistachio: [
    [[36.55, 37.6], [36.95, 36.85], [37.95, 36.62], [38.55, 37.05], [38.2, 37.65], [37.3, 37.85]],
    [[37.85, 37.45], [38.3, 36.7], [39.45, 36.58], [40.15, 37.0], [39.75, 37.55], [38.75, 37.75]],
  ],
  citrus: [
    [[26.4, 38.9], [26.8, 37.8], [27.8, 36.85], [29.0, 36.35], [29.2, 36.75], [28.45, 37.45], [27.6, 38.45], [26.85, 39.3]],
    [[29.0, 36.65], [30.2, 36.2], [31.8, 36.05], [33.4, 36.0], [35.0, 36.15], [36.65, 36.05], [36.7, 36.55], [35.2, 36.8], [33.5, 36.55], [31.8, 36.65], [30.25, 36.85]],
    [[40.25, 41.2], [40.65, 40.95], [41.2, 40.9], [41.35, 41.15], [40.9, 41.35], [40.4, 41.35]],
  ],
  banana: [
    [[31.7, 36.35], [32.3, 36.05], [33.2, 36.0], [34.2, 36.15], [34.0, 36.5], [33.1, 36.55], [32.2, 36.65]],
  ],
  apricot: [
    [[37.85, 38.65], [38.05, 38.2], [38.7, 38.05], [39.1, 38.4], [38.8, 38.75], [38.2, 38.85]],
  ],
  fig: [
    [[27.05, 38.05], [27.35, 37.45], [28.15, 37.25], [28.75, 37.65], [28.45, 38.15], [27.65, 38.32]],
  ],
  apple: [
    [[30.05, 38.15], [30.3, 37.55], [31.0, 37.35], [31.45, 37.8], [31.1, 38.25], [30.5, 38.4]],
  ],
  "sheep-livestock": [
    [[28.7, 40.45], [29.5, 39.35], [30.9, 38.45], [32.3, 37.55], [34.4, 37.45], [36.2, 38.1], [36.75, 39.15], [35.8, 40.1], [33.8, 40.65], [31.5, 40.75]],
    [[35.8, 39.7], [37.15, 38.55], [38.2, 37.25], [40.15, 36.65], [41.65, 37.25], [41.4, 38.55], [40.2, 39.45], [38.1, 40.05]],
  ],
  "angora-goat": [
    [[30.2, 40.25], [31.15, 39.25], [33.25, 38.55], [35.7, 38.8], [36.2, 39.65], [34.7, 40.35], [32.25, 40.7]],
    [[36.55, 38.1], [37.2, 36.85], [39.4, 36.45], [41.45, 37.05], [41.0, 38.1], [39.0, 38.65]],
  ],
  "pasture-cattle": [
    [[39.15, 41.35], [40.2, 39.85], [41.55, 39.2], [43.2, 39.45], [44.2, 40.25], [43.35, 41.45], [41.55, 41.75], [40.1, 41.65]],
  ],
  "stable-cattle": [
    [[26.0, 41.95], [27.4, 40.35], [29.7, 40.25], [30.65, 41.15], [29.2, 42.05], [27.1, 42.2]],
    [[26.3, 39.75], [27.0, 37.65], [29.25, 36.65], [30.15, 37.55], [29.25, 39.05], [27.7, 40.0]],
    [[29.1, 36.55], [30.9, 36.1], [33.35, 36.0], [35.7, 36.55], [36.5, 37.2], [34.55, 37.55], [32.2, 37.35], [30.25, 37.55]],
    [[29.7, 40.35], [31.25, 38.15], [34.4, 37.5], [36.25, 38.45], [35.55, 40.2], [33.05, 40.8], [31.0, 40.7]],
  ],
  poultry: [
    [[31.15, 41.05], [31.35, 40.55], [32.0, 40.45], [32.25, 40.85], [31.85, 41.15]],
    [[29.85, 41.2], [30.05, 40.55], [30.75, 40.45], [31.05, 40.85], [30.65, 41.2]],
    [[27.25, 40.25], [27.45, 39.45], [28.35, 39.25], [28.75, 39.85], [28.25, 40.35]],
    [[27.35, 39.25], [27.65, 38.25], [28.65, 38.05], [29.15, 38.7], [28.7, 39.25]],
  ],
  silkworm: [
    [[28.55, 40.55], [28.7, 39.9], [29.45, 39.75], [29.8, 40.25], [29.4, 40.65]],
    [[30.05, 37.25], [30.25, 36.55], [31.1, 36.35], [31.35, 36.9], [30.9, 37.35]],
    [[39.55, 38.5], [39.75, 37.6], [40.65, 37.35], [41.05, 38.0], [40.6, 38.55]],
    [[37.8, 37.7], [38.1, 36.75], [39.2, 36.5], [39.65, 37.15], [39.15, 37.75]],
  ],
  beekeeping: [
    [[42.35, 41.35], [42.55, 40.35], [43.55, 40.15], [44.05, 40.75], [43.55, 41.45]],
    [[41.45, 38.95], [41.7, 38.05], [42.65, 37.8], [43.05, 38.4], [42.55, 39.0]],
    [[42.9, 38.0], [43.15, 37.05], [44.25, 36.7], [44.65, 37.35], [44.05, 38.0]],
    [[39.7, 41.45], [39.9, 40.75], [41.0, 40.65], [41.45, 41.15], [40.85, 41.5]],
    [[37.05, 41.35], [37.25, 40.65], [38.25, 40.55], [38.65, 41.05], [38.1, 41.4]],
    [[31.75, 40.35], [32.05, 39.45], [33.35, 39.25], [33.8, 40.0], [33.15, 40.55]],
    [[27.35, 37.75], [27.75, 36.65], [28.95, 36.25], [29.45, 36.95], [28.8, 37.85]],
    [[40.2, 40.65], [40.55, 39.45], [41.8, 39.1], [42.35, 39.95], [41.65, 40.75]],
    [[31.35, 38.75], [31.75, 37.55], [33.3, 37.25], [34.0, 38.05], [33.35, 38.85]],
  ],
  "sea-fishing": [
    [[25.8, 42.15], [29.0, 42.15], [32.0, 41.85], [35.5, 41.95], [38.7, 41.55], [41.8, 41.6], [41.5, 40.72], [38.55, 40.75], [35.4, 41.0], [32.0, 40.95], [29.1, 41.05], [26.0, 41.25]],
    [[26.0, 41.25], [27.2, 40.2], [29.3, 40.2], [30.65, 40.65], [30.55, 41.25], [28.7, 41.45], [27.0, 41.6]],
  ],
  "freshwater-fishing": [
    [[30.68, 38.18], [30.73, 37.75], [31.0, 37.7], [31.06, 38.15]],
    [[31.35, 38.0], [31.4, 37.45], [31.82, 37.42], [31.9, 37.95]],
    [[42.95, 41.22], [43.05, 40.85], [43.45, 40.82], [43.5, 41.15]],
    [[29.25, 40.62], [29.3, 40.25], [29.85, 40.22], [29.9, 40.58]],
    [[28.35, 40.4], [28.4, 40.05], [29.0, 40.02], [29.05, 40.35]],
  ],
  "kalankli-teke-taseli": [
    [[29.1, 36.35], [29.8, 36.05], [30.7, 36.0], [31.2, 36.2], [30.6, 36.45], [29.8, 36.55]],
    [[31.8, 36.2], [32.8, 36.0], [34.4, 36.0], [34.7, 36.25], [33.4, 36.45], [32.3, 36.5]],
  ],
  "karadeniz-cl": [
    [[26.6, 41.9], [29.2, 41.8], [32.4, 41.8], [35.7, 41.8], [38.8, 41.4], [41.8, 41.4], [41.5, 40.5], [38.8, 40.4], [35.5, 40.7], [32.0, 40.7], [29.0, 40.8], [27.0, 41.1]],
  ],
  "akdeniz-cl": [
    [[26.05, 40.15], [26.25, 39.2], [26.55, 38.2], [27.25, 37.25], [28.35, 36.55], [29.25, 36.2], [29.85, 36.42], [29.48, 37.3], [28.88, 38.1], [28.2, 39.15], [27.25, 40.05]],
    [[29.05, 36.35], [30.7, 35.95], [32.6, 35.85], [34.5, 36.0], [35.75, 36.55], [36.75, 36.02], [36.92, 36.88], [35.85, 37.18], [34.15, 37.08], [32.25, 37.18], [30.45, 37.45], [29.4, 37.15]],
    [[26.05, 40.0], [27.4, 40.2], [28.7, 40.55], [30.15, 40.55], [30.25, 41.0], [28.8, 41.1], [27.25, 40.85], [26.15, 40.65]],
    [[27.1, 39.3], [28.0, 39.25], [29.15, 38.95], [30.35, 38.2], [30.55, 37.25], [29.7, 37.1], [28.8, 37.55], [27.75, 38.25]],
    [[36.05, 37.65], [36.65, 37.75], [37.45, 37.55], [38.15, 37.2], [38.05, 36.7], [37.35, 36.75], [36.55, 36.95]],
  ],
  "karasal-cl": [
    [[29.55, 40.0], [31.7, 40.65], [34.45, 40.65], [37.1, 40.35], [39.65, 39.75], [39.45, 37.65], [37.9, 37.25], [36.2, 37.45], [34.0, 37.55], [31.45, 37.75], [29.55, 38.75]],
    [[38.7, 39.55], [40.0, 39.7], [41.1, 39.15], [42.7, 38.8], [44.4, 39.35], [44.55, 37.35], [42.75, 37.0], [40.35, 37.05], [38.55, 37.55]],
  ],
  "sert-karasal-cl": [
    [[39.45, 41.45], [40.55, 41.78], [42.2, 41.8], [43.65, 41.42], [44.75, 40.55], [44.45, 39.15], [43.0, 39.0], [41.45, 39.28], [40.05, 39.75]],
  ],
  "forest-black": [
    [[27.0, 41.8], [30.0, 41.8], [33.0, 41.8], [36.0, 41.7], [39.0, 41.4], [42.0, 41.4], [41.5, 40.4], [39.0, 40.3], [36.0, 40.6], [33.0, 40.5], [30.0, 40.6], [27.2, 40.9]],
  ],
  "forest-med": [
    [[29.0, 37.45], [30.5, 37.65], [32.0, 37.45], [33.8, 37.35], [35.5, 37.65], [36.65, 37.35], [36.3, 36.8], [34.7, 36.75], [32.8, 36.9], [31.0, 37.0], [29.5, 36.9]],
  ],
  "forest-west": [
    [[26.55, 40.0], [27.5, 40.2], [28.3, 39.75], [28.0, 39.25], [27.0, 39.35]],
    [[28.65, 40.4], [29.35, 40.4], [29.65, 39.85], [29.15, 39.55], [28.6, 39.8]],
    [[27.2, 39.2], [28.4, 39.1], [29.3, 38.5], [29.0, 37.8], [28.1, 37.9], [27.3, 38.4]],
  ],
  "forest-interior": [
    [[30.2, 40.25], [33.0, 40.45], [35.7, 40.2], [35.4, 39.75], [32.9, 39.85], [30.5, 39.8]],
    [[30.5, 37.5], [32.5, 37.2], [34.8, 37.25], [35.3, 37.75], [33.0, 38.05], [31.0, 37.95]],
    [[38.0, 39.2], [40.0, 39.55], [41.2, 39.2], [40.8, 38.65], [39.0, 38.65]],
    [[41.7, 41.1], [43.4, 41.4], [43.7, 40.5], [42.3, 39.9], [41.5, 40.25]],
  ],
  maquis: [
    [[26.0, 39.5], [26.7, 38.0], [28.2, 36.8], [29.5, 36.2], [29.8, 37.2], [28.8, 37.9], [27.8, 39.5]],
    [[29.2, 36.2], [31.5, 35.9], [34.0, 36.0], [36.7, 36.0], [36.8, 36.8], [35.2, 37.1], [33.2, 37.0], [31.0, 37.3], [29.6, 37.1]],
  ],
  "garig-veg": [
    [[26.0, 39.55], [26.65, 38.25], [27.65, 37.1], [28.7, 36.55], [29.25, 36.35], [29.35, 36.75], [28.5, 37.25], [27.8, 38.2], [27.2, 39.3]],
    [[29.2, 36.35], [30.4, 36.0], [31.8, 35.9], [32.2, 36.2], [31.4, 36.45], [30.0, 36.55]],
    [[32.6, 36.05], [34.2, 35.95], [35.7, 36.35], [36.55, 36.05], [36.7, 36.45], [35.5, 36.75], [33.7, 36.55]],
  ],
  "pseudomaquis-veg": [
    [[27.0, 41.72], [29.8, 41.72], [32.6, 41.72], [35.6, 41.65], [38.8, 41.35], [41.6, 41.35], [41.45, 40.95], [38.7, 40.95], [35.5, 41.15], [32.4, 41.12], [29.7, 41.1], [27.1, 41.25]],
  ],
  step: [
    [[29.8, 40.0], [32.0, 40.4], [35.2, 40.2], [38.2, 39.7], [41.3, 39.2], [42.0, 37.6], [39.5, 37.2], [36.5, 37.5], [33.8, 37.6], [31.2, 38.0], [29.5, 38.8]],
  ],
  meadow: [
    [[39.5, 41.2], [42.8, 41.7], [44.5, 40.8], [44.7, 39.1], [42.4, 39.1], [40.4, 39.8]],
  ],
  "alpine-meadow-veg": [
    [[30.0, 40.85], [33.0, 41.25], [36.0, 41.05], [39.0, 40.65], [41.3, 40.85], [41.1, 40.45], [38.8, 40.2], [35.8, 40.45], [32.8, 40.55], [30.2, 40.45]],
    [[29.2, 37.55], [31.5, 37.25], [34.0, 37.05], [36.2, 37.2], [36.0, 36.8], [33.7, 36.55], [31.2, 36.75], [29.4, 37.05]],
  ],
  "anthro-step": [
    [[27.8, 40.2], [29.3, 40.6], [31.3, 40.2], [32.0, 39.0], [30.9, 38.5], [28.9, 38.7], [27.5, 39.4]],
  ],
  "terra-rossa": [
    [[27.6, 37.2], [29.3, 36.2], [31.6, 35.9], [34.1, 36.0], [36.7, 36.0], [36.8, 36.8], [34.8, 37.2], [32.5, 37.1], [30.2, 37.5], [28.6, 38.0]],
  ],
  "brown-forest": [
    [[27.0, 41.8], [30.3, 41.8], [33.5, 41.8], [36.7, 41.7], [39.8, 41.4], [42.0, 41.2], [41.4, 40.3], [38.6, 40.3], [35.6, 40.5], [32.5, 40.5], [29.5, 40.5], [27.1, 40.8]],
  ],
  cherno: [
    [[40.5, 41.5], [42.5, 41.8], [44.3, 41.2], [44.2, 39.8], [42.4, 39.5], [40.7, 40.0]],
  ],
  chestnut: [
    [[29.7, 40.0], [32.0, 40.6], [35.2, 40.4], [37.3, 39.9], [37.5, 38.5], [35.5, 37.7], [32.4, 37.8], [30.2, 38.6]],
  ],
  "brown-step": [
    [[31.0, 39.0], [33.3, 39.7], [36.8, 39.5], [40.0, 38.8], [42.6, 38.0], [42.5, 36.9], [39.5, 36.8], [36.3, 37.1], [33.2, 37.3], [31.0, 38.0]],
  ],
  "podzol-soil": [
    [[29.3, 41.35], [31.4, 41.6], [33.2, 41.65], [33.0, 41.2], [31.3, 41.05], [29.5, 41.05]],
    [[38.2, 41.2], [39.7, 41.45], [41.3, 41.35], [41.0, 40.85], [39.5, 40.75], [38.3, 40.9]],
  ],
  "hydromorphic-soil": [
    [[28.58, 36.86], [28.7, 36.82], [28.78, 36.9], [28.7, 36.99], [28.57, 36.96]],
    [[29.82, 38.18], [30.02, 38.12], [30.16, 38.23], [30.03, 38.35], [29.82, 38.31]],
    [[35.15, 38.12], [35.48, 38.12], [35.52, 38.36], [35.2, 38.4], [35.1, 38.27]],
    [[31.22, 40.62], [31.36, 40.61], [31.42, 40.71], [31.31, 40.78], [31.2, 40.72]],
  ],
  "halomorphic-soil": [
    [[30.0, 37.66], [30.35, 37.55], [30.53, 37.74], [30.35, 37.92], [30.05, 37.88]],
    [[29.68, 37.76], [29.95, 37.7], [30.03, 37.9], [29.83, 38.02], [29.62, 37.94]],
    [[40.8, 39.82], [41.35, 39.72], [41.55, 39.95], [41.22, 40.14], [40.84, 40.05]],
    [[43.82, 39.74], [44.42, 39.72], [44.55, 40.05], [44.15, 40.22], [43.8, 40.08]],
  ],
  "rendzina-soil": [
    [[27.0, 39.2], [28.3, 39.25], [29.2, 38.72], [28.75, 38.15], [27.35, 38.25]],
    [[32.0, 39.9], [33.8, 40.05], [35.0, 39.4], [34.45, 38.65], [32.4, 38.75]],
    [[39.0, 39.3], [40.6, 39.35], [41.5, 38.8], [40.8, 38.2], [39.2, 38.35]],
  ],
  "vertisol-soil": [
    [[26.0, 42.0], [27.7, 42.0], [28.0, 41.35], [26.8, 40.95], [26.0, 41.25]],
    [[41.0, 39.1], [42.0, 39.2], [42.4, 38.6], [41.6, 38.3], [40.9, 38.55]],
    [[27.0, 38.6], [27.35, 38.45], [27.6, 38.55], [27.4, 38.78], [27.05, 38.78]],
    [[31.8, 38.5], [33.2, 38.6], [34.2, 37.9], [33.5, 37.2], [32.0, 37.35]],
  ],
  "alluvial-soil": [
    [[34.25, 37.05], [35.0, 36.68], [36.15, 36.68], [36.35, 37.1], [35.35, 37.35], [34.55, 37.28]],
    [[35.58, 41.5], [36.0, 41.3], [36.4, 41.45], [36.25, 41.78], [35.7, 41.75]],
    [[36.2, 41.22], [36.65, 41.0], [37.25, 41.2], [37.05, 41.58], [36.42, 41.55]],
    [[26.72, 38.62], [27.0, 38.42], [27.18, 38.54], [27.05, 38.72], [26.82, 38.72]],
    [[36.45, 40.55], [37.0, 40.5], [37.2, 40.8], [36.8, 40.95], [36.4, 40.82]],
    [[41.05, 38.9], [42.05, 39.05], [42.25, 38.55], [41.5, 38.3], [40.95, 38.55]],
    [[38.95, 39.9], [39.65, 39.9], [39.82, 39.55], [39.2, 39.35], [38.8, 39.58]],
  ],
  "colluvial-soil": [
    [[27.2, 38.2], [28.0, 38.1], [28.3, 37.75], [27.65, 37.62], [27.1, 37.82]],
    [[28.0, 38.75], [29.2, 38.65], [29.45, 38.25], [28.5, 38.18], [27.9, 38.42]],
    [[29.0, 37.2], [31.3, 36.2], [33.5, 36.0], [35.8, 36.45], [35.5, 36.85], [33.2, 36.55], [31.0, 36.72], [29.3, 37.55]],
  ],
  "lithosol-soil": [
    [[30.0, 40.7], [33.0, 41.2], [36.5, 40.9], [39.2, 40.5], [38.8, 40.0], [35.8, 40.15], [32.8, 40.2], [30.2, 40.25]],
    [[29.2, 37.25], [31.2, 36.4], [34.0, 36.1], [36.8, 36.3], [36.2, 37.0], [33.5, 36.75], [31.0, 37.1]],
    [[38.5, 39.0], [40.5, 38.6], [42.8, 37.5], [44.2, 37.4], [43.5, 38.2], [41.2, 39.0], [39.2, 39.5]],
  ],
  "regosol-soil": [
    [[28.25, 38.8], [28.75, 38.75], [28.82, 38.4], [28.35, 38.35]],
    [[34.2, 39.1], [35.2, 39.0], [35.5, 38.2], [34.5, 37.75], [33.8, 38.25]],
    [[42.2, 40.0], [44.3, 40.15], [44.5, 39.1], [42.6, 38.75], [41.8, 39.3]],
  ],
  "loess-soil": [
    [[37.1, 37.65], [38.3, 37.5], [39.6, 37.55], [40.7, 37.2], [40.4, 36.7], [38.9, 36.55], [37.4, 36.8]],
  ],
  "moraine-soil": [
    [[43.9, 39.9], [44.45, 39.85], [44.55, 39.5], [44.1, 39.4]],
    [[43.0, 37.75], [44.1, 37.75], [44.0, 37.25], [43.2, 37.2]],
    [[40.2, 41.2], [41.2, 41.15], [41.05, 40.75], [40.3, 40.72]],
    [[34.8, 37.9], [35.8, 37.85], [35.7, 37.35], [35.0, 37.28]],
  ],
  goat: [
    [[29.1, 36.5], [31.0, 36.1], [33.2, 36.2], [35.0, 36.6], [36.5, 36.4], [36.7, 37.1], [35.0, 37.5], [33.0, 37.3], [31.0, 37.5], [29.4, 37.2]],
  ],
  "chrome-sivas-kop": [
    [[37.3, 40.05], [38.2, 39.25], [39.7, 39.2], [40.9, 39.65], [40.75, 40.4], [39.2, 40.65], [37.8, 40.55]],
  ],
  "chrome-fethiye-denizli": [
    [[28.15, 37.85], [28.55, 36.55], [29.55, 36.35], [30.15, 37.15], [29.75, 38.05], [28.8, 38.35]],
  ],
  "chrome-mersin-kayseri": [
    [[33.15, 38.75], [33.55, 36.2], [35.4, 36.25], [36.25, 37.5], [35.85, 38.85], [34.45, 39.2]],
  ],
  "chrome-bursa-eskisehir": [
    [[28.35, 40.55], [28.9, 39.05], [30.05, 38.65], [31.35, 39.15], [31.2, 40.35], [30.0, 40.7]],
  ],
  "chrome-iskenderun-gaziantep": [
    [[35.75, 37.45], [35.95, 36.45], [37.1, 36.35], [37.95, 36.95], [37.55, 37.65], [36.45, 37.75]],
  ],
  "east-black-sea-lead-zinc": [
    [[37.4, 41.3], [38.7, 41.45], [40.1, 41.2], [41.5, 41.45], [41.35, 40.75], [39.9, 40.65], [38.5, 40.85], [37.5, 40.9]],
  ],
  "payas-mine": [
    [[36.16, 36.66], [36.31, 36.61], [36.47, 36.73], [36.46, 37.02], [36.31, 37.08], [36.18, 36.94]],
    [[36.48, 36.96], [36.72, 36.84], [37.0, 36.91], [37.08, 37.18], [36.89, 37.38], [36.61, 37.31], [36.48, 37.12]],
  ],
  "keban-lead-zinc": [
    [[38.68, 38.78], [38.7, 38.75], [38.76, 38.76], [38.78, 38.81], [38.73, 38.84], [38.68, 38.82]],
  ],
  zonguldak: [
    [[31.18, 41.18], [31.55, 41.2], [31.92, 41.38], [32.45, 41.61], [32.72, 41.72], [32.65, 41.86], [32.15, 41.76], [31.62, 41.58], [31.24, 41.42]],
  ],
  "tavsanli-lignite": [
    [[29.13, 39.42], [29.36, 39.39], [29.61, 39.47], [29.64, 39.59], [29.42, 39.64], [29.18, 39.57]],
  ],
  "nallihan-lignite": [
    [[30.94, 40.04], [31.22, 40.02], [31.45, 40.14], [31.42, 40.32], [31.12, 40.4], [30.87, 40.25]],
  ],
  "afsin-mine": [
    [[36.78, 38.36], [36.86, 38.16], [37.1, 38.08], [37.42, 38.12], [37.7, 38.28], [37.65, 38.5], [37.35, 38.58], [37.0, 38.53]],
  ],
  "soma-mine": [
    [[27.34, 39.08], [27.43, 38.98], [27.62, 38.99], [27.79, 39.09], [27.8, 39.24], [27.65, 39.34], [27.46, 39.3], [27.35, 39.2]],
  ],
  "tuncbilek-lignite": [
    [[29.25, 39.58], [29.34, 39.5], [29.51, 39.5], [29.66, 39.57], [29.67, 39.7], [29.55, 39.78], [29.38, 39.76], [29.27, 39.68]],
  ],
  seyitomer: [
    [[29.64, 39.53], [29.72, 39.44], [29.91, 39.43], [30.08, 39.52], [30.08, 39.65], [29.94, 39.72], [29.76, 39.7], [29.65, 39.62]],
  ],
  "can-lignite": [
    [[26.84, 39.99], [26.93, 39.9], [27.09, 39.91], [27.22, 40.0], [27.2, 40.12], [27.07, 40.18], [26.91, 40.14], [26.84, 40.07]],
  ],
  "yatagan-lignite": [
    [[27.88, 37.33], [27.98, 37.2], [28.18, 37.2], [28.36, 37.31], [28.33, 37.46], [28.17, 37.54], [27.98, 37.48], [27.89, 37.41]],
  ],
  "celtek-lignite": [
    [[35.55, 40.89], [35.61, 40.84], [35.7, 40.85], [35.76, 40.91], [35.73, 40.97], [35.64, 41.0], [35.56, 40.96]],
  ],
  "cayirhan-lignite": [
    [[31.43, 40.03], [31.52, 39.95], [31.7, 39.96], [31.86, 40.04], [31.86, 40.16], [31.72, 40.23], [31.54, 40.2], [31.43, 40.12]],
  ],
  "dodurga-lignite": [
    [[34.61, 40.84], [34.68, 40.77], [34.83, 40.76], [34.96, 40.84], [34.94, 40.94], [34.82, 41.0], [34.68, 40.97], [34.61, 40.91]],
  ],
  "askale-lignite": [
    [[40.51, 39.84], [40.56, 39.78], [40.67, 39.78], [40.75, 39.84], [40.73, 39.91], [40.64, 39.95], [40.54, 39.92]],
  ],
  "zamanti-lead-zinc": [
    [[35.18, 37.62], [35.34, 37.49], [35.58, 37.5], [35.78, 37.68], [35.77, 37.96], [35.62, 38.22], [35.39, 38.29], [35.2, 38.13], [35.1, 37.86]],
  ],
  "bingol-phosphate": [
    [[40.255, 38.61], [40.3, 38.585], [40.365, 38.59], [40.405, 38.63], [40.392, 38.69], [40.34, 38.72], [40.275, 38.7], [40.245, 38.66]],
  ],
  "yildiz-m": [[[26.82, 42.02], [27.42, 42.09], [28.12, 42.02], [28.72, 41.78], [28.63, 41.5], [28.08, 41.42], [27.38, 41.55], [26.9, 41.76]]],
  "kazdagi-m": [[[26.7, 39.92], [27.06, 40.02], [27.43, 39.88], [27.5, 39.62], [27.22, 39.45], [26.86, 39.52], [26.65, 39.72]]],
  "uludag-m": [[[28.9, 40.2], [29.08, 40.28], [29.36, 40.2], [29.5, 40.02], [29.34, 39.88], [29.08, 39.9], [28.88, 40.04]]],
  "menderes-m": [
    [[27.92, 39.18], [28.36, 39.28], [28.9, 39.08], [29.25, 38.74], [29.08, 38.48], [28.56, 38.5], [28.1, 38.76]],
    [[27.35, 38.62], [27.92, 38.72], [28.52, 38.52], [29.22, 38.22], [29.48, 37.88], [29.08, 37.68], [28.42, 37.8], [27.82, 38.08]],
    [[27.25, 37.92], [27.72, 37.95], [28.25, 37.75], [28.58, 37.42], [28.35, 37.18], [27.82, 37.2], [27.35, 37.48]],
  ],
  "sultandag-m": [[[30.66, 38.8], [30.9, 38.88], [31.3, 38.7], [31.62, 38.35], [31.5, 38.08], [31.18, 38.15], [30.82, 38.43]]],
  "alanya-anamur-m": [
    [[31.52, 36.78], [31.72, 36.42], [32.08, 36.18], [32.42, 36.32], [32.32, 36.68], [31.92, 36.9]],
    [[32.55, 36.62], [32.8, 36.22], [33.22, 36.08], [33.62, 36.28], [33.48, 36.66], [33.02, 36.86]],
  ],
  "ilgaz-m": [[[32.92, 41.18], [33.28, 41.32], [33.8, 41.28], [34.42, 41.12], [34.58, 40.9], [34.2, 40.76], [33.58, 40.82], [33.08, 40.96]]],
  "tokat-m": [[[35.62, 40.72], [36.0, 40.9], [36.58, 40.82], [37.22, 40.58], [37.42, 40.28], [37.02, 40.06], [36.42, 40.12], [35.82, 40.38]]],
  "akdagmadeni-m": [[[35.45, 40.02], [35.78, 40.12], [36.18, 39.95], [36.52, 39.62], [36.38, 39.38], [36.0, 39.4], [35.62, 39.64]]],
  "kirsehir-m": [[[32.95, 39.82], [33.38, 40.0], [33.92, 39.9], [34.48, 39.52], [34.62, 39.05], [34.3, 38.78], [33.72, 38.82], [33.18, 39.16]]],
  "nigde-m": [[[34.18, 38.48], [34.45, 38.58], [34.92, 38.42], [35.2, 38.08], [35.05, 37.78], [34.6, 37.72], [34.26, 37.98]]],
  "akdag-m": [[[37.18, 39.12], [37.52, 39.22], [37.92, 39.02], [38.18, 38.68], [38.02, 38.42], [37.6, 38.48], [37.28, 38.74]]],
  "malatya-m": [[[37.85, 38.62], [38.28, 38.72], [38.82, 38.48], [39.42, 38.12], [39.62, 37.72], [39.25, 37.48], [38.72, 37.62], [38.25, 37.95]]],
  "bitlis-m": [[[38.82, 38.2], [39.52, 38.08], [40.35, 37.72], [41.28, 37.38], [42.28, 37.22], [43.18, 37.45], [43.32, 37.78], [42.55, 38.02], [41.52, 38.18], [40.4, 38.42], [39.38, 38.52]]],
  "van-basin": [[[41.6, 39.7], [44.4, 40.0], [44.8, 37.8], [42.2, 37.4], [41.3, 38.4]]],
  "konya-closed-basin": [[[30.5, 39.6], [34.8, 40.0], [35.2, 36.6], [31.0, 36.2], [29.8, 37.3]]],
  "burdur-basin": [[[28.5, 38.5], [31.0, 38.6], [31.0, 36.6], [29.3, 36.2], [28.3, 37.2]]],
  "akaracay-basin": [[[29.8, 39.2], [32.4, 39.0], [32.5, 37.8], [30.3, 37.6]]],
  "aras-basin": [[[39.5, 41.8], [44.8, 42.0], [44.8, 39.0], [42.0, 39.1], [40.0, 40.0]]],
  "hazar-lake-basin": [[[38.45, 39.05], [39.25, 39.04], [39.55, 38.65], [39.34, 38.3], [38.63, 38.28], [38.34, 38.62]]],
};

const FUNCTION_CITY_COORDINATES: Record<string, Coordinate> = {
  soke: [27.4061, 37.7482],
  osmaniye: [36.2478, 37.0746],
  akhisar: [27.8399, 38.9185],
  rize: [40.5234, 41.0255],
  bafra: [35.9064, 41.5678],
  malatya: [38.3095, 38.3552],
  istanbul: [28.9784, 41.0082],
  "istanbul-strait": [29.0718072, 41.1125268],
  "canakkale-strait": [26.4413908, 40.2091726],
  kocaeli: [29.9408, 40.7669],
  bursa: [29.0600, 40.1950],
  iskenderun: [36.1725, 36.5872],
  eregli: [31.4181, 41.2797],
  soma: [27.6094, 39.1855],
  batman: [41.1322, 37.8812],
  zonguldak: [31.7894, 41.4535],
  elbistan: [37.1983, 38.2059],
  murgul: [41.5624, 41.2798],
  izmir: [27.1428, 38.4237],
  mersin: [34.6415, 36.8121],
  samsun: [36.3361, 41.2867],
  trabzon: [39.7168, 41.0027],
  sinop: [35.1517, 42.0268],
  kayseri: [35.4826, 38.7205],
  konya: [32.4846, 37.8746],
  erzurum: [41.2679, 39.9043],
  ankara: [32.8597, 39.9334],
  gaziantep: [37.3781, 37.0662],
  eskisehir: [30.5206, 39.7767],
  golcuk: [29.8289, 40.7160],
  polatli: [32.1472, 39.5842],
  erzincan: [39.4902, 39.7468],
  antalya: [30.7133, 36.8969],
  marmaris: [28.2742, 36.8550],
  kusadasi: [27.2578, 37.8597],
  nevsehir: [34.7194, 38.6244],
};

function functionalCityCoordinate(featureId: string) {
  const match = featureId.match(
    /^(?:function-city|farm-city|industrial-city|mining-city|port-city|transport-trade-city|culture-admin-city|tourism-city)-(.+)$/,
  );
  return match ? FUNCTION_CITY_COORDINATES[match[1]] : undefined;
}

const POINT_COORDINATES: Record<string, Coordinate> = {
  "north-anatolian-fault": [35.3, 40.75],
  "east-anatolian-fault": [38.5, 38.25],
  "west-anatolian-faults": [28.7, 38.25],
  "abant-set": [31.28, 40.605],
  "yedigoller-set": [31.744, 40.941],
  "borabay-set": [36.154, 40.804],
  "zinav-set": [37.273, 40.448],
  "sera-set": [39.614, 40.985],
  "tortum-set": [41.636, 40.625],
  "marmara-set": [28.007, 38.62],
  "bafa-set": [27.455, 37.516],
  "koycegiz-set": [28.65, 36.91],
  "uzungol-set": [40.295, 40.619],
  "eymir-set": [32.83, 39.823],
  "mogan-set": [32.79, 39.77],
  "buyukcekmece-set": [28.555, 41.065],
  "kucukcekmece-set": [28.746, 41.015],
  "durusu-set": [28.575, 41.345],
  "akyatan-set": [35.27, 36.61],
  yarisli: [29.968, 37.568],
  "kilimli-glacial": [29.2213, 40.0785],
  "aynali-glacial": [29.2352, 40.0708],
  "karagol-uludag-glacial": [29.228711, 40.073787],
  "buzlu-uludag-glacial": [29.219054, 40.076535],
  "heybeli-uludag-glacial": [29.217728, 40.078753],
  "deligol-glacial": [40.9227, 40.69675],
  "sat-ikiyaka-glacial": [44.187, 37.354],
  agri: [44.2983964, 39.7019346],
  "agri-v": [44.2983964, 39.7019346],
  "agri-gl": [44.2983964, 39.7019346],
  tendurek: [43.8669939, 39.354844],
  suphan: [42.8276945, 38.9265462],
  "suphan-gl": [42.8276945, 38.9265462],
  nemrut: [42.2554405, 38.6546955],
  erciyes: [35.4502248, 38.5327397],
  "erciyes-v": [35.4502248, 38.5327397],
  "erciyes-gl": [35.4502248, 38.5327397],
  hasan: [34.1651126, 38.1265274],
  karadag: [33.1471169, 37.3994076],
  melendiz: [34.5265715, 38.0712926],
  "karacadag-ic": [33.7780749, 37.7474922],
  "karacadag-gd": [39.8290462, 37.7114291],
  kula: [28.52, 38.58],
  ilgin: [31.875, 38.35],
  "nar-lake": [34.457, 38.34],
  "meyil-lake": [33.3535, 37.988],
  "cirali-lake": [33.413, 37.932],
  "hafik-lake": [37.378, 39.872],
  "todurge-lake": [37.6, 39.881],
  "golcuk-vl": [30.494, 37.731],
  "meke-vl": [33.64, 37.685],
  "acigol-karapinar": [33.666, 37.713],
  aygir: [42.823, 38.837],
  "keban-dam": [38.7567034, 38.808031],
  "karakaya-dam": [39.1348555, 38.225808],
  "ataturk-dam": [38.3176375, 37.4804869],
  "birecik-dam": [37.8897894, 37.0539658],
  "karkamis-dam": [38.0331015, 36.8684064],
  "kralkizi-dam": [40.021935, 38.347676],
  "ilisu-dam": [41.8468945, 37.5315611],
  "batman-dam": [41.2028098, 38.1595247],
  "dicle-dam": [40.1764152, 38.2307274],
  "devegecidi-dam": [39.9723437, 38.0586374],
  "arpacay-dam": [43.6452142, 40.5626798],
  "seyhan-dam": [35.3319992, 37.0392894],
  "catalan-dam": [35.280582, 37.1977915],
  "sir-dam": [36.5964642, 37.5007665],
  "aslantas-dam": [36.2713703, 37.2721166],
  "menzelet-dam": [36.8498845, 37.6761468],
  "kartalkaya-dam": [37.239063, 37.4688209],
  "oymapinar-dam": [31.5317293, 36.9083626],
  "demirkopru-dam": [28.3110264, 38.616576],
  "kemer-dam": [28.5247772, 37.5718609],
  "adiguzel-dam": [29.205808, 38.1586154],
  "porsuk-dam": [30.2793191, 39.6354915],
  "bayindir-dam": [32.9920439, 39.9152082],
  "sariyar-dam": [31.4146548, 40.0398482],
  "gokcekaya-dam": [31.0165411, 40.0326861],
  "kurtbogazi-dam": [32.7005676, 40.2696789],
  "hirfanli-dam": [33.5186415, 39.273381],
  "derbent-dam": [35.8422152, 41.4618627],
  "kesikkopru-dam": [33.4209546, 39.3959647],
  "altinkaya-dam": [35.7251617, 41.363782],
  "kapulukaya-dam": [33.4835992, 39.7310468],
  "cubuk1-dam": [32.9303585, 40.0033362],
  "cubuk2-dam": [33.0206943, 40.2874577],
  "almus-dam": [36.9021222, 40.4076443],
  "hasanugurlu-dam": [36.6462777, 40.9373801],
  "suatugurlu-dam": [36.6714034, 41.0751325],
  "kilickaya-dam": [38.186839, 40.2429847],
  "muratli-dam": [41.713678, 41.467023],
  "borcka-dam": [41.6857873, 41.3494555],
  "deriner-dam": [41.869075, 41.1716124],
  kapikule: [26.3605547, 41.7179296],
  ipsala: [26.3303661, 40.933463],
  sarp: [41.5479224, 41.5190947],
  gurbu: [44.3777801, 39.4122129],
  habur: [42.5685244, 37.1501969],
  cilvegozu: [36.6553514, 36.2387635],
  pazarkule: [26.4913385, 41.6543231],
  hamzabeyli: [26.6112448, 41.9583809],
  derekoy: [27.4585895, 41.967609],
  turkgozu: [42.81821, 41.58718],
  aktas: [43.19893, 41.23457],
  dilucu: [44.7995818, 39.654133],
  kapikoy: [44.3204051, 38.4969971],
  esendere: [44.6219355, 37.7172977],
  uzumlu: [43.51422, 37.23981],
  oncupinar: [37.08515, 36.64618],
  karkamis: [38.00074, 36.82972],
  cobanbey: [37.46996, 36.63524],
  zeytidali: [36.6012175, 36.3673763],
  "akcakale-gate": [38.95757, 36.70772],
  "ceylanpinar-gate": [40.0548, 36.8466],
  "nusaybin-gate": [41.21766, 37.06287],
  "yayladagi-gate": [36.01188, 35.90087],
  "bolu-pass": [31.4140658, 40.7473581],
  "zigana-pass": [39.4051227, 40.6389544],
  "gulek-pass": [34.7858856, 37.2853853],
  "sertavul-pass": [33.2635938, 36.9150187],
  "belen-pass": [36.2252927, 36.4812881],
  "kop-pass": [40.5120823, 40.0365803],
  "cubuk-pass": [30.49694, 37.1701959],
  "ilgaz-pass": [33.7449, 41.0437],
  "ovit-pass": [40.7811342, 40.6259079],
  "egribel-pass": [38.397344, 40.456541],
  "cankurtaran-pass": [41.5327165, 41.3939175],
  divrigi: [38.102998, 39.40934],
  seyitomer: [29.832337, 39.574254],
  murgul: [41.58172, 41.24761],
  bigadic: [28.13627, 39.46686],
  mazidagi: [40.36208, 37.50205],
  "cayeli-mine": [40.76, 41.04111],
  "kure-mine": [33.68853, 41.80509],
  "maden-mine": [39.66481, 38.38581],
  "guleman-mine": [39.87504, 38.45661],
  "seydisehir-mine": [31.88028, 37.28917],
  "emet-mine": [29.27765, 39.37204],
  "kirka-mine": [30.48667, 39.29],
  "hekimhan-mine": [37.967468, 38.903467],
  "hasancelebi-mine": [37.89278, 38.95444],
  "tuzgolu-mine": [33.11542, 38.76029],
  "camalti-mine": [26.91528, 38.5049],
  "afsin-mine": [37.082979, 38.340685],
  "soma-mine": [27.55082, 39.11457],
  "avnik-mine": [40.33306, 38.65],
  "mansurlu-mine": [35.63806, 37.95417],
  "kesikkopru-iron": [33.38736, 39.34966],
  "kokaksu-mine": [31.66667, 41.41667],
  "tavas-mine": [28.99695, 37.44393],
  "balya-mine": [27.58869, 39.73914],
  "yenice-lead-zinc": [27.36556, 39.98345],
  "bolkar-lead-zinc": [34.64155, 37.44981],
  "zamanti-lead-zinc": [35.46667, 38.1],
  "akdagmadeni-lead-zinc": [35.88783, 39.56028],
  "kestelek-boron": [28.56528, 39.94778],
  "bingol-phosphate": [40.321193, 38.6486048],
  "sanliurfa-phosphate": [38.5253584, 37.3619576],
  "cankiri-salt": [33.77064, 40.53536],
  "gulsehir-salt": [34.4855968, 38.7730603],
  "yerkoy-salt": [34.2601, 39.7198],
  "tuzluca-salt": [43.6687817, 40.0492563],
  "tuncbilek-lignite": [29.455311, 39.634823],
  "can-lignite": [27.038636, 40.023827],
  "yatagan-lignite": [28.0529043, 37.3416704],
  "celtek-lignite": [35.6414145, 40.9065455],
  "cayirhan-lignite": [31.695, 40.097],
  "dodurga-lignite": [34.758629, 40.855953],
  "askale-lignite": [40.6085481, 39.8522373],
  cesme: [26.3, 38.32],
  "dinar-wind": [30.1543032, 38.1223464],
  germencik: [27.6340167, 37.8828558],
  "buharkent-geothermal": [28.809483, 37.9795937],
  akkuyu: [33.53487, 36.14481],
  "sinop-nuclear": [34.9454, 42.0968],
  ataturk: [38.3176375, 37.4804869],
  "deriner-energy": [41.8707143, 41.1716191],
  karapinar: [33.59414, 37.80037],
  afsin: [37.0069049, 38.3495685],
  "catalagzi-energy": [31.8993563, 41.5154309],
  "soma-energy": [27.6402582, 39.193969],
  "balikesir-wind": [27.8953, 40.3521],
  "manisa-wind": [27.837, 38.918],
  "hatay-wind": [36.205, 36.489],
  "osmaniye-wind": [36.576, 37.202],
  "istanbul-wind": [28.461, 41.139],
  "canakkale-wind": [26.337, 39.785],
  "seyitomer-energy": [29.8800482, 39.5755059],
  "tuncbilek-energy": [29.4638049, 39.6287278],
  "yatagan-energy": [28.100476, 37.3283339],
  "hamitabat-energy": [27.33877, 41.48102],
  "ambarli-energy": [28.6921, 40.9834],
  "ovaakca-energy": [29.0726225, 40.2930382],
  "istanbul-industry": [28.98, 41.01],
  "izmir-industry": [27.14, 38.42],
  "bursa-industry": [29.06, 40.19],
  "ankara-industry": [32.85, 39.93],
  "adana-industry": [35.32, 37],
  "gaziantep-industry": [37.38, 37.07],
  "konya-industry": [32.48, 37.87],
  "erzurum-industry": [41.27, 39.9],
  "balikesir-industry": [27.89, 39.65],
  "kars-industry": [43.1, 40.6],
  "canakkale-industry": [26.41, 40.15],
  "trabzon-industry": [39.72, 41],
  "edirne-industry": [26.56, 41.68],
  "tekirdag-industry": [27.51, 40.98],
  "edremit-industry": [27.02, 39.59],
  "ayvalik-industry": [26.69, 39.32],
  "gemlik-industry": [29.16, 40.43],
  "rize-industry": [40.52, 41.02],
  "denizli-industry": [29.08, 37.78],
  "aydin-industry": [27.84, 37.84],
  "antalya-industry": [30.71, 36.89],
  "manisa-industry": [27.43, 38.62],
  "kayseri-industry": [35.48, 38.73],
  "hereke-industry": [29.6163185, 40.7840847],
  "usak-industry": [29.41, 38.68],
  "isparta-industry": [30.55, 37.77],
  "bolu-industry": [31.61, 40.73],
  "kastamonu-industry": [33.78, 41.38],
  "duzce-industry": [31.16, 40.84],
  "izmit-industry": [29.94, 40.77],
  "caycuma-industry": [32.0728211, 41.4269456],
  "dalaman-industry": [28.8015337, 36.7671003],
  "taskopru-industry": [34.2128338, 41.5074775],
  "aliaga-industry": [27.0533215, 38.812726],
  "kirikkale-industry": [33.51, 39.84],
  "batman-industry": [41.13, 37.89],
  "bandirma-industry": [27.9769613, 40.3524926],
  "iskenderun-industry": [36.17, 36.59],
  "ceyhan-industry": [35.8124428, 37.0288825],
  "mersin-industry": [34.63, 36.8],
  "kutahya-industry": [29.98, 39.42],
  "samsun-industry": [36.33, 41.29],
  "adapazari-industry": [30.4, 40.78],
  "kirsehir-industry": [34.16, 39.15],
  "kirklareli-industry": [27.23, 41.73],
  "eskisehir-industry": [30.52, 39.77],
  "afyon-industry": [30.54, 38.75],
  "tokat-industry": [36.55, 40.31],
  "can-industry": [27.0511631, 40.0289459],
  "bozuyuk-industry": [30.0372781, 39.9042599],
  "sogut-industry": [30.1814273, 40.0155518],
  "sivas-industry": [37.02, 39.75],
  "golcuk-industry": [29.819588, 40.7169247],
  "tuzla-industry": [29.3988672, 40.8930866],
  "pendik-industry": [29.2278233, 40.8946523],
  "halic-industry": [28.9457854, 41.0411549],
  "bodrum-industry": [27.43, 37.04],
  "maden-industry": [39.66905, 38.4012965],
  "kirka-industry": [30.5272292, 39.2819652],
  "eregli-industry": [31.503024, 41.271817],
  "seydisehir-industry": [31.8445127, 37.4239112],
  "cankiri-industry": [33.62, 40.6],
  "istanbul-san": [28.98, 41.01],
  "izmir-san": [27.14, 38.42],
  "bursa-san": [29.06, 40.19],
  "ankara-san": [32.85, 39.93],
  "adana-san": [35.32, 37.0],
  "gaziantep-san": [37.38, 37.07],
  "haydarpasa-port": [29.0182, 41.0013],
  "istanbul-port": [28.9828657, 41.0257757],
  "derince-port": [29.8352, 40.7498],
  "bandirma-port": [27.9558851, 40.3531441],
  "ambarli-port": [28.6789, 40.9658],
  "gemlik-port": [29.1111472, 40.4164667],
  "karasu-port": [30.671503, 41.1215213],
  "eregli-port": [31.4205, 41.2623],
  "zonguldak-port": [31.7817959, 41.4546504],
  "sinop-port": [35.1488193, 42.023269],
  "samsun-port": [36.3666667, 41.3],
  "trabzon-port": [39.7353335, 41.0043843],
  "izmir-port": [27.158914, 38.440432],
  "kusadasi-port": [27.2554504, 37.8632963],
  "bodrum-port": [27.4248877, 37.0321323],
  "marmaris-port": [28.2805083, 36.8491221],
  "fethiye-port": [29.1054613, 36.6219855],
  "antalya-port": [30.6057929, 36.832888],
  "alanya-port": [32.0014919, 36.5392159],
  "mersin-port": [34.6444164, 36.8063225],
  "iskenderun-port": [36.1837423, 36.5911349],
  "nemrut-tour": [38.74, 37.98],
  sumela: [39.66, 40.69],
  efes: [27.34, 37.94],
  "uludag-tour": [29.221, 40.069],
  "kartalkaya-tour": [31.809, 40.59],
  "erciyes-tour": [35.4502248, 38.5327397],
  "palandoken-tour": [41.2753321, 39.8597575],
  "kackar-tour": [40.84, 40.84],
  "beydaglari-tour": [30.2, 36.62],
  "nemrut-bitlis-tour": [42.2554405, 38.6546955],
  "agri-tour": [44.288, 39.702],
  "anzer-tour": [40.5174349, 40.5821521],
  "ayder-tour": [41.0970728, 40.9548315],
  "kadirga-tour": [39.3335652, 40.7220713],
  "persembe-tour": [37.3090489, 40.6304478],
  "saklikent-tour": [30.335133, 36.842915],
  "camliyayla-tour": [34.5934427, 37.1665396],
  "horzum-tour": [35.8492297, 37.6272879],
  "tekir-tour": [34.78, 37.33],
  "manyas-bird-tour": [27.962844, 40.192018],
  "golcuk-geotour": [30.494, 37.731],
  "meke-geotour": [33.64, 37.685],
  "acigol-geotour": [33.666, 37.713],
  "akcali-tour": [43.9253375, 37.8290539],
  "karain-tour": [30.5706249, 37.077831],
  "damlatas-tour": [31.9887906, 36.5418683],
  "dim-tour": [32.1097885, 36.5391555],
  "beldibi-tour": [30.5690834, 36.744337],
  "insuyu-tour": [30.3757774, 37.6597429],
  "gilindire-tour": [33.4022388, 36.1311398],
  "ballica-tour": [36.3015033, 40.2273137],
  "ayasofya-tour": [28.980175, 41.008584],
  "sultanahmet-tour": [28.9768534, 41.0053843],
  "topkapi-tour": [28.9840659, 41.0129795],
  "dolmabahce-tour": [28.9997735, 41.0389605],
  "meryemana-tour": [27.3340134, 37.9115563],
  "gokmedrese-tour": [37.0168037, 39.7443204],
  "selimiye-tour": [26.5593409, 41.6781393],
  "ishakpasa-tour": [44.1286023, 39.5203552],
  "gobeklitepe-tour": [38.9206472, 37.2233511],
  "catalhoyuk-tour": [32.8252568, 37.6667937],
  "alacahoyuk-tour": [34.6950961, 40.2345193],
  "hattusas-tour": [34.6197357, 40.0222167],
  "arslantepe-tour": [38.3607149, 38.3815255],
  "istanbul-city": [28.98, 41.01],
  "ankara-city": [32.85, 39.93],
  "izmir-city": [27.14, 38.42],
  "antalya-city": [30.71, 36.89],
  "samsun-city": [36.33, 41.29],
  "erzurum-city": [41.27, 39.9],
  "diyarbakir-city": [40.23, 37.91],
  "bogazici-b": [29.0343866, 41.0454858],
  "fsm-b": [29.0614398, 41.0913084],
  "yss-b": [29.1117786, 41.2030695],
  "osmangazi-b": [29.5158006, 40.7547337],
  "canakkale-b": [26.6368129, 40.339679],
  "avrasya-t": [28.9981122, 41.0059924],
  "marmaray-t": [29.0043517, 41.0144323],
  "bolu-t": [31.4589139, 40.7472274],
  "ovit-t": [40.7844019, 40.6211219],
  "zigana-t": [39.4148249, 40.6698851],
  "ilgaz-t": [33.7505896, 41.0631322],
  "cankurtaran-t": [41.5378512, 41.3847405],
  "sabuncubeli-t": [27.3015543, 38.5464436],
  "egribel-t": [38.3754329, 40.4522779],
};

const LABEL_OFFSETS: Record<string, Coordinate> = {
  agri: [0, -22],
  "agri-v": [24, -20],
  tendurek: [24, 34],
  suphan: [-44, -24],
  nemrut: [-36, 20],
  erciyes: [0, -22],
  "erciyes-v": [0, -22],
  hasan: [-34, 22],
  karadag: [-26, 24],
  melendiz: [36, -4],
  "karacadag-ic": [-45, -2],
  "karacadag-gd": [28, 22],
  kula: [0, -20],
};

const STRUCTURE_CALLOUT_OFFSETS: Record<string, Coordinate> = {
  "bogazici-b": [-38, -29],
  "fsm-b": [0, -53],
  "yss-b": [38, -29],
  "avrasya-t": [-38, 33],
  "marmaray-t": [38, 33],
};

const PORT_CALLOUT_OFFSETS: Record<string, Coordinate> = {
  "istanbul-port": [-30, -28],
  "haydarpasa-port": [30, -30],
};

const STRAIT_POLYGONS: Record<string, Coordinate[]> = {
  "istanbul-strait": [[28.9744713, 41.0218102], [28.9750682, 41.0176228], [28.9865039, 41.0174645], [28.9880682, 41.0130039], [28.9775963, 41.0014639], [29.0230084, 40.99212], [29.0066612, 41.0073035], [29.0111505, 41.0129903], [29.006788, 41.0230991], [29.0521167, 41.0482385], [29.0553974, 41.0734638], [29.0662404, 41.0811042], [29.066174, 41.1027446], [29.0816962, 41.1072331], [29.0972646, 41.1205819], [29.0915494, 41.1342807], [29.0711649, 41.1431569], [29.0779089, 41.1544962], [29.0734935, 41.1645956], [29.0866851, 41.1700517], [29.0871223, 41.1786616], [29.1125844, 41.1829603], [29.1186179, 41.1877689], [29.1180584, 41.2002838], [29.131043, 41.2031409], [29.1297348, 41.207401], [29.1253889, 41.2048244], [29.1300433, 41.2084203], [29.149902, 41.2130388], [29.1507315, 41.2180763], [29.116173, 41.2338127], [29.1145766, 41.2288], [29.1133322, 41.234073], [29.1061365, 41.220145], [29.1115042, 41.2141658], [29.106311, 41.2051582], [29.091431, 41.2003617], [29.0727073, 41.1750224], [29.036446, 41.1568587], [29.0524003, 41.1469566], [29.0579745, 41.1396613], [29.0542289, 41.1385837], [29.0716977, 41.1245372], [29.0617587, 41.1131254], [29.0543508, 41.1137722], [29.0593579, 41.1093226], [29.053534, 41.0989294], [29.0568428, 41.0829469], [29.0444714, 41.0778666], [29.046376, 41.0678914], [29.0327995, 41.0497522], [28.9967829, 41.0374971], [28.9744713, 41.0218102]],
  "canakkale-strait": [[26.1752383, 40.0430167], [26.198135, 40.008678], [26.238141, 39.9989345], [26.2716547, 40.0008574], [26.286669, 40.004249], [26.2992063, 40.013732], [26.3211055, 40.017296], [26.3343189, 40.0284291], [26.3382413, 40.0428737], [26.3485796, 40.0465013], [26.3561113, 40.0567656], [26.3582361, 40.074916], [26.3657924, 40.0827132], [26.3618603, 40.0924943], [26.3647936, 40.0982501], [26.3711071, 40.1045374], [26.3773678, 40.1016775], [26.3780077, 40.1058657], [26.3863599, 40.1019745], [26.3967817, 40.1043025], [26.4096053, 40.1178834], [26.4074904, 40.1293873], [26.3975227, 40.1432861], [26.4001773, 40.1508466], [26.4094147, 40.1560798], [26.4033906, 40.1631308], [26.4020307, 40.1759571], [26.4064738, 40.1787124], [26.4084157, 40.1929075], [26.4012274, 40.1963301], [26.4147967, 40.200197], [26.442057, 40.193573], [26.4545668, 40.1990488], [26.465807, 40.196509], [26.524594, 40.217179], [26.5416311, 40.2341275], [26.5502835, 40.2536043], [26.5586369, 40.2567918], [26.5565441, 40.2630293], [26.5687777, 40.2769486], [26.5866649, 40.2838169], [26.607107, 40.2813991], [26.6516632, 40.3279567], [26.6890222, 40.349355], [26.690033, 40.3546326], [26.69087, 40.3506563], [26.6900238, 40.3653594], [26.7365271, 40.3904405], [26.7151616, 40.3887654], [26.7120364, 40.3861516], [26.7156055, 40.3818707], [26.7063233, 40.3849217], [26.7443694, 40.3987303], [26.7001126, 40.4198562], [26.6810529, 40.4175403], [26.6826694, 40.4097562], [26.6751634, 40.4036534], [26.6570072, 40.4096416], [26.6585385, 40.4060119], [26.6424347, 40.4038027], [26.6385545, 40.3904003], [26.6260315, 40.3841548], [26.6328183, 40.3643401], [26.593663, 40.3290318], [26.5914355, 40.322153], [26.5740929, 40.3199665], [26.5673628, 40.3078631], [26.5487574, 40.2998873], [26.5125863, 40.2903851], [26.4929431, 40.2776537], [26.4938612, 40.2700674], [26.479423, 40.2549432], [26.4508742, 40.2364314], [26.427866, 40.2296292], [26.4236325, 40.2211503], [26.3989899, 40.2167364], [26.3750389, 40.2037327], [26.3594368, 40.204305], [26.3604719, 40.1826802], [26.3727589, 40.1664533], [26.3811666, 40.1439935], [26.3470717, 40.1265367], [26.3324812, 40.1095839], [26.3125681, 40.1004598], [26.309312, 40.093102], [26.2973084, 40.0857442], [26.231977, 40.060226], [26.2217738, 40.0494674], [26.2053837, 40.0533726], [26.1911179, 40.0414531], [26.1752383, 40.0430167]],
};

const REAL_LINES: Record<string, Coordinate[]> = {
  "parallel-36n": [[25.55, 36], [44.85, 36]],
  "parallel-42n": [[25.55, 42], [44.85, 42]],
  "meridian-26e": [[26, 35.75], [26, 42.15]],
  "meridian-45e": [[45, 35.75], [45, 42.15]],
  "bogazici-b": [[29.0401723, 41.0400268], [29.0392628, 41.0409211], [29.0383486, 41.0418118], [29.0305053, 41.0493357], [29.029366, 41.0504107], [29.0287188, 41.051017]],
  "fsm-b": [[29.0542772, 41.090911], [29.0546341, 41.0909274], [29.0550123, 41.0909448], [29.0680711, 41.0915457]],
  "yss-b": [[29.1015642, 41.2075642], [29.103718, 41.2065861], [29.105253, 41.2058857], [29.1074423, 41.2048854], [29.1159129, 41.2010219], [29.1182518, 41.1999573], [29.1209018, 41.1987649], [29.1217725, 41.1983774]],
  "osmangazi-b": [[29.5137838, 40.7418514], [29.5141739, 40.744242], [29.5144145, 40.7456838], [29.5151883, 40.7504229], [29.5162697, 40.7570551], [29.5170222, 40.761678], [29.5181253, 40.7684496], [29.5183917, 40.7701412]],
  "canakkale-b": [[26.6154334, 40.3502525], [26.6191466, 40.3484429], [26.6213877, 40.3473026], [26.6267832, 40.3446075], [26.6467294, 40.3345692], [26.6514075, 40.3321969], [26.6542129, 40.3307965], [26.6607092, 40.3274564]],
  "avrasya-t": [[29.0273649, 41.005655], [29.02298, 41.0061791], [29.0162979, 41.004887], [29.0033812, 41.0059258], [28.9925905, 41.0048917], [28.9808225, 41.0020477], [28.9727758, 41.0014627], [28.9692957, 41.002479]],
  "marmaray-t": [[28.9773615, 41.0134148], [28.9855192, 41.0168116], [29.0110397, 41.0252131], [29.0186402, 41.0260976], [29.0252235, 41.0249582], [29.027788, 41.022105], [29.0286659, 41.0160206], [29.0309077, 41.0026975]],
  "bolu-t": [[31.4494037, 40.7360552], [31.4546791, 40.7385212], [31.4572929, 40.7407813], [31.4588219, 40.7453911], [31.4589446, 40.7490555], [31.4564768, 40.7549253], [31.45329, 40.7570917], [31.4496377, 40.7581941]],
  "ovit-t": [[40.8463254, 40.5872525], [40.844, 40.5884096], [40.832091, 40.5945362], [40.8242804, 40.5975667], [40.8073717, 40.6078793], [40.7999474, 40.6124241], [40.7236853, 40.6543768], [40.722333, 40.6546769]],
  "zigana-t": [[39.4875299, 40.7002989], [39.4707582, 40.6985179], [39.4573379, 40.6958398], [39.3830785, 40.6677313], [39.3623844, 40.6622668], [39.346646, 40.6518037], [39.3424456, 40.6442397], [39.3419686, 40.6396071]],
  "ilgaz-t": [[33.7499627, 41.0388121], [33.7526346, 41.043207], [33.7529558, 41.0454503], [33.7520347, 41.0790716], [33.7516126, 41.0813848], [33.7498555, 41.0840502], [33.7486969, 41.0855895], [33.7487608, 41.0873764]],
  "cankurtaran-t": [[41.5687135, 41.3841813], [41.5653507, 41.3841825], [41.5164308, 41.3854757], [41.512006, 41.3855999], [41.5112462, 41.3855817], [41.5092565, 41.3853517], [41.5079502, 41.3850948], [41.5068001, 41.3848205]],
  "sabuncubeli-t": [[27.3199882, 38.556859], [27.3195172, 38.5554487], [27.3164964, 38.5518993], [27.310735, 38.5493066], [27.2939765, 38.5427825], [27.286064, 38.5393881], [27.2840287, 38.5376728], [27.2829402, 38.5363047]],
  "egribel-t": [[38.3768827, 40.4261055], [38.3771442, 40.4742515], [38.3762782, 40.4766755], [38.3751532, 40.4778017], [38.3740408, 40.478563]],
  "pipeline-west-line": [[27.38, 41.84], [27.63, 41.60], [28.68, 40.97], [29.00, 41.02], [29.94, 40.76], [29.06, 40.20], [30.52, 39.78], [32.85, 39.93]],
  "pipeline-blue-stream": [[36.33, 41.29], [35.84, 40.65], [34.95, 40.55], [33.50, 39.85], [32.85, 39.93]],
  "pipeline-iran-turkey": [[44.06, 39.55], [41.27, 39.90], [39.50, 39.75], [37.02, 39.75], [35.48, 38.72], [33.50, 39.85], [32.85, 39.93]],
  "pipeline-bte": [[42.58, 41.16], [43.10, 40.60], [42.25, 40.20], [41.27, 39.90]],
  "pipeline-tanap": [[42.75, 41.47], [43.10, 40.62], [41.28, 39.96], [39.50, 39.80], [40.22, 40.27], [39.47, 40.49], [38.40, 40.64], [37.02, 39.82], [34.81, 39.88], [34.16, 39.18], [33.50, 39.90], [32.85, 39.98], [30.52, 39.83], [29.98, 40.20], [29.98, 39.48], [29.06, 40.25], [27.89, 39.70], [26.42, 40.20], [27.50, 41.03], [26.34, 40.94]],
  "pipeline-turkstream": [[28.10, 41.64], [27.70, 41.52], [27.36, 41.41], [27.38, 41.84]],
  "pipeline-btc": [[42.58, 41.16], [41.25, 39.88], [39.48, 39.72], [37.00, 39.70], [35.48, 38.68], [36.93, 37.56], [35.82, 37.03]],
  "pipeline-iraq-turkey": [[42.34, 37.15], [41.46, 37.33], [40.74, 37.31], [39.35, 37.18], [38.79, 37.17], [37.38, 37.07], [36.82, 37.07], [35.82, 37.03]],
  "istiklal-tour": [[33.76, 41.98], [33.71, 41.81], [33.7, 41.55], [33.78, 41.39], [33.63, 40.92], [33.62, 40.6], [33.33, 40.1], [32.85, 39.93]],
  "uludag-tour": [[28.8, 40.1], [28.98, 40.08], [29.1, 40.0], [29.25, 39.96], [29.4, 39.9]],
  "kartalkaya-tour": [[31.55, 40.68], [31.72, 40.63], [31.809, 40.59], [31.98, 40.54], [32.12, 40.5]],
  "palandoken-tour": [[40.95, 40.02], [41.15, 39.94], [41.275, 39.86], [41.47, 39.72], [41.62, 39.58]],
  "kackar-tour": [[40.42, 40.91], [40.68, 40.86], [40.84, 40.84], [41.08, 40.78], [41.3, 40.72]],
  "beydaglari-tour": [[29.62, 36.76], [29.9, 36.72], [30.2, 36.72], [30.43, 36.8], [30.62, 36.94]],
  yildiz: [[26.7, 41.6], [27.5, 41.7], [28.7, 41.6]],
  kure: [[32.0, 41.4], [33.1, 41.5], [34.3, 41.3]],
  canik: [[35.3, 41.1], [36.6, 40.9], [38.0, 40.8]],
  kackar: [[39.2, 40.9], [40.4, 40.8], [41.7, 40.8]],
  "bolu-d": [[30.5, 40.7], [31.4, 40.7], [32.2, 40.8]],
  bolu: [[30.5, 40.7], [31.4, 40.7], [32.2, 40.8]],
  ilgaz: [[32.8, 40.7], [33.4, 40.8], [34.1, 40.7]],
  koroglu: [[30.8, 40.4], [31.5, 40.5], [32.2, 40.4]],
  giresun: [[37.6, 40.5], [38.4, 40.5], [39.0, 40.4]],
  mescit: [[40.2, 40.4], [40.8, 40.3], [41.3, 40.2]],
  "kop-dagi": [[39.95, 40.18], [40.35, 40.08], [40.75, 39.96]],
  bey: [[29.4, 36.8], [30.3, 36.9], [31.1, 37.0]],
  sultan: [[30.5, 38.2], [31.2, 38.1], [31.8, 38.0]],
  bolkar: [[32.8, 37.0], [33.8, 37.1], [34.8, 37.2]],
  aladag: [[34.7, 37.8], [35.4, 37.9], [36.0, 38.1]],
  nur: [[36.0, 37.1], [36.3, 36.7], [36.2, 36.3]],
  malatya: [[37.5, 38.5], [38.2, 38.4], [38.8, 38.3]],
  sundiken: [[30.8, 39.6], [31.4, 39.7], [32.0, 39.6]],
  elmadag: [[32.9, 39.8], [33.4, 39.8], [33.9, 39.7]],
  munzur: [[38.35, 39.68], [38.9, 39.67], [39.45, 39.6]],
  mercan: [[39.45, 39.66], [39.9, 39.64], [40.25, 39.55]],
  hakkari: [[42.15, 37.92], [42.75, 37.72], [43.3, 37.48], [43.85, 37.26]],
  cilo: [[43.65, 37.62], [44.05, 37.52], [44.5, 37.38]],
  uludag: [[28.8, 40.1], [29.1, 40.0], [29.4, 39.9]],
  kaz: [[26.6, 39.8], [26.9, 39.7], [27.3, 39.6]],
  madra: [[26.8, 39.3], [27.2, 39.0], [27.5, 38.7]],
  yunt: [[27.0, 38.9], [27.3, 38.6], [27.6, 38.3]],
  bozdag: [[27.2, 38.1], [28.0, 38.0], [28.7, 38.0]],
  "aydin-d": [[27.2, 37.8], [28.1, 37.7], [29.0, 37.7]],
  mentese: [[28.0, 37.3], [28.5, 37.0], [29.1, 36.8]],
  kizilirmak: [[37.1, 39.7], [35.6, 39.0], [33.7, 39.4], [32.9, 40.2], [34.2, 41.2], [35.9, 41.6]],
  yesilirmak: [[36.6, 40.3], [35.8, 40.6], [36.3, 41.0], [36.8, 41.4]],
  sakarya: [[30.1, 38.6], [31.3, 39.2], [31.0, 40.0], [30.4, 40.7]],
  firat: [[38.5, 39.8], [39.1, 38.9], [38.4, 38.1], [39.2, 37.2], [40.5, 36.9]],
  dicle: [[40.2, 38.2], [40.8, 37.7], [41.4, 37.2], [42.4, 37.0]],
  seyhan: [[35.5, 38.4], [35.4, 37.8], [35.3, 37.1], [35.3, 36.8]],
  buyukmenderes: [[29.2, 38.1], [28.7, 37.8], [28.0, 37.7], [27.3, 37.6]],
  "meric-br": [[26.5, 41.7], [26.3, 41.1], [26.1, 40.7]],
  "mutludere-br": [[27.4, 42.0], [28.0, 41.9], [28.1, 41.8]],
  "aras-br": [[42.5, 39.9], [43.3, 39.9], [44.5, 39.8]],
  aras: [[40.45, 39.72], [41.2, 39.72], [42.0, 39.92], [43.0, 40.08], [44.0, 40.0], [44.7, 39.78]],
  kura: [[42.32, 40.53], [42.68, 40.76], [43.06, 40.92], [43.45, 41.02], [43.78, 41.12]],
  coruh: [[39.75, 40.25], [40.25, 40.4], [40.75, 40.65], [41.2, 40.85], [41.65, 41.2], [41.55, 41.5]],
  "asi-br": [[36.3, 36.8], [36.2, 36.4], [36.0, 36.0]],
  "hezil-br": [[42.4, 37.3], [42.8, 37.2], [43.1, 37.1]],
  "boyuna-black": [[29.066, 41.1029], [29.1296, 41.2085], [29.2565, 41.2354], [29.8463, 41.1379], [30.1526, 41.1376], [30.2732, 41.2129], [30.7557, 41.0863], [31.2171, 41.0979], [31.3835, 41.1807], [31.3999, 41.316], [32.5801, 41.8274], [33.3382, 42.0204], [34.724, 41.944], [34.8763, 41.9996], [34.9454, 42.0979], [35.1937, 42.0396], [35.0901, 41.9218], [35.2776, 41.7151], [35.5654, 41.631], [35.9538, 41.7351], [36.056, 41.6874], [36.1307, 41.4626], [36.3963, 41.251], [36.5326, 41.2679], [36.6518, 41.3835], [36.8757, 41.3368], [37.0082, 41.2771], [37.0501, 41.1754], [37.2929, 41.1457], [37.5074, 41.0282], [37.6829, 41.1368], [37.7871, 41.1168], [37.7832, 41.0532], [37.8832, 40.9854], [38.3599, 40.9087], [39.4182, 41.1076], [39.6465, 40.9968], [40.1854, 40.9149], [40.3818, 41.0251], [40.546, 41.0276], [41.064, 41.2185], [41.5828, 41.515]],
  "boyuna-med": [[36.1691, 35.8154], [36.0085, 35.9403], [35.979, 36.019], [35.7804, 36.2988], [35.9096, 36.4451], [36.1946, 36.596], [36.2057, 36.7835], [36.0171, 36.9301], [35.7946, 36.7657], [35.5638, 36.7132], [35.7238, 36.7121], [35.4207, 36.5907], [35.251, 36.6782], [34.8157, 36.7971], [34.654, 36.8076], [34.2601, 36.5715], [33.9626, 36.2318], [33.6896, 36.1346], [33.1465, 36.1379], [32.8032, 36.0154], [32.389, 36.1629], [32.0296, 36.5382], [31.3349, 36.8079], [30.6793, 36.8838], [30.5749, 36.7949], [30.5915, 36.5893], [30.4768, 36.3974], [30.5296, 36.3343], [30.3499, 36.2815]],
  "enine-aegean": [[27.4165, 37.416], [27.1918, 37.3535], [27.2276, 37.4724], [27.1596, 37.5854], [27.0029, 37.659], [27.2421, 37.731], [27.2532, 37.9776], [26.981, 38.0749], [26.7574, 38.2221], [26.5915, 38.1026], [26.391, 38.261], [26.2301, 38.2751], [26.3026, 38.3207], [26.2846, 38.3765], [26.4824, 38.376], [26.4513, 38.4282], [26.3529, 38.6387], [26.4162, 38.681], [26.6251, 38.5313], [26.5846, 38.4265], [26.6738, 38.3121], [26.7074, 38.4346], [26.8085, 38.3554], [27.1707, 38.4412], [26.9485, 38.4318], [26.7221, 38.6524], [26.7401, 38.7418], [26.8946, 38.7337], [26.939, 38.766], [26.8926, 38.8251], [26.969, 38.804], [27.0663, 38.8771], [27.0438, 38.941], [26.8012, 38.9507], [26.8776, 39.1001], [26.7182, 39.259], [26.6087, 39.2735], [26.9312, 39.4854], [26.9499, 39.5629], [26.1379, 39.4526], [26.0838, 39.511]],
  "ria-istanbul": [[29.0699, 40.9621], [29.0171, 40.9957], [29.006, 41.0099], [29.0344, 41.0455], [29.0614, 41.0913], [29.0768, 41.1379], [29.1118, 41.2031], [29.2004, 41.224]],
  "ria-canakkale": [[26.0838, 39.511], [26.1635, 39.6593], [26.1774, 39.989], [26.3349, 40.0293], [26.4032, 40.1968], [26.5246, 40.2176], [26.7565, 40.404], [26.9918, 40.3846], [27.2621, 40.4615]],
  "ria-mentese": [[28.901, 36.7137], [28.8457, 36.5882], [28.6179, 36.7035], [28.5876, 36.8154], [28.4621, 36.8112], [28.3982, 36.7846], [28.2582, 36.8454], [28.0354, 36.5629], [27.9562, 36.6013], [28.1293, 36.7257], [27.9304, 36.7421], [28.0329, 36.7876], [28.0207, 36.9257], [28.1679, 36.9068], [28.2157, 36.9987], [28.3304, 37.0324]],
  "dalmacya-teke": [[30.3499, 36.2815], [30.1688, 36.3101], [30.1165, 36.2474], [29.6838, 36.1304], [29.5838, 36.186], [29.6304, 36.2054], [29.3515, 36.2301], [29.1013, 36.3871], [29.1251, 36.5435], [29.0085, 36.5435], [29.1218, 36.6479], [28.9365, 36.7562], [28.901, 36.7137]],
  "limanli-marmara": [[28.8846, 40.9768], [28.8404, 40.9582], [28.7885, 40.971], [28.6868, 40.9699], [28.6201, 40.9604], [28.5937, 41.0154], [28.5476, 40.9999], [28.441, 41.0343], [28.3401, 41.0588], [28.2335, 41.0776]],
  "kalankli-teke": [[31.6646, 36.6493], [31.3349, 36.8079], [30.6793, 36.8838], [30.5749, 36.7949], [30.5915, 36.5893], [30.4768, 36.3974], [30.5296, 36.3343], [30.4146, 36.2149], [30.2004, 36.3154], [29.6838, 36.1304], [29.3515, 36.2301], [29.1013, 36.3871], [29.1251, 36.5435], [28.901, 36.7137]],
  "kalankli-taseli": [[33.0887, 36.0874], [32.9501, 36.1037], [32.8032, 36.0154], [32.5171, 36.0965], [32.2949, 36.2349], [32.0535, 36.5232], [31.6646, 36.6493]],
  "aydin-f": [[27.2, 37.8], [28.1, 37.7], [29.0, 37.7]],
  saros: [[26.2379, 40.3315], [26.799, 40.5568], [26.839, 40.5868], [26.8243, 40.6374], [26.6099, 40.6368], [26.5338, 40.5913], [26.0757, 40.6171]],
  "izmit-g": [[29.1318, 40.7607], [29.2982, 40.7406], [29.4621, 40.7252], [29.6384, 40.7251], [29.8064, 40.7368], [29.9267, 40.7506], [29.8444, 40.7121], [29.6614, 40.6697], [29.4725, 40.6622], [29.2868, 40.6849], [29.1318, 40.7607]],
  "gemlik-g": [[28.7935, 40.4314], [28.9272, 40.4629], [29.0747, 40.4661], [29.2096, 40.4378], [29.2938, 40.3908], [29.1852, 40.3504], [29.0298, 40.3393], [28.8771, 40.3719], [28.7935, 40.4314]],
  "edremit-g": [[26.6532, 39.3185], [26.6304, 39.2971], [26.671, 39.279], [26.7018, 39.3407], [26.8057, 39.3921], [26.7971, 39.4324], [26.9312, 39.4854], [26.9535, 39.5518], [26.9226, 39.5838], [26.7476, 39.566]],
  "candarli-g": [[26.7613, 38.7401], [26.824, 38.7624], [26.8946, 38.7337], [26.939, 38.766], [26.8926, 38.8251], [26.969, 38.804], [26.9713, 38.846], [27.0663, 38.8771], [27.0438, 38.941], [26.8582, 38.9138], [26.8012, 38.9507], [26.799, 39.0324], [26.8871, 39.0782], [26.7629, 39.1776]],
  "izmir-g": [[26.609, 38.4707], [26.5846, 38.4265], [26.6807, 38.3104], [26.7074, 38.4346], [26.8085, 38.3554], [27.1707, 38.4412], [27.0268, 38.4676], [26.9485, 38.4318], [26.8282, 38.5271], [26.8879, 38.5107], [26.8182, 38.586]],
  "kusadasi-g": [[27.1818, 37.5518], [27.219, 37.5865], [27.1965, 37.606], [27.0029, 37.6615], [27.2421, 37.731], [27.2721, 37.9512], [26.941, 38.0746]],
  "gulluk-g": [[27.1875, 37.2802], [27.3057, 37.3216], [27.4388, 37.2869], [27.5534, 37.1821], [27.5731, 37.0836], [27.4928, 37.0173], [27.3532, 36.9994], [27.2296, 37.0615], [27.1875, 37.2802]],
  "gokova-g": [[27.6565, 36.6626], [27.5738, 36.6849], [27.4785, 36.6471], [27.3615, 36.7038], [27.4643, 36.7624], [27.6099, 36.764], [27.6404, 36.811], [28.0329, 36.7876], [28.0651, 36.821], [28.0024, 36.8351], [28.059, 36.8788], [28.0207, 36.9257], [28.1679, 36.9068], [28.1974, 36.9826], [28.3265, 37.0493], [27.5657, 36.9746], [27.4243, 37.0357], [27.3762, 36.9987], [27.3826, 37.0265], [27.331, 37.0146], [27.2871, 36.9576], [27.2254, 37.0585], [27.2613, 37.0918]],
  "antalya-g": [[32.1982, 36.3654], [32.0296, 36.5382], [31.7746, 36.604], [31.3349, 36.8079], [31.0065, 36.8582], [30.7574, 36.8449], [30.7001, 36.8846], [30.5749, 36.7949], [30.5546, 36.6479], [30.5915, 36.5893], [30.4813, 36.434], [30.5296, 36.3343], [30.4649, 36.3054]],
  "mersin-g": [[35.2921, 36.6301], [35.251, 36.6782], [35.1646, 36.6813], [35.3246, 36.5588], [34.9018, 36.7254], [34.8157, 36.7971], [34.654, 36.8076], [34.2601, 36.5715], [34.0821, 36.4151], [34.0768, 36.324], [33.9971, 36.304], [33.9626, 36.2318], [33.9376, 36.2896], [33.866, 36.3149], [33.6896, 36.1346], [33.6479, 36.1937], [33.561, 36.1254], [33.474, 36.1593], [33.3946, 36.1249], [33.3524, 36.1543], [33.1465, 36.1379], [33.0815, 36.0696], [32.9501, 36.1037], [32.8032, 36.0154], [32.5932, 36.0788]],
  "iskenderun-g": [[36.739, 36.8242], [36.6707, 36.8427], [36.553, 36.5011], [36.6226, 36.3912], [36.6078, 36.3299], [36.6662, 36.3302], [36.7048, 36.2503], [36.6184, 36.2166], [36.4954, 36.2345], [36.4711, 36.2018], [36.3975, 36.2232], [36.3786, 36.001], [36.2127, 35.9515], [36.1691, 35.8154], [36.0187, 35.8811], [36.0085, 35.9403], [35.9185, 35.9323], [35.979, 36.019], [35.7796, 36.3176], [36.0368, 36.5337], [36.1929, 36.5935], [36.2057, 36.7835], [36.1465, 36.8571], [36.0049, 36.9301], [35.7946, 36.7657], [35.6668, 36.7671], [35.5996, 36.6999], [35.5638, 36.7132], [35.5846, 36.6796], [35.6243, 36.7337], [35.7238, 36.7121], [35.5679, 36.5657], [35.4068, 36.5729]],
};

function project([longitude, latitude]: Coordinate): Coordinate {
  return [
    ((longitude - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * 1000,
    ((MAP_BOUNDS.north - latitude) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * 430,
  ];
}

function ringPath(ring: Coordinate[]) {
  return ring.map((coordinate, index) => {
    const [x, y] = project(coordinate);
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";
}

function smoothPath(points: Coordinate[]) {
  if (points.length < 3) {
    return points
      .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");
  }
  const commands = [`M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`];
  for (let index = 1; index < points.length - 1; index += 1) {
    const [x, y] = points[index];
    const [nextX, nextY] = points[index + 1];
    commands.push(`Q${x.toFixed(1)},${y.toFixed(1)} ${((x + nextX) / 2).toFixed(1)},${((y + nextY) / 2).toFixed(1)}`);
  }
  const [lastX, lastY] = points.at(-1)!;
  commands.push(`L${lastX.toFixed(1)},${lastY.toFixed(1)}`);
  return commands.join(" ");
}

function provincePath(feature: ProvinceFeature) {
  if (feature.geometry.type === "Polygon") {
    return (feature.geometry.coordinates as Coordinate[][]).map(ringPath).join(" ");
  }
  return (feature.geometry.coordinates as Coordinate[][][])
    .flatMap((polygon) => polygon.map(ringPath))
    .join(" ");
}

function lakePath(feature: LakeFeature) {
  if (feature.geometry.type === "Polygon") {
    return (feature.geometry.coordinates as Coordinate[][]).map(ringPath).join(" ");
  }
  return (feature.geometry.coordinates as Coordinate[][][])
    .flatMap((polygon) => polygon.map(ringPath))
    .join(" ");
}

function riverPath(feature: RiverFeature) {
  const lines = feature.geometry.type === "LineString"
    ? [feature.geometry.coordinates as Coordinate[]]
    : (feature.geometry.coordinates as Coordinate[][]);
  return lines
    .filter((line) => line.length > 1)
    .map((line) =>
      line
        .map((coordinate, index) => {
          const [x, y] = project(coordinate);
          return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" "),
    )
    .join(" ");
}

function provinceCenter(feature: ProvinceFeature): Coordinate {
  const coordinates = feature.geometry.type === "Polygon"
    ? (feature.geometry.coordinates as Coordinate[][]).flat()
    : (feature.geometry.coordinates as Coordinate[][][]).flat(2);
  const projected = coordinates.map(project);
  const xs = projected.map(([x]) => x);
  const ys = projected.map(([, y]) => y);
  return [
    (Math.min(...xs) + Math.max(...xs)) / 2,
    (Math.min(...ys) + Math.max(...ys)) / 2,
  ];
}

function provinceSetCenter(plates: number[], provinces: ProvinceFeature[]): Coordinate {
  const selected = provinces.filter((province) => plates.includes(province.properties.plate));
  if (selected.length === 0) return [500, 215];
  const projected = selected.flatMap((province) => {
    const coordinates = province.geometry.type === "Polygon"
      ? (province.geometry.coordinates as Coordinate[][]).flat()
      : (province.geometry.coordinates as Coordinate[][][]).flat(2);
    return coordinates.map(project);
  });
  const xs = projected.map(([x]) => x);
  const ys = projected.map(([, y]) => y);
  return [
    (Math.min(...xs) + Math.max(...xs)) / 2,
    (Math.min(...ys) + Math.max(...ys)) / 2,
  ];
}

function lakeShapeId(feature: Feature) {
  const aliases: Record<string, string> = {
    "aktas-lake": "aktas",
    "manyas-bird-tour": "manyas",
    "golcuk-geotour": "golcuk",
    "meke-geotour": "meke",
    "acigol-geotour": "acigol-karapinar",
    "van-vs": "van",
    "iznik-t": "iznik",
    "manyas-t": "manyas",
    "tuz-t": "tuz",
    "ercis": "ercek",
    "burdur-r": "burdur",
    "uluabat-r": "uluabat",
    "seyfe-r": "seyfe",
    "nemrut-kaldera": "nemrut",
    "akyatan-r": "akyatan-set",
    "meke-r": "meke",
    "kizoren-r": "kizoren",
    "ulubat": "uluabat",
    "kiziloren-l": "kizoren",
    "haçli": "hacli",
    kus: "manyas",
  };
  return (aliases[feature.id] ?? feature.id).replace(/-(t|vl|l)$/, "");
}

function riverShapeId(feature: Feature) {
  const aliases: Record<string, string> = {
    "meric-br": "meric",
    "aras-br": "aras",
    "asi-br": "asi",
  };
  return aliases[feature.id] ?? feature.id;
}

function realLineFor(feature: Feature) {
  const exactLine = REAL_LINES[feature.id];
  if (exactLine) return exactLine;
  if (!["mountain", "river", "route"].includes(feature.kind)) return undefined;
  const canonicalId = feature.id.replace(/-(f|t|vs|n|s|gl|d|br)$/, "");
  return REAL_LINES[canonicalId];
}

function areaPolygonFor(feature: Feature) {
  return ["plain", "plateau", "region", "lake"].includes(feature.kind)
    ? AREA_POLYGONS[feature.id]
    : undefined;
}

function areaPolygonsFor(feature: Feature) {
  if (!["plain", "plateau", "region", "lake"].includes(feature.kind)) return undefined;
  const multiPolygon = AREA_MULTI_POLYGONS[feature.id];
  if (multiPolygon) return multiPolygon;
  const polygon = AREA_POLYGONS[feature.id];
  return polygon ? [polygon] : undefined;
}

function distributionPolygonsFor(feature: Feature) {
  return DISTRIBUTION_POLYGONS[feature.id];
}

function featureCenter(feature: Feature): Coordinate {
  const neighborLabel = NEIGHBOR_LABEL_COORDINATES[feature.id];
  if (neighborLabel) return project(neighborLabel);
  const point = POINT_COORDINATES[feature.id] ?? functionalCityCoordinate(feature.id);
  if (point) return project(point);
  const areaPolygons = areaPolygonsFor(feature);
  if (areaPolygons) {
    const projected = areaPolygons.flat().map(project);
    const xs = projected.map(([x]) => x);
    const ys = projected.map(([, y]) => y);
    return [
      (Math.min(...xs) + Math.max(...xs)) / 2,
      (Math.min(...ys) + Math.max(...ys)) / 2,
    ];
  }
  const distributionPolygons = distributionPolygonsFor(feature);
  if (distributionPolygons) {
    const projected = distributionPolygons.flat().map(project);
    const xs = projected.map(([x]) => x);
    const ys = projected.map(([, y]) => y);
    return [
      (Math.min(...xs) + Math.max(...xs)) / 2,
      (Math.min(...ys) + Math.max(...ys)) / 2,
    ];
  }
  const realLine = realLineFor(feature);
  if (realLine) {
    const projected = realLine.map(project);
    const xs = projected.map(([x]) => x);
    const ys = projected.map(([, y]) => y);
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  }
  return [50 + feature.x * 9, 20 + feature.y * 3.75];
}

function featureLabelCenter(feature: Feature, center: Coordinate, featureIndex = 0): Coordinate {
  const defaultOffset: Coordinate = feature.kind === "mountain"
    ? [featureIndex % 2 === 0 ? -26 : 26, -28 - (featureIndex % 3) * 20]
    : [0, -18];
  const [offsetX, offsetY] = LABEL_OFFSETS[feature.id] ?? defaultOffset;
  return [center[0] + offsetX, center[1] + offsetY];
}

type LabelPlacement = { x: number; y: number; width: number };

function featureLabelWidth(name: string) {
  return Math.min(190, Math.max(88, name.length * 5.8 + 24));
}

function labelOverlapArea(
  left: { x1: number; y1: number; x2: number; y2: number },
  right: { x1: number; y1: number; x2: number; y2: number },
) {
  const width = Math.max(0, Math.min(left.x2, right.x2) - Math.max(left.x1, right.x1));
  const height = Math.max(0, Math.min(left.y2, right.y2) - Math.max(left.y1, right.y1));
  return width * height;
}

function collisionAwareLabelPlacements(
  features: Feature[],
  correctIds: string[],
  provinces: ProvinceFeature[],
) {
  const placements = new Map<string, LabelPlacement>();
  const occupied: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  features.forEach((feature, featureIndex) => {
    if (!correctIds.includes(feature.id)) return;
    const center = feature.plates?.length
      ? provinceSetCenter(feature.plates, provinces)
      : featureCenter(feature);
    const preferred = featureLabelCenter(feature, center, featureIndex);
    const preferredOffset: Coordinate = [preferred[0] - center[0], preferred[1] - center[1]];
    const offsets: Coordinate[] = [
      preferredOffset,
      [0, -25],
      [0, 34],
      [-82, -24],
      [82, -24],
      [-82, 33],
      [82, 33],
      [0, -58],
      [0, 68],
      [-120, 0],
      [120, 0],
    ];
    const uniqueOffsets = offsets.filter(
      (offset, index) =>
        offsets.findIndex((candidate) => candidate[0] === offset[0] && candidate[1] === offset[1]) === index,
    );
    const width = featureLabelWidth(feature.name);
    const candidates = uniqueOffsets.map(([offsetX, offsetY]) => {
      const x = Math.min(988 - width / 2, Math.max(12 + width / 2, center[0] + offsetX));
      const y = Math.min(418, Math.max(26, center[1] + offsetY));
      const box = { x1: x - width / 2 - 4, y1: y - 21, x2: x + width / 2 + 4, y2: y + 7 };
      const overlap = occupied.reduce((sum, item) => sum + labelOverlapArea(box, item), 0);
      const distance = Math.hypot(x - preferred[0], y - preferred[1]);
      return { x, y, width, box, score: overlap * 100 + distance };
    });
    const selected = candidates.reduce((best, candidate) =>
      candidate.score < best.score ? candidate : best,
    );
    placements.set(feature.id, { x: selected.x, y: selected.y, width });
    occupied.push(selected.box);
  });

  return placements;
}

const EXPANDED_AREA_HIT_IDS = new Set([
  "kuyucuk",
  "sultan-sazligi",
  "nemrut-kaldera",
  "seyfe-r",
  "meke-r",
  "kizoren-r",
]);

function featureHitArea(feature: Feature) {
  const usesExpandedAreaHit = areaPolygonFor(feature)
    && (
      feature.kind === "lake"
      || feature.id.startsWith("tombolo-")
      || EXPANDED_AREA_HIT_IDS.has(feature.id)
    );
  if (usesExpandedAreaHit) {
    const [cx, cy] = featureCenter(feature);
    return (
      <rect
        className="geo-hit geo-hit--small-area"
        x={cx - 18}
        y={cy - 15}
        width="36"
        height="30"
        rx="8"
      />
    );
  }
  if (!["volcano", "city", "landmark", "gate", "pass", "mine", "energy", "dam", "port", "bridge", "tunnel"].includes(feature.kind)) return null;
  const [cx, cy] = featureCenter(feature);
  const [offsetX, offsetY] = feature.kind === "port"
    ? PORT_CALLOUT_OFFSETS[feature.id] ?? [0, 0]
    : [0, 0];
  return <rect className="geo-hit" x={cx + offsetX - Math.max(feature.w * 4, 16)} y={cy + offsetY - Math.max(feature.h * 2, 12)} width={Math.max(feature.w * 8, 32)} height={Math.max(feature.h * 4, 24)} />;
}

function featureGraphic(
  feature: Feature,
  lakeShape?: LakeFeature,
  riverShape?: RiverFeature,
  basinShape?: BasinFeature,
  provinces: ProvinceFeature[] = [],
  neighborShape?: NeighborFeature,
  faultShape?: FaultFeature,
) {
  const realLine = realLineFor(feature);
  const straitPolygon = STRAIT_POLYGONS[feature.id];
  const [cx, cy] = featureCenter(feature);
  const compactPoint = [
    "volcano", "city", "landmark", "gate", "pass", "mine", "energy", "dam", "port", "bridge", "tunnel",
  ].includes(feature.kind);
  const width = compactPoint ? Math.max(Math.min(feature.w * 4.2, 30), 18) : Math.max(feature.w * 7.2, 20);
  const height = compactPoint ? Math.max(Math.min(feature.h * 2.2, 18), 11) : Math.max(feature.h * 3.1, 12);
  const usesRiverOverride = feature.kind === "river"
    && ["aras", "aras-br", "coruh"].includes(feature.id)
    && realLine;

  if (feature.plates?.length) {
    return (
      <g className="geo-province-union">
        {provinces
          .filter((province) => feature.plates?.includes(province.properties.plate))
          .map((province) => (
            <path
              key={`${feature.id}-${province.properties.plate}`}
              d={provincePath(province)}
              className="geo-shape geo-shape--region geo-shape--province-area"
              fillRule="evenodd"
            />
          ))}
      </g>
    );
  }

  if (straitPolygon) {
    const path = ringPath(straitPolygon);
    return (
      <g className="geo-strait">
        <path d={path} className="geo-lake-hit" />
        <path d={path} className="geo-shape geo-shape--lake geo-shape--strait geo-shape--exact" />
      </g>
    );
  }

  if (lakeShape) {
    const path = lakePath(lakeShape);
    const isMicroLake = [
      "kilimli-glacial",
      "aynali-glacial",
      "karagol-uludag-glacial",
      "buzlu-uludag-glacial",
      "heybeli-uludag-glacial",
      "deligol-glacial",
      "sat-ikiyaka-glacial",
    ].includes(feature.id);
    if (isMicroLake) {
      const [anchorX, anchorY] = featureCenter(feature);
      const calloutOffsets: Record<string, Coordinate> = {
        "kilimli-glacial": [-44, 25],
        "aynali-glacial": [44, 25],
        "karagol-uludag-glacial": [0, 58],
        "buzlu-uludag-glacial": [-24, -34],
        "heybeli-uludag-glacial": [24, -34],
        "deligol-glacial": [-27, 31],
        "sat-ikiyaka-glacial": [-27, 31],
      };
      const [offsetX, offsetY] = calloutOffsets[feature.id];
      const calloutX = anchorX + offsetX;
      const calloutY = anchorY + offsetY;
      const scale = feature.id === "deligol-glacial"
        ? 120
        : feature.id === "sat-ikiyaka-glacial"
          ? 90
          : 150;
      return (
        <g className="micro-lake-callout">
          <line
            className="micro-lake-leader"
            x1={anchorX}
            y1={anchorY}
            x2={calloutX}
            y2={calloutY}
          />
          <circle className="micro-lake-anchor" cx={anchorX} cy={anchorY} r="2.8" />
          <path d={path} className="micro-lake-anchor-shape" fillRule="evenodd" />
          <rect
            className="micro-lake-hit-box"
            x={calloutX - 15}
            y={calloutY - 13}
            width="30"
            height="26"
            rx="7"
          />
          <g transform={`translate(${calloutX} ${calloutY}) scale(${scale}) translate(${-anchorX} ${-anchorY})`}>
            <path
              d={path}
              className={`geo-shape geo-shape--lake geo-shape--exact geo-shape--micro-lake${
                feature.id === "heybeli-uludag-glacial" ? " geo-shape--seasonal-lake" : ""
              }`}
              fillRule="evenodd"
            />
          </g>
        </g>
      );
    }
    return (
      <g>
        <path d={path} className="geo-lake-hit" fillRule="evenodd" />
        <path
          d={path}
          className="geo-shape geo-shape--lake geo-shape--exact"
          fillRule="evenodd"
        />
      </g>
    );
  }

  if (basinShape) {
    return (
      <path
        d={lakePath(basinShape)}
        className="geo-shape geo-shape--region geo-shape--area geo-shape--exact-basin"
        fillRule="evenodd"
      />
    );
  }

  if (neighborShape) {
    return (
      <path
        d={lakePath(neighborShape)}
        className="geo-shape geo-shape--country"
        fillRule="evenodd"
      />
    );
  }

  if (faultShape) {
    const path = riverPath(faultShape);
    return (
      <g clipPath="url(#turkey-country-clip)">
        <path d={path} className="geo-fault-hit" vectorEffect="non-scaling-stroke" />
        <path
          d={path}
          className="geo-shape geo-shape--line geo-shape--exact-fault"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    );
  }

  const areaPolygons = areaPolygonsFor(feature);
  if (areaPolygons) {
    const isIntermittentPolye = feature.id === "kestel-l";
    return (
      <g clipPath="url(#turkey-country-clip)">
        {areaPolygons.map((polygon, index) => (
          <path
            key={`${feature.id}-area-${index}`}
            d={ringPath(polygon)}
            className={`geo-shape geo-shape--${feature.kind} geo-shape--area${isIntermittentPolye ? " geo-shape--intermittent-polye" : ""}`}
          />
        ))}
      </g>
    );
  }

  const distributionPolygons = distributionPolygonsFor(feature);
  if (distributionPolygons) {
    return (
      <g className="geo-distribution">
        {distributionPolygons.map((polygon, index) => (
          <path
            key={`${feature.id}-distribution-${index}`}
            d={ringPath(polygon)}
            className="geo-shape geo-shape--region geo-shape--distribution"
          />
        ))}
      </g>
    );
  }

  if (usesRiverOverride && realLine) {
    const path = realLine
      .map(([x, y], index) => {
        const [px, py] = project([x, y]);
        return `${index === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`;
      })
      .join(" ");
    return (
      <g>
        <path d={path} className="geo-river-hit" vectorEffect="non-scaling-stroke" />
        <path d={path} className="geo-shape geo-shape--line geo-shape--exact-river" vectorEffect="non-scaling-stroke" />
      </g>
    );
  }

  if (feature.kind === "river" && riverShape) {
    const path = riverPath(riverShape);
    return (
      <g>
        <path d={path} className="geo-river-hit" vectorEffect="non-scaling-stroke" />
        <path
          d={path}
          className="geo-shape geo-shape--line geo-shape--exact-river"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    );
  }

  if (realLine) {
    const points = realLine.map(project);
    const isPipeline = feature.id.startsWith("pipeline-");
    const isBridgeAxis = feature.kind === "bridge";
    const isTunnelAxis = feature.kind === "tunnel";
    const path = isPipeline
      ? smoothPath(points)
      : points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    if (feature.kind === "mountain") {
      const ridgePoints = points;
      return (
        <g>
          <path d={path} className="geo-line-hit" vectorEffect="non-scaling-stroke" />
          <path d={path} className="geo-shape geo-shape--mountain-line" vectorEffect="non-scaling-stroke" />
          {ridgePoints.map(([x, y], index) => (
            <path
              key={`${feature.id}-peak-${index}`}
              d={`M${x - 9},${y + 5} L${x},${y - 9} L${x + 9},${y + 5} Z`}
              className="geo-shape geo-shape--mountain-peak"
            />
          ))}
        </g>
      );
    }
    if (isBridgeAxis || isTunnelAxis) {
      const [startX, startY] = points[0];
      const [endX, endY] = points[points.length - 1];
      const [calloutOffsetX, calloutOffsetY] = STRUCTURE_CALLOUT_OFFSETS[feature.id] ?? [0, 0];
      const calloutX = cx + calloutOffsetX;
      const calloutY = cy + calloutOffsetY;
      const usesCallout = calloutOffsetX !== 0 || calloutOffsetY !== 0;
      return (
        <g className={`structure-axis structure-axis--${isBridgeAxis ? "bridge" : "tunnel"}`}>
          <path d={path} className="geo-line-hit geo-structure-hit" vectorEffect="non-scaling-stroke" />
          <path d={path} className="structure-axis-casing" vectorEffect="non-scaling-stroke" />
          <path
            d={path}
            className={`geo-shape geo-shape--line geo-shape--${isBridgeAxis ? "bridge-axis" : "tunnel-axis"}`}
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={startX} cy={startY} r="3.2" className="structure-axis-end" />
          <circle cx={endX} cy={endY} r="3.2" className="structure-axis-end" />
          {usesCallout && (
            <line
              x1={cx}
              y1={cy}
              x2={calloutX}
              y2={calloutY}
              className="structure-callout-leader"
            />
          )}
          <g
            className={`structure-callout-marker structure-callout-marker--${isBridgeAxis ? "bridge" : "tunnel"}`}
            transform={`translate(${calloutX} ${calloutY})`}
          >
            <circle cx="0" cy="0" r="10" className="structure-callout-halo" />
            {isBridgeAxis ? (
              <path
                d="M-7,3 H7 M-6,3 Q0,-7 6,3 M-4,-1 V6 M4,-1 V6"
                className="geo-shape geo-shape--structure-marker geo-shape--bridge-marker"
              />
            ) : (
              <path
                d="M-7,5 V0 Q-6,-7 0,-7 Q6,-7 7,0 V5 Z M-3,5 V1 Q0,-3 3,1 V5"
                className="geo-shape geo-shape--structure-marker geo-shape--tunnel-marker"
                fillRule="evenodd"
              />
            )}
          </g>
        </g>
      );
    }
    const isCoordinateGrid = /^(parallel|meridian)-/.test(feature.id);
    return (
      <g>
        <path d={path} className="geo-line-hit" vectorEffect="non-scaling-stroke" />
        <path
          d={path}
          className={`geo-shape geo-shape--line${isCoordinateGrid ? " geo-shape--coordinate-grid" : ""}${isPipeline ? " geo-shape--pipeline" : ""}`}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    );
  }
  if (feature.kind === "river") {
    return <path d={`M${cx - width / 2},${cy + height / 3} Q${cx},${cy - height} ${cx + width / 2},${cy}`} className="geo-shape geo-shape--line" />;
  }
  if (feature.kind === "mountain") {
    return <path d={`M${cx - width / 2},${cy + height / 2} L${cx - width / 4},${cy - height / 3} L${cx},${cy + height / 4} L${cx + width / 4},${cy - height / 2} L${cx + width / 2},${cy + height / 2}`} className="geo-shape geo-shape--mountain" />;
  }
  if (feature.kind === "volcano" || feature.kind === "pass") {
    if (feature.kind === "volcano") {
      return (
        <g className="volcano-glyph">
          <ellipse cx={cx} cy={cy + height * .54} rx={width * .58} ry={height * .22} className="volcano-shadow" />
          <path d={`M${cx},${cy - height} L${cx + width / 2},${cy + height / 2} L${cx - width / 2},${cy + height / 2} Z`} className="geo-shape geo-shape--volcano" />
          <path d={`M${cx - width * .13},${cy - height * .42} Q${cx},${cy - height * .58} ${cx + width * .13},${cy - height * .42}`} className="volcano-crater" />
        </g>
      );
    }
    return <path d={`M${cx},${cy - height} L${cx + width / 2},${cy + height / 2} L${cx - width / 2},${cy + height / 2} Z`} className="geo-shape geo-shape--volcano" />;
  }
  if (feature.kind === "dam") {
    return (
      <g className="dam-glyph">
        <path
          d={`M${cx - width * .56},${cy - height * .55} L${cx - width * .42},${cy + height * .52} L${cx + width * .42},${cy + height * .52} L${cx + width * .56},${cy - height * .55} Z`}
          className="geo-shape geo-shape--dam"
        />
        <path
          d={`M${cx - width * .32},${cy - height * .14} H${cx + width * .32} M${cx - width * .25},${cy + height * .17} H${cx + width * .25}`}
          className="dam-detail"
        />
      </g>
    );
  }
  if (feature.kind === "port") {
    const [offsetX, offsetY] = PORT_CALLOUT_OFFSETS[feature.id] ?? [0, 0];
    const markerX = cx + offsetX;
    const markerY = cy + offsetY;
    const usesCallout = offsetX !== 0 || offsetY !== 0;
    return (
      <g className="port-glyph">
        {usesCallout && (
          <>
            <line
              x1={cx}
              y1={cy}
              x2={markerX}
              y2={markerY}
              className="port-callout-leader"
            />
            <circle cx={cx} cy={cy} r="3.2" className="port-callout-anchor" />
          </>
        )}
        <circle cx={markerX} cy={markerY} r={Math.max(height * .62, 7)} className="geo-shape geo-shape--port" />
        <path
          d={`M${markerX},${markerY - height * .62} L${markerX},${markerY + height * .5} M${markerX - width * .3},${markerY - height * .25} L${markerX + width * .3},${markerY - height * .25} M${markerX - width * .38},${markerY + height * .08} Q${markerX - width * .34},${markerY + height * .55} ${markerX},${markerY + height * .58} Q${markerX + width * .34},${markerY + height * .55} ${markerX + width * .38},${markerY + height * .08}`}
          className="port-detail"
        />
      </g>
    );
  }
  if (feature.kind === "bridge") {
    return (
      <g className="bridge-glyph">
        <path d={`M${cx - width * .62},${cy + height * .35} L${cx + width * .62},${cy + height * .35} M${cx - width * .46},${cy + height * .35} Q${cx},${cy - height * .72} ${cx + width * .46},${cy + height * .35}`} className="geo-shape geo-shape--bridge" />
        <path d={`M${cx - width * .38},${cy - height * .02} L${cx - width * .38},${cy + height * .62} M${cx + width * .38},${cy - height * .02} L${cx + width * .38},${cy + height * .62}`} className="bridge-detail" />
      </g>
    );
  }
  if (feature.kind === "tunnel") {
    return (
      <g className="tunnel-glyph">
        <path d={`M${cx - width * .58},${cy + height * .55} L${cx - width * .58},${cy} Q${cx - width * .52},${cy - height * .72} ${cx},${cy - height * .72} Q${cx + width * .52},${cy - height * .72} ${cx + width * .58},${cy} L${cx + width * .58},${cy + height * .55} Z`} className="geo-shape geo-shape--tunnel" />
        <path d={`M${cx - width * .27},${cy + height * .52} L${cx - width * .27},${cy + height * .05} Q${cx},${cy - height * .34} ${cx + width * .27},${cy + height * .05} L${cx + width * .27},${cy + height * .52}`} className="tunnel-detail" />
      </g>
    );
  }
  if (feature.kind === "landmark") {
    return (
      <g className="landmark-glyph">
        <path
          d={`M${cx - width * .58},${cy - height * .18} L${cx},${cy - height * .82} L${cx + width * .58},${cy - height * .18} Z M${cx - width * .5},${cy + height * .5} H${cx + width * .5} V${cy + height * .72} H${cx - width * .5} Z`}
          className="geo-shape geo-shape--landmark"
          fillRule="evenodd"
        />
        <path
          d={`M${cx - width * .34},${cy - height * .08} V${cy + height * .48} M${cx},${cy - height * .08} V${cy + height * .48} M${cx + width * .34},${cy - height * .08} V${cy + height * .48}`}
          className="landmark-detail"
        />
      </g>
    );
  }
  if (feature.kind === "city" || feature.kind === "gate" || feature.kind === "mine" || feature.kind === "energy") {
    return <path d={`M${cx},${cy - height} L${cx + width / 2},${cy} L${cx},${cy + height} L${cx - width / 2},${cy} Z`} className={`geo-shape geo-shape--${feature.kind}`} />;
  }
  return <ellipse cx={cx} cy={cy} rx={width / 2} ry={height / 2} className={`geo-shape geo-shape--${feature.kind}`} transform={`rotate(${feature.r ?? 0} ${cx} ${cy})`} />;
}

function TurkeyMap({
  quiz,
  currentFeatureId,
  correctIds,
  wrongIds,
  showAllLabels,
  onSelect,
}: {
  quiz: Quiz;
  currentFeatureId: string;
  correctIds: string[];
  wrongIds: string[];
  showAllLabels: boolean;
  onSelect: (feature: Feature) => void;
}) {
  const [provinces, setProvinces] = useState<ProvinceFeature[]>([]);
  const [lakes, setLakes] = useState<LakeFeature[]>([]);
  const [rivers, setRivers] = useState<RiverFeature[]>([]);
  const [basins, setBasins] = useState<BasinFeature[]>([]);
  const [neighbors, setNeighbors] = useState<NeighborFeature[]>([]);
  const [faults, setFaults] = useState<FaultFeature[]>([]);
  const [hoveredProvince, setHoveredProvince] = useState("");
  const uniqueFeatures = [...new Map(quiz.features.map((feature) => [feature.id, feature])).values()];
  const orderedFeatures = [...uniqueFeatures].sort((left, right) => {
    if (left.id === currentFeatureId) return 1;
    if (right.id === currentFeatureId) return -1;
    return 0;
  });
  const visibleLabelIds = showAllLabels ? correctIds.slice(-1) : [];
  const labelPlacements = collisionAwareLabelPlacements(orderedFeatures, visibleLabelIds, provinces);

  useEffect(() => {
    fetch("/data/turkey-provinces.geojson")
      .then((response) => response.json())
      .then((data) => setProvinces(data.features as ProvinceFeature[]))
      .catch(() => setProvinces([]));
    Promise.all([
      fetch("/data/turkey-lakes.geojson").then((response) => response.json()),
      fetch("/data/turkey-lakes-extra.geojson").then((response) => response.json()),
      fetch("/data/turkey-lakes-karstic-extra.geojson").then((response) => response.json()),
      fetch("/data/turkey-lakes-eastern-extra.geojson").then((response) => response.json()),
      fetch("/data/turkey-lakes-border-extra.geojson").then((response) => response.json()),
      fetch("/data/turkey-natural-set-lakes.geojson").then((response) => response.json()),
      fetch("/data/turkey-mixed-glacial-lakes.geojson").then((response) => response.json()),
      fetch("/data/turkey-ramsar.geojson").then((response) => response.json()),
    ])
      .then((collections) => setLakes(
        collections.flatMap((data) => data.features as LakeFeature[]),
      ))
      .catch(() => setLakes([]));
    Promise.all([
      fetch("/data/turkey-rivers.geojson").then((response) => response.json()),
      fetch("/data/turkey-rivers-extra.geojson").then((response) => response.json()),
      fetch("/data/turkey-rivers-official-extra.geojson").then((response) => response.json()),
    ])
      .then((collections) => setRivers(
        collections.flatMap((data) => data.features as RiverFeature[]),
      ))
      .catch(() => setRivers([]));
    fetch("/data/turkey-closed-basins.geojson")
      .then((response) => response.json())
      .then((data) => setBasins(data.features as BasinFeature[]))
      .catch(() => setBasins([]));
    fetch("/data/turkey-neighbors.geojson")
      .then((response) => response.json())
      .then((data) => setNeighbors(data.features as NeighborFeature[]))
      .catch(() => setNeighbors([]));
    fetch("/data/turkey-active-faults.geojson")
      .then((response) => response.json())
      .then((data) => setFaults(data.features as FaultFeature[]))
      .catch(() => setFaults([]));
  }, []);

  return (
    <div className="real-map-wrap">
      <svg
        className={`real-map${quiz.id === "neighbors" ? " real-map--neighbors" : ""}`}
        viewBox={quiz.id === "neighbors"
          ? "-100 -80 1200 590"
          : quiz.id === "absolute-location"
            ? "-25 -15 1050 460"
            : "0 0 1000 430"}
        role="img"
        aria-label={quiz.id === "neighbors"
          ? `Türkiye ve sekiz kara komşusu üzerinde ${quiz.title}`
          : `81 il sınırları üzerinde ${quiz.title}`}
      >
        <defs>
          <clipPath id="turkey-country-clip">
            {provinces.map((province) => (
              <path key={`clip-${province.properties.plate}`} d={provincePath(province)} />
            ))}
          </clipPath>
          <linearGradient id="terrain-atlas-tint" x1="0" y1="0" x2="1" y2=".2">
            <stop offset="0%" stopColor="#73b467" />
            <stop offset="38%" stopColor="#eadc88" />
            <stop offset="68%" stopColor="#e9b95d" />
            <stop offset="100%" stopColor="#dc8538" />
          </linearGradient>
        </defs>
        <image
          className="relief-layer"
          href="/data/turkey-terrain.png"
          x="0"
          y="0"
          width="1000"
          height="430"
          preserveAspectRatio="none"
          clipPath="url(#turkey-country-clip)"
        />
        <rect
          className="terrain-tint"
          x="0"
          y="0"
          width="1000"
          height="430"
          fill="url(#terrain-atlas-tint)"
          clipPath="url(#turkey-country-clip)"
        />
        {quiz.id === "neighbors" && (
          <g className="neighbor-quiz-layer">
            {orderedFeatures.map((feature) => {
              const status = correctIds.includes(feature.id)
                ? "correct"
                : wrongIds.includes(feature.id)
                  ? "wrong"
                  : "idle";
              const neighborShape = neighbors.find(
                (neighbor) => neighbor.properties.id === feature.id,
              );
              if (!neighborShape) return null;
              return (
                <g
                  key={`neighbor-${feature.id}`}
                  role="button"
                  tabIndex={0}
                  data-feature-id={feature.id}
                  data-feature-name={feature.name}
                  data-status={status}
                  aria-label={status === "correct" ? `${feature.name}, doğru bilindi` : "Komşu ülke seçeneği"}
                  className={`geo-feature geo-feature--${status} geo-feature--country`}
                  onPointerEnter={() => setHoveredProvince(feature.name)}
                  onPointerLeave={() => setHoveredProvince("")}
                  onClick={() => onSelect(feature)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") onSelect(feature);
                  }}
                >
                  {featureGraphic(feature, undefined, undefined, undefined, provinces, neighborShape)}
                </g>
              );
            })}
          </g>
        )}
        <g className="province-layer">
          {provinces.map((province) => (
            <path
              key={province.properties.plate}
              d={provincePath(province)}
              fill={MAP_COLORS[province.properties.plate % MAP_COLORS.length]}
              fillOpacity=".46"
              onPointerEnter={() => setHoveredProvince(province.properties.name)}
              onPointerLeave={() => setHoveredProvince("")}
            >
              <title>{province.properties.name}</title>
            </path>
          ))}
        </g>
        {quiz.id === "provinces" && (
          <g className="province-quiz-layer">
            {provinces.map((province) => {
              const feature = quiz.features.find((item) => item.plate === province.properties.plate);
              if (!feature) return null;
              const status = correctIds.includes(feature.id)
                ? "correct"
                : wrongIds.includes(feature.id)
                  ? "wrong"
                  : "idle";
              const [cx, cy] = provinceCenter(province);
              return (
                <g
                  key={`quiz-${province.properties.plate}`}
                  role="button"
                  tabIndex={0}
                  data-feature-id={feature.id}
                  data-feature-name={feature.name}
                  data-status={status}
                  aria-label={status === "correct" ? `${feature.name}, doğru bilindi` : "İl seçeneği"}
                  className={`province-option province-option--${status}`}
                  onClick={() => onSelect(feature)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") onSelect(feature);
                  }}
                >
                  <path d={provincePath(province)} fillRule="evenodd" />
                  {status === "correct" && visibleLabelIds.includes(feature.id) && (
                    <g className="geo-label geo-label--province" transform={`translate(${cx} ${cy})`}>
                      <rect
                        x={-Math.min(82, Math.max(36, feature.name.length * 5.2 + 12)) / 2}
                        y="-14"
                        width={Math.min(82, Math.max(36, feature.name.length * 5.2 + 12))}
                        height="17"
                        rx="4"
                      />
                      <text textAnchor="middle" y="-2">{feature.name}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        )}
        {quiz.id !== "provinces" && quiz.id !== "neighbors" && <g className="feature-layer">
          {orderedFeatures.map((feature) => {
            const status = correctIds.includes(feature.id)
              ? "correct"
              : wrongIds.includes(feature.id)
                ? "wrong"
                : "idle";
            return (
              <g
                key={feature.id}
                role="button"
                tabIndex={0}
                data-feature-id={feature.id}
                data-feature-name={feature.name}
                data-status={status}
                aria-label={status === "correct" ? `${feature.name}, doğru bilindi` : "Harita seçeneği"}
                className={`geo-feature geo-feature--${status}${
                  feature.id === currentFeatureId ? " geo-feature--current" : ""
                }`}
                onClick={() => onSelect(feature)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") onSelect(feature);
                }}
              >
                {featureHitArea(feature)}
                {featureGraphic(
                  feature,
                  lakes.find((lake) => lake.properties.id === lakeShapeId(feature)),
                  rivers.find((river) => river.properties.id === riverShapeId(feature)),
                  basins.find((basin) => basin.properties.id === feature.id),
                  provinces,
                  undefined,
                  faults.find((fault) => fault.properties.id === feature.id),
                )}
              </g>
            );
          })}
        </g>}
        {quiz.id !== "provinces" && (
          <g className="label-layer" aria-hidden="true">
            {orderedFeatures
              .filter((feature) => visibleLabelIds.includes(feature.id))
              .map((feature) => {
                const center = feature.plates?.length
                  ? provinceSetCenter(feature.plates, provinces)
                  : featureCenter(feature);
                const placement = labelPlacements.get(feature.id);
                if (!placement) return null;
                return (
                  <g key={`label-${feature.id}`}>
                    {Math.hypot(placement.x - center[0], placement.y - center[1]) > 20 && (
                      <line
                        className="geo-label-leader"
                        x1={center[0]}
                        y1={center[1]}
                        x2={placement.x}
                        y2={placement.y - 10}
                      />
                    )}
                    <g
                      className="geo-label"
                      data-label-for={feature.id}
                      transform={`translate(${placement.x} ${placement.y})`}
                    >
                      <rect x={-placement.width / 2} y="-19" width={placement.width} height="22" rx="5" />
                      <text textAnchor="middle" y="-4">{feature.name}</text>
                    </g>
                  </g>
                );
              })}
          </g>
        )}
      </svg>
      <div className="map-province-readout">
        <span>{quiz.id === "neighbors"
          ? "8 KARA KOMŞUSU"
          : quiz.id === "absolute-location"
            ? "36°–42° K · 26°–45° D"
            : "81 İL SINIRI"}</span>
        <strong>{hoveredProvince || (quiz.id === "neighbors"
          ? "Ülke poligonuna gel"
          : quiz.id === "absolute-location"
            ? "Koordinat çizgisine gel"
            : "İlin üzerine gel")}</strong>
      </div>
      <div className="map-attribution">
        {quiz.id === "absolute-location"
          ? "Koordinatlar: MEB Türkiye'nin mutlak konumu · "
          : quiz.id === "fault-systems"
          ? "Diri fay çizgileri: MTA TDFH-2026 · "
          : quiz.id === "neighbors"
          ? "Ülke sınırları: Natural Earth 1:50m · "
          : "Rölyef: Esri · İl sınırları: açık coğrafi veri · "}
        <a
          href={quiz.id === "absolute-location"
            ? "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page23.html"
            : quiz.id === "fault-systems"
              ? "https://tdfh.mta.gov.tr/"
              : "https://www.openstreetmap.org/copyright"}
          target="_blank"
          rel="noreferrer"
        >
          {quiz.id === "absolute-location"
            ? "Millî Eğitim Bakanlığı"
            : quiz.id === "fault-systems"
            ? "Maden Tetkik ve Arama Genel Müdürlüğü"
            : quiz.id === "neighbors"
              ? "Türkiye il sınırları: © OpenStreetMap katkıcıları"
              : "© OpenStreetMap katkıcıları"}
        </a>
      </div>
      {provinces.length === 0 && <div className="map-loading">Gerçek Türkiye haritası yükleniyor…</div>}
    </div>
  );
}

export default function Home() {
  const [activeQuizId, setActiveQuizId] = useState(QUIZZES[0].id);
  const [questionOrder, setQuestionOrder] = useState(
    QUIZZES[0].features.map((feature) => feature.id),
  );
  const [activeGroup, setActiveGroup] = useState("Tümü");
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showAllLabels, setShowAllLabels] = useState(true);
  const [quizReady, setQuizReady] = useState(false);

  const quiz = QUIZZES.find((item) => item.id === activeQuizId) ?? QUIZZES[0];
  const quizFeatureCount = new Set(quiz.features.map((feature) => feature.id)).size;
  const sourceRef = SOURCE_BY_QUIZ[quiz.id] ?? SOURCE_BY_GROUP[quiz.group];
  const currentId = questionOrder[0]
    ?? quiz.features.find((feature) => !correctIds.includes(feature.id))?.id
    ?? quiz.features[0].id;
  const current = quiz.features.find((feature) => feature.id === currentId) ?? quiz.features[0];
  const visibleQuizzes = useMemo(
    () =>
      activeGroup === "Tümü"
        ? QUIZZES
        : QUIZZES.filter((item) => item.group === activeGroup),
    [activeGroup],
  );

  const accuracy =
    attempts === 0 ? 100 : Math.round((correctIds.length / attempts) * 100);

  const resetQuiz = (nextQuizId = activeQuizId) => {
    const nextQuiz = QUIZZES.find((item) => item.id === nextQuizId) ?? QUIZZES[0];
    setActiveQuizId(nextQuizId);
    setQuestionOrder((previousOrder) => shuffledFeatureIds(nextQuiz.features, previousOrder));
    setCorrectIds([]);
    setWrongIds([]);
    setAttempts(0);
    setFinished(false);
    setShowAllLabels(true);
    setMenuOpen(false);
    window.localStorage.setItem(ACTIVE_QUIZ_STORAGE_KEY, nextQuiz.id);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleSelect = (feature: Feature) => {
    if (!quizReady || finished || correctIds.includes(feature.id)) return;

    if (feature.id !== current.id) {
      flushSync(() => {
        setAttempts((value) => value + 1);
        setWrongIds((ids) =>
          ids.includes(feature.id) ? ids : [...ids, feature.id],
        );
      });
      if (soundOn) playMapSound("wrong");
      return;
    }

    const nextCorrect = correctIds.includes(feature.id)
      ? correctIds
      : [...correctIds, feature.id];
    const isLastQuestion = nextCorrect.length === quizFeatureCount;
    flushSync(() => {
      setAttempts((value) => value + 1);
      setCorrectIds(nextCorrect);
      setQuestionOrder((order) => order.filter((id) => id !== feature.id));
      setWrongIds([]);
      if (isLastQuestion) setFinished(true);
    });
    if (soundOn) playMapSound("correct");

  };

  useEffect(() => {
    const savedQuizId = window.localStorage.getItem(ACTIVE_QUIZ_STORAGE_KEY);
    const savedQuiz = QUIZZES.find((item) => item.id === savedQuizId);
    const restoredQuiz = savedQuiz ?? QUIZZES[0];
    const restoreFrame = window.requestAnimationFrame(() => {
      setActiveQuizId(restoredQuiz.id);
      setQuestionOrder((previousOrder) => shuffledFeatureIds(restoredQuiz.features, previousOrder));
      setQuizReady(true);
    });
    return () => window.cancelAnimationFrame(restoreFrame);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="app-shell" data-quiz-ready={quizReady}>
      <header className="topbar">
        <a className="brand" href="#oyun" aria-label="Coğrafya Peşinde ana sayfa">
          <span className="brand-mark">CP</span>
          <span>
            <strong>Coğrafya Peşinde</strong>
            <small>KPSS Türkiye harita laboratuvarı</small>
          </span>
        </a>
        <div className="top-actions">
          <button
            className="ghost-button"
            type="button"
            aria-pressed={soundOn}
            onClick={() => setSoundOn((value) => !value)}
          >
            <span>{soundOn ? "♪" : "×"}</span> Ses {soundOn ? "açık" : "kapalı"}
          </button>
          <button className="ghost-button" type="button" onClick={() => setMenuOpen(true)}>
            <span>⌘</span> Konu değiştir
          </button>
          <button className="reset-button" type="button" onClick={() => resetQuiz()}>
            Yeniden başlat
          </button>
        </div>
      </header>

      <section id="oyun" className="game-layout">
        <aside className="progress-panel">
          <div className="eyebrow">{quiz.eyebrow}</div>
          <h1>Haritada bul.<br />Tıklayarak öğren.</h1>
          <p>{quiz.description}</p>
          <div className="coverage-stamp">
            <a href={sourceRef.url} target="_blank" rel="noreferrer" title="Bu oyunun ana kaynağını aç">
              ✓ {sourceRef.label} <span aria-hidden="true">↗</span>
            </a>
            <b>{QUIZZES.length} harita · {TOTAL_LOCATIONS} konum</b>
          </div>

          <div className="question-card" style={{ "--accent": quiz.color } as React.CSSProperties}>
            <span className="question-count">
              SORU {Math.min(correctIds.length + 1, quizFeatureCount)} / {quizFeatureCount}
            </span>
            <div className="question-icon">{quiz.icon}</div>
            <p>Haritada nerede?</p>
            <h2>{finished ? "Tebrikler!" : current.name}</h2>
            {!finished && <span className="instruction">Doğru şekle dokun</span>}
          </div>

          <div className="score-grid">
            <div><strong>{correctIds.length}</strong><span>Doğru</span></div>
            <div><strong>{attempts - correctIds.length}</strong><span>Yanlış</span></div>
            <div><strong>%{accuracy}</strong><span>İsabet</span></div>
          </div>

          <div className="legend">
            <span><i className="legend-correct" /> Öğrenildi</span>
            <span><i className="legend-wrong" /> Bu soruda yanlış</span>
          </div>
        </aside>

        <section className="map-panel" aria-label={`${quiz.title} oyun haritası`}>
          <div className="map-topline">
            <div>
              <span className="map-kicker">AKTİF HARİTA</span>
              <h2>{quiz.title}</h2>
            </div>
            <div className="map-actions">
              <button
                className="label-toggle"
                type="button"
                aria-pressed={showAllLabels}
                onClick={() => setShowAllLabels((value) => !value)}
              >
                Son doğru isim: {showAllLabels ? "açık" : "kapalı"}
              </button>
              <button className="mobile-menu" type="button" onClick={() => setMenuOpen(true)}>
                Konular <span>＋</span>
              </button>
            </div>
          </div>

          <div className="map-stage">
            <div className="sea-label sea-label--black">KARADENİZ</div>
            <div className="sea-label sea-label--aegean">EGE DENİZİ</div>
            <div className="sea-label sea-label--med">AKDENİZ</div>
            <TurkeyMap
              quiz={quiz}
              currentFeatureId={finished ? "" : current.id}
              correctIds={correctIds}
              wrongIds={wrongIds}
              showAllLabels={showAllLabels}
              onSelect={handleSelect}
            />
            <div className="map-note"><span>↖</span> Gerçek il sınırları ve coğrafi koordinatlar</div>

            {finished && (
              <div className="finish-card" role="status">
                <span className="finish-confetti">✦</span>
                <p>HARİTA TAMAMLANDI</p>
                <h3>{quizFeatureCount} / {quizFeatureCount} doğru</h3>
                <span>%{accuracy} isabetle bitirdin.</span>
                <div>
                  <button type="button" onClick={() => resetQuiz()}>Tekrar oyna</button>
                  <button type="button" className="finish-secondary" onClick={() => setMenuOpen(true)}>
                    Yeni konu
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="behavior-note">
            <span className="behavior-number">01</span>
            <p><strong>Yanlış seçim kırmızı kalır.</strong> Doğruyu bulduğunda o sorudaki kırmızılar temizlenir.</p>
            <span className="behavior-number">02</span>
            <p><strong>Doğrular yeşil kalır.</strong> Haritayı kapatmaması için yalnızca son doğru ismin etiketi gösterilir.</p>
          </div>
        </section>
      </section>

      <section className="catalogue" id="konular">
        <div className="catalogue-heading">
          <div>
            <span className="eyebrow">KONU KÜTÜPHANESİ</span>
            <h2>Bir sonraki haritanı seç</h2>
          </div>
          <p>Ana konular ve sınavda sık ayrılan alt başlıklar ayrı ayrı çalışılabilir.</p>
        </div>
        <div className="filter-row" role="tablist" aria-label="Konu grupları">
          {GROUPS.map((group) => (
            <button
              type="button"
              key={group}
              role="tab"
              aria-selected={activeGroup === group}
              className={activeGroup === group ? "active" : ""}
              onClick={() => setActiveGroup(group)}
            >
              {group}
            </button>
          ))}
        </div>
        <div className="quiz-grid">
          {visibleQuizzes.map((item, index) => (
            <button
              className={`quiz-tile ${item.id === activeQuizId ? "quiz-tile--active" : ""}`}
              type="button"
              key={item.id}
              data-quiz-id={item.id}
              onClick={() => resetQuiz(item.id)}
              style={{ "--tile-color": item.color } as React.CSSProperties}
            >
              <span className="tile-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="tile-icon">{item.icon}</span>
              <span className="tile-group">{item.eyebrow}</span>
              <strong>{item.title}</strong>
              <small>{item.features.length} konum · Tıklamalı</small>
              <span className="tile-arrow">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className="source-strip" aria-label="İçerik kaynakları">
        <div>
          <span className="eyebrow">İÇERİK STANDARDI</span>
          <h2>Ezber değil, kaynak kontrollü harita.</h2>
        </div>
        <p>
          İl sınırları gerçek poligonlardan, başlıca göller gerçek kıyı
          geometrilerinden çizilir; dağ ve akarsu hatları coğrafi koordinatlara
          oturur. İklim, bitki ve tarım gibi kesin bir çizgisi olmayan yayılış
          alanları ise sınavda okunabilir kalması için genelleştirilir.
        </p>
        <div className="source-links">
          <a href="https://orgm.meb.gov.tr/ekpssmebozel/cografyakonular.html" target="_blank" rel="noreferrer">
            MEB konu kapsamı <span>↗</span>
          </a>
          <a href="https://www.osym.gov.tr/TR,29487/2024-kpss-lisans-genel-yetenek-genel-kultur-ve-egitim-bilimleri-temel-soru-kitapciklari-ve-cevap-anahtarlari--10.html" target="_blank" rel="noreferrer">
            ÖSYM KPSS soru standardı <span>↗</span>
          </a>
          <a href="https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page76.html" target="_blank" rel="noreferrer">
            MEB yer şekilleri <span>↗</span>
          </a>
          <a href="https://www.tarimorman.gov.tr/DKMP/Menu/18/Korunan-Alan-Istatistikleri" target="_blank" rel="noreferrer">
            DKMP korunan alanlar <span>↗</span>
          </a>
          <a href="https://www.harita.gov.tr/urun/turkiye-fiziki-haritasi-dilsiz/273" target="_blank" rel="noreferrer">
            HGM fiziki harita <span>↗</span>
          </a>
          <a href="https://bayrammeral.com/" target="_blank" rel="noreferrer">
            Bayram Meral kapsam kontrolü · ikincil <span>↗</span>
          </a>
        </div>
      </section>

      <footer>
        <strong>Coğrafya Peşinde</strong>
        <span>KPSS için odaklı, tıklamalı Türkiye haritaları.</span>
      </footer>

      {menuOpen && (
        <div className="menu-backdrop" role="presentation" onMouseDown={() => setMenuOpen(false)}>
          <section
            className="topic-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Konu seç"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="drawer-head">
              <div><span>HARİTA KÜTÜPHANESİ</span><h2>Konu seç</h2></div>
              <button type="button" aria-label="Kapat" onClick={() => setMenuOpen(false)}>×</button>
            </div>
            <div className="drawer-list">
              {QUIZZES.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={item.id === activeQuizId ? "active" : ""}
                  onClick={() => resetQuiz(item.id)}
                >
                  <i style={{ background: item.color }}>{item.icon}</i>
                  <span><strong>{item.title}</strong><small>{item.eyebrow}</small></span>
                  <b>{item.features.length}</b>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
