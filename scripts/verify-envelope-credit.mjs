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
  await page.waitForSelector('#enter-btn:not([hidden])', { timeout: 7000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(ART_DIR, `env-${name}-closed.png`) });

  const envWidth = await page.evaluate(() => Math.round(document.getElementById('enter-btn').getBoundingClientRect().width));
  await page.click('#enter-btn', { force: true });
  await page.waitForTimeout(1350);

  const musicPlaying = await page.evaluate(() => !document.getElementById('bg-music').paused);
  if (!musicPlaying) throw new Error(`Music did not start on tap at ${name}`);

  await page.evaluate(() => document.getElementById('scene-14').scrollIntoView({ behavior: 'instant', block: 'start' }));
  await page.waitForTimeout(450);
  await page.screenshot({ path: path.join(ART_DIR, `s14cred-${name}-bn.png`) });

  const checkBn = await page.evaluate(() => {
    const cd = document.querySelector('.s14-countdown-card').getBoundingClientRect();
    const cr = document.querySelector('.s14-credit').getBoundingClientRect();
    const mu = document.getElementById('music-toggle').getBoundingClientRect();
    const overlapsMute = !(cr.right < mu.left || cr.left > mu.right || cr.bottom < mu.top || cr.top > mu.bottom);
    return {
      crTop: Math.round(cr.top),
      cdBottom: Math.round(cd.bottom),
      crBottom: Math.round(cr.bottom),
      vh: window.innerHeight,
      overlapsMute,
      creditW: getComputedStyle(document.querySelector('.s14-credit')).fontWeight,
      strongW: getComputedStyle(document.querySelector('.s14-credit strong')).fontWeight,
      fs: getComputedStyle(document.querySelector('.s14-credit')).fontSize,
    };
  });

  await page.click('#lang-toggle');
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(ART_DIR, `s14cred-${name}-en.png`) });
  const enText = await page.evaluate(() => document.querySelector('.s14-credit').textContent.trim());

  console.log(`[${name}] envWidth=${envWidth} bn=${JSON.stringify(checkBn)} en="${enText}"`);
  if (checkBn.crTop < checkBn.cdBottom) throw new Error(`Credit overlaps countdown at ${name}`);
  if (checkBn.overlapsMute) throw new Error(`Credit overlaps mute button at ${name}`);
  if (checkBn.crBottom > checkBn.vh) throw new Error(`Credit overflows viewport at ${name}`);
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
