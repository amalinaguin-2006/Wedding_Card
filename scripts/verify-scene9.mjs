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

  const range = await page.evaluate(() => {
    const spacer = document.getElementById('group-4-9').closest('.pin-spacer');
    return {
      top: spacer.getBoundingClientRect().top + window.scrollY,
      height: spacer.offsetHeight - window.innerHeight,
    };
  });

  // Scroll to Scene 9 settled state (p = 0.93 for top, 0.99 for panned bottom on small phones)
  const y = Math.round(range.top + range.height * 0.93);
  await page.evaluate((pos) => window.scrollTo(0, pos), y);
  await page.waitForTimeout(450);

  const metrics = await page.evaluate(() => {
    const groomBox = document.querySelector('.s9-box--groom').getBoundingClientRect();
    const brideBox = document.querySelector('.s9-box--bride').getBoundingClientRect();
    const groomFamImg = document.querySelector('.s9-groom-family .s9-family-img').getBoundingClientRect();
    const brideFamImg = document.querySelector('.s9-bride-family .s9-family-img').getBoundingClientRect();
    const groomTitle = document.querySelector('.s9-groom-family .s9-family-title').getBoundingClientRect();
    const brideTitle = document.querySelector('.s9-bride-family .s9-family-title').getBoundingClientRect();
    const groomLead = document.querySelector('.s9-box--groom .s9-box__lead').textContent.trim();
    return {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      groomBox: { w: Math.round(groomBox.width), h: Math.round(groomBox.height), top: Math.round(groomBox.top), bottom: Math.round(groomBox.bottom), left: Math.round(groomBox.left), right: Math.round(groomBox.right) },
      brideBox: { w: Math.round(brideBox.width), h: Math.round(brideBox.height), top: Math.round(brideBox.top), bottom: Math.round(brideBox.bottom), left: Math.round(brideBox.left), right: Math.round(brideBox.right) },
      famImgDiffBottom: Math.abs(Math.round(groomFamImg.bottom - brideFamImg.bottom)),
      famImgOverlapsGroomBox: groomFamImg.right > groomBox.left + 1,
      famImgOverlapsBrideBox: brideFamImg.left < brideBox.right - 1,
      titleDiffTop: Math.abs(Math.round(groomTitle.top - brideTitle.top)),
      groomLead,
    };
  });

  console.log(`[${name}]`, JSON.stringify(metrics));

  if (metrics.scrollWidth > metrics.innerWidth) throw new Error(`Overflow at ${name}`);
  if (Math.abs(metrics.groomBox.w - metrics.brideBox.w) > 2) throw new Error(`Box widths differ at ${name}: ${metrics.groomBox.w} vs ${metrics.brideBox.w}`);
  if (Math.abs(metrics.groomBox.h - metrics.brideBox.h) > 2) throw new Error(`Box heights differ at ${name}: ${metrics.groomBox.h} vs ${metrics.brideBox.h}`);
  if (metrics.groomLead !== 'কল্যাণীয় পবিত্রার্ঘ্য চক্রবর্তী') throw new Error(`Wrong groom name: ${metrics.groomLead}`);

  if (!isMobile) {
    if (Math.abs(metrics.groomBox.top - metrics.brideBox.top) > 2) throw new Error(`Desktop box tops misaligned at ${name}`);
    if (metrics.famImgDiffBottom > 2) throw new Error(`Desktop family bottoms misaligned at ${name}`);
    if (metrics.titleDiffTop > 2) throw new Error(`Desktop family titles misaligned at ${name}`);
  } else {
    if (metrics.famImgOverlapsGroomBox) throw new Error(`Mobile groom family overlaps box at ${name}`);
    if (metrics.famImgOverlapsBrideBox) throw new Error(`Mobile bride family overlaps box at ${name}`);
  }

  await page.screenshot({ path: path.join(ART_DIR, `s9eq-${name}.png`) });
  if (isMobile) {
    await page.evaluate((pos) => window.scrollTo(0, pos), Math.round(range.top + range.height * 0.99));
    await page.waitForTimeout(450);
    await page.screenshot({ path: path.join(ART_DIR, `s9eq-${name}-bottom.png`) });
  }

  await context.close();
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  try {
    await checkViewport(browser, '360x640', { width: 360, height: 640 }, true);
    await checkViewport(browser, '390x844', { width: 390, height: 844 }, true);
    await checkViewport(browser, '430x932', { width: 430, height: 932 }, true);
    await checkViewport(browser, '1366x768', { width: 1366, height: 768 }, false);
    await checkViewport(browser, '1920x1080', { width: 1920, height: 1080 }, false);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
