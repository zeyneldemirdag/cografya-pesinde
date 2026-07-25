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
  | "gate"
  | "pass"
  | "mine"
  | "energy"
  | "dam"
  | "port"
  | "bridge"
  | "tunnel"
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

const NATURAL_TOURISM_FEATURES: Feature[] = [
  f("uludag-tour", "Uludağ · Bursa", 50, 50, 5, 4, "city"),
  f("kartalkaya-tour", "Kartalkaya · Bolu", 50, 50, 5, 4, "city"),
  f("erciyes-tour", "Erciyes · Kayseri", 50, 50, 5, 4, "city"),
  f("palandoken-tour", "Palandöken · Erzurum", 50, 50, 5, 4, "city"),
  f("kackar-tour", "Kaçkar · Rize", 50, 50, 5, 4, "city"),
  f("beydaglari-tour", "Beydağları · Antalya", 50, 50, 5, 4, "city"),
  f("nemrut-bitlis-tour", "Nemrut Dağı ve Kalderası · Bitlis", 50, 50, 5, 4, "city"),
  f("agri-tour", "Ağrı Dağı · Ağrı", 50, 50, 5, 4, "city"),
  f("anzer-tour", "Anzer Yaylası · Rize", 50, 50, 5, 4, "city"),
  f("ayder-tour", "Ayder Yaylası · Rize", 50, 50, 5, 4, "city"),
  f("kadirga-tour", "Kadırga Yaylası · Trabzon-Gümüşhane", 50, 50, 5, 4, "city"),
  f("persembe-tour", "Perşembe Yaylası · Ordu", 50, 50, 5, 4, "city"),
  f("saklikent-tour", "Saklıkent ve Beydağı · Antalya", 50, 50, 5, 4, "city"),
  f("camliyayla-tour", "Çamlıyayla · Mersin", 50, 50, 5, 4, "city"),
  f("horzum-tour", "Horzum Yaylası · Adana", 50, 50, 5, 4, "city"),
  f("tekir-tour", "Tekir Yaylası · Adana", 50, 50, 5, 4, "city"),
  f("karacabey-longoz-tour", "Karacabey Longozu · Bursa", 50, 50, 5, 4, "city"),
  f("igneada-longoz-tour", "İğneada Longozu · Kırklareli", 50, 50, 5, 4, "city"),
  f("izmir-bird-tour", "İzmir Kuş Cenneti", 50, 50, 5, 4, "city"),
  f("manyas-bird-tour", "Manyas Kuş Cenneti · Balıkesir", 50, 50, 5, 4, "city"),
  f("kizilirmak-bird-tour", "Kızılırmak Deltası Kuş Cenneti · Samsun", 50, 50, 5, 4, "city"),
  f("kapadokya", "Kapadokya Peribacaları · Nevşehir", 50, 50, 5, 4, "city"),
  f("pamukkale", "Pamukkale Travertenleri · Denizli", 50, 50, 5, 4, "city"),
  f("akcali-tour", "Akçalı Travertenleri · Van", 50, 50, 5, 4, "city"),
  f("karain-tour", "Karain Mağarası · Antalya", 50, 50, 5, 4, "city"),
  f("damlatas-tour", "Damlataş Mağarası · Antalya", 50, 50, 5, 4, "city"),
  f("dim-tour", "Dim Mağarası · Antalya", 50, 50, 5, 4, "city"),
  f("beldibi-tour", "Beldibi Mağarası · Antalya", 50, 50, 5, 4, "city"),
  f("insuyu-tour", "İnsuyu Mağarası · Burdur", 50, 50, 5, 4, "city"),
  f("gilindire-tour", "Gilindire Mağarası · Mersin", 50, 50, 5, 4, "city"),
  f("ballica-tour", "Ballıca Mağarası · Tokat", 50, 50, 5, 4, "city"),
  f("golcuk-geotour", "Gölcük Kalderası · Isparta", 50, 50, 5, 4, "city"),
  f("kula-geotour", "Kula Volkanik Alanı · Manisa", 50, 50, 5, 4, "city"),
  f("meke-geotour", "Meke Gölü · Konya", 50, 50, 5, 4, "city"),
  f("acigol-geotour", "Acıgöl Maarı · Konya", 50, 50, 5, 4, "city"),
];

