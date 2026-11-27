import { chromium } from 'playwright-core';
import path from 'node:path';

const ART_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\8437f326-a723-444b-9a96-5dd6df7ec53a';
const URL = process.env.TEST_URL || 'http://localhost:5173/';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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

  // Verify Scene 10 & 11 text against SPEC.md
  const texts = await page.evaluate(() => ({
    s10: document.getElementById('scene-10').textContent.replace(/\s+/g, ' '),
    s11: document.getElementById('scene-11').textContent.replace(/\s+/g, ' '),
  }));
  for (const req of ['|| আমাদের বিয়ে ||', 'AINDRILA', 'PABITRARGHYA', 'Wedding Ceremony : 12th February 2027', 'Reception : 14th February 2027 at Anur Bari']) {
    if (!texts.s10.includes(req)) throw new Error(`Missing in Scene 10: ${req}`);
  }
  for (const req of ['সময়সূচী', 'শুভ বিবাহ', '২৮শে মাঘ, ১৪৩৩ (বাংলা)', '৭১২৩০৫', 'বৌভাত', '১লা ফাল্গুন, ১৪৩৩ (বাংলা)', '৭১২৩০৪']) {
    if (!texts.s11.includes(req)) throw new Error(`Missing in Scene 11: ${req}`);
  }
  console.log(`[${name}] Scene 10 & 11 text check: PASS`);

  // Scroll to Scene 10
  await page.evaluate(() => {
    document.getElementById('scene-10').scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(550);
  const s10Petals = await page.evaluate(() => document.getElementById('petal-layer').classList.contains('is-visible'));
  if (s10Petals) throw new Error(`[${name}] Petals should be hidden on Scene 10`);
  if (name === '390x844' || name === '1440x900') {
    await page.screenshot({ path: path.join(ART_DIR, `p5-${name}-scene-10.png`) });
  }

  // Scroll to Scene 11
  await page.evaluate(() => {
    document.getElementById('scene-11').scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(550);
  const s11Petals = await page.evaluate(() => document.getElementById('petal-layer').classList.contains('is-visible'));
  if (!s11Petals) throw new Error(`[${name}] Petals should be visible on Scene 11`);
  if (name === '390x844' || name === '1440x900') {
    await page.screenshot({ path: path.join(ART_DIR, `p5-${name}-scene-11.png`) });
  }

  // Scroll back up to Scene 10 and verify petals hide again
  await page.evaluate(() => {
    document.getElementById('scene-10').scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(450);
  const revPetals = await page.evaluate(() => document.getElementById('petal-layer').classList.contains('is-visible'));
  console.log(`[${name}] Reverse to Scene 10: petalsHidden=${!revPetals}`);

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
