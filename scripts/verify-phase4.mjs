import { chromium } from 'playwright-core';
import path from 'node:path';

const ART_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\8437f326-a723-444b-9a96-5dd6df7ec53a';
const URL = process.env.TEST_URL || 'http://localhost:5173/';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function scrollToSceneHold(page, targetScene) {
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  const range = await page.evaluate(() => {
    const spacer = document.getElementById('group-4-9').closest('.pin-spacer');
    const top = spacer.getBoundingClientRect().top + window.scrollY;
    const height = spacer.offsetHeight - window.innerHeight;
    return { top, height };
  });

  // Progress targets inside [4-9] hold windows: Scene 7 (~0.58), Scene 8 (~0.71), Scene 9 (~0.94)
  const progMap = { 7: 0.58, 8: 0.71, 9: 0.94 };
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
    s7: document.getElementById('scene-7').textContent.replace(/\s+/g, ' '),
    s9: document.getElementById('scene-9').textContent.replace(/\s+/g, ' '),
  }));
  if (!texts.s7.includes('কল্যাণীয়া ঐন্দ্রিলা ব্যানার্জ্জী')) {
    throw new Error('Missing Scene 8 bride name');
  }
  for (const req of [
    'শুভ বিবাহ',
    'চক্রবর্তী পরিবার',
    'ব্যানার্জ্জী পরিবার',
    'কল্যাণীয় পবিত্রার্ঘ্য চক্রবর্তী',
    'পিতা : শ্রী পঙ্কজ চক্রবর্তী',
    'মাতা : শ্রীমতী অনুশ্রী চক্রবর্তী',
    'ভাই : অভ্রনীল চক্রবর্তী',
    'পিন- ৭১২৩০৪',
    'কল্যাণীয়া ঐন্দ্রিলা ব্যানার্জ্জী',
    'পিতা : শ্রী রবি শঙ্কর ব্যানার্জ্জী',
    'মাতা : শ্রীমতী বাণী ব্যানার্জ্জী',
    'পিন- ৭১২৩০৫',
  ]) {
    if (!texts.s9.includes(req)) throw new Error(`Missing in Scene 9: ${req}`);
  }
  console.log(`[${name}] Bengali spelling check: PASS`);

  if (name === '390x844' || name === '1440x900') {
    for (const s of [7, 8, 9]) {
      await scrollToSceneHold(page, s);
      const outPath = path.join(ART_DIR, `p4-${name}-scene-${s}.png`);
      await page.screenshot({ path: outPath });
      console.log(`Saved ${outPath}`);
    }
    // Reverse back to Scene 7
    await scrollToSceneHold(page, 7);
    const leafVisible = await page.evaluate(() => Number(getComputedStyle(document.querySelector('.s7-leaf--front')).opacity) > 0.8);
    console.log(`[${name}] Reverse to Scene 7: leafVisible=${leafVisible}`);
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
