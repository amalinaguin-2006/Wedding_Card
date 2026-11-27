import { chromium } from 'playwright-core';
import path from 'node:path';

const ART_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\8437f326-a723-444b-9a96-5dd6df7ec53a';
const URL = process.env.TEST_URL || 'http://localhost:5173/';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function getGroup49Range(page) {
  return page.evaluate(() => {
    const spacer = document.getElementById('group-4-9').closest('.pin-spacer');
    const top = spacer.getBoundingClientRect().top + window.scrollY;
    const height = spacer.offsetHeight - window.innerHeight;
    return { top, height };
  });
}

async function scrollToProgress(page, range, p) {
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  const y = Math.min(maxScroll, Math.round(range.top + range.height * p));
  await page.evaluate((pos) => window.scrollTo(0, pos), y);
  await page.waitForTimeout(400);
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
  if (overflow.scrollWidth > overflow.innerWidth) throw new Error(`Overflow at ${name}`);

  const range = await getGroup49Range(page);

  // Check 6 -> 7 transition: Scene 6 must fade out completely before Scene 7 appears,
  // and Scene 7 leaves must always be opacity=1
  for (const p of [0.49, 0.505, 0.52, 0.55]) {
    await scrollToProgress(page, range, p);
    const check = await page.evaluate(() => {
      const s6 = getComputedStyle(document.getElementById('scene-6'));
      const s7 = getComputedStyle(document.getElementById('scene-7'));
      const l1 = getComputedStyle(document.querySelector('.s7-leaf-pos--left'));
      const l2 = getComputedStyle(document.querySelector('.s7-leaf-pos--right'));
      return {
        s6Op: Number(s6.opacity),
        s7Vis: s7.visibility,
        l1Op: Number(l1.opacity),
        l2Op: Number(l2.opacity),
      };
    });
    if (check.s7Vis === 'visible' && check.s6Op > 0.01) {
      throw new Error(`[${name}] Overlap 6->7 at p=${p}: s6Op=${check.s6Op}`);
    }
    if (check.s7Vis === 'visible' && (check.l1Op < 0.99 || check.l2Op < 0.99)) {
      throw new Error(`[${name}] Leaves not 100% opaque at p=${p}: ${check.l1Op}, ${check.l2Op}`);
    }
  }
  console.log(`[${name}] 6->7 opaque entrance check: PASS`);

  // Capture Scenes 7, 8, 9 (and 9-bottom on mobile)
  const captures = [
    { key: 'scene-7', p: 0.56 },
    { key: 'scene-8', p: 0.66 },
    { key: 'scene-9-cloths', p: 0.76 },
    { key: 'scene-9', p: isMobile ? 0.90 : 0.96 },
  ];
  if (isMobile) {
    captures.push({ key: 'scene-9-scrolled', p: 0.98 });
  }

  for (const cap of captures) {
    await scrollToProgress(page, range, cap.p);
    const outPath = path.join(ART_DIR, `p4fix-${name}-${cap.key}.png`);
    await page.screenshot({ path: outPath });
    console.log(`Saved ${outPath}`);
  }

  // Verify reverse scroll back to Scene 7
  await scrollToProgress(page, range, 0.56);
  const revOk = await page.evaluate(() => {
    const l1 = getComputedStyle(document.querySelector('.s7-leaf-pos--left'));
    return Number(l1.opacity) === 1;
  });
  console.log(`[${name}] Reverse scroll to Scene 7: ${revOk ? 'PASS' : 'FAIL'}`);

  await context.close();
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    await runViewport(browser, '360x640', { width: 360, height: 640 }, true);
    await runViewport(browser, '390x844', { width: 390, height: 844 }, true);
    await runViewport(browser, '1366x768', { width: 1366, height: 768 }, false);
    await runViewport(browser, '1920x1080', { width: 1920, height: 1080 }, false);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
