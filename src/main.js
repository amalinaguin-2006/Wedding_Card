import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles/main.css';
import { CONFIG } from './config.js';
import { initScenes1to2, initScene3 } from './scenes/scenes1to3.js';
import { initScenes4to9 } from './scenes/scenes4to9.js';
import { initScenes10to11 } from './scenes/scenes10to11.js';
import { initScenes12to14 } from './scenes/scenes12to14.js';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const MUSIC_MUTE_KEY = 'wedding_music_muted';

function initMusicController() {
  const audio = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-toggle');
  if (!audio || !musicBtn) {
    return { startOnEnter: () => {}, showToggle: () => {} };
  }

  audio.loop = true;
  audio.volume = 0.35;

  let isMuted = false;
  try {
    isMuted = localStorage.getItem(MUSIC_MUTE_KEY) === '1';
  } catch {
    isMuted = false;
  }
  let wasPlayingBeforeAutoPause = false;

  const syncButton = () => {
    musicBtn.classList.toggle('is-muted', isMuted);
    musicBtn.setAttribute('aria-pressed', isMuted ? 'true' : 'false');
    musicBtn.setAttribute('aria-label', isMuted ? 'Unmute music' : 'Mute music');
  };

  const pauseForExternal = () => {
    if (!audio.paused) {
      wasPlayingBeforeAutoPause = true;
      audio.pause();
    }
  };

  const resumeIfAllowed = () => {
    if (wasPlayingBeforeAutoPause && !isMuted && !document.hidden) {
      wasPlayingBeforeAutoPause = false;
      audio.play().catch(() => {});
    }
  };

  syncButton();

  musicBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    try {
      localStorage.setItem(MUSIC_MUTE_KEY, isMuted ? '1' : '0');
    } catch {
      // ignore storage errors
    }
    if (isMuted) {
      wasPlayingBeforeAutoPause = false;
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    syncButton();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseForExternal();
    } else {
      resumeIfAllowed();
    }
  });

  window.addEventListener('focus', resumeIfAllowed);

  const mapLink = document.getElementById('s13-map-link');
  if (mapLink) {
    mapLink.addEventListener('click', pauseForExternal);
  }

  return {
    startOnEnter: () => {
      musicBtn.classList.add('is-visible');
      if (!isMuted) {
        audio.play().catch(() => {});
      }
    },
  };
}

/**
 * Preload critical images for Group [1–2], then show the opening button "আমন্ত্রণ দেখুন".
 */
async function preloadFirstGroup(musicCtrl) {
  const loader = document.getElementById('loader');
  const enterBtn = document.getElementById('enter-btn');
  const criticalUrls = [
    '/assets/butterfly-open.webp',
    '/assets/butterfly-closed.webp',
    '/assets/sparkles/star-1.webp',
    '/assets/sparkles/star-2.webp',
    '/assets/sparkles/star-3.webp',
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

  // Race against a 5s maximum wait so slow/failed networks never stall the loader
  await Promise.race([
    Promise.all(loadPromises),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);

  const hideLoader = () => {
    if (!loader) return;
    loader.classList.add('is-hidden');
    if (prefersReducedMotion) {
      loader.style.display = 'none';
    } else {
      loader.addEventListener(
        'transitionend',
        () => {
          loader.style.display = 'none';
        },
        { once: true }
      );
      setTimeout(() => {
        loader.style.display = 'none';
      }, 600);
    }
  };

  if (loader && enterBtn) {
    loader.classList.add('is-ready');
    enterBtn.hidden = false;
    enterBtn.addEventListener(
      'click',
      () => {
        musicCtrl?.startOnEnter();
        if (prefersReducedMotion) {
          hideLoader();
        } else {
          enterBtn.classList.add('is-opening');
          setTimeout(hideLoader, 780);
        }
      },
      { once: true }
    );
  } else {
    hideLoader();
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
 * Phase 1 ScrollTrigger skeleton:
 * - Pinned group [1–2]
 * - Normal section [3]
 * - Pinned group [4–9]
 * - Normal sections [10], [11]
 * - Pinned group [12–13]
 * - Normal section [14]
 */
function initScrollStructure(petals) {
  // Scenes 1–2 (pinned group) & Scene 3 (normal section)
  initScenes1to2(petals, prefersReducedMotion);
  initScene3(petals, prefersReducedMotion);

  // Group [4–9] (Scenes 4–6 in Phase 3, Scenes 7–9 in Phase 4)
  initScenes4to9(petals, prefersReducedMotion);

  // Scenes 10 & 11 (normal scroll sections)
  initScenes10to11(petals, prefersReducedMotion);

  // Scenes 12–14 (pinned group [12–13], Scene 14 countdown, & language toggle)
  initScenes12to14(petals, prefersReducedMotion);
}

async function init() {
  // Expose config reference for later phases
  window.__WEDDING_CONFIG__ = CONFIG;

  const musicCtrl = initMusicController();
  const petals = initPetalLayer();
  initScrollStructure(petals);
  await preloadFirstGroup(musicCtrl);
}

init();
