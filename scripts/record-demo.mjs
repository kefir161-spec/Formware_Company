/**
 * Record short looping UI demos for portfolio case studies.
 * Usage: node scripts/record-demo.mjs <stroy|cubik>
 */
import { chromium } from "playwright";
import { mkdirSync, rmSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "work");
const tmpDir = path.join(__dirname, "..", ".tmp-record");
mkdirSync(outDir, { recursive: true });
rmSync(tmpDir, { recursive: true, force: true });
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

  const addBtn = page.getByRole("button", { name: /Добавить запись/i });
  if (await addBtn.count()) {
    await addBtn.click();
    await settle(page, 1600);
    await page.keyboard.press("Escape");
    await settle(page, 700);
  }

  const performerRow = page
    .locator("text=Объём работ по исполнителям")
    .locator("xpath=ancestor::section[1]//button | ancestor::section[1]//tr")
    .first();
  if (await performerRow.count()) {
    await performerRow.click().catch(() => {});
    await settle(page, 1100);
  }

  await page.getByRole("link", { name: /Виды работ/i }).click();
  await page.waitForLoadState("networkidle");
  await settle(page, 1600);

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

async function openVoicePanel(page) {
  const voice = page.getByRole("button", { name: /Открыть голосовой агент|Голосовой агент/i });
  if (await voice.count()) {
    await voice.click();
    await settle(page, 1200);
    return true;
  }
  const fab = page.locator('button[aria-label*="голосовой" i], button[title*="Голосовой" i]').first();
  if (await fab.count()) {
    await fab.click();
    await settle(page, 1200);
    return true;
  }
  return false;
}

async function recordCubik() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: tmpDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  // 1) Login — short beat only
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await settle(page, 500);
  await page.locator('input[type="email"]').fill("admin@cubik.one");
  await page.locator('input[type="password"]').fill("admin123");
  await page.getByRole("button", { name: /Войти/i }).click();
  await page.waitForURL(/dashboard/, { timeout: 25000 });
  await settle(page, 1100);

  // 2) Главная
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "networkidle" });
  await settle(page, 1400);

  // 3) Компании
  await page.goto("http://localhost:3000/dashboard/companies", { waitUntil: "networkidle" });
  await settle(page, 1300);

  // 4) Контакты
  await page.goto("http://localhost:3000/dashboard/contacts", { waitUntil: "networkidle" });
  await settle(page, 1300);

  // 5) Провалиться в карточку контакта
  const contactLink = page.locator('a[href^="/dashboard/contacts/"]').first();
  await contactLink.waitFor({ timeout: 10000 });
  await contactLink.click();
  await page.waitForURL(/\/dashboard\/contacts\/.+/, { timeout: 15000 });
  await settle(page, 1600);

  // 6) Добавить контакт — форма на списке
  await page.goto("http://localhost:3000/dashboard/contacts", { waitUntil: "networkidle" });
  await settle(page, 800);
  await page.getByRole("button", { name: /^\+ Добавить$/i }).click();
  await settle(page, 700);
  const stamp = Date.now().toString().slice(-5);
  await page.getByPlaceholder("Имя").fill(`Demo Contact ${stamp}`);
  await page.locator('input[type="email"]').first().fill(`demo${stamp}@example.com`);
  await settle(page, 900);
  await page.getByRole("button", { name: /^Создать$/i }).click();
  await settle(page, 1400);

  // 7) AI-ассистент включить
  await openVoicePanel(page);
  await settle(page, 1600);

  // Type a command so the panel feels alive
  const cmd = page.getByPlaceholder(/Введите команду|команд/i);
  if (await cmd.count()) {
    await cmd.fill("Покажи расходы за этот месяц");
    await settle(page, 1000);
  }

  // 8) В расходы зайти (панель можно закрыть)
  const closeVoice = page.getByRole("button", { name: /Закрыть/i });
  if (await closeVoice.count()) {
    await closeVoice.click();
    await settle(page, 500);
  }
  await page.goto("http://localhost:3000/dashboard/expenses", { waitUntil: "networkidle" });
  await settle(page, 1600);
  await page.mouse.wheel(0, 240);
  await settle(page, 900);

  // Strong poster: expenses with voice open again
  await openVoicePanel(page);
  await settle(page, 1200);
  await page.screenshot({
    path: path.join(outDir, "cubik-core.png"),
    type: "png",
  });
  await settle(page, 900);

  const videoPath = await page.video().path();
  await context.close();
  await browser.close();
  return videoPath;
}

const raw = target === "cubik" ? await recordCubik() : await recordStroy();
console.log(JSON.stringify({ target, raw }));
