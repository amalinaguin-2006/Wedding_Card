import { chromium } from 'playwright-core';
import path from 'node:path';

const ART_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\8437f326-a723-444b-9a96-5dd6df7ec53a';
const URL = process.env.TEST_URL || 'http://localhost:4173/';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function scrollToSceneHold(page, targetScene) {
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  // Find group-4-9 start and end scroll positions
  const range = await page.evaluate(() => {
    const spacer = document.getElementById('group-4-9').closest('.pin-spacer');
    const top = spacer.getBoundingClientRect().top + window.scrollY;
    const height = spacer.offsetHeight - window.innerHeight;
    return { top, height };
  });

  // Progress targets inside [4-9] hold windows: Scene 4 (~0.11), Scene 5 (~0.25), Scene 6 (~0.47)
  const progMap = { 4: 0.11, 5: 0.25, 6: 0.47 };
  const p = progMap[targetScene];
  const y = Math.min(maxScroll, Math.round(range.top + range.height * p));
  await page.evaluate((pos) => window.scrollTo(0, pos), y);
  await page.waitForTimeout(550);
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

  // Verify Bengali spelling against SPEC.md
  const texts = await page.evaluate(() => ({
    s4: document.getElementById('scene-4').textContent.replace(/\s+/g, ' '),
    s5: document.getElementById('scene-5').textContent.replace(/\s+/g, ' '),
    s6: document.getElementById('scene-6').textContent.replace(/\s+/g, ' '),
  }));
  for (const req of ['শ্রী পঙ্কজ', 'শ্রীমতী অনুশ্রী', 'জ্যেষ্ঠপুত্র']) {
    if (!texts.s4.includes(req)) throw new Error(`Missing in Scene 4: ${req}`);
  }
  for (const req of ['শ্রীমান পবিত্রার্ঘ্য', '-এর সহিত']) {
    if (!texts.s5.includes(req)) throw new Error(`Missing in Scene 5: ${req}`);
  }
  for (const req of ['শ্রী রবি শঙ্কর', 'শ্রীমতী বাণী ব্যানার্জ্জী', 'একমাত্র', 'কন্যা']) {
    if (!texts.s6.includes(req)) throw new Error(`Missing in Scene 6: ${req}`);
  }
  console.log(`[${name}] Bengali spelling check: PASS`);

  if (name === '390x844' || name === '1440x900') {
    for (const s of [4, 5, 6]) {
      await scrollToSceneHold(page, s);
      const outPath = path.join(ART_DIR, `p3-${name}-scene-${s}.png`);
      await page.screenshot({ path: outPath });
      console.log(`Saved ${outPath}`);
    }
    // Reverse back to Scene 4
    await scrollToSceneHold(page, 4);
    const s4Active = await page.evaluate(() => document.getElementById('scene-4').classList.contains('is-active'));
    console.log(`[${name}] Reverse to Scene 4: active=${s4Active}`);
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
