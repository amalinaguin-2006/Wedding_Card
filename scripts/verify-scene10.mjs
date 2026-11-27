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

  await page.evaluate(() => {
    document.getElementById('scene-10').scrollIntoView({ behavior: 'instant', block: 'start' });
  });

  // Capture mid-ride frame at 1.0s into the 2.8s ride to verify wheels rotating behind bike-body
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(ART_DIR, `s10v3-${name}-midride.png`) });

  // Wait remaining 2.5s for 2.8s ride + text reveal to finish, then watch idle for 15s
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(ART_DIR, `s10v3-${name}-settled.png`) });

  const metrics = await page.evaluate(() => {
    const title = document.querySelector('.s10-title-block').getBoundingClientRect();
    const details = document.querySelector('.s10-details-block').getBoundingClientRect();
    const bride = document.querySelector('.s10-bride-wrap').getBoundingClientRect();
    const groom = document.querySelector('.s10-groom-wrap').getBoundingClientRect();
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      brideRight: Math.round(bride.right),
      titleOp: Number(getComputedStyle(document.querySelector('.s10-title-block')).opacity),
      detailsOp: Number(getComputedStyle(document.querySelector('.s10-details-block')).opacity),
      detailsOverlapsBride: details.top < bride.bottom - 5 && details.left < bride.right && details.right > bride.left,
      groomLeft: Math.round(groom.left),
    };
  });

  console.log(`[${name}]`, JSON.stringify(metrics));
  if (metrics.scrollWidth > metrics.innerWidth) throw new Error(`Overflow at ${name}`);
  if (metrics.titleOp < 0.9 || metrics.detailsOp < 0.9) throw new Error(`Text did not appear after stop at ${name}`);
  if (metrics.brideRight > metrics.innerWidth) throw new Error(`Bride saree clipped on right: ${metrics.brideRight} > ${metrics.innerWidth}`);

  // Watch idle animation for 15 seconds
  await page.waitForTimeout(15000);
  console.log(`[${name}] 15s idle watch: PASS`);

  await context.close();
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    await checkViewport(browser, '390x844', { width: 390, height: 844 }, true);
    await checkViewport(browser, '1920x1080', { width: 1920, height: 1080 }, false);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
