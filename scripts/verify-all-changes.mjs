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

  // 1. Scene 10 scroll-controlled
  const s10Top = await page.evaluate(() => {
    const el = document.getElementById('scene-10');
    const spacer = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
    spacer.scrollIntoView({ behavior: 'instant', block: 'start' });
    return window.scrollY;
  });
  const s10PinLen = height * 1.9;

  // Mid-ride (~0.25)
  await page.evaluate((y) => window.scrollTo(0, y), s10Top + Math.round(s10PinLen * 0.25));
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(ART_DIR, `vfinal-${name}-s10-mid.png`) });

  // Settled & held (~0.80)
  await page.evaluate((y) => window.scrollTo(0, y), s10Top + Math.round(s10PinLen * 0.80));
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(ART_DIR, `vfinal-${name}-s10-held.png`) });
  const s10Held = await page.evaluate(() => ({
    titleOp: Number(getComputedStyle(document.querySelector('.s10-bn-title')).opacity),
    quoteOp: Number(getComputedStyle(document.querySelector('.s10-quote')).opacity),
    detailsOp: Number(getComputedStyle(document.querySelector('.s10-details-block')).opacity),
  }));
  if (s10Held.titleOp < 0.99 || s10Held.quoteOp < 0.99 || s10Held.detailsOp < 0.99) {
    throw new Error(`Scene 10 text not fully visible during hold at ${name}: ${JSON.stringify(s10Held)}`);
  }

  // Reverse scroll back to start of Scene 10
  await page.evaluate((y) => window.scrollTo(0, y), s10Top);
  await page.waitForTimeout(700);
  const s10Rev = await page.evaluate(() => ({
    detailsOp: Number(getComputedStyle(document.querySelector('.s10-details-block')).opacity),
  }));
  if (s10Rev.detailsOp > 0.05) throw new Error(`Scene 10 did not reverse on scroll up at ${name}`);

  // 2. Scene 12 -> 13
  const g1213Top = await page.evaluate(() => {
    const el = document.getElementById('group-12-13');
    const spacer = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el;
    spacer.scrollIntoView({ behavior: 'instant', block: 'start' });
    return window.scrollY;
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ART_DIR, `vfinal-${name}-s12-sharp.png`) });

  await page.evaluate((y) => window.scrollTo(0, y), g1213Top + Math.round(height * 1.48));
  await page.waitForTimeout(750);
  await page.screenshot({ path: path.join(ART_DIR, `vfinal-${name}-s13-bn.png`) });

  const s13Bn = await page.evaluate(() => ({
    blurOp: Number(getComputedStyle(document.querySelector('.s12-house-blur')).opacity),
    creamOp: Number(getComputedStyle(document.querySelector('.s12-cream-overlay')).opacity),
    addr1: document.querySelector('[data-i18n="s13.addr1"]').textContent.trim(),
  }));
  if (s13Bn.blurOp < 0.95 || s13Bn.creamOp < 0.95) throw new Error(`Scene 12->13 blur/overlay incomplete at ${name}`);
  if (s13Bn.addr1 !== 'মণিরামপুর, ডাকঘর- মণিরামপুর,') throw new Error(`Wrong BN addr1: ${s13Bn.addr1}`);

  // Switch to English on Scene 13
  await page.click('#lang-toggle');
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(ART_DIR, `vfinal-${name}-s13-en.png`) });
  const s13EnAddr = await page.evaluate(() => document.querySelector('[data-i18n="s13.addr1"]').textContent.trim());
  if (!s13EnAddr.includes('Manirampur, P.O.- Manirampur')) throw new Error(`Wrong EN addr1: ${s13EnAddr}`);

  // 3. Scene 14 in English then Bengali
  await page.evaluate(() => document.getElementById('scene-14').scrollIntoView({ behavior: 'instant', block: 'start' }));
  await page.waitForTimeout(500);
  const s14EnH = await page.evaluate(() => document.querySelector('.s14-heading').textContent.trim());
  await page.screenshot({ path: path.join(ART_DIR, `vfinal-${name}-s14-en.png`) });
  if (s14EnH !== 'We Look Forward to Your Presence!') throw new Error(`Wrong S14 EN heading: ${s14EnH}`);

  await page.click('#lang-toggle');
  await page.waitForTimeout(250);
  const s14BnH = await page.evaluate(() => document.querySelector('.s14-heading').textContent.trim());
  await page.screenshot({ path: path.join(ART_DIR, `vfinal-${name}-s14-bn.png`) });
  if (s14BnH !== 'অবশ্যই আসবেন!') throw new Error(`Wrong S14 BN heading: ${s14BnH}`);

  // Scroll up back to Scene 13 and confirm blur reverses back to sharp Scene 12
  await page.evaluate((y) => window.scrollTo(0, y), g1213Top);
  await page.waitForTimeout(700);
  const s12RevBlur = await page.evaluate(() => Number(getComputedStyle(document.querySelector('.s12-house-blur')).opacity));
  if (s12RevBlur > 0.05) throw new Error(`Scene 12->13 did not reverse to sharp at ${name}`);

  console.log(`[${name}] PASS (s10Held=${JSON.stringify(s10Held)} s13Bn=${s13Bn.addr1} s14Bn=${s14BnH})`);
  await context.close();
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    await checkViewport(browser, '360x640', 360, 640, true);
    await checkViewport(browser, '390x844', 390, 844, true);
    await checkViewport(browser, '430x932', 430, 932, true);
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
