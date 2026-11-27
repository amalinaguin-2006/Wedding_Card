import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONFIG } from '../config.js';
import { TRANSLATIONS, applyLanguage, formatDigits } from '../i18n.js';
import '../styles/scenes12to14.css';

/**
 * Scenes 12–14 & Floating Language Toggle:
 * - [12–13] Pinned group: House illustration alone, then fades back as Boubhat pill, venue card & clickable map appear
 * - [14] Normal section: Petals, heading, couple & live countdown to WEDDING_TIME
 * - Floating language toggle visible ONLY on Scenes 9, 11, 13, and 14
 */
export function initScenes12to14(petals, prefersReducedMotion) {
  const group1213 = document.getElementById('group-12-13');
  const scene12 = document.getElementById('scene-12');
  const scene13 = document.getElementById('scene-13');
  const scene14 = document.getElementById('scene-14');
  const langBtn = document.getElementById('lang-toggle');

  let currentLang = 'bn';
  const activeLangScenes = new Set();

  const updateLangBtnVisibility = () => {
    if (!langBtn) return;
    langBtn.classList.toggle('is-visible', activeLangScenes.size > 0);
  };

  const setLangSceneActive = (key, isActive) => {
    if (isActive) {
      activeLangScenes.add(key);
    } else {
      activeLangScenes.delete(key);
    }
    updateLangBtnVisibility();
  };

  // --- SCENE 14 COUNTDOWN ---
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-minutes');
  const secsEl = document.getElementById('cd-seconds');
  const subEl = document.getElementById('s14-sub');
  const statusEl = document.getElementById('s14-status');

  const weddingMs = new Date(CONFIG.WEDDING_TIME).getTime();
  // End of wedding day in IST (+05:30): 2027-02-13T00:00:00+05:30
  const afterWeddingMs = weddingMs + 24 * 60 * 60 * 1000;

  const updateCountdown = () => {
    const now = Date.now();
    const diff = weddingMs - now;

    if (diff > 0) {
      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      if (daysEl) daysEl.textContent = formatDigits(days, currentLang);
      if (hoursEl) hoursEl.textContent = formatDigits(hours, currentLang);
      if (minsEl) minsEl.textContent = formatDigits(mins, currentLang);
      if (secsEl) secsEl.textContent = formatDigits(secs, currentLang);
      if (subEl) subEl.style.display = '';
      if (statusEl) statusEl.hidden = true;
    } else {
      if (daysEl) daysEl.textContent = formatDigits(0, currentLang);
      if (hoursEl) hoursEl.textContent = formatDigits(0, currentLang);
      if (minsEl) minsEl.textContent = formatDigits(0, currentLang);
      if (secsEl) secsEl.textContent = formatDigits(0, currentLang);
      if (subEl) subEl.style.display = 'none';
      if (statusEl) {
        statusEl.hidden = false;
        const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.bn;
        statusEl.textContent = now < afterWeddingMs ? dict['s14.today'] : dict['s14.after'];
      }
    }
  };

  if (langBtn) {
    langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'bn' ? 'en' : 'bn';
      langBtn.textContent = currentLang === 'bn' ? 'English' : 'বাংলা';
      langBtn.setAttribute('aria-label', currentLang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন');
      applyLanguage(currentLang);
      updateCountdown();
    });
  }

  applyLanguage('bn');
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // --- PINNED GROUP [12–13] ---
  if (group1213 && scene12 && scene13) {
    const houseWrap = scene12.querySelector('.s12-house-wrap');
    const pill = scene13.querySelector('.s13-pill');
    const card = scene13.querySelector('.s13-card');
    const mapLink = document.getElementById('s13-map-link');

    if (mapLink && CONFIG.MAP_URL && !CONFIG.MAP_URL.startsWith('PASTE_')) {
      mapLink.href = CONFIG.MAP_URL;
    }

    let group1213InView = false;
    let currentProgress1213 = 0;

    const sync1213 = () => {
      const is13 = currentProgress1213 >= 0.4;
      scene12.classList.toggle('is-active', !is13);
      scene13.classList.toggle('is-active', is13);
      setLangSceneActive('s13', group1213InView && is13);
    };

    if (prefersReducedMotion) {
      gsap.set(houseWrap, { opacity: 0.28 });
      gsap.set([pill, card], { autoAlpha: 1, y: 0 });
      ScrollTrigger.create({
        trigger: group1213,
        start: 'top top',
        end: '+=160%',
        pin: true,
        onUpdate: (self) => {
          currentProgress1213 = self.progress;
          sync1213();
        },
        onToggle: (self) => {
          group1213InView = self.isActive;
          if (self.isActive) petals?.setVisible(false);
          sync1213();
        },
      });
    } else {
      const tl1213 = gsap.timeline({
        scrollTrigger: {
          trigger: group1213,
          start: 'top top',
          end: '+=160%',
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => {
            currentProgress1213 = self.progress;
            sync1213();
          },
          onToggle: (self) => {
            group1213InView = self.isActive;
            if (self.isActive) petals?.setVisible(false);
            sync1213();
          },
        },
      });

      // Hold Scene 12 alone (0 -> 0.34), then fade house back and reveal Scene 13 pill & card
      tl1213
        .to(houseWrap, { opacity: 0.28, duration: 0.22, ease: 'power1.inOut' }, 0.34)
        .fromTo(
          pill,
          { y: -18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.22, ease: 'power2.out' },
          0.38
        )
        .fromTo(
          card,
          { y: 24, autoAlpha: 0, scale: 0.97 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.26, ease: 'power2.out' },
          0.42
        )
        // Hold still at the end so user can read and tap map before scrolling to Scene 14
        .to({}, { duration: 0.32 }, 0.68);
    }
  }

  // --- SCENE 14 PETALS & LANG TOGGLE ---
  if (scene14) {
    ScrollTrigger.create({
      trigger: scene14,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (self.isActive) petals?.setVisible(true);
        setLangSceneActive('s14', self.isActive);
      },
    });
  }

  // --- SCENE 9 & SCENE 11 LANG TOGGLE VISIBILITY ---
  const group49 = document.getElementById('group-4-9');
  const scene9 = document.getElementById('scene-9');
  if (group49 && scene9) {
    let group49Active = false;
    const syncScene9Lang = () => {
      setLangSceneActive('s9', group49Active && scene9.classList.contains('is-active'));
    };

    const group49TriggerEl = group49.parentElement?.classList.contains('pin-spacer')
      ? group49.parentElement
      : group49;

    ScrollTrigger.create({
      trigger: group49TriggerEl,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        group49Active = self.isActive;
        syncScene9Lang();
      },
    });

    const obs = new MutationObserver(syncScene9Lang);
    obs.observe(scene9, { attributes: true, attributeFilter: ['class'] });
  }

  const scene11 = document.getElementById('scene-11');
  if (scene11) {
    ScrollTrigger.create({
      trigger: scene11,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        setLangSceneActive('s11', self.isActive);
      },
    });
  }
}
