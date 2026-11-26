import { chromium } from 'playwright-core';
import path from 'node:path';

const ART_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\8437f326-a723-444b-9a96-5dd6df7ec53a';
const URL = process.env.TEST_URL || 'http://localhost:4173/';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testScene2(browser, name, viewport, isMobile) {
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

  // Scroll to Scene 2
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  for (let i = 0; i <= 60; i++) {
    const y = Math.round((maxScroll * i) / 60);
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(40);
    const s2 = await page.evaluate(() => document.getElementById('scene-2').classList.contains('is-active'));
    if (s2) {
      await page.evaluate((pos) => window.scrollTo(0, pos + 220), y);
      await page.waitForTimeout(300);
      break;
    }
  }

  const count = await page.evaluate(() => document.querySelectorAll('#scene-2 .s2-butterfly').length);
  console.log(`[${name}] Scene 2 butterfly count: ${count}`);

  // Watch Scene 2 for 30 seconds without scrolling (sample every 5s)
  for (let t = 0; t <= 30; t += 5) {
    const positions = await page.evaluate(() => {
      return [...document.querySelectorAll('#scene-2 .s2-butterfly')].map((el) => {
        const r = el.getBoundingClientRect();
        const flip = getComputedStyle(el.querySelector('.s2-butterfly__flip')).transform;
        return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), flip };
      });
    });
    console.log(`[${name}] t=${t}s:`, JSON.stringify(positions.map((p) => `${p.x},${p.y}(${p.w}px)`)));
    if (t === 15) {
      await page.screenshot({ path: path.join(ART_DIR, `p2-${name}-scene-2.png`) });
    }
    if (t < 30) await page.waitForTimeout(5000);
  }

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  console.log(`[${name}] Overflow: ${overflow.scrollWidth}/${overflow.innerWidth}`);
  if (overflow.scrollWidth > overflow.innerWidth) throw new Error(`Overflow at ${name}`);

  await context.close();
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    await testScene2(browser, '390x844', { width: 390, height: 844 }, true);
    await testScene2(browser, '1440x900', { width: 1440, height: 900 }, false);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
