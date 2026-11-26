import { chromium } from 'playwright-core';
import path from 'node:path';

const ART_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\8437f326-a723-444b-9a96-5dd6df7ec53a';
const URL = process.env.TEST_URL || 'http://localhost:4173/';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function scrollToScene(page, targetScene) {
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  const steps = 100;
  for (let i = 0; i <= steps; i++) {
    const y = Math.round((maxScroll * i) / steps);
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(60);
    const active = await page.evaluate(() => {
      for (const el of document.querySelectorAll('.pinned-group .scene.is-active')) {
        const rect = el.closest('.pinned-group').getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) {
          return Number(el.dataset.scene);
        }
      }
      for (const s of document.querySelectorAll('.section-scene')) {
        const r = s.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.5 && r.bottom >= window.innerHeight * 0.5) {
          return Number(s.dataset.scene);
        }
      }
      return null;
    });
    if (active === targetScene) {
      // For Scene 2, scroll a bit further so it's fully settled
      if (targetScene === 2) {
        await page.evaluate((pos) => window.scrollTo(0, pos + 220), y);
        await page.waitForTimeout(300);
      }
      // For Scene 3, center Scene 3 in the viewport
      if (targetScene === 3) {
        await page.evaluate(() => {
          document.getElementById('scene-3')?.scrollIntoView({ behavior: 'instant', block: 'start' });
        });
        await page.waitForTimeout(450);
      }
      return;
    }
  }
}

async function runViewport(browser, name, viewport, isMobile) {
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

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  console.log(`[${name}] Overflow: ${overflow.scrollWidth}/${overflow.innerWidth}`);
  if (overflow.scrollWidth > overflow.innerWidth) {
    throw new Error(`Overflow at ${name}`);
  }

  if (name === '390x844' || name === '1440x900') {
    for (const s of [1, 2, 3]) {
      await scrollToScene(page, s);
      await page.waitForTimeout(350);
      const outPath = path.join(ART_DIR, `p2-${name}-scene-${s}.png`);
      await page.screenshot({ path: outPath });
      console.log(`Saved ${outPath}`);
    }
    // Scroll back to top and confirm Scene 1 reverses cleanly
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(350);
    const s1Active = await page.evaluate(() => document.getElementById('scene-1').classList.contains('is-active'));
    const petalsHidden = await page.evaluate(() => !document.getElementById('petal-layer').classList.contains('is-visible'));
    console.log(`[${name}] Reverse to Scene 1: active=${s1Active}, petalsHidden=${petalsHidden}`);
  }

  await context.close();
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    await runViewport(browser, '360x640', { width: 360, height: 640 }, true);
    await runViewport(browser, '390x844', { width: 390, height: 844 }, true);
    await runViewport(browser, '1440x900', { width: 1440, height: 900 }, false);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
