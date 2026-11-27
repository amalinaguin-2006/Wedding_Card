import { chromium } from 'playwright-core';
import path from 'node:path';

const ART_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\8437f326-a723-444b-9a96-5dd6df7ec53a';
const URL = process.env.TEST_URL || 'http://localhost:5173/';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function checkViewport(browser, name, viewport, isMobile) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: isMobile ? 2 : 1,
    isMobile,
    hasTouch: isMobile,
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  await page.waitForFunction(() => {
    const loader = document.getElementById('loader');
    return !loader || getComputedStyle(loader).display === 'none' || (loader.classList.contains('is-hidden') && getComputedStyle(loader).opacity === '0');
  }, null, { timeout: 6000 });

  // Scroll to Scene 10 (almost fully in view -> triggers 5s time-based ride)
  await page.evaluate(() => {
    document.getElementById('scene-10').scrollIntoView({ behavior: 'instant', block: 'start' });
  });

  // Immediately check text is hidden before bike stops
  await page.waitForTimeout(300);
  const earlyTextOp = await page.evaluate(() => Number(getComputedStyle(document.querySelector('.s10-title-block')).opacity));
  if (earlyTextOp > 0.1) throw new Error(`[${name}] Text appeared before bike stopped: opacity=${earlyTextOp}`);

  // Wait 5.8s for the ~5s bike ride + text fade-in to finish
  await page.waitForTimeout(5800);

  const metrics = await page.evaluate(() => {
    const title = document.querySelector('.s10-title-block').getBoundingClientRect();
    const details = document.querySelector('.s10-details-block').getBoundingClientRect();
    const bride = document.querySelector('.s10-bride-wrap').getBoundingClientRect();
    const groom = document.querySelector('.s10-groom-wrap').getBoundingClientRect();
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      titleRightPct: Number(((title.right / window.innerWidth) * 100).toFixed(1)),
      titleOp: Number(getComputedStyle(document.querySelector('.s10-title-block')).opacity),
      detailsOp: Number(getComputedStyle(document.querySelector('.s10-details-block')).opacity),
      detailsOverlapsBride: details.top < bride.bottom - 10 && details.right > bride.left + 10,
      groomLeft: Math.round(groom.left),
    };
  });

  console.log(`[${name}]`, JSON.stringify(metrics));
  if (metrics.scrollWidth > metrics.innerWidth) throw new Error(`Overflow at ${name}`);
  if (metrics.titleOp < 0.9 || metrics.detailsOp < 0.9) throw new Error(`Text did not appear after stop at ${name}`);
  if (isMobile && metrics.titleRightPct > 47) throw new Error(`Mobile title overlaps shutter (${metrics.titleRightPct}%) at ${name}`);

  await page.screenshot({ path: path.join(ART_DIR, `s10fix-${name}.png`) });
  await context.close();
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    await checkViewport(browser, '360x640', { width: 360, height: 640 }, true);
    await checkViewport(browser, '390x844', { width: 390, height: 844 }, true);
    await checkViewport(browser, '1366x768', { width: 1366, height: 768 }, false);
    await checkViewport(browser, '1920x1080', { width: 1920, height: 1080 }, false);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
