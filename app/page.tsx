"use client";

import { useEffect, useMemo, useState } from "react";

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
      f("agri", "Ağrı Dağı", 88, 40, 5, 8, "volcano"),
      f("erciyes", "Erciyes Dağı", 57, 51, 5, 8, "volcano"),
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
      f("ulubat", "Ulubat Gölü", 19, 35, 5, 3, "lake"),
      f("tuz-t", "Tuz Gölü", 49, 52, 7, 9, "lake", 8),
      f("beysehir-t", "Beyşehir Gölü", 40, 65, 6, 8, "lake", 14),
      f("egirdir-t", "Eğirdir Gölü", 36, 64, 4, 9, "lake", -8),
      f("burdur-t", "Burdur Gölü", 33, 62, 5, 5, "lake"),
      f("aksehir-t", "Akşehir Gölü", 39, 58, 5, 4, "lake"),
      f("eber-t", "Eber Gölü", 37, 58, 5, 4, "lake"),
      f("acigol-t", "Acıgöl", 29, 61, 5, 4, "lake"),
      f("hazar", "Hazar Gölü", 71, 54, 6, 3, "lake", -10),
      f("seyfe-t", "Seyfe Gölü", 54, 46, 5, 4, "lake"),
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
      f("van-vs", "Van Gölü", 80, 51, 10, 7, "lake", -8),
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
      f("coruh", "Çoruh", 84, 24, 12, 3, "river", -18),
      f("goksu", "Göksu", 48, 69, 12, 3, "river", 72),
      f("manavgat", "Manavgat", 36, 71, 9, 3, "river", 80),
      f("aksu", "Aksu", 34, 71, 9, 3, "river", 80),
      f("dalaman", "Dalaman Çayı", 25, 68, 10, 3, "river", 70),
      f("susurluk", "Susurluk (Simav) Çayı", 20, 38, 14, 3, "river", 35),
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
      f("bafra", "Bafra Ovası", 54, 19, 8, 4, "plain"),
      f("carsamba", "Çarşamba Ovası", 61, 20, 8, 4, "plain"),
      f("gediz", "Gediz Ovası", 20, 52, 12, 5, "plain", -4),
      f("bakircay", "Bakırçay Ovası", 16, 46, 10, 4, "plain", -4),
      f("kucukmenderes", "Küçük Menderes Ovası", 19, 56, 11, 4, "plain", 3),
      f("buyukmenderes-o", "Büyük Menderes Ovası", 22, 61, 13, 4, "plain", 5),
      f("silifke", "Silifke Ovası", 46, 75, 9, 4, "plain"),
      f("erzincan-o", "Erzincan Ovası", 70, 42, 10, 5, "plain"),
      f("mus-o", "Muş Ovası", 78, 54, 10, 5, "plain"),
      f("igdir-o", "Iğdır Ovası", 91, 41, 7, 5, "plain"),
      f("amik", "Amik Ovası", 62, 75, 9, 5, "plain"),
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
    ],
  },
  {
    id: "passes",
    group: "Ulaşım",
    title: "Geçitler",
    eyebrow: "Ulaşım · Geçitler",
    description: "Dağ sıralarını aşan önemli geçitleri seç.",
    color: "#d98b38",
    icon: "⌃",
    features: [
      f("bolu-pass", "Bolu Geçidi", 34, 27, 6, 5, "pass"),
      f("zigana-pass", "Zigana Geçidi", 70, 28, 6, 5, "pass"),
      f("gulek-pass", "Gülek Geçidi", 54, 69, 6, 5, "pass"),
      f("sertavul-pass", "Sertavul Geçidi", 48, 71, 6, 5, "pass"),
      f("belen-pass", "Belen Geçidi", 62, 73, 6, 5, "pass"),
      f("kop-pass", "Kop Geçidi", 73, 36, 6, 5, "pass"),
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
      f("sultan", "Sultan Sazlığı", 58, 53, 7, 6, "region"),
      f("kus", "Kuş Gölü", 17, 31, 6, 5, "region"),
      f("kizilirmak-delta", "Kızılırmak Deltası", 54, 18, 8, 5, "region"),
      f("goksu", "Göksu Deltası", 49, 74, 8, 5, "region"),
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
    ],
  },
  {
    id: "energy",
    group: "Ekonomi",
    title: "Enerji Kaynakları",
    eyebrow: "Ekonomi · Enerji",
    description: "Enerji üretim merkezlerini haritadaki yerleriyle bil.",
    color: "#dcaa24",
    icon: "ϟ",
    features: [
      f("cesme", "Çeşme · Rüzgâr", 14, 54, 7, 6, "energy"),
      f("germencik", "Germencik · Jeotermal", 20, 56, 7, 6, "energy"),
      f("akkuyu", "Akkuyu · Nükleer", 47, 76, 7, 6, "energy"),
      f("ataturk", "Atatürk Barajı · Hidroelektrik", 72, 63, 7, 6, "energy"),
      f("karapinar", "Karapınar · Güneş", 50, 62, 7, 6, "energy"),
      f("afsin", "Afşin-Elbistan · Termik", 65, 52, 7, 6, "energy"),
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
    title: "Sanayi",
    eyebrow: "Ekonomi · Sanayi",
    description: "Türkiye’nin başlıca sanayi odaklarını bul.",
    color: "#c93b45",
    icon: "▥",
    features: [
      f("istanbul-san", "İstanbul", 17, 26, 8, 7, "city"),
      f("izmir-san", "İzmir", 17, 54, 8, 7, "city"),
      f("bursa-san", "Bursa", 23, 34, 8, 7, "city"),
      f("ankara-san", "Ankara", 42, 40, 8, 7, "city"),
      f("adana-san", "Adana", 57, 68, 8, 7, "city"),
      f("gaziantep-san", "Gaziantep", 70, 67, 8, 7, "city"),
    ],
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
      f("marmara-cl", "Marmara Geçiş İklimi", 18, 31, 18, 15, "region"),
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
    eyebrow: "Doğal coğrafya · Topraklar",
    description: "Zonal ve azonal toprakların tipik yayılış alanlarını seç.",
    color: "#986846",
    icon: "≋",
    features: [
      f("terra-rossa", "Terra Rossa", 39, 71, 47, 10, "region"),
      f("brown-forest", "Kahverengi Orman Toprağı", 55, 23, 55, 10, "region"),
      f("cherno", "Çernezyom", 83, 30, 18, 11, "region"),
      f("chestnut", "Kestane Renkli Bozkır Toprağı", 55, 45, 36, 17, "region"),
      f("brown-step", "Kahverengi Bozkır Toprağı", 54, 56, 40, 18, "region"),
      f("alluvial", "Alüvyal Toprak · Çukurova", 57, 69, 15, 7, "plain"),
    ],
  },
  {
    id: "agriculture",
    group: "Ekonomi",
    title: "Tarım Ürünleri",
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
    ],
  },
  {
    id: "livestock",
    group: "Ekonomi",
    title: "Hayvancılık",
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
    ],
  },
  {
    id: "ports",
    group: "Ulaşım",
    title: "Limanlar",
    eyebrow: "Ulaşım · Deniz yolu",
    description: "Başlıca ticaret ve ulaşım limanlarını kıyıda bul.",
    color: "#357ca6",
    icon: "⚓",
    features: [
      f("istanbul-port", "İstanbul Limanı", 17, 25, 6, 5, "city"),
      f("izmir-port", "İzmir Limanı", 15, 54, 6, 5, "city"),
      f("mersin-port", "Mersin Limanı", 49, 76, 6, 5, "city"),
      f("iskenderun-port", "İskenderun Limanı", 62, 74, 6, 5, "city"),
      f("samsun-port", "Samsun Limanı", 58, 20, 6, 5, "city"),
      f("trabzon-port", "Trabzon Limanı", 72, 21, 6, 5, "city"),
      f("zonguldak-port", "Zonguldak Limanı", 31, 19, 6, 5, "city"),
    ],
  },
  {
    id: "dams",
    group: "Sular",
    title: "Barajlar",
    eyebrow: "Sular · Barajlar",
    description: "Başlıca barajları üzerinde kurulduğu akarsu çevresinde bul.",
    color: "#3b8aa1",
    icon: "▰",
    features: [
      f("ataturk-dam", "Atatürk Barajı", 71, 61, 8, 6, "lake"),
      f("keban", "Keban Barajı", 70, 49, 7, 6, "lake"),
      f("karakaya", "Karakaya Barajı", 70, 54, 7, 6, "lake"),
      f("hirfanli", "Hirfanlı Barajı", 49, 45, 7, 6, "lake"),
      f("altinkaya", "Altınkaya Barajı", 56, 25, 7, 6, "lake"),
      f("deriner", "Deriner Barajı", 84, 25, 7, 6, "lake"),
      f("borcka", "Borçka Barajı", 86, 23, 7, 6, "lake"),
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
    eyebrow: "Ekonomi · Turizm",
    description: "Doğal ve kültürel turizm merkezlerini haritada bul.",
    color: "#b14784",
    icon: "✦",
    features: [
      f("pamukkale", "Pamukkale", 25, 58, 7, 6, "city"),
      f("kapadokya", "Kapadokya", 56, 52, 7, 6, "city"),
      f("safranbolu", "Safranbolu", 36, 24, 7, 6, "city"),
      f("nemrut-tour", "Nemrut Dağı", 71, 58, 7, 6, "city"),
      f("sumela", "Sümela Manastırı", 72, 24, 7, 6, "city"),
      f("efes", "Efes", 17, 56, 7, 6, "city"),
    ],
  },
  {
    id: "cities",
    group: "Türkiye",
    title: "Türkiye Şehirleri",
    eyebrow: "Türkiye · Şehirler",
    description: "Temel şehir konumlarını haritada pekiştir.",
    color: "#6847bd",
    icon: "⌂",
    features: [
      f("istanbul-city", "İstanbul", 17, 26, 7, 6, "city"),
      f("ankara-city", "Ankara", 43, 42, 7, 6, "city"),
      f("izmir-city", "İzmir", 16, 55, 7, 6, "city"),
      f("antalya-city", "Antalya", 34, 72, 7, 6, "city"),
      f("samsun-city", "Samsun", 58, 22, 7, 6, "city"),
      f("erzurum-city", "Erzurum", 78, 39, 7, 6, "city"),
      f("diyarbakir-city", "Diyarbakır", 75, 61, 7, 6, "city"),
    ],
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
      f("sugla", "Suğla Gölü", 41, 67, 4, 4, "lake"),
      f("avlan", "Avlan Gölü", 32, 72, 4, 4, "lake"),
      f("kestel-l", "Kestel Gölü", 31, 66, 4, 4, "lake"),
      f("kovada-l", "Kovada Gölü", 35, 66, 4, 4, "lake"),
      f("kiziloren-l", "Kızılören Obruk Gölü", 48, 59, 4, 4, "lake"),
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
      f("acigol-vl", "Acıgöl", 29, 61, 5, 4, "lake"),
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
      f("ria-straits", "Ria Kıyı · İstanbul ve Çanakkale", 14, 29, 8, 13, "river"),
      f("ria-mentese", "Ria Kıyı · Menteşe", 22, 68, 10, 5, "river"),
      f("dalmacya-teke", "Dalmaçya Kıyı · Teke", 31, 73, 10, 4, "river"),
      f("limanli-marmara", "Limanlı Kıyı · İstanbul çevresi", 16, 25, 8, 4, "river"),
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
      f("bogazici-b", "15 Temmuz Şehitler Köprüsü", 16, 24, 5, 4, "pass"),
      f("fsm-b", "Fatih Sultan Mehmet Köprüsü", 16, 23, 5, 4, "pass"),
      f("yss-b", "Yavuz Sultan Selim Köprüsü", 17, 22, 5, 4, "pass"),
      f("osmangazi-b", "Osmangazi Köprüsü", 20, 31, 5, 4, "pass"),
      f("canakkale-b", "1915 Çanakkale Köprüsü", 9, 35, 5, 4, "pass"),
      f("avrasya-t", "Avrasya Tüneli", 16, 25, 5, 4, "pass"),
      f("marmaray-t", "Marmaray", 16, 24, 5, 4, "pass"),
      f("bolu-t", "Bolu Dağı Tüneli", 32, 28, 5, 4, "pass"),
      f("ovit-t", "Ovit Tüneli", 77, 26, 5, 4, "pass"),
      f("zigana-t", "Yeni Zigana Tüneli", 70, 27, 5, 4, "pass"),
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
  bakircay: [[26.7, 39.2], [27.0, 38.9], [27.8, 38.9], [28.1, 39.1], [27.7, 39.4], [27.0, 39.4]],
  kucukmenderes: [[27.0, 38.2], [27.4, 37.9], [28.2, 38.0], [28.6, 38.2], [28.1, 38.4], [27.4, 38.4]],
  "buyukmenderes-o": [[27.1, 37.8], [27.7, 37.5], [28.8, 37.5], [29.5, 37.7], [29.0, 38.0], [27.8, 38.0]],
  silifke: [[33.6, 36.4], [33.8, 36.2], [34.2, 36.2], [34.4, 36.4], [34.1, 36.6], [33.7, 36.6]],
  "erzincan-o": [[38.7, 39.7], [39.0, 39.5], [39.7, 39.5], [40.0, 39.7], [39.7, 39.9], [39.0, 39.9]],
  "mus-o": [[40.9, 38.8], [41.3, 38.5], [42.1, 38.5], [42.4, 38.8], [42.0, 39.0], [41.3, 39.0]],
  "igdir-o": [[43.5, 39.9], [43.8, 39.7], [44.6, 39.7], [44.8, 39.9], [44.5, 40.1], [43.8, 40.1]],
  amik: [[36.0, 36.5], [36.2, 36.2], [36.7, 36.2], [36.9, 36.5], [36.6, 36.8], [36.2, 36.8]],
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
};

const DISTRIBUTION_POLYGONS: Record<string, Coordinate[][]> = {
  "karadeniz-cl": [
    [[26.6, 41.9], [29.2, 41.8], [32.4, 41.8], [35.7, 41.8], [38.8, 41.4], [41.8, 41.4], [41.5, 40.5], [38.8, 40.4], [35.5, 40.7], [32.0, 40.7], [29.0, 40.8], [27.0, 41.1]],
  ],
  "akdeniz-cl": [
    [[26.0, 39.5], [26.5, 38.5], [27.0, 37.4], [28.0, 36.8], [29.0, 36.3], [29.8, 36.4], [29.5, 37.3], [28.7, 37.8], [28.2, 38.8], [27.3, 39.7]],
    [[29.0, 36.3], [31.0, 35.9], [33.7, 36.0], [35.6, 36.5], [36.8, 36.0], [36.9, 36.9], [35.9, 37.3], [34.4, 37.2], [32.4, 37.2], [30.5, 37.4], [29.5, 37.2]],
  ],
  "karasal-cl": [
    [[29.7, 40.0], [31.7, 40.7], [34.5, 40.7], [37.0, 40.5], [39.8, 40.3], [42.7, 40.5], [44.4, 39.6], [44.5, 37.4], [42.7, 37.0], [40.3, 37.1], [38.4, 37.6], [36.4, 37.4], [34.0, 37.6], [31.5, 37.8], [29.6, 38.8]],
  ],
  "marmara-cl": [
    [[26.0, 42.0], [29.7, 42.0], [30.8, 40.9], [30.2, 39.8], [28.7, 39.4], [26.2, 40.0]],
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
  goat: [
    [[29.1, 36.5], [31.0, 36.1], [33.2, 36.2], [35.0, 36.6], [36.5, 36.4], [36.7, 37.1], [35.0, 37.5], [33.0, 37.3], [31.0, 37.5], [29.4, 37.2]],
  ],
};

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
  kapikule: [26.36, 41.72],
  ipsala: [26.38, 40.92],
  sarp: [41.55, 41.52],
  gurbu: [44.48, 39.42],
  habur: [42.57, 37.15],
  cilvegozu: [36.19, 36.24],
  "bolu-pass": [31.68, 40.63],
  "zigana-pass": [39.4, 40.65],
  "gulek-pass": [34.8, 37.3],
  "sertavul-pass": [33.1, 36.88],
  "belen-pass": [36.23, 36.48],
  "kop-pass": [40.55, 40.03],
  zonguldak: [31.79, 41.45],
  divrigi: [38.12, 39.37],
  seyitomer: [29.58, 39.49],
  murgul: [41.56, 41.28],
  bigadic: [28.13, 39.39],
  mazidagi: [40.49, 37.48],
  cesme: [26.3, 38.32],
  germencik: [27.6, 37.87],
  akkuyu: [33.54, 36.14],
  ataturk: [38.32, 37.48],
  karapinar: [33.55, 37.72],
  afsin: [36.92, 38.25],
  "istanbul-san": [28.98, 41.01],
  "izmir-san": [27.14, 38.42],
  "bursa-san": [29.06, 40.19],
  "ankara-san": [32.85, 39.93],
  "adana-san": [35.32, 37.0],
  "gaziantep-san": [37.38, 37.07],
  "istanbul-port": [28.97, 41.02],
  "izmir-port": [27.14, 38.43],
  "mersin-port": [34.64, 36.8],
  "iskenderun-port": [36.17, 36.59],
  "samsun-port": [36.33, 41.29],
  "trabzon-port": [39.73, 41.0],
  "zonguldak-port": [31.79, 41.45],
  pamukkale: [29.12, 37.92],
  kapadokya: [34.83, 38.64],
  safranbolu: [32.69, 41.25],
  "nemrut-tour": [38.74, 37.98],
  sumela: [39.66, 40.69],
  efes: [27.34, 37.94],
  "istanbul-city": [28.98, 41.01],
  "ankara-city": [32.85, 39.93],
  "izmir-city": [27.14, 38.42],
  "antalya-city": [30.71, 36.89],
  "samsun-city": [36.33, 41.29],
  "erzurum-city": [41.27, 39.9],
  "diyarbakir-city": [40.23, 37.91],
  "bogazici-b": [29.03, 41.05],
  "fsm-b": [29.06, 41.09],
  "yss-b": [29.11, 41.2],
  "osmangazi-b": [29.51, 40.75],
  "canakkale-b": [26.63, 40.34],
  "avrasya-t": [29.02, 41.0],
  "marmaray-t": [29.02, 41.0],
  "bolu-t": [31.69, 40.65],
  "ovit-t": [40.78, 40.62],
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
  "asi-br": [[36.3, 36.8], [36.2, 36.4], [36.0, 36.0]],
  "hezil-br": [[42.4, 37.3], [42.8, 37.2], [43.1, 37.1]],
  "boyuna-black": [[28.8, 41.1], [32.0, 41.7], [36.0, 41.6], [40.0, 41.1], [41.8, 41.4]],
  "boyuna-med": [[29.0, 36.2], [31.5, 36.0], [34.0, 36.1], [36.0, 36.0]],
  "enine-aegean": [[26.4, 39.6], [27.2, 39.0], [26.8, 38.5], [27.4, 37.9], [27.1, 37.2]],
  "ria-straits": [[26.4, 40.3], [26.7, 40.1], [28.9, 41.2], [29.1, 41.0]],
  "ria-mentese": [[27.4, 37.1], [28.0, 36.8], [28.7, 36.7]],
  "dalmacya-teke": [[29.3, 36.3], [29.8, 36.2], [30.5, 36.2]],
  "limanli-marmara": [[28.2, 41.0], [28.6, 41.0], [29.0, 41.1]],
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
  const canonicalId = feature.id.replace(/-(f|t|vs|n|s|gl|d|br)$/, "");
  return REAL_LINES[feature.id] ?? REAL_LINES[canonicalId];
}

function areaPolygonFor(feature: Feature) {
  return feature.kind === "plain" || feature.kind === "plateau"
    ? AREA_POLYGONS[feature.id]
    : undefined;
}

function distributionPolygonsFor(feature: Feature) {
  return DISTRIBUTION_POLYGONS[feature.id];
}

function featureCenter(feature: Feature): Coordinate {
  const point = POINT_COORDINATES[feature.id];
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

function featureLabelCenter(feature: Feature, center: Coordinate): Coordinate {
  const [offsetX, offsetY] = LABEL_OFFSETS[feature.id] ?? [0, -18];
  return [center[0] + offsetX, center[1] + offsetY];
}

function featureHitArea(feature: Feature) {
  const realLine = realLineFor(feature);
  if (realLine) {
    const projected = realLine.map(project);
    const xs = projected.map(([x]) => x);
    const ys = projected.map(([, y]) => y);
    const x = Math.min(...xs) - 12;
    const y = Math.min(...ys) - 12;
    return <rect className="geo-hit" x={x} y={y} width={Math.max(...xs) - Math.min(...xs) + 24} height={Math.max(...ys) - Math.min(...ys) + 24} />;
  }
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
  const width = Math.max(feature.w * 7.2, 20);
  const height = Math.max(feature.h * 3.1, 12);

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

  if (feature.kind === "lake" && lakeShape) {
    return (
      <path
        d={lakePath(lakeShape)}
        className="geo-shape geo-shape--lake geo-shape--exact"
        fillRule="evenodd"
      />
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
      const ridgePoints = points.flatMap((point, index) => {
        if (index === points.length - 1) return [point];
        return [
          point,
          [(point[0] + points[index + 1][0]) / 2, (point[1] + points[index + 1][1]) / 2] as Coordinate,
        ];
      });
      return (
        <g>
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
      <path
        d={path}
        className="geo-shape geo-shape--line"
        vectorEffect="non-scaling-stroke"
      />
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
  if (feature.kind === "city" || feature.kind === "gate" || feature.kind === "mine" || feature.kind === "energy") {
    return <path d={`M${cx},${cy - height} L${cx + width / 2},${cy} L${cx},${cy + height} L${cx - width / 2},${cy} Z`} className={`geo-shape geo-shape--${feature.kind}`} />;
  }
  return <ellipse cx={cx} cy={cy} rx={width / 2} ry={height / 2} className={`geo-shape geo-shape--${feature.kind}`} transform={`rotate(${feature.r ?? 0} ${cx} ${cy})`} />;
}

function TurkeyMap({
  quiz,
  correctIds,
  wrongIds,
  onSelect,
}: {
  quiz: Quiz;
  correctIds: string[];
  wrongIds: string[];
  onSelect: (feature: Feature) => void;
}) {
  const [provinces, setProvinces] = useState<ProvinceFeature[]>([]);
  const [lakes, setLakes] = useState<LakeFeature[]>([]);
  const [rivers, setRivers] = useState<RiverFeature[]>([]);
  const [hoveredProvince, setHoveredProvince] = useState("");

  useEffect(() => {
    fetch("/data/turkey-provinces.geojson")
      .then((response) => response.json())
      .then((data) => setProvinces(data.features as ProvinceFeature[]))
      .catch(() => setProvinces([]));
    fetch("/data/turkey-lakes.geojson")
      .then((response) => response.json())
      .then((data) => setLakes(data.features as LakeFeature[]))
      .catch(() => setLakes([]));
    fetch("/data/turkey-rivers.geojson")
      .then((response) => response.json())
      .then((data) => setRivers(data.features as RiverFeature[]))
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
                    <g className="geo-label" transform={`translate(${cx} ${cy})`}>
                      <rect x="-48" y="-18" width="96" height="22" rx="5" />
                      <text textAnchor="middle" y="-3">{feature.name}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        )}
        {quiz.id !== "provinces" && <g className="feature-layer">
          {quiz.features.map((feature) => {
            const status = correctIds.includes(feature.id)
              ? "correct"
              : wrongIds.includes(feature.id)
                ? "wrong"
                : "idle";
            const [cx, cy] = feature.plates?.length
              ? provinceSetCenter(feature.plates, provinces)
              : featureCenter(feature);
            const [labelX, labelY] = featureLabelCenter(feature, [cx, cy]);
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
                {status === "correct" && (
                  <>
                    {(labelX !== cx || labelY !== cy - 18) && (
                      <line className="geo-label-leader" x1={cx} y1={cy} x2={labelX} y2={labelY - 10} />
                    )}
                    <g className="geo-label" transform={`translate(${labelX} ${labelY})`}>
                      <rect x="-62" y="-19" width="124" height="22" rx="5" />
                      <text textAnchor="middle" y="-4">{feature.name}</text>
                    </g>
                  </>
                )}
              </g>
            );
          })}
        </g>}
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
  const [activeGroup, setActiveGroup] = useState("Tümü");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [finished, setFinished] = useState(false);

  const quiz = QUIZZES.find((item) => item.id === activeQuizId) ?? QUIZZES[0];
  const current = quiz.features[questionIndex];
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
    setActiveQuizId(nextQuizId);
    setQuestionIndex(0);
    setCorrectIds([]);
    setWrongIds([]);
    setAttempts(0);
    setFinished(false);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelect = (feature: Feature) => {
    if (finished || correctIds.includes(feature.id)) return;
    setAttempts((value) => value + 1);

    if (feature.id !== current.id) {
      setWrongIds((ids) =>
        ids.includes(feature.id) ? ids : [...ids, feature.id],
      );
      return;
    }

    const nextCorrect = [...correctIds, feature.id];
    setCorrectIds(nextCorrect);
    setWrongIds([]);

    if (nextCorrect.length === quiz.features.length) {
      window.setTimeout(() => setFinished(true), 380);
      return;
    }

    window.setTimeout(() => setQuestionIndex((index) => index + 1), 520);
  };

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
            <span>✓ MEB + HGM ile çapraz kontrollü</span>
            <b>{QUIZZES.length} harita · {TOTAL_LOCATIONS} konum</b>
          </div>

          <div className="question-card" style={{ "--accent": quiz.color } as React.CSSProperties}>
            <span className="question-count">
              SORU {Math.min(questionIndex + 1, quiz.features.length)} / {quiz.features.length}
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
            <button className="mobile-menu" type="button" onClick={() => setMenuOpen(true)}>
              Konular <span>＋</span>
            </button>
          </div>

          <div className="map-stage">
            <div className="sea-label sea-label--black">KARADENİZ</div>
            <div className="sea-label sea-label--aegean">EGE DENİZİ</div>
            <div className="sea-label sea-label--med">AKDENİZ</div>
            <TurkeyMap
              quiz={quiz}
              correctIds={correctIds}
              wrongIds={wrongIds}
              onSelect={handleSelect}
            />
            <div className="map-note"><span>↖</span> Gerçek il sınırları ve coğrafi koordinatlar</div>

            {finished && (
              <div className="finish-card" role="status">
                <span className="finish-confetti">✦</span>
                <p>HARİTA TAMAMLANDI</p>
                <h3>{quiz.features.length} / {quiz.features.length} doğru</h3>
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
