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
  | "energy";

type Feature = {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  kind: FeatureKind;
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
      f("bey", "Bey Dağları", 32, 71, 8, 5, "mountain", -4),
      f("bolkar", "Bolkar Dağları", 49, 71, 8, 5, "mountain", 2),
      f("aladag", "Aladağlar", 58, 66, 7, 5, "mountain", -6),
      f("munzur", "Munzur Dağları", 69, 46, 8, 5, "mountain", -4),
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
      f("bey", "Bey Dağları", 31, 70, 13, 5, "mountain", -4),
      f("bolkar", "Bolkar Dağları", 51, 70, 13, 5, "mountain", 2),
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
      f("cildir", "Çıldır Gölü", 87, 27, 5, 4, "lake"),
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
      f("hazar", "Hazar Gölü", 71, 54, 6, 3, "lake", -10),
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
      f("buyukmenderes", "Büyük Menderes", 23, 61, 18, 3, "river", 8),
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
      f("bolu", "Bolu Geçidi", 34, 27, 6, 5, "pass"),
      f("zigana", "Zigana Geçidi", 70, 28, 6, 5, "pass"),
      f("gulek", "Gülek Geçidi", 54, 69, 6, 5, "pass"),
      f("sertavul", "Sertavul Geçidi", 48, 71, 6, 5, "pass"),
      f("belen", "Belen Geçidi", 62, 73, 6, 5, "pass"),
      f("kop", "Kop Geçidi", 73, 36, 6, 5, "pass"),
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
      f("gap", "GAP", 76, 65, 20, 14, "region"),
      f("dap", "DAP", 79, 40, 22, 15, "region"),
      f("dokap", "DOKAP", 69, 22, 25, 10, "region"),
      f("kop", "KOP", 49, 57, 20, 16, "region"),
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
      f("marmara-pop", "Çatalca-Kocaeli", 19, 27, 18, 11, "region"),
      f("ege-pop", "Kıyı Ege", 17, 53, 11, 24, "region"),
      f("cukur-pop", "Çukurova", 57, 68, 17, 10, "region"),
      f("ankara-pop", "Ankara Çevresi", 43, 42, 12, 11, "region"),
      f("samsun-pop", "Samsun Çevresi", 58, 21, 11, 8, "region"),
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
      f("tea", "Çay · Rize", 79, 21, 7, 6, "region"),
      f("hazelnut", "Fındık · Ordu-Giresun", 66, 21, 10, 6, "region"),
      f("olive", "Zeytin · Kıyı Ege", 17, 50, 8, 19, "region"),
      f("cotton", "Pamuk · Şanlıurfa", 75, 68, 10, 8, "region"),
      f("banana", "Muz · Anamur-Alanya", 40, 74, 13, 6, "region"),
      f("apricot", "Kayısı · Malatya", 68, 51, 7, 6, "region"),
      f("grape", "Üzüm · Manisa", 20, 52, 7, 6, "region"),
      f("sunflower", "Ayçiçeği · Trakya", 9, 26, 11, 10, "region"),
      f("sugarbeet", "Şeker Pancarı · İç Anadolu", 49, 49, 20, 14, "region"),
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
      f("cattle", "Büyükbaş · Erzurum-Kars", 83, 32, 19, 13, "region"),
      f("sheep", "Koyun · İç Anadolu", 51, 49, 35, 22, "region"),
      f("goat", "Kıl Keçisi · Toroslar", 46, 70, 42, 9, "region"),
      f("silkworm", "İpek Böcekçiliği · Bursa", 22, 34, 8, 7, "region"),
      f("beekeeping", "Arıcılık · Ordu", 65, 23, 10, 7, "region"),
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

const MAP_BOUNDS = { west: 25.55, east: 44.85, north: 42.15, south: 35.75 };
const MAP_COLORS = ["#ead9a2", "#c4d89b", "#e9bd7b", "#c7d8ca", "#d4c1dc", "#f1cf9f", "#b8d6c7"];

const REAL_LINES: Record<string, Coordinate[]> = {
  yildiz: [[26.7, 41.6], [27.5, 41.7], [28.7, 41.6]],
  kure: [[32.0, 41.4], [33.1, 41.5], [34.3, 41.3]],
  canik: [[35.3, 41.1], [36.6, 40.9], [38.0, 40.8]],
  kackar: [[39.2, 40.9], [40.4, 40.8], [41.7, 40.8]],
  "bolu-d": [[30.5, 40.7], [31.4, 40.7], [32.2, 40.8]],
  bey: [[29.4, 36.8], [30.3, 36.9], [31.1, 37.0]],
  bolkar: [[32.8, 37.0], [33.8, 37.1], [34.8, 37.2]],
  aladag: [[34.7, 37.8], [35.4, 37.9], [36.0, 38.1]],
  munzur: [[38.5, 39.6], [39.4, 39.7], [40.4, 39.6]],
  hakkari: [[43.0, 37.5], [43.8, 37.6], [44.6, 37.4]],
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

function realLineFor(feature: Feature) {
  const canonicalId = feature.id.replace(/-(f|t|vs)$/, "");
  return REAL_LINES[feature.id] ?? REAL_LINES[canonicalId];
}

function featureCenter(feature: Feature): Coordinate {
  const realLine = realLineFor(feature);
  if (realLine) {
    const projected = realLine.map(project);
    const xs = projected.map(([x]) => x);
    const ys = projected.map(([, y]) => y);
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  }
  return [50 + feature.x * 9, 20 + feature.y * 3.75];
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

function featureGraphic(feature: Feature) {
  const realLine = realLineFor(feature);
  const [cx, cy] = featureCenter(feature);
  const width = Math.max(feature.w * 7.2, 20);
  const height = Math.max(feature.h * 3.1, 12);

  if (realLine) {
    const points = realLine.map(project);
    const path = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    return (
      <path
        d={path}
        className={`geo-shape ${feature.kind === "mountain" ? "geo-shape--mountain" : "geo-shape--line"}`}
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
  const [hoveredProvince, setHoveredProvince] = useState("");

  useEffect(() => {
    fetch("/data/turkey-provinces.geojson")
      .then((response) => response.json())
      .then((data) => setProvinces(data.features as ProvinceFeature[]))
      .catch(() => setProvinces([]));
  }, []);

  return (
    <div className="real-map-wrap">
      <svg className="real-map" viewBox="0 0 1000 430" role="img" aria-label={`81 il sınırları üzerinde ${quiz.title}`}>
        <g className="province-layer">
          {provinces.map((province) => (
            <path
              key={province.properties.plate}
              d={provincePath(province)}
              fill={MAP_COLORS[province.properties.plate % MAP_COLORS.length]}
              onPointerEnter={() => setHoveredProvince(province.properties.name)}
              onPointerLeave={() => setHoveredProvince("")}
            >
              <title>{province.properties.name}</title>
            </path>
          ))}
        </g>
        <g className="feature-layer">
          {quiz.features.map((feature) => {
            const status = correctIds.includes(feature.id)
              ? "correct"
              : wrongIds.includes(feature.id)
                ? "wrong"
                : "idle";
            const [cx, cy] = featureCenter(feature);
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
                {featureGraphic(feature)}
                {status === "correct" && (
                  <g className="geo-label" transform={`translate(${cx} ${cy - 18})`}>
                    <rect x="-62" y="-19" width="124" height="22" rx="5" />
                    <text textAnchor="middle" y="-4">{feature.name}</text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="map-province-readout">
        <span>81 İL SINIRI</span>
        <strong>{hoveredProvince || "İlin üzerine gel"}</strong>
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
            <span>✓ MEB kaynaklarıyla denetlendi</span>
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
          Konu kapsamı ve sınıflandırmalar MEB coğrafya programı ile ders
          materyallerine; güncel koruma alanları ilgili kamu kurumlarına göre
          denetlendi. Konumlar sınav haritasında seçilebilir kalacak biçimde
          şematikleştirildi.
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
