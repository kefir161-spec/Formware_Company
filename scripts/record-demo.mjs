/**
 * Record short looping UI demos for portfolio case studies.
 * Usage: node scripts/record-demo.mjs <stroy|cubik>
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "work");
const tmpDir = path.join(__dirname, "..", ".tmp-record");
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

const target = process.argv[2] || "stroy";

async function settle(page, ms = 600) {
  await page.waitForTimeout(ms);
}

async function recordStroy() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: tmpDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:5180/", { waitUntil: "networkidle" });
  await settle(page, 1400);

  // Open add-entry modal, then close
  const addBtn = page.getByRole("button", { name: /Добавить запись/i });
  if (await addBtn.count()) {
    await addBtn.click();
    await settle(page, 1600);
    await page.keyboard.press("Escape");
    await settle(page, 700);
  }

  // Expand first performer summary row
  const performerRow = page.locator("text=Объём работ по исполнителям").locator("xpath=ancestor::section[1]//button | ancestor::section[1]//tr").first();
  if (await performerRow.count()) {
    await performerRow.click().catch(() => {});
    await settle(page, 1100);
  }

  // Work types catalogue
  await page.getByRole("link", { name: /Виды работ/i }).click();
  await page.waitForLoadState("networkidle");
  await settle(page, 1600);

  // Back to journal and scroll summary into view
  await page.getByRole("link", { name: /Журнал работ/i }).click();
  await page.waitForLoadState("networkidle");
  await settle(page, 1000);
  await page.mouse.wheel(0, 480);
  await settle(page, 1200);
  await page.mouse.wheel(0, -480);
  await settle(page, 900);

  await page.screenshot({
    path: path.join(outDir, "stroyzhurnal.png"),
    type: "png",
  });

  const videoPath = await page.video().path();
  await context.close();
  await browser.close();
  return videoPath;
}

async function recordCubik() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: tmpDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await settle(page, 900);

  await page.locator('input[type="email"]').fill("admin@cubik.one");
  await page.locator('input[type="password"]').fill("admin123");
  await page.getByRole("button", { name: /Войти/i }).click();
  await page.waitForURL(/dashboard/, { timeout: 25000 });
  await settle(page, 1600);

  const routes = [
    "/dashboard/companies",
    "/dashboard/expenses",
    "/dashboard/inventory",
    "/dashboard/documents",
    "/dashboard",
  ];

  for (const route of routes) {
    await page.goto(`http://localhost:3000${route}`, { waitUntil: "networkidle" });
    await settle(page, 1500);
  }

  await page.screenshot({
    path: path.join(outDir, "cubik-core.png"),
    type: "png",
  });

  const videoPath = await page.video().path();
  await context.close();
  await browser.close();
  return videoPath;
}

const raw = target === "cubik" ? await recordCubik() : await recordStroy();
console.log(JSON.stringify({ target, raw }));
