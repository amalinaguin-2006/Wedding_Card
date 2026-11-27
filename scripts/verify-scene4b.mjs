import { chromium } from 'playwright-core';
import path from 'node:path';

const ART_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\8437f326-a723-444b-9a96-5dd6df7ec53a';
const URL = process.env.TEST_URL || 'http://localhost:5173/';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkViewport(browser, name, width, height, isMobile) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: isMobile ? 2 : 1,
    isMobile,
    hasTouch: isMobile,
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const loader = document.getElementById('loader');
    return !loader || getComputedStyle(loader).display === 'none' || getComputedStyle(loader).opacity === '0';
  }, null, { timeout: 6000 });

  const gTop = await page.evaluate(() => {
    const el = document.getElementById('group-4-9');
    el.scrollIntoView({ behavior: 'instant', block: 'start' });
    return window.scrollY;
  });
  const pinLen = height * 7.45;

  // Scene 4B hold (~0.22)
  await page.evaluate((y) => window.scrollTo(0, y), gTop + Math.round(pinLen * 0.22));
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(ART_DIR, `s4b-${name}.png`) });

  const check4b = await page.evaluate(() => {
    const s4 = getComputedStyle(document.getElementById('scene-4')).opacity;
    const s4b = getComputedStyle(document.getElementById('scene-4b')).opacity;
    const s5 = getComputedStyle(document.getElementById('scene-5')).opacity;
    const roleRect = document.querySelector('.s4b-role').getBoundingClientRect();
    const roleH = parseFloat(getComputedStyle(document.querySelector('.s4b-role')).lineHeight);
    return {
      s4Op: Number(s4),
      s4bOp: Number(s4b),
      s5Op: Number(s5),
      roleOneLine: roleRect.height <= roleH * 1.3,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  // Scene 5 hold (~0.33)
  await page.evaluate((y) => window.scrollTo(0, y), gTop + Math.round(pinLen * 0.33));
  await page.waitForTimeout(700);
  const s5Check = await page.evaluate(() => ({
    s4bOp: Number(getComputedStyle(document.getElementById('scene-4b')).opacity),
    s5Op: Number(getComputedStyle(document.getElementById('scene-5')).opacity),
  }));

  // Scene 9 hold (~0.92)
  await page.evaluate((y) => window.scrollTo(0, y), gTop + Math.round(pinLen * 0.92));
  await page.waitForTimeout(700);
  const s9Check = await page.evaluate(() => ({
    s9Active: document.getElementById('scene-9').classList.contains('is-active'),
    langVisible: document.getElementById('lang-toggle').classList.contains('is-visible'),
  }));

  // Reverse scroll back to Scene 4B
  await page.evaluate((y) => window.scrollTo(0, y), gTop + Math.round(pinLen * 0.22));
  await page.waitForTimeout(700);
  const rev4b = await page.evaluate(() => Number(getComputedStyle(document.getElementById('scene-4b')).opacity));

  console.log(`[${name}] 4B=${JSON.stringify(check4b)} 5=${JSON.stringify(s5Check)} 9=${JSON.stringify(s9Check)} rev4b=${rev4b}`);
  if (check4b.s4Op > 0.05 || check4b.s4bOp < 0.95 || check4b.s5Op > 0.05) {
    throw new Error(`Overlap in Scene 4B at ${name}`);
  }
  if (check4b.overflow) throw new Error(`Overflow at ${name}`);
  if (!s9Check.s9Active || !s9Check.langVisible) throw new Error(`Scene 9 broken at ${name}`);
  if (rev4b < 0.95) throw new Error(`Reverse scroll to 4B failed at ${name}`);

  await context.close();
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    await checkViewport(browser, '360x640', 360, 640, true);
    await checkViewport(browser, '390x844', 390, 844, true);
    await checkViewport(browser, '1366x768', 1366, 768, false);
    await checkViewport(browser, '1920x1080', 1920, 1080, false);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
