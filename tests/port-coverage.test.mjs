import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

const expectedByQuiz = {
  ports: [
    "haydarpasa-port", "istanbul-port", "derince-port", "bandirma-port",
    "ambarli-port", "gemlik-port", "karasu-port", "eregli-port",
    "zonguldak-port", "sinop-port", "samsun-port", "trabzon-port",
    "izmir-port", "kusadasi-port", "bodrum-port", "marmaris-port",
    "fethiye-port", "antalya-port", "alanya-port", "mersin-port",
    "iskenderun-port",
  ],
  "marmara-ports": [
    "haydarpasa-port", "istanbul-port", "derince-port",
    "bandirma-port", "ambarli-port", "gemlik-port",
  ],
  "black-sea-ports": [
    "karasu-port", "eregli-port", "zonguldak-port",
    "sinop-port", "samsun-port", "trabzon-port",
  ],
  "aegean-ports": [
    "izmir-port", "kusadasi-port", "bodrum-port",
    "marmaris-port", "fethiye-port",
  ],
  "mediterranean-ports": [
    "antalya-port", "alanya-port", "mersin-port", "iskenderun-port",
  ],
};

function quizBlock(id) {
  const marker = `id: "${id}"`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${id} quiz should exist`);
  const next = source.indexOf("\n  {\n    id:", start + marker.length);
  return source.slice(start, next === -1 ? source.length : next);
}

for (const [quizId, expectedIds] of Object.entries(expectedByQuiz)) {
  test(`${quizId} matches the current MEB regional port scope`, () => {
    const block = quizBlock(quizId);
    const actualIds = [...block.matchAll(/f\("([^"]+-port)"/g)].map((match) => match[1]);
    assert.deepEqual(actualIds, expectedIds);
  });
}

test("port source points to the current official MEB logistics geography book", () => {
  assert.match(
    source,
    /MEB güncel Türkiye lojistik coğrafyası · 21 liman[\s\S]*cografya\/files\/basic-html\/page6\.html/,
  );
});

test("all 21 MEB ports have explicit geographic coordinates", () => {
  for (const id of expectedByQuiz.ports) {
    assert.match(
      source,
      new RegExp(`"${id}": \\[-?\\d+(?:\\.\\d+)?, -?\\d+(?:\\.\\d+)?\\]`),
      `${id} should have an explicit coordinate`,
    );
  }
});

test("adjacent Istanbul ports use separate clickable callouts tied to their exact anchors", () => {
  assert.match(source, /const PORT_CALLOUT_OFFSETS[\s\S]*"istanbul-port": \[-30, -28\]/);
  assert.match(source, /const PORT_CALLOUT_OFFSETS[\s\S]*"haydarpasa-port": \[30, -30\]/);
  assert.match(source, /feature\.kind === "port"[\s\S]*PORT_CALLOUT_OFFSETS\[feature\.id\]/);
  assert.match(source, /className="port-callout-leader"/);
  assert.match(source, /className="port-callout-anchor"/);
});