const CULTURAL_TOURISM_FEATURES: Feature[] = [
  f("ayasofya-tour", "Ayasofya · İstanbul", 50, 50, 5, 4, "city"),
  f("sultanahmet-tour", "Sultan Ahmet Camii · İstanbul", 50, 50, 5, 4, "city"),
  f("topkapi-tour", "Topkapı Sarayı · İstanbul", 50, 50, 5, 4, "city"),
  f("dolmabahce-tour", "Dolmabahçe Sarayı · İstanbul", 50, 50, 5, 4, "city"),
  f("meryemana-tour", "Meryem Ana Evi · İzmir", 50, 50, 5, 4, "city"),
  f("gokmedrese-tour", "Gök Medrese · Sivas", 50, 50, 5, 4, "city"),
  f("selimiye-tour", "Selimiye Camii · Edirne", 50, 50, 5, 4, "city"),
  f("ishakpasa-tour", "İshak Paşa Sarayı · Ağrı", 50, 50, 5, 4, "city"),
  f("gobeklitepe-tour", "Göbeklitepe · Şanlıurfa", 50, 50, 5, 4, "city"),
  f("catalhoyuk-tour", "Çatalhöyük · Konya", 50, 50, 5, 4, "city"),
  f("alacahoyuk-tour", "Alacahöyük · Çorum", 50, 50, 5, 4, "city"),
  f("hattusas-tour", "Hattuşaş · Çorum", 50, 50, 5, 4, "city"),
  f("arslantepe-tour", "Arslantepe · Malatya", 50, 50, 5, 4, "city"),
  f("efes", "Efes · İzmir", 50, 50, 5, 4, "city"),
  f("gelibolu-tour", "Çanakkale Savaşları Gelibolu Tarihî Alanı", 50, 50, 5, 4, "city"),
  f("baskomutan-tour", "Başkomutan Tarihî Millî Parkı · Afyonkarahisar", 50, 50, 5, 4, "city"),
  f("istiklal-tour", "İstiklal Yolu Tarihî Millî Parkı · Kastamonu-Çankırı", 50, 50, 5, 4, "city"),
  f("malazgirt-tour", "Malazgirt Meydan Muharebesi Tarihî Millî Parkı · Muş", 50, 50, 5, 4, "city"),
  f("sakarya-tour", "Sakarya Meydan Muharebesi Tarihî Millî Parkı · Ankara", 50, 50, 5, 4, "city"),
  f("safranbolu", "Safranbolu · Karabük", 50, 50, 5, 4, "city"),
  f("sumela", "Sümela Manastırı · Trabzon", 50, 50, 5, 4, "city"),
  f("nemrut-tour", "Nemrut Dağı Ören Yeri · Adıyaman", 50, 50, 5, 4, "city"),
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
    description: "Ege’de horst sistemini oluşturan kırık dağları bul.",
    color: "#bf6657",
    icon: "⌁",
    features: [
      f("kaz", "Kaz Dağı", 13, 39, 9, 5, "mountain", 15),
      f("madra-f", "Madra Dağları", 15, 44, 9, 5, "mountain", 18),
      f("yunt-f", "Yunt Dağları", 18, 49, 9, 5, "mountain", 18),
      f("bozdag-f", "Bozdağlar", 20, 55, 11, 5, "mountain", 13),
      f("aydin-f", "Aydın Dağları", 22, 61, 11, 5, "mountain", 8),
      f("mentese-f", "Menteşe Dağları", 19, 66, 11, 6, "mountain", -15),
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
      f("van", "Van Gölü", 80, 51, 10, 7, "lake", -8),
      f("tuz", "Tuz Gölü", 49, 52, 7, 9, "lake", 8),
      f("beysehir", "Beyşehir Gölü", 40, 65, 6, 8, "lake", 14),
      f("egirdir", "Eğirdir Gölü", 36, 64, 4, 9, "lake", -8),
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
      f("sugla", "Suğla Gölü", 42, 68, 5, 4, "lake"),
      f("avlan", "Avlan Gölü", 31, 69, 5, 4, "lake"),
      f("kestel-l", "Kestel Gölü", 28, 64, 5, 4, "lake"),
      f("kovada-l", "Kovada Gölü", 35, 62, 5, 4, "lake"),
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
    features: [
      f("cukur", "Çukurova", 56, 70, 13, 7, "plain", 4),
      f("konya", "Konya Ovası", 47, 59, 15, 9, "plain"),
      f("erzurum", "Erzurum Ovası", 77, 37, 12, 6, "plain"),
      f("harran", "Harran Ovası", 72, 71, 12, 7, "plain"),
      f("bafra-d", "Bafra Deltası", 54, 19, 8, 4, "plain"),
      f("carsamba-d", "Çarşamba Deltası", 61, 20, 8, 4, "plain"),
      f("gediz-o", "Gediz Ovası", 20, 52, 12, 5, "plain", -4),
      f("bakircay-o", "Bakırçay Ovası", 16, 46, 10, 4, "plain", -4),
      f("kucukmenderes-o", "Küçük Menderes Ovası", 19, 56, 11, 4, "plain", 3),
      f("buyukmenderes-o", "Büyük Menderes Ovası", 22, 61, 13, 4, "plain", 5),
      f("silifke-d", "Silifke Deltası", 46, 75, 9, 4, "plain"),
      f("erzincan-o", "Erzincan Ovası", 70, 42, 10, 5, "plain"),
      f("mus-o", "Muş Ovası", 78, 54, 10, 5, "plain"),
      f("igdir-o", "Iğdır Ovası", 91, 41, 7, 5, "plain"),
      f("amik", "Amik Ovası", 62, 75, 9, 5, "plain"),
      f("menemen-d", "Menemen Deltası", 16, 51, 8, 4, "plain"),
      f("selcuk-d", "Selçuk Deltası", 18, 58, 8, 4, "plain"),
      f("balat-d", "Balat Deltası", 20, 62, 8, 4, "plain"),
      f("meric-d", "Meriç Deltası", 7, 36, 8, 4, "plain"),
      f("bursa-o", "Bursa Ovası", 22, 35, 8, 4, "plain"),
      f("yuksekova-o", "Yüksekova", 89, 68, 8, 4, "plain"),
      f("adapazari-o", "Adapazarı Ovası", 29, 29, 8, 4, "plain"),
      f("bolu-o", "Bolu Ovası", 34, 28, 7, 4, "plain"),
      f("duzce-o", "Düzce Ovası", 31, 27, 7, 4, "plain"),
      f("bergama-o", "Bergama Ovası", 16, 46, 7, 4, "plain"),
      f("soma-o", "Soma Ovası", 18, 44, 7, 4, "plain"),
      f("akhisar-o", "Akhisar Ovası", 20, 48, 7, 4, "plain"),
      f("maras-o", "Kahramanmaraş Ovası", 64, 59, 9, 4, "plain"),
      f("malatya-o", "Malatya Ovası", 68, 52, 9, 4, "plain"),
      f("suruc-o", "Suruç Ovası", 71, 69, 8, 4, "plain"),
      f("ceylanpinar-o", "Ceylanpınar Ovası", 78, 71, 10, 4, "plain"),
    ],
  },
  {
    id: "plateaus",
    group: "Yer şekilleri",
    title: "Platolar",
    eyebrow: "Yer şekilleri · Platolar",
    description: "Aşınım ve lav platolarını alanlarıyla tanı.",
    color: "#b58654",
    icon: "▱",
    features: [
      f("catalca", "Çatalca-Kocaeli Platosu", 19, 25, 17, 8, "plateau"),
      f("bozok", "Bozok Platosu", 57, 43, 14, 9, "plateau"),
      f("obruk", "Obruk Platosu", 49, 59, 13, 8, "plateau"),
      f("taspinar", "Taşeli Platosu", 44, 70, 14, 7, "plateau"),
      f("gaziantep", "Gaziantep Platosu", 68, 67, 12, 7, "plateau"),
      f("erzurum-kars", "Erzurum-Kars Platosu", 82, 32, 16, 10, "plateau"),
      f("haymana", "Haymana Platosu", 43, 46, 11, 7, "plateau"),
      f("cihanbeyli", "Cihanbeyli Platosu", 45, 53, 12, 7, "plateau"),
      f("uzunyayla", "Uzunyayla Platosu", 63, 48, 12, 8, "plateau"),
      f("yazilikaya", "Yazılıkaya Platosu", 29, 44, 11, 8, "plateau"),
      f("usak-esme", "Uşak-Eşme Platosu", 25, 52, 12, 8, "plateau"),
      f("teke", "Teke Platosu", 31, 69, 12, 8, "plateau"),
      f("sanliurfa-p", "Şanlıurfa Platosu", 75, 69, 13, 7, "plateau"),
      f("ardahan-p", "Ardahan Platosu", 87, 26, 10, 7, "plateau"),
      f("persembe-p", "Perşembe Platosu", 62, 23, 11, 7, "plateau"),
    ],
  },
  {
    id: "straits",
    group: "Ulaşım",
    title: "Kanallar ve Boğazlar",
    eyebrow: "Ulaşım · Boğazlar",
    description: "Stratejik su yollarını haritada bul.",
    color: "#7257c7",
    icon: "⌁",
    features: [
      f("istanbul", "İstanbul Boğazı", 16, 23, 3, 7, "river", 80),
      f("canakkale", "Çanakkale Boğazı", 10, 33, 3, 8, "river", 65),
    ],
  },
  {
    id: "gates",
    group: "Ulaşım",
    title: "Sınır Kapıları",
    eyebrow: "Ulaşım · Sınır kapıları",
    description: "Komşu ülkelere açılan kara kapılarını seç.",
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
      f("menderes-m", "Menderes Masifi", 22, 57, 14, 10, "region"),
      f("kirsehir-m", "Kırşehir Masifi", 53, 46, 13, 10, "region"),
      f("bitlis-m", "Bitlis Masifi", 77, 62, 16, 8, "region"),
      f("kazdagi-m", "Kazdağı Masifi", 13, 40, 9, 7, "region"),
      f("alanya-anamur-m", "Alanya-Anamur Masifi", 43, 74, 13, 6, "region"),
    ],
  },
  {
    id: "mines",
    group: "Ekonomi",
    title: "Madenler",
    eyebrow: "Ekonomi · Madenler",
    description: "Madenleri öne çıkan üretim sahalarıyla eşleştir.",
    color: "#c57735",
    icon: "⬟",
    features: [
      f("zonguldak", "Zonguldak · Taş kömürü", 31, 20, 7, 6, "mine"),
      f("divrigi", "Divriği · Demir", 68, 45, 7, 6, "mine"),
      f("seyitomer", "Seyitömer · Linyit", 25, 44, 7, 6, "mine"),
      f("murgul", "Murgul · Bakır", 86, 24, 7, 6, "mine"),
      f("bigadic", "Bigadiç · Bor", 17, 40, 7, 6, "mine"),
      f("mazidagi", "Mazıdağı · Fosfat", 78, 65, 7, 6, "mine"),
      f("cayeli-mine", "Çayeli · Bakır", 78, 21, 7, 6, "mine"),
      f("kure-mine", "Küre · Bakır", 39, 17, 7, 6, "mine"),
      f("maden-mine", "Maden · Bakır", 70, 54, 7, 6, "mine"),
      f("guleman-mine", "Guleman · Krom", 71, 53, 7, 6, "mine"),
      f("kop-mine", "Kop Dağı · Krom", 73, 35, 7, 6, "mine"),
      f("fethiye-koycegiz-mine", "Fethiye-Köyceğiz · Krom", 24, 70, 9, 6, "mine"),
      f("seydisehir-mine", "Seydişehir · Boksit", 41, 64, 7, 6, "mine"),
      f("emet-mine", "Emet · Bor", 26, 41, 7, 6, "mine"),
      f("kirka-mine", "Kırka · Bor", 31, 42, 7, 6, "mine"),
      f("hekimhan-mine", "Hekimhan · Demir", 67, 48, 7, 6, "mine"),
      f("hasancelebi-mine", "Hasançelebi · Demir", 67, 47, 7, 6, "mine"),
      f("tuzgolu-mine", "Tuz Gölü · Tuz", 50, 51, 7, 6, "mine"),
      f("camalti-mine", "Çamaltı · Tuz", 14, 52, 7, 6, "mine"),
      f("afsin-mine", "Afşin-Elbistan · Linyit", 65, 52, 8, 6, "mine"),
      f("soma-mine", "Soma · Linyit", 18, 44, 7, 6, "mine"),
      f("afyon-mermer", "Afyonkarahisar · Mermer", 33, 52, 8, 6, "mine"),
    ],
  },
  {
    id: "energy",
    group: "Ekonomi",
    title: "Başlıca Enerji Santralleri",
    eyebrow: "Ekonomi · Enerji · KPSS örnekleri",
    description: "MEB'de geçen ve enerji türlerini temsil eden başlıca üretim merkezlerini bul.",
    color: "#dcaa24",
    icon: "ϟ",
    features: [
      f("cesme", "Çeşme · Rüzgâr", 14, 54, 7, 6, "energy"),
      f("dinar-wind", "Dinar · Rüzgâr", 50, 50, 7, 6, "energy"),
      f("germencik", "Germencik · Jeotermal", 20, 56, 7, 6, "energy"),
      f("buharkent-geothermal", "Buharkent · Jeotermal", 50, 50, 7, 6, "energy"),
      f("akkuyu", "Akkuyu · Nükleer", 47, 76, 7, 6, "energy"),
      f("sinop-nuclear", "Sinop-İnceburun · Nükleer (planlanan)", 50, 50, 7, 6, "energy"),
      f("ataturk", "Atatürk Barajı · Hidroelektrik", 72, 63, 7, 6, "energy"),
      f("deriner-energy", "Deriner · Hidroelektrik", 50, 50, 7, 6, "energy"),
      f("karapinar", "Karapınar · Güneş", 50, 62, 7, 6, "energy"),
      f("afsin", "Afşin-Elbistan · Termik", 65, 52, 7, 6, "energy"),
      f("catalagzi-energy", "Çatalağzı · Termik", 50, 50, 7, 6, "energy"),
      f("soma-energy", "Soma · Termik", 50, 50, 7, 6, "energy"),
    ],
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
    title: "Nüfus Yoğunluğu",
    eyebrow: "Beşerî coğrafya · Nüfus",
    description: "Yoğun nüfuslu çekim alanlarını seç.",
    color: "#8eaa46",
    icon: "●",
    features: [
      fp("marmara-pop", "Çatalca-Kocaeli", 19, 27, 18, 11, [34, 41, 59]),
      fp("ege-pop", "Kıyı Ege", 17, 53, 11, 24, [9, 35, 45]),
      fp("cukur-pop", "Çukurova", 57, 68, 17, 10, [1, 33, 80]),
      fp("ankara-pop", "Ankara Çevresi", 43, 42, 12, 11, [6]),
      fp("samsun-pop", "Samsun Çevresi", 58, 21, 11, 8, [55]),
    ],
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
    eyebrow: "Doğal coğrafya · Bitkiler",
    description: "Doğal bitki topluluklarının belirgin yayılış alanlarını bul.",
    color: "#4d9660",
    icon: "♣",
    features: [
      f("forest-black", "Nemli Karadeniz Ormanları", 61, 20, 55, 10, "region"),
      f("maquis", "Maki", 35, 69, 50, 11, "region"),
      f("step", "Bozkır", 54, 48, 45, 24, "region"),
      f("meadow", "Çayır", 83, 32, 22, 15, "region"),
      f("anthro-step", "Antropojen Bozkır", 31, 45, 20, 14, "region"),
    ],
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
    eyebrow: "Ekonomi · Tarım",
    description: "Ürünleri öne çıkan yetişme alanlarıyla eşleştir.",
    color: "#79a43e",
    icon: "✳",
    features: [
      fp("tea", "Çay · Rize", 79, 21, 7, 6, [53]),
      fp("hazelnut", "Fındık · Ordu-Giresun", 66, 21, 10, 6, [28, 52]),
      fp("olive", "Zeytin · Kıyı Ege", 17, 50, 8, 19, [9, 10, 35, 45]),
      fp("cotton", "Pamuk · Şanlıurfa", 75, 68, 10, 8, [63]),
      fp("banana", "Muz · Anamur-Alanya", 40, 74, 13, 6, [7, 33]),
      fp("apricot", "Kayısı · Malatya", 68, 51, 7, 6, [44]),
      fp("grape", "Üzüm · Manisa", 20, 52, 7, 6, [45]),
      fp("sunflower", "Ayçiçeği · Trakya", 9, 26, 11, 10, [22, 39, 59]),
      fp("sugarbeet", "Şeker Pancarı · İç Anadolu", 49, 49, 20, 14, [6, 26, 38, 40, 42, 66]),
      fp("fig", "İncir · Aydın", 18, 59, 7, 6, [9]),
      fp("pistachio", "Antep Fıstığı · Gaziantep-Şanlıurfa", 72, 67, 13, 8, [27, 63]),
      fp("citrus", "Turunçgiller · Akdeniz kıyıları", 50, 72, 32, 8, [1, 7, 31, 33, 80]),
      fp("tobacco", "Tütün · Manisa", 20, 52, 7, 6, [45]),
      fp("rice", "Çeltik · Edirne", 7, 27, 7, 6, [22]),
      fp("apple", "Elma · Isparta", 35, 63, 7, 6, [32]),
      fp("lentil", "Kırmızı Mercimek · Güneydoğu", 76, 65, 20, 10, [21, 47, 63]),
      fp("wheat", "Buğday · İç Anadolu", 50, 48, 28, 18, [6, 18, 26, 40, 42, 66, 68, 70, 71]),
      fp("corn", "Mısır · Adana-Samsun", 57, 47, 18, 26, [1, 55]),
    ],
  },
  {
    id: "livestock",
    group: "Ekonomi",
    title: "Başlıca Hayvancılık Alanları",
    eyebrow: "Ekonomi · Hayvancılık",
    description: "Hayvancılık türlerinin yoğunlaştığı alanları bul.",
    color: "#aa7748",
    icon: "♜",
    features: [
      fp("cattle", "Büyükbaş · Erzurum-Kars", 83, 32, 19, 13, [25, 36, 75]),
      fp("sheep", "Koyun · İç Anadolu", 51, 49, 35, 22, [6, 18, 38, 40, 42, 50, 51, 66, 68, 70, 71]),
      f("goat", "Kıl Keçisi · Toroslar", 46, 70, 42, 9, "region"),
      fp("silkworm", "İpek Böcekçiliği · Bursa", 22, 34, 8, 7, [16]),
      fp("beekeeping", "Arıcılık · Ordu", 65, 23, 10, 7, [52]),
      fp("angora-goat", "Tiftik Keçisi · Ankara", 43, 42, 10, 8, [6]),
      fp("poultry", "Kümes Hayvancılığı · Bolu", 34, 27, 10, 8, [14]),
      fp("fishing", "Balıkçılık · Karadeniz", 69, 21, 32, 9, [8, 28, 52, 53, 55, 61]),
    ],
  },
  {
    id: "ports",
    group: "Ulaşım",
    title: "Türkiye'nin Başlıca Limanları",
    eyebrow: "Ulaşım · Deniz yolu",
    description: "MEB haritasındaki 17 başlıca limanı, gerçek liman noktasında bul.",
    color: "#357ca6",
    icon: "⚓",
    features: [
      f("istanbul-port", "İstanbul Limanı", 50, 50, 5, 4, "port"),
      f("bandirma-port", "Bandırma Limanı", 50, 50, 5, 4, "port"),
      f("izmit-port", "İzmit Limanı", 50, 50, 5, 4, "port"),
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
      f("istanbul-port", "İstanbul Limanı", 50, 50, 5, 4, "port"),
      f("bandirma-port", "Bandırma Limanı", 50, 50, 5, 4, "port"),
      f("izmit-port", "İzmit Limanı", 50, 50, 5, 4, "port"),
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
      f("fethiye-port", "Fethiye Limanı", 50, 50, 5, 4, "port"),
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
      f("batman-dam", "Batman Barajı · Dicle", 50, 50, 5, 4, "dam"),
      f("dicle-dam", "Dicle Barajı · Dicle", 50, 50, 5, 4, "dam"),
      f("devegecidi-dam", "Devegeçidi Barajı · Dicle", 50, 50, 5, 4, "dam"),
      f("arpacay-dam", "Arpaçay Barajı · Aras", 50, 50, 5, 4, "dam"),
      f("seyhan-dam", "Seyhan Barajı · Seyhan", 50, 50, 5, 4, "dam"),
      f("catalan-dam", "Çatalan Barajı · Seyhan", 50, 50, 5, 4, "dam"),
      f("sir-dam", "Sır Barajı · Ceyhan", 50, 50, 5, 4, "dam"),
      f("aslantas-dam", "Aslantaş Barajı · Ceyhan", 50, 50, 5, 4, "dam"),
      f("menzelet-dam", "Menzelet Barajı · Ceyhan", 50, 50, 5, 4, "dam"),
      f("kartalkaya-dam", "Kartalkaya Barajı · Ceyhan", 50, 50, 5, 4, "dam"),
      f("oymapinar-dam", "Oymapınar Barajı · Manavgat", 50, 50, 5, 4, "dam"),
      f("demirkopru-dam", "Demirköprü Barajı · Gediz", 50, 50, 5, 4, "dam"),
      f("kemer-dam", "Kemer Barajı · Büyük Menderes", 50, 50, 5, 4, "dam"),
      f("adiguzel-dam", "Adıgüzel Barajı · Büyük Menderes", 50, 50, 5, 4, "dam"),
      f("porsuk-dam", "Porsuk Barajı · Sakarya", 50, 50, 5, 4, "dam"),
      f("bayindir-dam", "Bayındır Barajı · Sakarya", 50, 50, 5, 4, "dam"),
      f("sariyar-dam", "Sarıyar (Hasan Polatkan) Barajı · Sakarya", 50, 50, 5, 4, "dam"),
      f("gokcekaya-dam", "Gökçekaya Barajı · Sakarya", 50, 50, 5, 4, "dam"),
      f("kurtbogazi-dam", "Kurtboğazı Barajı · Sakarya", 50, 50, 5, 4, "dam"),
      f("hirfanli-dam", "Hirfanlı Barajı · Kızılırmak", 50, 50, 5, 4, "dam"),
      f("derbent-dam", "Derbent Barajı · Kızılırmak", 50, 50, 5, 4, "dam"),
      f("kesikkopru-dam", "Kesikköprü Barajı · Kızılırmak", 50, 50, 5, 4, "dam"),
      f("altinkaya-dam", "Altınkaya Barajı · Kızılırmak", 50, 50, 5, 4, "dam"),
      f("kapulukaya-dam", "Kapulukaya Barajı · Kızılırmak", 50, 50, 5, 4, "dam"),
      f("cubuk1-dam", "Çubuk 1 Barajı · Kızılırmak", 50, 50, 5, 4, "dam"),
      f("cubuk2-dam", "Çubuk 2 Barajı · Kızılırmak", 50, 50, 5, 4, "dam"),
      f("almus-dam", "Almus Barajı · Yeşilırmak", 50, 50, 5, 4, "dam"),
      f("hasanugurlu-dam", "Hasan Uğurlu Barajı · Yeşilırmak", 50, 50, 5, 4, "dam"),
      f("suatugurlu-dam", "Suat Uğurlu Barajı · Yeşilırmak", 50, 50, 5, 4, "dam"),
      f("kilickaya-dam", "Kılıçkaya Barajı · Yeşilırmak", 50, 50, 5, 4, "dam"),
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
    description: "Türkiye’nin yedi coğrafi bölgesini alanlarıyla tanı.",
    color: "#6851a8",
    icon: "⬡",
    features: [
      f("marmara", "Marmara Bölgesi", 16, 31, 17, 18, "region"),
      f("aegean", "Ege Bölgesi", 20, 53, 14, 28, "region"),
      f("med", "Akdeniz Bölgesi", 45, 72, 40, 10, "region"),
      f("black", "Karadeniz Bölgesi", 58, 20, 56, 9, "region"),
      f("central", "İç Anadolu Bölgesi", 49, 47, 28, 20, "region"),
      f("east", "Doğu Anadolu Bölgesi", 79, 44, 25, 27, "region"),
      f("southeast", "Güneydoğu Anadolu Bölgesi", 75, 68, 22, 11, "region"),
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
    description: "Kalkerli arazilerde çözünme çanaklarında oluşan gölleri bul.",
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
    features: [
      f("bafra-d", "Bafra Deltası · Kızılırmak", 54, 18, 8, 4, "plain"),
      f("carsamba-d", "Çarşamba Deltası · Yeşilırmak", 61, 20, 8, 4, "plain"),
      f("cukur-d", "Çukurova · Seyhan-Ceyhan", 57, 71, 13, 6, "plain"),
      f("silifke-d", "Silifke Deltası · Göksu", 47, 75, 8, 4, "plain"),
      f("menemen-d", "Menemen Deltası · Gediz", 15, 51, 7, 4, "plain"),
      f("selcuk-d", "Selçuk Deltası · Küçük Menderes", 18, 57, 7, 4, "plain"),
      f("balat-d", "Balat Deltası · Büyük Menderes", 20, 61, 7, 4, "plain"),
      f("meric-d", "Meriç Deltası", 7, 34, 7, 4, "plain"),
    ],
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
      f("edremit-g", "Edremit Körfezi", 13, 43, 7, 4, "lake"),
      f("candarli-g", "Çandarlı Körfezi", 15, 49, 6, 4, "lake"),
      f("izmir-g", "İzmir Körfezi", 14, 54, 6, 4, "lake"),
      f("kusadasi-g", "Kuşadası Körfezi", 17, 59, 6, 4, "lake"),
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
      f("ria-mentese", "Ria Kıyı · Menteşe", 22, 68, 10, 5, "river"),
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
      f("tuz-basin", "Tuz Gölü Kapalı Havzası", 49, 52, 17, 16, "region"),
      f("konya-basin", "Konya Kapalı Havzası", 47, 62, 21, 16, "region"),
      f("lakes-basin", "Göller Yöresi Kapalı Havzası", 36, 64, 16, 15, "region"),
      f("aksehir-eber-basin", "Akşehir-Eber Kapalı Havzası", 38, 58, 12, 9, "region"),
      f("aras-kura-basin", "Aras-Kura (Hazar) Havzası", 86, 34, 18, 13, "region"),
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
    ],
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
  massifs: {
    label: "MEB Türkiye'nin masif arazileri",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page61.html",
  },
  straits: {
    label: "HGM + KGM ulaşım haritaları",
    url: "https://www.kgm.gov.tr/Sayfalar/KGM/SiteTr/Root/Haritalarr.aspx",
  },
  gates: {
    label: "Ticaret Bakanlığı sınır kapıları",
    url: "https://ticaret.gov.tr/gumruk-islemleri/sikca-sorulan-sorular/english/customs-offices",
  },
  passes: {
    label: "MEB geçit soru kapsamı + KGM yol ağı",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap/konu-pekistirme/ayt/cografya/files/basic-html/page183.html",
  },
  mines: {
    label: "MTA maden verileri + MEB",
    url: "https://www.mta.gov.tr/v3.0/",
  },
  energy: {
    label: "MEB enerji santrali örnekleri + Enerji Bakanlığı",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/etkilesimli/kitap/calisma_defteri/f3/11/cografya/files/basic-html/page8.html",
  },
  dams: {
    label: "MEB başlıca barajlar + gerçek gövde koordinatları",
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
    label: "TÜİK nüfus ve demografi verileri",
    url: "https://data.tuik.gov.tr/Kategori/GetKategori?p=nufus-ve-demografi-109",
  },
  climate: {
    label: "MEB Türkiye iklim tipleri + MGM",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page48.html",
  },
  vegetation: {
    label: "MEB doğal sistemler + OGM",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page88.html",
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
    label: "MEB doğal turizm varlıkları",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page86.html",
  },
  "cultural-tourism": {
    label: "MEB kültürel varlıklar ve ören yerleri",
    url: "https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/ayt-cografya/files/basic-html/page86.html",
  },
  agriculture: {
    label: "Tarım ve Orman Bakanlığı + TÜİK",
    url: "https://www.tarimorman.gov.tr/BUGEM/kumelenme/Link/12/Tuik-Istatistikleri",
  },
  livestock: {
    label: "Tarım ve Orman Bakanlığı + TÜİK",
    url: "https://arastirma.tarimorman.gov.tr/tepge/Sayfalar/Detay.aspx?TermId=7f477a6a-a8ea-4497-9ddb-173030b5be42&UrlSuffix=27",
  },
  ports: {
    label: "MEB başlıca limanlar + Ulaştırma Bakanlığı liman kayıtları",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/kitap/4entwxnnnzr.pdf",
  },
  "marmara-ports": {
    label: "MEB Türkiye'nin başlıca limanları",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/kitap/4entwxnnnzr.pdf",
  },
  "black-sea-ports": {
    label: "MEB Türkiye'nin başlıca limanları",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/kitap/4entwxnnnzr.pdf",
  },
  "aegean-ports": {
    label: "MEB Türkiye'nin başlıca limanları",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/kitap/4entwxnnnzr.pdf",
  },
  "mediterranean-ports": {
    label: "MEB Türkiye'nin başlıca limanları",
    url: "https://ogmmateryal.eba.gov.tr/panel/upload/kitap/4entwxnnnzr.pdf",
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
    label: "KGM köprü ve tünel bilgileri",
    url: "https://www.kgm.gov.tr/Sayfalar/SiteMap.aspx",
  },
  bridges: {
    label: "KGM köprü bilgileri",
    url: "https://www.kgm.gov.tr/Sayfalar/SiteMap.aspx",
  },
  tunnels: {
    label: "KGM tünel bilgileri",
    url: "https://www.kgm.gov.tr/Sayfalar/SiteMap.aspx",
  },
};

const ACTIVE_QUIZ_STORAGE_KEY = "cografya-pesinde:active-quiz";

function shuffledFeatureIds(features: Feature[], previousOrder: string[] = []) {
  const ids = [...new Set(features.map((feature) => feature.id))];
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];
  }
  if (
    ids.length > 1 &&
    previousOrder.length === ids.length &&
    ids.every((id, index) => id === previousOrder[index])
  ) {
    [ids[0], ids[1]] = [ids[1], ids[0]];
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

type RiverFeature = {
  geometry: {
    type: "LineString" | "MultiLineString";
    coordinates: Coordinate[] | Coordinate[][];
  };
  properties: { id: string; name: string };
};

const MAP_BOUNDS = { west: 25.55, east: 44.85, north: 42.15, south: 35.75 };
const MAP_COLORS = ["#ead9a2", "#c4d89b", "#e9bd7b", "#c7d8ca", "#d4c1dc", "#f1cf9f", "#b8d6c7"];

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
  catalca: [[27.4, 41.5], [28.0, 40.9], [29.3, 40.7], [30.6, 40.9], [30.3, 41.4], [29.2, 41.6], [28.1, 41.7]],
  bozok: [[34.3, 40.0], [34.7, 39.3], [35.6, 39.1], [36.3, 39.5], [36.0, 40.1], [35.2, 40.3]],
  obruk: [[32.2, 38.6], [32.6, 37.8], [33.5, 37.6], [34.3, 38.0], [34.0, 38.8], [33.0, 39.0]],
  taspinar: [[32.0, 37.3], [32.4, 36.6], [33.5, 36.3], [34.4, 36.7], [34.1, 37.3], [33.1, 37.6]],
  gaziantep: [[36.5, 37.5], [36.9, 36.8], [37.8, 36.7], [38.5, 37.1], [38.1, 37.7], [37.2, 37.9]],
  "erzurum-kars": [[40.5, 40.9], [40.8, 39.7], [42.0, 39.3], [43.4, 39.7], [43.7, 40.7], [42.8, 41.2], [41.5, 41.3]],
  haymana: [[31.5, 39.7], [31.9, 39.0], [32.8, 38.9], [33.5, 39.3], [33.1, 39.9], [32.2, 40.0]],
  cihanbeyli: [[31.4, 39.1], [31.7, 38.4], [32.6, 38.1], [33.4, 38.5], [33.1, 39.2], [32.2, 39.4]],
  uzunyayla: [[35.3, 39.2], [35.8, 38.4], [36.7, 38.2], [37.4, 38.7], [37.1, 39.4], [36.1, 39.6]],
  yazilikaya: [[29.1, 39.7], [29.5, 39.0], [30.4, 38.8], [31.2, 39.2], [30.9, 39.8], [30.0, 40.0]],
  "usak-esme": [[28.3, 38.9], [28.7, 38.2], [29.5, 38.0], [30.2, 38.4], [29.9, 39.0], [29.0, 39.2]],
  teke: [[28.8, 37.3], [29.2, 36.4], [30.2, 36.1], [31.2, 36.5], [30.9, 37.3], [29.9, 37.6]],
  "sanliurfa-p": [[37.0, 37.5], [37.5, 36.8], [38.8, 36.5], [40.2, 36.8], [40.5, 37.5], [39.4, 37.9], [38.0, 37.9]],
  "ardahan-p": [[42.2, 41.5], [42.5, 40.8], [43.4, 40.6], [43.8, 41.1], [43.4, 41.7], [42.7, 41.8]],
  "persembe-p": [[36.8, 41.1], [37.2, 40.7], [38.1, 40.6], [38.5, 40.9], [38.1, 41.3], [37.3, 41.4]],
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

const DISTRIBUTION_POLYGONS: Record<string, Coordinate[][]> = {
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
  maquis: [
    [[26.0, 39.5], [26.7, 38.0], [28.2, 36.8], [29.5, 36.2], [29.8, 37.2], [28.8, 37.9], [27.8, 39.5]],
    [[29.2, 36.2], [31.5, 35.9], [34.0, 36.0], [36.7, 36.0], [36.8, 36.8], [35.2, 37.1], [33.2, 37.0], [31.0, 37.3], [29.6, 37.1]],
  ],
  step: [
    [[29.8, 40.0], [32.0, 40.4], [35.2, 40.2], [38.2, 39.7], [41.3, 39.2], [42.0, 37.6], [39.5, 37.2], [36.5, 37.5], [33.8, 37.6], [31.2, 38.0], [29.5, 38.8]],
  ],
  meadow: [
    [[39.5, 41.2], [42.8, 41.7], [44.5, 40.8], [44.7, 39.1], [42.4, 39.1], [40.4, 39.8]],
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
  "yildiz-m": [[[26.1, 42.08], [27.1, 42.12], [28.35, 42.05], [29.05, 41.72], [29.18, 41.36], [28.42, 41.12], [27.22, 41.3], [26.28, 41.58]]],
  "menderes-m": [[[27.05, 39.25], [27.78, 39.18], [28.7, 38.82], [29.42, 38.12], [29.3, 37.38], [28.64, 36.94], [27.82, 37.28], [27.24, 38.02]]],
  "kirsehir-m": [[[32.72, 40.08], [33.78, 40.36], [34.88, 40.25], [35.62, 39.68], [35.7, 38.75], [34.92, 38.12], [33.62, 38.3], [32.68, 39.05]]],
  "bitlis-m": [[[38.08, 38.58], [39.16, 38.14], [40.55, 37.66], [42.18, 37.25], [43.42, 37.58], [43.02, 38.16], [41.45, 38.55], [39.72, 38.88], [38.42, 39.02]]],
  "kazdagi-m": [[[26.62, 39.98], [27.12, 40.04], [27.55, 39.86], [27.48, 39.5], [27.08, 39.36], [26.68, 39.55]]],
  "alanya-anamur-m": [
    [[31.56, 36.82], [31.72, 36.42], [32.08, 36.18], [32.42, 36.36], [32.34, 36.78], [31.92, 36.98]],
    [[32.58, 36.62], [32.82, 36.22], [33.25, 36.08], [33.62, 36.3], [33.48, 36.72], [33.02, 36.9]],
  ],
  marmara: [[[25.7, 42.1], [30.8, 42.1], [31.0, 40.0], [29.4, 39.4], [26.0, 39.8]]],
  aegean: [[[26.0, 40.6], [30.8, 40.3], [30.7, 36.3], [28.5, 35.8], [26.0, 37.0]]],
  med: [[[28.5, 37.5], [31.0, 37.8], [34.0, 37.5], [36.8, 37.8], [37.1, 35.8], [29.0, 35.7]]],
  black: [[[29.5, 42.1], [41.8, 42.1], [41.7, 39.7], [38.5, 39.9], [35.0, 40.0], [31.0, 39.9]]],
  central: [[[29.5, 40.3], [33.0, 40.8], [37.5, 40.2], [39.0, 38.3], [36.0, 36.8], [31.0, 37.0]]],
  east: [[[37.0, 41.8], [44.8, 42.0], [44.8, 37.2], [42.0, 36.7], [38.0, 37.4], [36.5, 39.5]]],
  southeast: [[[36.0, 38.3], [44.5, 38.3], [44.7, 36.5], [36.2, 36.4]]],
  "van-basin": [[[41.6, 39.7], [44.4, 40.0], [44.8, 37.8], [42.2, 37.4], [41.3, 38.4]]],
  "tuz-basin": [[[32.0, 40.0], [34.8, 40.0], [35.2, 38.0], [33.7, 37.2], [31.8, 38.0]]],
  "konya-basin": [[[30.5, 38.6], [34.5, 38.8], [35.0, 36.6], [31.0, 36.2], [29.8, 37.3]]],
  "lakes-basin": [[[29.0, 38.5], [32.5, 38.6], [32.3, 36.5], [29.3, 36.2], [28.5, 37.2]]],
  "aksehir-eber-basin": [[[30.2, 39.1], [32.4, 39.0], [32.5, 37.8], [30.5, 37.6]]],
  "aras-kura-basin": [[[39.5, 41.8], [44.8, 42.0], [44.8, 39.0], [42.0, 39.1], [40.0, 40.0]]],
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
  agri: [44.288, 39.702],
  "agri-v": [44.288, 39.702],
  "agri-gl": [44.288, 39.702],
  tendurek: [43.83, 39.33],
  suphan: [42.82, 38.92],
  "suphan-gl": [42.82, 38.92],
  nemrut: [42.23, 38.65],
  erciyes: [35.45, 38.53],
  "erciyes-v": [35.45, 38.53],
  "erciyes-gl": [35.45, 38.53],
  hasan: [34.17, 38.13],
  karadag: [33.08, 37.25],
  melendiz: [34.63, 38.2],
  "karacadag-ic": [33.65, 38.16],
  "karacadag-gd": [39.83, 37.67],
  kula: [28.52, 38.58],
  ilgin: [31.875, 38.35],
  "aktas-lake": [43.21, 41.21],
  "nar-lake": [34.457, 38.34],
  "meyil-lake": [33.3535, 37.988],
  "cirali-lake": [33.413, 37.932],
  "hafik-lake": [37.378, 39.872],
  "todurge-lake": [37.6, 39.881],
  "golcuk-vl": [30.494, 37.731],
  "meke-vl": [33.64, 37.685],
  "acigol-karapinar": [33.666, 37.713],
  aygir: [42.823, 38.837],
  "keban-dam": [38.7566096, 38.8080318],
  "karakaya-dam": [39.1348903, 38.2258096],
  "ataturk-dam": [38.3198488, 37.4805193],
  "birecik-dam": [37.890014, 37.053973],
  "karkamis-dam": [38.0335308, 36.8681117],
  "kralkizi-dam": [40.0192214, 38.3476202],
  "ilisu-dam": [41.8461144, 37.5314581],
  "batman-dam": [41.2022529, 38.1596078],
  "dicle-dam": [40.1768122, 38.2305638],
  "devegecidi-dam": [39.9865272, 38.0585711],
  "arpacay-dam": [43.6450159, 40.5627088],
  "seyhan-dam": [35.3319783, 37.0392763],
  "catalan-dam": [35.2798818, 37.1978175],
  "sir-dam": [36.5956565, 37.5007666],
  "aslantas-dam": [36.2719514, 37.2720947],
  "menzelet-dam": [36.8502713, 37.6762981],
  "kartalkaya-dam": [37.2389926, 37.4686816],
  "oymapinar-dam": [31.5310808, 36.9078994],
  "demirkopru-dam": [28.3109941, 38.6161815],
  "kemer-dam": [28.5248427, 37.5718215],
  "adiguzel-dam": [29.2057844, 38.1586598],
  "porsuk-dam": [30.2791284, 39.6357423],
  "bayindir-dam": [32.9926568, 39.9152713],
  "sariyar-dam": [31.4146641, 40.0399775],
  "gokcekaya-dam": [31.0151951, 40.0326683],
  "kurtbogazi-dam": [32.7006007, 40.2698014],
  "hirfanli-dam": [33.6730055, 39.1447265],
  "derbent-dam": [35.8412827, 41.4614629],
  "kesikkopru-dam": [33.4209485, 39.3959928],
  "altinkaya-dam": [35.7257254, 41.3637882],
  "kapulukaya-dam": [33.4837714, 39.7311474],
  "cubuk1-dam": [32.9262609, 40.0014247],
  "cubuk2-dam": [33.0155739, 40.2869288],
  "almus-dam": [36.9020744, 40.407343],
  "hasanugurlu-dam": [36.6462866, 40.9374358],
  "suatugurlu-dam": [36.6710399, 41.0751136],
  "kilickaya-dam": [38.1869778, 40.2429353],
  "muratli-dam": [41.7140019, 41.4670671],
  "borcka-dam": [41.68596, 41.3500252],
  "deriner-dam": [41.8707143, 41.1716191],
  kapikule: [26.36, 41.72],
  ipsala: [26.38, 40.92],
  sarp: [41.55, 41.52],
  gurbu: [44.48, 39.42],
  habur: [42.57, 37.15],
  cilvegozu: [36.19, 36.24],
  pazarkule: [26.56, 41.66],
  hamzabeyli: [26.58, 41.95],
  derekoy: [27.37, 41.97],
  turkgozu: [43.13, 41.47],
  aktas: [43.2, 41.21],
  dilucu: [44.8, 39.65],
  kapikoy: [44.13, 38.49],
  esendere: [44.57, 37.72],
  uzumlu: [43.08, 37.08],
  oncupinar: [36.67, 36.82],
  karkamis: [38.01, 36.87],
  cobanbey: [37.56, 36.85],
  zeytidali: [36.66, 36.76],
  "bolu-pass": [31.4140658, 40.7473581],
  "zigana-pass": [39.4051227, 40.6389544],
  "gulek-pass": [34.7858856, 37.2853853],
  "sertavul-pass": [33.2635938, 36.9150187],
  "belen-pass": [36.2252927, 36.4812881],
  "kop-pass": [40.5120823, 40.0365803],
  "cubuk-pass": [30.49694, 37.1701959],
  zonguldak: [31.79, 41.45],
  divrigi: [38.12, 39.37],
  seyitomer: [29.58, 39.49],
  murgul: [41.56, 41.28],
  bigadic: [28.13, 39.39],
  mazidagi: [40.49, 37.48],
  "cayeli-mine": [40.73, 41.09],
  "kure-mine": [33.71, 41.8],
  "maden-mine": [39.67, 38.39],
  "guleman-mine": [39.85, 38.45],
  "kop-mine": [40.55, 40.03],
  "fethiye-koycegiz-mine": [29.0, 36.75],
  "seydisehir-mine": [31.85, 37.42],
  "emet-mine": [29.26, 39.34],
  "kirka-mine": [30.53, 39.28],
  "hekimhan-mine": [37.93, 38.82],
  "hasancelebi-mine": [37.88, 38.95],
  "tuzgolu-mine": [33.4, 38.75],
  "camalti-mine": [26.85, 38.48],
  "afsin-mine": [36.92, 38.25],
  "soma-mine": [27.61, 39.19],
  "afyon-mermer": [30.54, 38.75],
  cesme: [26.3, 38.32],
  "dinar-wind": [30.1543032, 38.1223464],
  germencik: [27.6, 37.87],
  "buharkent-geothermal": [28.751, 37.963],
  akkuyu: [33.54, 36.14],
  "sinop-nuclear": [34.91, 42.08],
  ataturk: [38.32, 37.48],
  "deriner-energy": [41.8707143, 41.1716191],
  karapinar: [33.55, 37.72],
  afsin: [36.92, 38.25],
  "catalagzi-energy": [31.8993563, 41.5154309],
  "soma-energy": [27.6402582, 39.193969],
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
  "istanbul-port": [28.9828657, 41.0257757],
  "bandirma-port": [27.9558851, 40.3531441],
  "izmit-port": [29.9146439, 40.7606042],
  "eregli-port": [31.4205, 41.2623],
  "zonguldak-port": [31.7817959, 41.4546504],
  "sinop-port": [35.1488193, 42.023269],
  "samsun-port": [36.339, 41.293],
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
  pamukkale: [29.12, 37.92],
  kapadokya: [34.83, 38.64],
  safranbolu: [32.69, 41.25],
  "nemrut-tour": [38.74, 37.98],
  sumela: [39.66, 40.69],
  efes: [27.34, 37.94],
  "uludag-tour": [29.221, 40.069],
  "kartalkaya-tour": [31.809, 40.59],
  "erciyes-tour": [35.45, 38.53],
  "palandoken-tour": [41.12, 39.82],
  "kackar-tour": [40.84, 40.84],
  "beydaglari-tour": [30.2, 36.62],
  "nemrut-bitlis-tour": [42.23, 38.65],
  "agri-tour": [44.288, 39.702],
  "anzer-tour": [40.5174349, 40.5821521],
  "ayder-tour": [41.0970728, 40.9548315],
  "kadirga-tour": [39.3335652, 40.7220713],
  "persembe-tour": [37.3090489, 40.6304478],
  "saklikent-tour": [30.335133, 36.842915],
  "camliyayla-tour": [34.5934427, 37.1665396],
  "horzum-tour": [35.8492297, 37.6272879],
  "tekir-tour": [34.78, 37.33],
  "karacabey-longoz-tour": [28.39, 40.4],
  "igneada-longoz-tour": [27.9565008, 41.8233204],
  "izmir-bird-tour": [26.9294352, 38.4509623],
  "manyas-bird-tour": [28.0400417, 40.23195],
  "kizilirmak-bird-tour": [36.0355242, 41.6697721],
  "akcali-tour": [43.9253375, 37.8290539],
  "karain-tour": [30.5706249, 37.077831],
  "damlatas-tour": [31.9887906, 36.5418683],
  "dim-tour": [32.1097885, 36.5391555],
  "beldibi-tour": [30.5690834, 36.744337],
  "insuyu-tour": [30.3757774, 37.6597429],
  "gilindire-tour": [33.4022388, 36.1311398],
  "ballica-tour": [36.3015033, 40.2273137],
  "golcuk-geotour": [30.494, 37.731],
  "kula-geotour": [28.52, 38.58],
  "meke-geotour": [33.64, 37.685],
  "acigol-geotour": [33.666, 37.713],
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
  "gelibolu-tour": [26.3142842, 40.2045903],
  "baskomutan-tour": [30.3960434, 38.7009321],
  "istiklal-tour": [33.76, 41.98],
  "malazgirt-tour": [42.5119814, 39.1393805],
  "sakarya-tour": [32.3789195, 39.4367068],
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
  "marmaray-t": [29.018, 41.007],
  "bolu-t": [31.4589139, 40.7472274],
  "ovit-t": [40.7844019, 40.6211219],
  "zigana-t": [39.47, 40.64],
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

const REAL_LINES: Record<string, Coordinate[]> = {
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
  "kop-dagi": [[39.7, 40.0], [40.3, 39.9], [40.8, 39.8]],
  bey: [[29.4, 36.8], [30.3, 36.9], [31.1, 37.0]],
  sultan: [[30.5, 38.2], [31.2, 38.1], [31.8, 38.0]],
  bolkar: [[32.8, 37.0], [33.8, 37.1], [34.8, 37.2]],
  aladag: [[34.7, 37.8], [35.4, 37.9], [36.0, 38.1]],
  nur: [[36.0, 37.1], [36.3, 36.7], [36.2, 36.3]],
  malatya: [[37.5, 38.5], [38.2, 38.4], [38.8, 38.3]],
  sundiken: [[30.8, 39.6], [31.4, 39.7], [32.0, 39.6]],
  elmadag: [[32.9, 39.8], [33.4, 39.8], [33.9, 39.7]],
  munzur: [[38.5, 39.6], [39.4, 39.7], [40.4, 39.6]],
  mercan: [[39.6, 39.9], [40.2, 39.8], [40.8, 39.7]],
  hakkari: [[43.0, 37.5], [43.8, 37.6], [44.6, 37.4]],
  cilo: [[43.3, 37.5], [44.0, 37.5], [44.5, 37.4]],
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
  "boyuna-med": [[39.4671, 36.6979], [38.7774, 36.6993], [38.5634, 36.8388], [38.2528, 36.9135], [37.485, 36.6411], [37.091, 36.6236], [36.9888, 36.762], [36.6755, 36.8456], [36.5529, 36.497], [36.7048, 36.2503], [36.3975, 36.2232], [36.1691, 35.8154], [36.0085, 35.9403], [35.979, 36.019], [35.7804, 36.2988], [35.9096, 36.4451], [36.1946, 36.596], [36.2057, 36.7835], [36.0171, 36.9301], [35.7946, 36.7657], [35.5638, 36.7132], [35.7238, 36.7121], [35.4207, 36.5907], [35.251, 36.6782], [34.8157, 36.7971], [34.654, 36.8076], [34.2601, 36.5715], [33.9626, 36.2318], [33.6896, 36.1346], [33.1465, 36.1379], [32.8032, 36.0154], [32.389, 36.1629], [32.0296, 36.5382], [31.3349, 36.8079], [30.6793, 36.8838], [30.5749, 36.7949], [30.5915, 36.5893], [30.4768, 36.3974], [30.5296, 36.3343], [30.3499, 36.2815]],
  "enine-aegean": [[28.901, 36.7137], [28.7901, 36.686], [28.5876, 36.8154], [28.4621, 36.8112], [28.3785, 36.8449], [28.2582, 36.8454], [28.0354, 36.5629], [27.9562, 36.6013], [28.1293, 36.7257], [27.9304, 36.7421], [27.6787, 36.6576], [27.3629, 36.6846], [27.6404, 36.811], [28.0329, 36.7876], [28.0207, 36.9257], [28.1679, 36.9068], [28.3265, 37.0493], [27.5657, 36.9746], [27.4243, 37.0357], [27.2635, 36.964], [27.2529, 37.129], [27.4724, 37.081], [27.5812, 37.1363], [27.5754, 37.2157], [27.4568, 37.2507], [27.4982, 37.3201], [27.3888, 37.3229], [27.4165, 37.416], [27.1918, 37.3535], [27.2276, 37.4724], [27.1596, 37.5854], [27.0029, 37.659], [27.2421, 37.731], [27.2532, 37.9776], [26.981, 38.0749], [26.7574, 38.2221], [26.5915, 38.1026], [26.391, 38.261], [26.2301, 38.2751], [26.3026, 38.3207], [26.2846, 38.3765], [26.4824, 38.376], [26.4513, 38.4282], [26.3529, 38.6387], [26.4162, 38.681], [26.6251, 38.5313], [26.5846, 38.4265], [26.6738, 38.3121], [26.7074, 38.4346], [26.8085, 38.3554], [27.1707, 38.4412], [26.9485, 38.4318], [26.7221, 38.6524], [26.7401, 38.7418], [26.8946, 38.7337], [26.939, 38.766], [26.8926, 38.8251], [26.969, 38.804], [27.0663, 38.8771], [27.0438, 38.941], [26.8012, 38.9507], [26.8776, 39.1001], [26.7182, 39.259], [26.6087, 39.2735], [26.9312, 39.4854], [26.9499, 39.5629], [26.1379, 39.4526], [26.0838, 39.511]],
  "ria-istanbul": [[29.0699, 40.9621], [29.0171, 40.9957], [29.006, 41.0099], [29.0344, 41.0455], [29.0614, 41.0913], [29.0768, 41.1379], [29.1118, 41.2031], [29.2004, 41.224]],
  "ria-canakkale": [[26.0838, 39.511], [26.1635, 39.6593], [26.1774, 39.989], [26.3349, 40.0293], [26.4032, 40.1968], [26.5246, 40.2176], [26.7565, 40.404], [26.9918, 40.3846], [27.2621, 40.4615]],
  "ria-mentese": [[28.901, 36.7137], [28.8457, 36.5882], [28.6179, 36.7035], [28.5876, 36.8154], [28.4621, 36.8112], [28.3982, 36.7846], [28.2582, 36.8454], [28.0354, 36.5629], [27.9562, 36.6013], [28.1293, 36.7257], [27.9304, 36.7421], [27.6787, 36.6576], [27.4049, 36.6624], [27.3624, 36.7096], [27.6404, 36.811], [28.0329, 36.7876], [28.0207, 36.9257], [28.1679, 36.9068], [28.2157, 36.9987], [28.3304, 37.0324], [27.5657, 36.9746], [27.4243, 37.0357], [27.2635, 36.964], [27.2529, 37.129], [27.3649, 37.1571], [27.4724, 37.081], [27.5812, 37.1363]],
  "dalmacya-teke": [[30.3499, 36.2815], [30.1688, 36.3101], [30.1165, 36.2474], [29.6838, 36.1304], [29.5838, 36.186], [29.6304, 36.2054], [29.3515, 36.2301], [29.1013, 36.3871], [29.1251, 36.5435], [29.0085, 36.5435], [29.1218, 36.6479], [28.9365, 36.7562], [28.901, 36.7137]],
  "limanli-marmara": [[28.8846, 40.9768], [28.8404, 40.9582], [28.7885, 40.971], [28.6868, 40.9699], [28.6201, 40.9604], [28.5937, 41.0154], [28.5476, 40.9999], [28.441, 41.0343], [28.3401, 41.0588], [28.2335, 41.0776]],
  "kalankli-teke": [[31.6646, 36.6493], [31.3349, 36.8079], [30.6793, 36.8838], [30.5749, 36.7949], [30.5915, 36.5893], [30.4768, 36.3974], [30.5296, 36.3343], [30.4146, 36.2149], [30.2004, 36.3154], [29.6838, 36.1304], [29.3515, 36.2301], [29.1013, 36.3871], [29.1251, 36.5435], [28.901, 36.7137]],
  "kalankli-taseli": [[33.0887, 36.0874], [32.9501, 36.1037], [32.8032, 36.0154], [32.5171, 36.0965], [32.2949, 36.2349], [32.0535, 36.5232], [31.6646, 36.6493]],
  "aydin-f": [[27.2, 37.8], [28.1, 37.7], [29.0, 37.7]],
  istanbul: [[28.96, 41.22], [29.1, 41.12], [29.04, 41.03], [28.98, 40.98]],
  canakkale: [[26.72, 40.45], [26.55, 40.25], [26.4, 40.05]],
  saros: [[26.2379, 40.3315], [26.799, 40.5568], [26.839, 40.5868], [26.8243, 40.6374], [26.6099, 40.6368], [26.5338, 40.5913], [26.0757, 40.6171]],
  "edremit-g": [[26.6532, 39.3185], [26.6304, 39.2971], [26.671, 39.279], [26.7018, 39.3407], [26.8057, 39.3921], [26.7971, 39.4324], [26.9312, 39.4854], [26.9535, 39.5518], [26.9226, 39.5838], [26.7476, 39.566]],
  "candarli-g": [[26.7613, 38.7401], [26.824, 38.7624], [26.8946, 38.7337], [26.939, 38.766], [26.8926, 38.8251], [26.969, 38.804], [26.9713, 38.846], [27.0663, 38.8771], [27.0438, 38.941], [26.8582, 38.9138], [26.8012, 38.9507], [26.799, 39.0324], [26.8871, 39.0782], [26.7629, 39.1776]],
  "izmir-g": [[26.609, 38.4707], [26.5846, 38.4265], [26.6807, 38.3104], [26.7074, 38.4346], [26.8085, 38.3554], [27.1707, 38.4412], [27.0268, 38.4676], [26.9485, 38.4318], [26.8282, 38.5271], [26.8879, 38.5107], [26.8182, 38.586]],
  "kusadasi-g": [[27.1818, 37.5518], [27.219, 37.5865], [27.1965, 37.606], [27.0029, 37.6615], [27.2421, 37.731], [27.2721, 37.9512], [26.941, 38.0746]],
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
    "van-vs": "van",
    "iznik-t": "iznik",
    "manyas-t": "manyas",
    "tuz-t": "tuz",
    "ercis": "ercek",
    "burdur-r": "burdur",
    "uluabat-r": "uluabat",
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
  if (!["mountain", "river"].includes(feature.kind)) return undefined;
  const canonicalId = feature.id.replace(/-(f|t|vs|n|s|gl|d|br)$/, "");
  return REAL_LINES[canonicalId];
}

function areaPolygonFor(feature: Feature) {
  return ["plain", "plateau", "region", "lake"].includes(feature.kind)
    ? AREA_POLYGONS[feature.id]
    : undefined;
}

function distributionPolygonsFor(feature: Feature) {
  return DISTRIBUTION_POLYGONS[feature.id];
}

function featureCenter(feature: Feature): Coordinate {
  const point = POINT_COORDINATES[feature.id] ?? functionalCityCoordinate(feature.id);
  if (point) return project(point);
  const areaPolygon = areaPolygonFor(feature);
  if (areaPolygon) {
    const projected = areaPolygon.map(project);
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

function featureHitArea(feature: Feature) {
  if (!["volcano", "city", "gate", "pass", "mine", "energy", "dam", "port", "bridge", "tunnel"].includes(feature.kind)) return null;
  const [cx, cy] = featureCenter(feature);
  return <rect className="geo-hit" x={cx - Math.max(feature.w * 4, 16)} y={cy - Math.max(feature.h * 2, 12)} width={Math.max(feature.w * 8, 32)} height={Math.max(feature.h * 4, 24)} />;
}

function featureGraphic(
  feature: Feature,
  lakeShape?: LakeFeature,
  riverShape?: RiverFeature,
  provinces: ProvinceFeature[] = [],
) {
  const realLine = realLineFor(feature);
  const [cx, cy] = featureCenter(feature);
  const compactPoint = ["city", "gate", "mine", "energy", "dam", "port", "bridge", "tunnel"].includes(feature.kind);
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

  if (lakeShape) {
    const path = lakePath(lakeShape);
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

  const areaPolygon = areaPolygonFor(feature);
  if (areaPolygon) {
    return (
      <path
        d={ringPath(areaPolygon)}
        className={`geo-shape geo-shape--${feature.kind} geo-shape--area`}
      />
    );
  }

  const distributionPolygons = distributionPolygonsFor(feature);
  if (distributionPolygons) {
    return (
      <g className="geo-distribution" clipPath="url(#turkey-country-clip)">
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
    const path = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
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
    return (
      <g>
        <path d={path} className="geo-line-hit" vectorEffect="non-scaling-stroke" />
        <path
          d={path}
          className="geo-shape geo-shape--line"
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
    return (
      <g className="port-glyph">
        <circle cx={cx} cy={cy} r={Math.max(height * .62, 7)} className="geo-shape geo-shape--port" />
        <path
          d={`M${cx},${cy - height * .62} L${cx},${cy + height * .5} M${cx - width * .3},${cy - height * .25} L${cx + width * .3},${cy - height * .25} M${cx - width * .38},${cy + height * .08} Q${cx - width * .34},${cy + height * .55} ${cx},${cy + height * .58} Q${cx + width * .34},${cy + height * .55} ${cx + width * .38},${cy + height * .08}`}
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
  const [hoveredProvince, setHoveredProvince] = useState("");
  const uniqueFeatures = [...new Map(quiz.features.map((feature) => [feature.id, feature])).values()];
  const orderedFeatures = [...uniqueFeatures].sort((left, right) => {
    if (left.id === currentFeatureId) return 1;
    if (right.id === currentFeatureId) return -1;
    return 0;
  });
  const visibleLabelIds = showAllLabels ? correctIds : correctIds.slice(-4);
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
    ])
      .then((collections) => setLakes(
        collections.flatMap((data) => data.features as LakeFeature[]),
      ))
      .catch(() => setLakes([]));
    Promise.all([
      fetch("/data/turkey-rivers.geojson").then((response) => response.json()),
      fetch("/data/turkey-rivers-extra.geojson").then((response) => response.json()),
    ])
      .then((collections) => setRivers(
        collections.flatMap((data) => data.features as RiverFeature[]),
      ))
      .catch(() => setRivers([]));
  }, []);

  return (
    <div className="real-map-wrap">
      <svg className="real-map" viewBox="0 0 1000 430" role="img" aria-label={`81 il sınırları üzerinde ${quiz.title}`}>
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
                  data-status={status}
                  aria-label={status === "correct" ? `${feature.name}, doğru bilindi` : "İl seçeneği"}
                  className={`province-option province-option--${status}`}
                  onClick={() => onSelect(feature)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") onSelect(feature);
                  }}
                >
                  <path d={provincePath(province)} fillRule="evenodd" />
                  {status === "correct" && (
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
        {quiz.id !== "provinces" && <g className="feature-layer">
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
                data-status={status}
                aria-label={status === "correct" ? `${feature.name}, doğru bilindi` : "Harita seçeneği"}
                className={`geo-feature geo-feature--${status}`}
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
                  provinces,
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
        <span>81 İL SINIRI</span>
        <strong>{hoveredProvince || "İlin üzerine gel"}</strong>
      </div>
      <div className="map-attribution">
        Rölyef: Esri · İl sınırları: açık coğrafi veri ·{" "}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
          © OpenStreetMap katkıcıları
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
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showAllLabels, setShowAllLabels] = useState(false);

  const quiz = QUIZZES.find((item) => item.id === activeQuizId) ?? QUIZZES[0];
  const quizFeatureCount = new Set(quiz.features.map((feature) => feature.id)).size;
  const sourceRef = SOURCE_BY_QUIZ[quiz.id] ?? SOURCE_BY_GROUP[quiz.group];
  const currentId = questionOrder.find(
    (id, index) => index >= questionIndex && !correctIds.includes(id),
  ) ?? quiz.features.find((feature) => !correctIds.includes(feature.id))?.id ?? quiz.features[0].id;
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
    setQuestionIndex(0);
    setCorrectIds([]);
    setWrongIds([]);
    setAttempts(0);
    setFinished(false);
    setShowAllLabels(false);
    setMenuOpen(false);
    window.localStorage.setItem(ACTIVE_QUIZ_STORAGE_KEY, nextQuiz.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelect = (feature: Feature) => {
    if (finished || correctIds.includes(feature.id)) return;

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
    flushSync(() => {
      setAttempts((value) => value + 1);
      setCorrectIds(nextCorrect);
      setWrongIds([]);
    });
    if (soundOn) playMapSound("correct");

    if (nextCorrect.length === quizFeatureCount) {
      window.setTimeout(() => setFinished(true), 380);
      return;
    }

    window.setTimeout(() => setQuestionIndex((index) => index + 1), 360);
  };

  useEffect(() => {
    const savedQuizId = window.localStorage.getItem(ACTIVE_QUIZ_STORAGE_KEY);
    const savedQuiz = QUIZZES.find((item) => item.id === savedQuizId);
    const restoreTimer = window.setTimeout(() => {
      if (savedQuiz) {
        setActiveQuizId(savedQuiz.id);
        setQuestionOrder((previousOrder) => shuffledFeatureIds(savedQuiz.features, previousOrder));
      } else {
        setQuestionOrder((previousOrder) => shuffledFeatureIds(QUIZZES[0].features, previousOrder));
      }
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="app-shell">
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
                İsimler: {showAllLabels ? "tümü" : "son 4"}
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
            <p><strong>Doğrular yeşil kalır.</strong> İsimleri haritada görünür ve öğrenme izini oluşturur.</p>
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
          <a href="https://ogmmateryal.eba.gov.tr/kitap/mebi-konu-ozetleri/tyt-cografya/files/basic-html/page76.html" target="_blank" rel="noreferrer">
            MEB yer şekilleri <span>↗</span>
          </a>
          <a href="https://www.tarimorman.gov.tr/DKMP/Menu/18/Korunan-Alan-Istatistikleri" target="_blank" rel="noreferrer">
            DKMP korunan alanlar <span>↗</span>
          </a>
          <a href="https://www.harita.gov.tr/urun/turkiye-fiziki-haritasi-dilsiz/273" target="_blank" rel="noreferrer">
            HGM fiziki harita <span>↗</span>
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
