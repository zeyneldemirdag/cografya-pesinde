import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const nextConfig = fs.readFileSync(
  new URL("../next.config.ts", import.meta.url),
  "utf8",
);
const viteConfig = fs.readFileSync(
  new URL("../vite.config.ts", import.meta.url),
  "utf8",
);
const page = fs.readFileSync(
  new URL("../app/page.tsx", import.meta.url),
  "utf8",
);
const workflow = fs.readFileSync(
  new URL("../.github/workflows/deploy-pages.yml", import.meta.url),
  "utf8",
);

test("GitHub Pages derlemesi statik çıktı ve depo alt yolu kullanır", () => {
  assert.match(nextConfig, /output: isGitHubPages \? "export"/);
  assert.match(viteConfig, /base: isGitHubPages \? "\/cografya-pesinde\/"/);
  assert.match(page, /const publicAsset = \(path: string\)/);
  assert.match(page, /export const dynamic = "force-static"/);
});

test("Pages iş akışı bütün oyun verilerini içeren istemci paketini yayınlar", () => {
  assert.match(workflow, /GITHUB_PAGES: "true"/);
  assert.match(workflow, /NEXT_PUBLIC_BASE_PATH: \/cografya-pesinde/);
  assert.match(workflow, /enablement: true/);
  assert.match(workflow, /path: \.\/dist\/client/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});
