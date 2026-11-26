import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles/main.css';
import { CONFIG } from './config.js';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Preload critical images for Group [1–2], then hide the loader.
 */
async function preloadFirstGroup() {
  const loader = document.getElementById('loader');
  const criticalUrls = [
    '/assets/butterfly.webp',
    '/assets/sparkle.webp',
    '/assets/ornament.webp',
    '/assets/brahma.webp',
    '/assets/chakra.webp',
  ];

  const loadPromises = criticalUrls.map(
    (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve; // Do not block UI if an optional/pending asset fails
        img.src = src;
      })
  );

  // Race against a 2.5s timeout so slow networks never stall the loader
  await Promise.race([
    Promise.all(loadPromises),
    new Promise((resolve) => setTimeout(resolve, 2500)),
  ]);

  if (loader) {
    loader.classList.add('is-hidden');
  }
}

/**
 * Shared looping petal layer using cropped individual petals from petal.png.
 * Pauses automatically when on non-petal scenes or when prefers-reduced-motion is set.
 */
function initPetalLayer() {
  const layer = document.getElementById('petal-layer');
  if (!layer || prefersReducedMotion) return null;

  const isSmallScreen = window.innerWidth < 768;
  const petalCount = isSmallScreen ? 14 : 26;
  const petalVariants = 11;
  const tweens = [];

  for (let i = 0; i < petalCount; i++) {
    const img = document.createElement('img');
    const variant = (i % petalVariants) + 1;
    img.src = `/assets/petals/petal-${variant}.webp`;
    img.alt = '';
    img.className = 'petal-item';
    img.loading = 'lazy';

    const size = gsap.utils.random(18, isSmallScreen ? 34 : 44);
    const startX = gsap.utils.random(0, 100);
    const driftX = gsap.utils.random(-80, 80);
    const duration = gsap.utils.random(7, 14);
    const delay = gsap.utils.random(-14, 0);
    const startRot = gsap.utils.random(0, 360);
    const endRot = startRot + gsap.utils.random(-240, 240);

    img.style.width = `${size}px`;
    img.style.left = `${startX}vw`;

    layer.appendChild(img);

    const tl = gsap.to(img, {
      y: '118vh',
      x: driftX,
      rotation: endRot,
      duration,
      delay,
      ease: 'none',
      repeat: -1,
    });
    tl.pause();
    tweens.push(tl);
  }

  let active = false;
  function setVisible(shouldShow) {
    if (shouldShow === active) return;
    active = shouldShow;
    layer.classList.toggle('is-visible', shouldShow);
    tweens.forEach((t) => (shouldShow ? t.play() : t.pause()));
  }

  return { setVisible };
}

/**
 * Helper to switch the active scene inside a pinned group.
 */
function activateSceneInGroup(groupEl, sceneNumber) {
  const scenes = groupEl.querySelectorAll('.scene');
  scenes.forEach((el) => {
    const num = Number(el.dataset.scene);
    el.classList.toggle('is-active', num === sceneNumber);
  });
}

/**
 * Phase 1 ScrollTrigger skeleton:
 * - Pinned group [1–2]
 * - Normal section [3]
 * - Pinned group [4–9]
 * - Normal sections [10], [11]
 * - Pinned group [12–13]
 * - Normal section [14]
 */
function initScrollStructure(petals) {
  const group12 = document.getElementById('group-1-2');
  const group49 = document.getElementById('group-4-9');
  const group1213 = document.getElementById('group-12-13');

  // Group [1–2]
  if (group12) {
    ScrollTrigger.create({
      trigger: group12,
      start: 'top top',
      end: '+=160%',
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const active = self.progress < 0.5 ? 1 : 2;
        activateSceneInGroup(group12, active);
      },
      onEnter: () => petals?.setVisible(false),
      onEnterBack: () => petals?.setVisible(false),
    });
  }

  // Group [4–9]
  if (group49) {
    const scenes49 = [4, 5, 6, 7, 8, 9];
    ScrollTrigger.create({
      trigger: group49,
      start: 'top top',
      end: '+=540%',
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const idx = Math.min(
          scenes49.length - 1,
          Math.floor(self.progress * scenes49.length)
        );
        activateSceneInGroup(group49, scenes49[idx]);
      },
      onEnter: () => petals?.setVisible(true),
      onEnterBack: () => petals?.setVisible(true),
    });
  }

  // Group [12–13]
  if (group1213) {
    ScrollTrigger.create({
      trigger: group1213,
      start: 'top top',
      end: '+=160%',
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const active = self.progress < 0.45 ? 12 : 13;
        activateSceneInGroup(group1213, active);
      },
      onEnter: () => petals?.setVisible(false),
      onEnterBack: () => petals?.setVisible(false),
    });
  }

  // Normal sections petal visibility triggers
  document.querySelectorAll('.section-scene').forEach((section) => {
    const hasPetals = section.dataset.petals === 'true';
    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => petals?.setVisible(hasPetals),
      onEnterBack: () => petals?.setVisible(hasPetals),
    });
  });
}

async function init() {
  // Expose config reference for later phases
  window.__WEDDING_CONFIG__ = CONFIG;

  const petals = initPetalLayer();
  initScrollStructure(petals);
  await preloadFirstGroup();
}

init();
