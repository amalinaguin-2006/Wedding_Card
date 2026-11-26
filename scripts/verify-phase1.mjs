import { chromium } from 'playwright-core';
import path from 'node:path';

const ART_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\8437f326-a723-444b-9a96-5dd6df7ec53a';
const URL = process.env.TEST_URL || 'http://localhost:4173/';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function scrollToScene(page, targetScene) {
  // Compute scroll Y for each scene based on DOM positions and pinned durations
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  const steps = 60;
  // First check if we can find the exact scroll position by stepping
  // For pinned groups, we step until the target scene is active
  const currentActive = async () =>
    page.evaluate(() => {
      // Check active scene in viewport
      const pinnedActive = [...document.querySelectorAll('.pinned-group .scene.is-active')];
      for (const el of pinnedActive) {
        const rect = el.closest('.pinned-group').getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) {
          return Number(el.dataset.scene);
        }
      }
      const sections = [...document.querySelectorAll('.section-scene')];
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= window.innerHeight * 0.5 && r.bottom >= window.innerHeight * 0.5) {
          return Number(s.dataset.scene);
        }
      }
      return null;
    });

  // Binary/linear scan from top to find targetScene
  for (let i = 0; i <= steps; i++) {
    const y = Math.round((maxScroll * i) / steps);
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(80);
    const active = await currentActive();
    if (active === targetScene) {
      return y;
    }
  }
  return null;
}

async function verifyViewport(browser, name, viewport, isMobile = false) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: isMobile ? 2 : 1,
    isMobile,
    hasTouch: isMobile,
  });
  const page = await context.newPage();

  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  // Wait for loader to disappear (max 6s)
  await page.waitForFunction(() => {
    const loader = document.getElementById('loader');
    return !loader || getComputedStyle(loader).display === 'none' || (loader.classList.contains('is-hidden') && getComputedStyle(loader).opacity === '0');
  }, null, { timeout: 6000 });

  // Check horizontal overflow
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  console.log(`[${name}] Overflow check: scrollWidth=${overflow.scrollWidth}, innerWidth=${overflow.innerWidth}`);
  if (overflow.scrollWidth > overflow.innerWidth) {
    throw new Error(`Horizontal overflow at ${name}: ${overflow.scrollWidth} > ${overflow.innerWidth}`);
  }

  // Check heading centering on Scene 1
  const centerCheck = await page.evaluate(() => {
    const h2 = document.querySelector('#scene-1 h2');
    const r = h2.getBoundingClientRect();
    return {
      left: Math.round(r.left),
      right: Math.round(r.right),
      centerX: Math.round((r.left + r.right) / 2),
      expectedCenterX: Math.round(window.innerWidth / 2),
    };
  });
  console.log(`[${name}] Scene 1 heading bounds:`, centerCheck);

  // Scroll down through all 14 scenes and verify active scene & petals
  const expectedPetals = new Set([3, 4, 5, 6, 7, 8, 9, 11, 14]);
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

  const seenDown = new Map();
  const totalSteps = 80;
  for (let i = 0; i <= totalSteps; i++) {
    const y = Math.round((maxScroll * i) / totalSteps);
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(40);
    const state = await page.evaluate(() => {
      const petalsVisible = document.getElementById('petal-layer')?.classList.contains('is-visible') ?? false;
      let active = null;
      for (const el of document.querySelectorAll('.pinned-group .scene.is-active')) {
        const rect = el.closest('.pinned-group').getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) {
          active = Number(el.dataset.scene);
          break;
        }
      }
      if (!active) {
        for (const s of document.querySelectorAll('.section-scene')) {
          const r = s.getBoundingClientRect();
          if (r.top <= window.innerHeight * 0.5 && r.bottom >= window.innerHeight * 0.5) {
            active = Number(s.dataset.scene);
            break;
          }
        }
      }
      return { active, petalsVisible };
    });
    if (state.active) {
      seenDown.set(state.active, state.petalsVisible);
    }
  }

  // Scroll back up to top and verify reverse
  const seenUp = new Map();
  for (let i = totalSteps; i >= 0; i--) {
    const y = Math.round((maxScroll * i) / totalSteps);
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(40);
    const state = await page.evaluate(() => {
      const petalsVisible = document.getElementById('petal-layer')?.classList.contains('is-visible') ?? false;
      let active = null;
      for (const el of document.querySelectorAll('.pinned-group .scene.is-active')) {
        const rect = el.closest('.pinned-group').getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) {
          active = Number(el.dataset.scene);
          break;
        }
      }
      if (!active) {
        for (const s of document.querySelectorAll('.section-scene')) {
          const r = s.getBoundingClientRect();
          if (r.top <= window.innerHeight * 0.5 && r.bottom >= window.innerHeight * 0.5) {
            active = Number(s.dataset.scene);
            break;
          }
        }
      }
      return { active, petalsVisible };
    });
    if (state.active) {
      seenUp.set(state.active, state.petalsVisible);
    }
  }

  for (let s = 1; s <= 14; s++) {
    const downOk = seenDown.has(s) && seenDown.get(s) === expectedPetals.has(s);
    const upOk = seenUp.has(s) && seenUp.get(s) === expectedPetals.has(s);
    console.log(`[${name}] Scene ${s}: down=${seenDown.get(s)} up=${seenUp.get(s)} expectedPetals=${expectedPetals.has(s)} -> ${downOk && upOk ? 'PASS' : 'FAIL'}`);
  }

  // Capture screenshots for scenes 1, 4, 9, 11, 14 (only if name is 390x844 or 1440x900)
  if (name === '390x844' || name === '1440x900') {
    for (const target of [1, 4, 9, 11, 14]) {
      await scrollToScene(page, target);
      await page.waitForTimeout(450); // allow petal opacity transition to settle
      const outPath = path.join(ART_DIR, `p1-${name}-scene-${target}.png`);
      await page.screenshot({ path: outPath });
      console.log(`Saved ${outPath}`);
    }
  }

  await context.close();
}

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });
  try {
    await verifyViewport(browser, '360x640', { width: 360, height: 640 }, true);
    await verifyViewport(browser, '390x844', { width: 390, height: 844 }, true);
    await verifyViewport(browser, '1440x900', { width: 1440, height: 900 }, false);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
