import fs from "node:fs";
import path from "node:path";

const [shpInput, dbfInput] = process.argv.slice(2);
if (!shpInput || !dbfInput) {
  throw new Error(
    "Kullanım: node scripts/build-active-faults.mjs <TDFH_2026.shp> <TDFH_2026.dbf>",
  );
}

const shp = fs.readFileSync(path.resolve(shpInput));
const dbf = fs.readFileSync(path.resolve(dbfInput));
const dbfDecoder = new TextDecoder("utf-8");
const WESTERN_SYSTEM_NAMES = new Set([
  "AFYON - AKŞEHİR GRABEN SİSTEMİ",
  "GEDİZ GRABENİ",
  "BÜYÜK MENDERES GRABENİ",
  "DENİZLİ GRABEN SİSTEMİ",
  "EDREMİT FAY ZONU",
  "EMET - GEDİZ FAY ZONU",
  "DİNAR FAYI",
  "ACIGÖL GRABENİ",
  "SİMAV FAY ZONU",
  "BURDUR GRABENİ",
  "ÇİVRİL - BAKLAN GRABENİ",
  "SOMA - KIRKAĞAÇ FAY ZONU",
  "GÖKOVA FAY ZONU",
  "KARAMIK GRABENİ",
  "GÜLBAHÇE FAY ZONU",
  "KUŞADASI FAY ZONU",
  "İZMİR FAYI",
  "MENEMEN FAY ZONU",
]);

function dbfRows(buffer) {
  const recordCount = buffer.readUInt32LE(4);
  const headerLength = buffer.readUInt16LE(8);
  const recordLength = buffer.readUInt16LE(10);
  const fields = [];

  for (let offset = 32; offset < headerLength - 1; offset += 32) {
    if (buffer[offset] === 0x0d) break;
    fields.push({
      name: buffer
        .subarray(offset, offset + 11)
        .toString("ascii")
        .replace(/\0.*$/, "")
        .trim(),
      length: buffer[offset + 16],
    });
  }

  return Array.from({ length: recordCount }, (_, index) => {
    let cursor = headerLength + index * recordLength + 1;
    return Object.fromEntries(fields.map((field) => {
      const value = dbfDecoder
        .decode(buffer.subarray(cursor, cursor + field.length))
        .trim();
      cursor += field.length;
      return [field.name, value];
    }));
  });
}

function shapeRecords(buffer) {
  const records = [];
  let offset = 100;

  while (offset + 8 <= buffer.length) {
    const contentLength = buffer.readInt32BE(offset + 4) * 2;
    const start = offset + 8;
    const end = start + contentLength;
    const shapeType = buffer.readInt32LE(start);

    if ((shapeType === 3 || shapeType === 13) && contentLength >= 44) {
      const partCount = buffer.readInt32LE(start + 36);
      const pointCount = buffer.readInt32LE(start + 40);
      const partsOffset = start + 44;
      const pointsOffset = partsOffset + partCount * 4;
      const partStarts = Array.from(
        { length: partCount },
        (_, index) => buffer.readInt32LE(partsOffset + index * 4),
      );
      const points = Array.from({ length: pointCount }, (_, index) => [
        buffer.readDoubleLE(pointsOffset + index * 16),
        buffer.readDoubleLE(pointsOffset + index * 16 + 8),
      ]);
      records.push(partStarts.map((partStart, index) =>
        points.slice(partStart, partStarts[index + 1] ?? pointCount),
      ));
    } else {
      records.push([]);
    }
    offset = end;
  }
  return records;
}

function perpendicularDistance(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  if (dx === 0 && dy === 0) return Math.hypot(point[0] - start[0], point[1] - start[1]);
  const t = Math.max(
    0,
    Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)),
  );
  return Math.hypot(point[0] - (start[0] + t * dx), point[1] - (start[1] + t * dy));
}

function simplify(line, tolerance = 0.004) {
  if (line.length <= 2) return line;
  let maxDistance = 0;
  let splitIndex = 0;
  for (let index = 1; index < line.length - 1; index += 1) {
    const distance = perpendicularDistance(line[index], line[0], line.at(-1));
    if (distance > maxDistance) {
      maxDistance = distance;
      splitIndex = index;
    }
  }
  if (maxDistance <= tolerance) return [line[0], line.at(-1)];
  return [
    ...simplify(line.slice(0, splitIndex + 1), tolerance).slice(0, -1),
    ...simplify(line.slice(splitIndex), tolerance),
  ];
}

function inWesternAnatolia([longitude, latitude]) {
  return longitude >= 25.7 && longitude <= 32.2 && latitude >= 35.7 && latitude <= 40.55;
}

const rows = dbfRows(dbf);
const records = shapeRecords(shp);
if (rows.length !== records.length) {
  throw new Error(`SHP/DBF kayıt sayısı uyuşmuyor: ${records.length}/${rows.length}`);
}

const targets = new Map([
  ["north-anatolian-fault", []],
  ["east-anatolian-fault", []],
  ["west-anatolian-faults", []],
]);

records.forEach((parts, index) => {
  const name = rows[index].FAYADI;
  let target;
  if (name === "KUZEY ANADOLU FAY ZONU") target = "north-anatolian-fault";
  else if (name === "DOĞU ANADOLU FAY ZONU") target = "east-anatolian-fault";
  else if (
    WESTERN_SYSTEM_NAMES.has(name) &&
    parts.some((line) => line.some(inWesternAnatolia))
  ) target = "west-anatolian-faults";
  if (!target) return;

  const selected = target === "west-anatolian-faults"
    ? parts
      .map((line) => line.filter(inWesternAnatolia))
      .filter((line) => line.length > 1)
    : parts;
  targets.get(target).push(
    ...selected
      .filter((line) => line.length > 1)
      .map((line) => simplify(line).map(([x, y]) => [
        Number(x.toFixed(5)),
        Number(y.toFixed(5)),
      ])),
  );
});

const names = {
  "north-anatolian-fault": "Kuzey Anadolu Fay Zonu",
  "east-anatolian-fault": "Doğu Anadolu Fay Zonu",
  "west-anatolian-faults": "Batı Anadolu Fay Sistemi",
};

const output = {
  type: "FeatureCollection",
  source: "MTA Türkiye Diri Fay Haritası 2026 (TDFH-2026)",
  sourceUrl: "https://tdfh.mta.gov.tr/",
  selectionNote:
    "KAF ve DAF, MTA FAYADI özniteliğiyle; Batı Anadolu sistemi, MEB'in öğretim kapsamındaki başlıca graben ve fay zonlarının MTA çizgileriyle oluşturuldu.",
  features: [...targets].map(([id, coordinates]) => ({
    type: "Feature",
    properties: { id, name: names[id] },
    geometry: { type: "MultiLineString", coordinates },
  })),
};

for (const feature of output.features) {
  if (feature.geometry.coordinates.length === 0) {
    throw new Error(`${feature.properties.name} için çizgi bulunamadı.`);
  }
}

const outputPath = new URL("../public/data/turkey-active-faults.geojson", import.meta.url);
fs.writeFileSync(outputPath, `${JSON.stringify(output)}\n`);
console.log(
  output.features.map((feature) => ({
    id: feature.properties.id,
    lineCount: feature.geometry.coordinates.length,
  })),
);
