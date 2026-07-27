import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const page = fs.readFileSync(path.join(root, "app", "page.tsx"), "utf8");

const industryBlock = page.match(
  /const INDUSTRY_CENTRES: Feature\[\] = \[([\s\S]*?)\n\];/,
)?.[1];
const coordinateBlock = page.match(
  /const POINT_COORDINATES: Record<string, Coordinate> = \{([\s\S]*?)\n\};/,
)?.[1];

assert.ok(industryBlock, "INDUSTRY_CENTRES block must exist");
assert.ok(coordinateBlock, "POINT_COORDINATES block must exist");

const industryIds = [...industryBlock.matchAll(/f\("([^"]+)"/g)].map(
  (match) => match[1],
);

function coordinateFor(id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = coordinateBlock.match(
    new RegExp(
      `(?:"${escaped}"|${escaped})\\s*:\\s*\\[(-?\\d+(?:\\.\\d+)?),\\s*(-?\\d+(?:\\.\\d+)?)\\]`,
    ),
  );
  return match ? [Number(match[1]), Number(match[2])] : undefined;
}

function subsetIds(constName) {
  const block = page.match(
    new RegExp(
      `const ${constName} = industrySubset\\(\\[([\\s\\S]*?)\\n\\]\\);`,
    ),
  )?.[1];
  assert.ok(block, `${constName} block must exist`);
  return [...block.matchAll(/"([^"]+-industry)"/g)].map((match) => match[1]);
}

test("all 62 MEB industry centres are unique and have real Turkey coordinates", () => {
  assert.equal(industryIds.length, 62);
  assert.equal(new Set(industryIds).size, industryIds.length);

  for (const id of industryIds) {
    const coordinate = coordinateFor(id);
    assert.ok(coordinate, `${id} is missing its map coordinate`);
    const [longitude, latitude] = coordinate;
    assert.ok(
      longitude >= 25.5 && longitude <= 45,
      `${id} longitude is outside Turkey: ${longitude}`,
    );
    assert.ok(
      latitude >= 35.5 && latitude <= 42.3,
      `${id} latitude is outside Turkey: ${latitude}`,
    );
  }
});

test("MEB industry subgames contain only centres from the complete industry set", () => {
  const expectedSizes = new Map([
    ["INDUSTRY_FOOD_FEATURES", 15],
    ["INDUSTRY_TEXTILE_FEATURES", 16],
    ["INDUSTRY_CHEMICAL_FEATURES", 35],
    ["INDUSTRY_MACHINE_FEATURES", 25],
  ]);
  const allIds = new Set(industryIds);

  for (const [constName, expectedSize] of expectedSizes) {
    const ids = subsetIds(constName);
    assert.equal(ids.length, expectedSize, `${constName} centre count changed`);
    assert.equal(new Set(ids).size, ids.length, `${constName} contains duplicates`);
    for (const id of ids) {
      assert.ok(allIds.has(id), `${constName} contains unknown centre ${id}`);
    }
  }
});

test("district-level industry centres retain distinct, high-precision coordinates", () => {
  const exactDistrictIds = [
    "hereke-industry",
    "aliaga-industry",
    "can-industry",
    "bozuyuk-industry",
    "sogut-industry",
    "golcuk-industry",
    "tuzla-industry",
    "pendik-industry",
    "halic-industry",
    "maden-industry",
    "kirka-industry",
    "eregli-industry",
    "seydisehir-industry",
  ];

  const exactCoordinates = exactDistrictIds.map((id) => {
    const coordinate = coordinateFor(id);
    assert.ok(coordinate, `${id} exact coordinate is missing`);
    assert.ok(
      coordinate.some((value) => String(value).split(".")[1]?.length >= 4),
      `${id} was reduced to a coarse city-centre coordinate`,
    );
    return coordinate.join(",");
  });
  assert.equal(new Set(exactCoordinates).size, exactCoordinates.length);
});

test("industry quiz sources point to the matching official MEB pages", () => {
  for (const [quizId, pageNumber] of [
    ["industry", 37],
    ["food-industry", 37],
    ["textile-industry", 38],
    ["chemical-industry", 38],
    ["machine-industry", 39],
  ]) {
    const sourceBlock = page.match(
      new RegExp(`"${quizId}"|${quizId}`),
    );
    assert.ok(sourceBlock, `${quizId} quiz/source entry is missing`);
    assert.match(
      page,
      new RegExp(
        `(?:["']${quizId}["']|\\b${quizId}\\b):\\s*\\{[\\s\\S]{0,500}?page${pageNumber}\\.html`,
      ),
      `${quizId} must cite official MEB page ${pageNumber}`,
    );
  }
});
