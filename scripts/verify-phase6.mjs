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

  // 1. Check Scene 1: lang toggle hidden
  const s1Lang = await page.evaluate(() => document.getElementById('lang-toggle').classList.contains('is-visible'));
  if (s1Lang) throw new Error(`Lang toggle visible on Scene 1 at ${name}`);

  // 2. Scroll to Scene 12 (start of group-12-13)
  const g1213Top = await page.evaluate(() => {
    const el = document.getElementById('group-12-13');
    el.scrollIntoView({ behavior: 'instant', block: 'start' });
    return window.scrollY;
  });
  await page.waitForTimeout(450);
  await page.screenshot({ path: path.join(ART_DIR, `p6-${name}-scene12.png`) });
  const s12Lang = await page.evaluate(() => document.getElementById('lang-toggle').classList.contains('is-visible'));
  if (s12Lang) throw new Error(`Lang toggle visible on Scene 12 at ${name}`);

  // 3. Scroll into Scene 13 (progress ~0.85)
  await page.evaluate((y) => window.scrollTo(0, y + Math.round(window.innerHeight * 1.35)), g1213Top);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(ART_DIR, `p6-${name}-scene13-bn.png`) });

  const s13Check = await page.evaluate(() => {
    const langVisible = document.getElementById('lang-toggle').classList.contains('is-visible');
    const href = document.getElementById('s13-map-link').getAttribute('href');
    const card = document.querySelector('.s13-card').getBoundingClientRect();
    return { langVisible, href, cardTop: Math.round(card.top), cardBottom: Math.round(card.bottom), vh: window.innerHeight };
  });
  if (!s13Check.langVisible) throw new Error(`Lang toggle NOT visible on Scene 13 at ${name}`);
  if (s13Check.href !== 'https://maps.app.goo.gl/zz4EkPCmiX9YhYqv7?g_st=aw') {
    throw new Error(`Unexpected map href: ${s13Check.href}`);
  }

  // 4. Scroll to Scene 14
  await page.evaluate(() => {
    document.getElementById('scene-14').scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ART_DIR, `p6-${name}-scene14-bn.png`) });

  const secBefore = await page.evaluate(() => document.getElementById('cd-seconds').textContent);
  await page.waitForTimeout(1150);
  const secAfter = await page.evaluate(() => document.getElementById('cd-seconds').textContent);
  if (secBefore === secAfter) throw new Error(`Countdown did not tick on ${name}: ${secBefore}`);

  const s14Lang = await page.evaluate(() => document.getElementById('lang-toggle').classList.contains('is-visible'));
  if (!s14Lang) throw new Error(`Lang toggle NOT visible on Scene 14 at ${name}`);

  // 5. Switch to English on Scene 14 and check scroll position stability
  const yBeforeToggle = await page.evaluate(() => window.scrollY);
  await page.click('#lang-toggle');
  await page.waitForTimeout(250);
  const yAfterToggle = await page.evaluate(() => window.scrollY);
  if (Math.abs(yAfterToggle - yBeforeToggle) > 2) {
    throw new Error(`Scroll jumped on language toggle: ${yBeforeToggle} -> ${yAfterToggle}`);
  }
  await page.screenshot({ path: path.join(ART_DIR, `p6-${name}-scene14-en.png`) });

  // 6. Scroll back to Scene 13 in English
  await page.evaluate((y) => window.scrollTo(0, y + Math.round(window.innerHeight * 1.35)), g1213Top);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(ART_DIR, `p6-${name}-scene13-en.png`) });

  // 7. Check Scene 11 in English (scroll to pinned end)
  const s11Top = await page.evaluate(() => {
    const el = document.getElementById('scene-11');
    el.scrollIntoView({ behavior: 'instant', block: 'start' });
    return window.scrollY;
  });
  await page.evaluate((y) => window.scrollTo(0, y + Math.round(window.innerHeight * 0.84)), s11Top);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(ART_DIR, `p6-${name}-scene11-en.png`) });

  // 8. Check Scene 10: lang toggle MUST be hidden
  await page.evaluate(() => {
    document.getElementById('scene-10').scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(400);
  const s10Lang = await page.evaluate(() => document.getElementById('lang-toggle').classList.contains('is-visible'));
  if (s10Lang) throw new Error(`Lang toggle visible on Scene 10 at ${name}`);

  // 9. Check Scene 9 in English
  await page.evaluate(() => {
    const g = document.getElementById('group-4-9');
    g.scrollIntoView({ behavior: 'instant', block: 'start' });
    window.scrollTo(0, window.scrollY + Math.round(window.innerHeight * 7.8));
  });
  await page.waitForTimeout(700);
  const s9Check = await page.evaluate(() => ({
    s9Active: document.getElementById('scene-9').classList.contains('is-active'),
    langVisible: document.getElementById('lang-toggle').classList.contains('is-visible'),
    overflow: document.documentElement.scrollWidth > window.innerWidth,
  }));
  await page.screenshot({ path: path.join(ART_DIR, `p6-${name}-scene9-en.png`) });

  console.log(`[${name}] s13=${JSON.stringify(s13Check)} countdown=${secBefore}->${secAfter} s9=${JSON.stringify(s9Check)}`);
  if (s9Check.overflow) throw new Error(`Horizontal overflow at ${name}`);
  await context.close();
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    await checkViewport(browser, '360x640', 360, 640, true);
    await checkViewport(browser, '390x844', 390, 844, true);
    await checkViewport(browser, '1440x900', 1440, 900, false);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
