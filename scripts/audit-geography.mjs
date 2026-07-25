import fs from "node:fs";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

function constantKeys(name) {
  const start = source.indexOf(`const ${name}`);
  if (start < 0) return new Set();
  const open = source.indexOf("{", start);
  let depth = 0;
  let end = open;
  for (; end < source.length; end += 1) {
    if (source[end] === "{") depth += 1;
    if (source[end] === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const body = source.slice(open + 1, end);
  return new Set(
    [...body.matchAll(/^\s*(?:"([^"]+)"|([a-zA-Z][\w-]*))\s*:/gm)]
      .map((match) => match[1] ?? match[2]),
  );
}

const pointKeys = constantKeys("POINT_COORDINATES");
const functionCityKeys = constantKeys("FUNCTION_CITY_COORDINATES");
const areaKeys = constantKeys("AREA_POLYGONS");
const distributionKeys = constantKeys("DISTRIBUTION_POLYGONS");
const lineKeys = constantKeys("REAL_LINES");

const callPattern = /\bf\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*"([^"]+)"/g;
const features = [...source.matchAll(callPattern)].map((match) => ({
  id: match[1],
  name: match[2],
  x: Number(match[3]),
  y: Number(match[4]),
  kind: match[7],
}));

const lakeData = [
  "../public/data/turkey-lakes.geojson",
  "../public/data/turkey-lakes-extra.geojson",
  "../public/data/turkey-lakes-karstic-extra.geojson",
  "../public/data/turkey-lakes-eastern-extra.geojson",
].flatMap((path) =>
  JSON.parse(fs.readFileSync(new URL(path, import.meta.url), "utf8")).features
);
const riverData = [
  "../public/data/turkey-rivers.geojson",
  "../public/data/turkey-rivers-extra.geojson",
].flatMap((path) =>
  JSON.parse(fs.readFileSync(new URL(path, import.meta.url), "utf8")).features
);
const lakeIds = new Set(lakeData.map((feature) => feature.properties.id));
const riverIds = new Set(riverData.map((feature) => feature.properties.id));

const canonical = (id) => id.replace(/-(f|t|vs|n|s|gl|d|br)$/, "");
const lakeCanonical = (id) => ({
  "van-vs": "van",
  "iznik-t": "iznik",
  "manyas-t": "manyas",
  "tuz-t": "tuz",
  ercis: "ercek",
  "burdur-r": "burdur",
  "uluabat-r": "uluabat",
  ulubat: "uluabat",
  "kiziloren-l": "kizoren",
  "haçli": "hacli",
  kus: "manyas",
}[id] ?? id).replace(/-(t|vl|l)$/, "");
const riverCanonical = (id) => ({
  "meric-br": "meric",
  "aras-br": "aras",
  "asi-br": "asi",
}[id] ?? id);

const classifications = features.map((feature) => {
  let geometry = "fallback";
  if (lakeIds.has(lakeCanonical(feature.id))) geometry = "exact-lake";
  else if (pointKeys.has(feature.id)) geometry = "verified-point";
  else {
    const functionCityMatch = feature.id.match(
      /^(?:function-city|farm-city|industrial-city|mining-city|port-city|transport-trade-city|culture-admin-city|tourism-city)-(.+)$/,
    );
    if (functionCityMatch && functionCityKeys.has(functionCityMatch[1])) geometry = "verified-point";
  }
  if (geometry === "fallback" && areaKeys.has(feature.id) && ["plain", "plateau", "region", "lake"].includes(feature.kind)) geometry = "area-polygon";
  else if (geometry === "fallback" && distributionKeys.has(feature.id)) geometry = "distribution-polygon";
  else if (geometry === "fallback" && (lineKeys.has(feature.id) || lineKeys.has(canonical(feature.id)))) geometry = "coordinate-line";
  else if (geometry === "fallback" && feature.kind === "river" && riverIds.has(riverCanonical(feature.id))) geometry = "exact-river";
  return { ...feature, geometry };
});

const unique = new Map();
for (const feature of classifications) {
  const key = `${feature.id}|${feature.name}|${feature.kind}`;
  if (!unique.has(key)) unique.set(key, feature);
}

const byGeometry = Object.groupBy([...unique.values()], (feature) => feature.geometry);
const conflicts = Object.entries(Object.groupBy([...unique.values()], (feature) => feature.id))
  .filter(([, entries]) => new Set(entries.map((entry) => `${entry.name}|${entry.kind}`)).size > 1)
  .map(([id, entries]) => ({ id, variants: entries.map((entry) => `${entry.name} (${entry.kind})`) }));

function featureNamesInArray(marker, offset = 0) {
  const start = source.indexOf(marker, offset);
  if (start < 0) return [];
  const featuresStart = source.indexOf("features: [", start);
  const arrayStart = featuresStart >= 0 && marker.includes("id:")
    ? featuresStart
    : source.indexOf("=", start);
  const open = source.indexOf("[", arrayStart);
  let depth = 0;
  let end = open;
  for (; end < source.length; end += 1) {
    if (source[end] === "[") depth += 1;
    if (source[end] === "]") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const body = source.slice(open + 1, end);
  const direct = [...body.matchAll(/\b(?:f|fp)\(\s*"[^"]+"\s*,\s*"([^"]+)"/g)]
    .map((match) => match[1].split(" · ")[0]);
  const spread = [...body.matchAll(/\.\.\.([A-Z][A-Z0-9_]+)/g)]
    .flatMap((match) => featureNamesInArray(`const ${match[1]}`));
  const referenced = [...body.matchAll(/"([^"]+-industry)"/g)]
    .map((match) => features.find((feature) => feature.id === match[1])?.name)
    .filter(Boolean)
    .map((name) => name.split(" · ")[0]);
  return [...direct, ...spread, ...referenced];
}

function quizFeatureNames(id) {
  return featureNamesInArray(`    id: "${id}",`);
}

const coverageComparisons = [
  ["mountains-all", ["fold-mountains", "fault-mountains", "volcanic-mountains", "north-fold-mountains", "south-fold-mountains", "glacial-mountains"]],
  ["lakes-all", ["tectonic-lakes", "volcanic-set-lakes", "karstic-lakes", "volcanic-lakes"]],
  ["rivers", ["black-sea-rivers", "aegean-rivers", "mediterranean-rivers", "outbound-rivers", "inbound-rivers", "border-rivers"]],
  ["plains", ["delta-plains"]],
  ["tourism", ["natural-tourism", "cultural-tourism"]],
  ["industry", ["food-industry", "textile-industry", "chemical-industry", "machine-industry"]],
  ["ports", ["marmara-ports", "black-sea-ports", "aegean-ports", "mediterranean-ports"]],
  ["bridges-tunnels", ["bridges", "tunnels"]],
  ["soils", ["zonal-soils", "intrazonal-soils", "azonal-soils"]],
  ["vegetation", ["forest-vegetation", "shrub-vegetation", "grass-vegetation"]],
  ["population", ["dense-population", "sparse-population"]],
  ["agriculture", ["grain-legume-crops", "industrial-oil-crops", "fruit-special-crops"]],
  ["livestock", ["small-ruminant-livestock", "cattle-poultry-livestock", "other-livestock"]],
  ["energy", ["wind-energy", "thermal-energy", "other-energy"]],
].map(([general, subtopics]) => {
  const generalNames = new Set(quizFeatureNames(general));
  const subtopicNames = [...new Set(subtopics.flatMap(quizFeatureNames))];
  return {
    general,
    subtopics,
    missingFromGeneral: subtopicNames.filter((name) => !generalNames.has(name)),
  };
});

const officialExpectations = {
  regions: [
    "Marmara Bölgesi", "Ege Bölgesi", "Akdeniz Bölgesi",
    "Karadeniz Bölgesi", "İç Anadolu Bölgesi",
    "Doğu Anadolu Bölgesi", "Güneydoğu Anadolu Bölgesi",
  ],
  "dense-population": [
    "Çatalca-Kocaeli Yarımadası", "Kıyı Ege", "Antalya Yöresi",
    "Ankara-Eskişehir Yöresi", "Çukurova-Gaziantep Yöresi",
    "Orta ve Doğu Karadeniz Kıyıları",
  ],
  "sparse-population": [
    "Yıldız Dağları", "Çanakkale Çevresi", "Sinop Çevresi",
    "Menteşe Yöresi", "Teke Yöresi", "Taşeli Yöresi",
    "Tuz Gölü Çevresi", "Erzurum-Kars Yöresi", "Hakkâri Yöresi",
  ],
  "forest-vegetation": [
    "Kuzey Anadolu Ormanları", "Akdeniz Ormanları",
    "Batı Anadolu Ormanları", "İç Bölge Ormanları",
  ],
  "shrub-vegetation": [
    "Maki", "Garig (Frigana)", "Psödomaki",
  ],
  "grass-vegetation": [
    "Bozkır", "Antropojen Bozkır", "Çayır", "Alpin Çayır",
  ],
  "zonal-soils": [
    "Terra Rossa", "Kahverengi Orman Toprağı", "Podzol", "Çernezyom",
    "Kestane Renkli Bozkır Toprağı", "Kahverengi Bozkır Toprağı",
  ],
  "intrazonal-soils": [
    "Hidromorfik Toprak", "Halomorfik Toprak",
    "Rendzina", "Vertisol",
  ],
  "azonal-soils": [
    "Alüvyal Toprak", "Kolüvyal Toprak", "Litosol",
    "Regosol", "Lös", "Moren",
  ],
  climate: [
    "Akdeniz İklimi", "Karadeniz İklimi", "Karasal İklim", "Sert Karasal İklim",
  ],
  massifs: [
    "Yıldız Masifi", "Menderes Masifi", "Kırşehir Masifi",
    "Alanya-Anamur Masifi", "Bitlis Masifi", "Kazdağı Masifi",
  ],
  "agricultural-function-cities": [
    "Söke", "Osmaniye", "Akhisar", "Rize", "Bafra", "Malatya",
  ],
  "industrial-function-cities": [
    "İstanbul", "Kocaeli", "Bursa", "İskenderun", "Karadeniz Ereğli",
  ],
  "mining-function-cities": [
    "Soma", "Batman", "Zonguldak", "Elbistan", "Murgul",
  ],
  "port-function-cities": [
    "İskenderun", "İstanbul", "İzmir", "Mersin", "Kocaeli", "Samsun", "Trabzon", "Sinop",
  ],
  "transport-trade-function-cities": [
    "İzmir", "Kayseri", "Konya", "Erzurum", "İstanbul", "Ankara", "Gaziantep",
  ],
  "culture-admin-military-function-cities": [
    "Ankara", "Eskişehir", "İstanbul", "İzmir", "Gölcük", "Polatlı", "Malatya", "Erzincan",
  ],
  "tourism-function-cities": [
    "Antalya", "Marmaris", "Kuşadası", "Nevşehir", "İstanbul",
  ],
  "fold-mountains": [
    "Sündiken Dağları", "Elmadağ", "Munzur Dağları", "Mercan Dağları",
  ],
  "fault-mountains": [
    "Madra Dağları", "Yunt Dağları", "Bozdağlar", "Aydın Dağları", "Menteşe Dağları",
  ],
  "volcanic-mountains": [
    "Ağrı Dağı", "Süphan Dağı", "Tendürek Dağı", "Erciyes Dağı",
    "Nemrut Dağı", "Karacadağ (Güneydoğu)", "Kula Volkanları",
  ],
  "glacial-mountains": [
    "Ağrı Dağı", "Cilo-Sat Dağları", "Kaçkar Dağları", "Süphan Dağı",
    "Erciyes Dağı", "Aladağlar", "Bolkar Dağları",
  ],
  "border-rivers": [
    "Meriç", "Mutludere (Rezve)", "Arpaçay", "Aras", "Asi", "Hezil Çayı",
  ],
  "coast-types": [
    "Boyuna Kıyı", "Enine Kıyı", "Ria Kıyı", "Dalmaçya Kıyı",
    "Limanlı Kıyı", "Kalanklı Kıyı", "Tombolo",
  ],
  "tectonic-lakes": [
    "Manyas Gölü", "Uluabat Gölü", "İznik Gölü", "Sapanca Gölü",
    "Burdur Gölü", "Acıgöl", "Tuz Gölü", "Eber Gölü", "Akşehir Gölü",
    "Ilgın (Çavuşçu) Gölü", "Seyfe Gölü", "Hazar Gölü", "Aktaş Gölü",
  ],
  "volcanic-set-lakes": [
    "Çıldır Gölü", "Erçek Gölü", "Nazik Gölü", "Haçlı Gölü", "Balık Gölü",
  ],
  "karstic-lakes": [
    "Avlan Gölü", "Kestel Gölü", "Salda Gölü", "Kızören Obruğu",
    "Meyil Obruğu", "Çıralı Obruğu", "Hafik Gölü", "Tödürge Gölü",
  ],
  "volcanic-lakes": [
    "Nemrut Kaldera Gölü", "Meke Maarı", "Gölcük Krater Gölü",
    "Acıgöl (Karapınar)", "Nar Gölü", "Aygır (Süphan) Gölü",
  ],
  plateaus: [
    "Yazılıkaya Platosu", "Uşak-Eşme Platosu", "Gaziantep Platosu",
    "Şanlıurfa Platosu", "Erzurum-Kars Platosu", "Ardahan Platosu",
    "Teke Platosu", "Taşeli Platosu", "Haymana Platosu",
    "Cihanbeyli Platosu", "Obruk Platosu", "Uzunyayla Platosu",
    "Çatalca-Kocaeli Platosu", "Perşembe Platosu",
  ],
  plains: [
    "Çukurova", "Gediz Ovası", "Bursa Ovası", "Çarşamba Deltası",
    "Konya Ovası", "Iğdır Ovası", "Yüksekova", "Erzincan Ovası",
    "Muş Ovası", "Bafra Deltası", "Silifke Deltası", "Adapazarı Ovası",
    "Bolu Ovası", "Düzce Ovası", "Bergama Ovası", "Soma Ovası",
    "Akhisar Ovası", "Amik Ovası", "Kahramanmaraş Ovası",
    "Malatya Ovası", "Suruç Ovası", "Ceylanpınar Ovası",
  ],
  "outbound-rivers": ["Fırat", "Dicle", "Çoruh", "Kura", "Aras"],
  "inbound-rivers": ["Asi", "Meriç"],
  dams: [
    "Keban Barajı", "Karakaya Barajı", "Atatürk Barajı", "Birecik Barajı", "Karkamış Barajı",
    "Kralkızı Barajı", "Ilısu Barajı", "Batman Barajı", "Dicle Barajı", "Devegeçidi Barajı",
    "Arpaçay Barajı", "Seyhan Barajı", "Çatalan Barajı", "Sır Barajı", "Aslantaş Barajı",
    "Menzelet Barajı", "Kartalkaya Barajı", "Oymapınar Barajı", "Demirköprü Barajı",
    "Kemer Barajı", "Adıgüzel Barajı", "Porsuk Barajı", "Bayındır Barajı",
    "Sarıyar (Hasan Polatkan) Barajı", "Gökçekaya Barajı", "Kurtboğazı Barajı",
    "Hirfanlı Barajı", "Derbent Barajı", "Kesikköprü Barajı", "Altınkaya Barajı",
    "Kapulukaya Barajı", "Çubuk 1 Barajı", "Çubuk 2 Barajı", "Almus Barajı",
    "Hasan Uğurlu Barajı", "Suat Uğurlu Barajı", "Kılıçkaya Barajı",
    "Muratlı Barajı", "Borçka Barajı", "Deriner Barajı",
  ],
  "natural-tourism": [
    "Uludağ", "Kartalkaya", "Erciyes", "Palandöken", "Kaçkar", "Beydağları",
    "Nemrut Dağı ve Kalderası", "Ağrı Dağı", "Anzer Yaylası", "Ayder Yaylası",
    "Kadırga Yaylası", "Perşembe Yaylası", "Saklıkent ve Beydağı", "Çamlıyayla",
    "Horzum Yaylası", "Tekir Yaylası", "Karacabey Longozu", "İğneada Longozu",
    "İzmir Kuş Cenneti", "Manyas Kuş Cenneti", "Kızılırmak Deltası Kuş Cenneti",
    "Kapadokya Peribacaları", "Pamukkale Travertenleri", "Akçalı Travertenleri",
    "Karain Mağarası", "Damlataş Mağarası", "Dim Mağarası", "Beldibi Mağarası",
    "İnsuyu Mağarası", "Gilindire Mağarası", "Ballıca Mağarası", "Gölcük Kalderası",
    "Kula Volkanik Alanı", "Meke Gölü", "Acıgöl Maarı",
  ],
  "cultural-tourism": [
    "Ayasofya", "Sultan Ahmet Camii", "Topkapı Sarayı", "Dolmabahçe Sarayı",
    "Meryem Ana Evi", "Gök Medrese", "Selimiye Camii", "İshak Paşa Sarayı",
    "Göbeklitepe", "Çatalhöyük", "Alacahöyük", "Hattuşaş", "Arslantepe", "Efes",
    "Çanakkale Savaşları Gelibolu Tarihî Alanı", "Başkomutan Tarihî Millî Parkı",
    "İstiklal Yolu Tarihî Millî Parkı", "Malazgirt Meydan Muharebesi Tarihî Millî Parkı",
    "Sakarya Meydan Muharebesi Tarihî Millî Parkı",
  ],
  energy: [
    "İzmir-Çeşme", "Balıkesir-Bandırma", "Manisa-Akhisar", "Hatay-Belen",
    "Osmaniye-Bahçe", "İstanbul-Çatalca", "Çanakkale-Ezine", "Dinar",
    "Çatalağzı", "Soma", "Seyitömer", "Tunçbilek", "Yatağan",
    "Afşin-Elbistan", "Hamitabat", "Ambarlı", "Ovaakça",
    "Germencik", "Buharkent", "Akkuyu", "Sinop-İnceburun",
    "Atatürk Barajı", "Deriner", "Karapınar",
  ],
  "food-industry": [
    "Konya", "İzmir", "Erzurum", "Balıkesir", "Kars", "Çanakkale", "Trabzon",
    "Edirne", "Tekirdağ", "Edremit", "Ayvalık", "Gemlik", "Adana", "İstanbul", "Rize",
  ],
  "textile-industry": [
    "Adana", "İzmir", "Denizli", "Aydın", "Antalya", "Manisa", "Gaziantep",
    "İstanbul", "Bursa", "Kayseri", "Hereke", "Uşak", "Isparta", "Ankara",
    "Bolu", "Tekirdağ",
  ],
  "chemical-industry": [
    "Kastamonu", "Tekirdağ", "Bursa", "İzmir", "Ankara", "Düzce", "İstanbul",
    "Kayseri", "İzmit", "Çaycuma", "Dalaman", "Balıkesir", "Taşköprü", "Aliağa",
    "Kırıkkale", "Batman", "Bandırma", "İskenderun", "Ceyhan", "Mersin", "Kütahya",
    "Gemlik", "Samsun", "Gaziantep", "Adapazarı", "Kırşehir", "Kırklareli",
    "Eskişehir", "Afyonkarahisar", "Uşak", "Tokat", "Manisa", "Çan", "Bozüyük", "Söğüt",
  ],
  "machine-industry": [
    "Bursa", "İzmir", "İstanbul", "İzmit", "Adapazarı", "Ankara", "Tekirdağ",
    "Konya", "Gaziantep", "Manisa", "Eskişehir", "Sivas", "Gölcük", "Tuzla",
    "Pendik", "Haliç", "Antalya", "Bodrum", "Maden", "Kırka", "Karadeniz Ereğli",
    "Seydişehir", "Kırıkkale", "Çankırı", "İskenderun",
  ],
  gates: [
    "Pazarkule", "İpsala", "Kapıkule", "Hamzabeyli", "Dereköy",
    "Sarp", "Türkgözü", "Çıldır-Aktaş", "Dilucu", "Gürbulak",
    "Kapıköy", "Esendere", "Habur", "Üzümlü", "Cilvegözü",
    "Öncüpınar", "Karkamış", "Çobanbey", "Zeytindalı",
  ],
  passes: [
    "Bolu Dağı Geçidi", "Zigana Geçidi", "Gülek Geçidi", "Sertavul Geçidi",
    "Belen Geçidi", "Kop Geçidi", "Çubuk Beli Geçidi",
  ],
  bridges: [
    "15 Temmuz Şehitler Köprüsü", "Fatih Sultan Mehmet Köprüsü",
    "Yavuz Sultan Selim Köprüsü", "Osmangazi Köprüsü", "1915 Çanakkale Köprüsü",
  ],
  tunnels: [
    "Avrasya Tüneli", "Marmaray", "Bolu Dağı Tüneli", "Ovit Tüneli", "Yeni Zigana Tüneli",
  ],
  ramsar: [
    "Sultan Sazlığı", "Kuş Gölü", "Kızılırmak Deltası", "Göksu Deltası",
    "Kuyucuk Gölü", "Nemrut Kalderası", "Burdur Gölü", "Seyfe Gölü",
    "Uluabat Gölü", "Gediz Deltası", "Akyatan Lagünü",
    "Yumurtalık Lagünleri", "Meke Maarı", "Kızören Obruğu",
  ],
  mines: [
    "Zonguldak", "Divriği", "Murgul", "Çayeli", "Küre", "Maden",
    "Guleman", "Kop Dağı", "Fethiye-Köyceğiz", "Seydişehir",
    "Bigadiç", "Emet", "Kırka", "Mazıdağı", "Hekimhan",
    "Hasançelebi", "Tuz Gölü", "Çamaltı", "Seyitömer",
    "Afşin-Elbistan", "Soma", "Afyonkarahisar",
  ],
  "grain-legume-crops": [
    "Buğday", "Arpa", "Mısır", "Çeltik", "Nohut", "Fasulye", "Mercimek",
  ],
  "industrial-oil-crops": [
    "Tütün", "Şeker Pancarı", "Pamuk", "Ayçiçeği", "Yer Fıstığı", "Soya Fasulyesi",
  ],
  "fruit-special-crops": [
    "Zeytin", "Fındık", "Çay", "Üzüm", "Antep Fıstığı",
    "Turunçgiller", "Muz", "Kayısı", "İncir", "Elma",
  ],
  livestock: [
    "Koyun", "Kıl Keçisi", "Tiftik Keçisi", "Mera Sığırcılığı",
    "Ahır Sığırcılığı", "Kümes Hayvancılığı", "İpek Böcekçiliği",
    "Arıcılık", "Deniz Balıkçılığı", "Tatlı Su Balıkçılığı",
  ],
  "small-ruminant-livestock": [
    "Koyun", "Kıl Keçisi", "Tiftik Keçisi",
  ],
  "cattle-poultry-livestock": [
    "Mera Sığırcılığı", "Ahır Sığırcılığı", "Kümes Hayvancılığı",
  ],
  "other-livestock": [
    "İpek Böcekçiliği", "Arıcılık", "Deniz Balıkçılığı", "Tatlı Su Balıkçılığı",
  ],
  "wind-energy": [
    "İzmir-Çeşme", "Balıkesir-Bandırma", "Manisa-Akhisar", "Hatay-Belen",
    "Osmaniye-Bahçe", "İstanbul-Çatalca", "Çanakkale-Ezine", "Dinar",
  ],
  "thermal-energy": [
    "Çatalağzı", "Soma", "Seyitömer", "Tunçbilek", "Yatağan",
    "Afşin-Elbistan", "Hamitabat", "Ambarlı", "Ovaakça",
  ],
  "other-energy": [
    "Germencik", "Buharkent", "Akkuyu", "Sinop-İnceburun",
    "Atatürk Barajı", "Deriner", "Karapınar",
  ],
  ports: [
    "İstanbul Limanı", "Bandırma Limanı", "İzmit Limanı", "Karadeniz Ereğli Limanı",
    "Zonguldak Limanı", "Sinop Limanı", "Samsun Limanı", "Trabzon Limanı",
    "İzmir Limanı", "Kuşadası Limanı", "Bodrum Limanı", "Marmaris Limanı",
    "Fethiye Limanı", "Antalya Limanı", "Alanya Limanı", "Mersin Limanı",
    "İskenderun Limanı",
  ],
  "closed-basins": [
    "Van Gölü Kapalı Havzası", "Tuz Gölü Kapalı Havzası",
    "Göller Yöresi Kapalı Havzası", "Hazar Gölü Kapalı Havzası",
  ],
};

const sourceCoverage = Object.entries(officialExpectations).map(([quiz, expected]) => {
  const present = new Set(quizFeatureNames(quiz));
  return {
    quiz,
    expectedCount: expected.length,
    missing: expected.filter((name) => !present.has(name)),
  };
});

const sourceQuizKeys = constantKeys("SOURCE_BY_QUIZ");
const sourceOverrideRequired = [
  "glacial-mountains", "massifs", "straits", "gates", "passes", "mines",
  "energy", "wind-energy", "thermal-energy", "other-energy", "development",
  "industry", "population", "dense-population", "sparse-population", "regions",
  "climate", "vegetation", "soils", "tourism",
  "zonal-soils", "intrazonal-soils", "azonal-soils",
  "forest-vegetation", "shrub-vegetation", "grass-vegetation",
  "agriculture", "grain-legume-crops", "industrial-oil-crops", "fruit-special-crops",
  "livestock", "small-ruminant-livestock", "cattle-poultry-livestock", "other-livestock",
  "ports", "marmara-ports", "black-sea-ports",
  "aegean-ports", "mediterranean-ports", "gulfs", "coast-types", "bridges-tunnels",
  "bridges", "tunnels", "cities", "agricultural-function-cities",
  "industrial-function-cities", "mining-function-cities", "port-function-cities",
  "transport-trade-function-cities", "culture-admin-military-function-cities",
  "tourism-function-cities",
];
const missingSourceOverrides = sourceOverrideRequired.filter((id) => !sourceQuizKeys.has(id));

console.log(JSON.stringify({
  featureCalls: features.length,
  uniqueFeatures: unique.size,
  geometryCounts: Object.fromEntries(Object.entries(byGeometry).map(([key, value]) => [key, value.length])),
  fallback: (byGeometry.fallback ?? []).map(({ id, name, kind }) => ({ id, name, kind })),
  conflicts,
  coverageComparisons,
  sourceCoverage,
  nonExactLakeTargets: [...unique.values()]
    .filter((feature) => feature.kind === "lake" && feature.geometry !== "exact-lake")
    .map(({ id, name, geometry }) => ({ id, name, geometry })),
  missingSourceOverrides,
}, null, 2));
