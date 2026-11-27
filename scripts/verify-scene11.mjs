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

  const s11Top = await page.evaluate(() => {
    const el = document.getElementById('scene-11');
    el.scrollIntoView({ behavior: 'instant', block: 'start' });
    return window.scrollY;
  });
  await page.waitForTimeout(450);
  await page.screenshot({ path: path.join(ART_DIR, `s11-${name}-closed.png`) });

  const closedFit = await page.evaluate(() => {
    const h2 = document.querySelector('.s11-heading').getBoundingClientRect();
    const s2 = document.querySelector('.s11-scroll--2').getBoundingClientRect();
    return { hTop: Math.round(h2.top), s2Bottom: Math.round(s2.bottom), vh: window.innerHeight };
  });

  // Scroll ~45% through pin -> both scrolls mid-open simultaneously
  await page.evaluate((y) => window.scrollTo(0, y + Math.round(window.innerHeight * 0.42)), s11Top);
  await page.waitForTimeout(750);
  await page.screenshot({ path: path.join(ART_DIR, `s11-${name}-mid.png`) });

  // Scroll ~85% through pin -> both scrolls open
  await page.evaluate((y) => window.scrollTo(0, y + Math.round(window.innerHeight * 0.84)), s11Top);
  await page.waitForTimeout(750);
  await page.screenshot({ path: path.join(ART_DIR, `s11-${name}-open.png`) });

  // Switch to English and verify no text cut off
  await page.evaluate(() => {
    const btn = document.querySelector('#lang-toggle, .lang-toggle');
    if (btn) btn.click();
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(ART_DIR, `s11-${name}-en.png`) });

  // Scroll back up to closed and verify reversal
  await page.evaluate((y) => window.scrollTo(0, y), s11Top);
  await page.waitForTimeout(750);
  const reversed = await page.evaluate(() => {
    const clip = getComputedStyle(document.querySelector('.s11-scroll--1 .s11-scroll__paper-clip')).clipPath;
    return { clip };
  });

  console.log(`[${name}] closedFit=${JSON.stringify(closedFit)} reversed=${JSON.stringify(reversed)}`);
  if (closedFit.s2Bottom > closedFit.vh) {
    throw new Error(`Scroll 2 extends below viewport on ${name}: ${closedFit.s2Bottom} > ${closedFit.vh}`);
  }
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
