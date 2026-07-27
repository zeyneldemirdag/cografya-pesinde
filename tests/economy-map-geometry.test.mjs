import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(root, "app", "page.tsx"), "utf8");

function quizBlock(id) {
  const start = page.indexOf(`id: "${id}"`);
  assert.notEqual(start, -1, `${id} quiz must exist`);
  const next = page.indexOf("\n  {", start + 1);
  return page.slice(start, next === -1 ? undefined : next);
}

function plateList(block, id) {
  const match = block.match(
    new RegExp(`fp\\("${id}",[\\s\\S]*?\\[([^\\]]+)\\]\\)`),
  );
  assert.ok(match, `${id} province union is missing`);
  return match[1].match(/\d+/g).map(Number);
}

function realLine(id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = page.match(
    new RegExp(`"${escaped}":\\s*(\\[\\[[^;]+?\\]\\])(?:,|\\n)`),
  );
  assert.ok(match, `${id} REAL_LINES geometry is missing`);
  return JSON.parse(match[1]);
}

test("four current regional-development projects use exact official province scopes", () => {
  const block = quizBlock("development");
  const expected = {
    gap: [2, 21, 27, 47, 56, 63, 72, 73, 79],
    dap: [4, 12, 13, 23, 24, 25, 30, 36, 44, 49, 58, 62, 65, 75, 76],
    dokap: [5, 8, 19, 28, 29, 52, 53, 55, 60, 61, 69],
    kop: [40, 42, 50, 51, 66, 68, 70, 71],
  };

  for (const [id, plates] of Object.entries(expected)) {
    assert.deepEqual(plateList(block, id), plates, `${id} official province scope changed`);
  }
  assert.match(block, /GAP · 9 il/);
  assert.match(block, /DAP · 15 il/);
  assert.match(block, /DOKAP · 11 il/);
  assert.match(block, /KOP · 8 il/);
});

test("all eight ETKB/BOTAŞ international pipelines have distinct route geometry", () => {
  const ids = [
    "pipeline-west-line",
    "pipeline-blue-stream",
    "pipeline-iran-turkey",
    "pipeline-bte",
    "pipeline-tanap",
    "pipeline-turkstream",
    "pipeline-btc",
    "pipeline-iraq-turkey",
  ];
  const signatures = [];

  for (const id of ids) {
    const line = realLine(id);
    assert.ok(line.length >= 4, `${id} needs at least four route anchors`);
    for (const [longitude, latitude] of line) {
      assert.ok(longitude >= 25.5 && longitude <= 45, `${id} leaves Turkey east/west`);
      assert.ok(latitude >= 35.5 && latitude <= 42.3, `${id} leaves Turkey north/south`);
    }
    signatures.push(JSON.stringify(line));
  }
  assert.equal(new Set(signatures).size, ids.length);
});

test("pipeline endpoints preserve their named border/coast and terminal locations", () => {
  const endpointChecks = {
    "pipeline-west-line": [[27.38, 41.84], [32.85, 39.93]],
    "pipeline-blue-stream": [[36.33, 41.29], [32.85, 39.93]],
    "pipeline-iran-turkey": [[44.06, 39.55], [32.85, 39.93]],
    "pipeline-bte": [[42.58, 41.16], [41.27, 39.9]],
    "pipeline-tanap": [[42.75, 41.47], [26.34, 40.94]],
    "pipeline-turkstream": [[28.1, 41.64], [27.38, 41.84]],
    "pipeline-btc": [[42.58, 41.16], [35.82, 37.03]],
    "pipeline-iraq-turkey": [[42.34, 37.15], [35.82, 37.03]],
  };

  for (const [id, [start, end]] of Object.entries(endpointChecks)) {
    const line = realLine(id);
    assert.deepEqual(line[0], start, `${id} entrance endpoint changed`);
    assert.deepEqual(line.at(-1), end, `${id} terminal endpoint changed`);
  }
});

test("economy maps cite their direct official authorities", () => {
  assert.match(
    page,
    /"natural-gas-pipelines":\s*\{[\s\S]{0,400}?https:\/\/www\.enerji\.gov\.tr\/bilgi-merkezi-dogal-gaz-boru-hatlari/,
  );
  assert.match(
    page,
    /"oil-pipelines":\s*\{[\s\S]{0,400}?https:\/\/www\.enerji\.gov\.tr\/bilgi-merkezi-haritalar/,
  );
  assert.match(
    page,
    /development:\s*\{[\s\S]{0,400}?https:\/\/www\.sanayi\.gov\.tr\/bolgesel-kalkinma-faaliyetleri/,
  );
});
