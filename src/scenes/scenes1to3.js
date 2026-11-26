import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/scenes1to3.css';

/**
 * Create individual twinkling star elements from the cropped sparkle.png sprites.
 * - Core stars: 4 closer groups around the butterfly + 5 extra small stars (mobile & desktop)
 * - Desktop-only stars (>=1024px): 12 on the left outer 25% + 12 on the right outer 25%, top to bottom
 */
function buildSparkleStars(container) {
  if (!container) return [];

  const starSpecs = [
    // Upper-right cluster (closer to butterfly)
    { left: '66%', top: '14%', size: 'clamp(46px, 12vw, 74px)', sprite: 1 },
    { left: '57%', top: '12%', size: 'clamp(16px, 4.2vw, 26px)', sprite: 2 },
    { left: '78%', top: '11%', size: 'clamp(22px, 5.5vw, 34px)', sprite: 3 },
    { left: '61%', top: '24%', size: 'clamp(14px, 3.8vw, 22px)', sprite: 4 },
    { left: '84%', top: '18%', size: 'clamp(11px, 3vw, 17px)', sprite: 5 },

    // Upper-left cluster (closer to butterfly)
    { left: '20%', top: '18%', size: 'clamp(26px, 6.8vw, 42px)', sprite: 1 },
    { left: '16%', top: '15%', size: 'clamp(11px, 2.8vw, 16px)', sprite: 3 },
    { left: '27%', top: '16%', size: 'clamp(13px, 3.3vw, 20px)', sprite: 2 },

    // Mid-left cluster (near wing/antennae)
    { left: '22%', top: '37%', size: 'clamp(22px, 5.8vw, 36px)', sprite: 2 },
    { left: '18%', top: '42%', size: 'clamp(10px, 2.6vw, 15px)', sprite: 4 },
    { left: '28%', top: '34%', size: 'clamp(11px, 2.8vw, 16px)', sprite: 6 },

    // Lower-left cluster
    { left: '19%', top: '76%', size: 'clamp(38px, 10vw, 60px)', sprite: 1 },
    { left: '14%', top: '72%', size: 'clamp(14px, 3.5vw, 22px)', sprite: 3 },
    { left: '28%', top: '74%', size: 'clamp(18px, 4.5vw, 28px)', sprite: 2 },
    { left: '16%', top: '83%', size: 'clamp(12px, 3vw, 18px)', sprite: 4 },

    // 5 extra small stars around the butterfly (not covering butterfly)
    { left: '42%', top: '23%', size: 'clamp(12px, 3.2vw, 19px)', sprite: 5 },
    { left: '83%', top: '39%', size: 'clamp(13px, 3.4vw, 21px)', sprite: 3 },
    { left: '84%', top: '69%', size: 'clamp(15px, 3.8vw, 24px)', sprite: 4 },
    { left: '44%', top: '79%', size: 'clamp(11px, 2.9vw, 18px)', sprite: 6 },
    { left: '34%', top: '65%', size: 'clamp(13px, 3.4vw, 20px)', sprite: 5 },

    // Desktop-only (>=1024px): 12 stars in outer-left 25% (top to bottom)
    { left: '4%',  top: '8%',  size: '34px', sprite: 1, desktop: true },
    { left: '14%', top: '12%', size: '18px', sprite: 3, desktop: true },
    { left: '8%',  top: '22%', size: '24px', sprite: 2, desktop: true },
    { left: '21%', top: '27%', size: '14px', sprite: 5, desktop: true },
    { left: '5%',  top: '38%', size: '42px', sprite: 1, desktop: true },
    { left: '16%', top: '46%', size: '20px', sprite: 4, desktop: true },
    { left: '9%',  top: '55%', size: '15px', sprite: 6, desktop: true },
    { left: '22%', top: '60%', size: '28px', sprite: 2, desktop: true },
    { left: '4%',  top: '68%', size: '22px', sprite: 3, desktop: true },
    { left: '13%', top: '78%', size: '36px', sprite: 1, desktop: true },
    { left: '7%',  top: '87%', size: '16px', sprite: 4, desktop: true },
    { left: '19%', top: '91%', size: '24px', sprite: 5, desktop: true },

    // Desktop-only (>=1024px): 12 stars in outer-right 25% (top to bottom)
    { left: '92%', top: '7%',  size: '28px', sprite: 2, desktop: true },
    { left: '81%', top: '15%', size: '16px', sprite: 4, desktop: true },
    { left: '88%', top: '24%', size: '40px', sprite: 1, desktop: true },
    { left: '78%', top: '31%', size: '18px', sprite: 5, desktop: true },
    { left: '94%', top: '39%', size: '22px', sprite: 3, desktop: true },
    { left: '84%', top: '48%', size: '34px', sprite: 1, desktop: true },
    { left: '91%', top: '57%', size: '15px', sprite: 6, desktop: true },
    { left: '79%', top: '64%', size: '26px', sprite: 2, desktop: true },
    { left: '93%', top: '72%', size: '38px', sprite: 1, desktop: true },
    { left: '85%', top: '81%', size: '19px', sprite: 3, desktop: true },
    { left: '77%', top: '88%', size: '14px', sprite: 4, desktop: true },
    { left: '90%', top: '92%', size: '24px', sprite: 5, desktop: true },
  ];

  return starSpecs.map((spec) => {
    const img = document.createElement('img');
    img.src = `/assets/sparkles/star-${spec.sprite}.webp`;
    img.alt = '';
    img.className = spec.desktop ? 's1-star s1-star--desktop' : 's1-star';
    img.style.left = spec.left;
    img.style.top = spec.top;
    img.style.width = spec.size;
    container.appendChild(img);
    return img;
  });
}

/**
 * Crisp 2-frame wing flap: very short blend (0.045s) to avoid faded double-wing ghosting,
 * paired with a subtle horizontal squeeze around the body joint (34% 65%).
 */
function createWingFlapTween(wingsEl, openImg, closedImg, flapHalfDur = 0.25, delay = 0) {
  const blend = 0.045;
  const tl = gsap.timeline({ repeat: -1, delay });
  tl.to(openImg, { opacity: 0, duration: blend, ease: 'none' }, flapHalfDur * 0.45)
    .to(closedImg, { opacity: 1, duration: blend, ease: 'none' }, flapHalfDur * 0.45)
    .to(wingsEl, { scaleX: 0.90, duration: flapHalfDur, ease: 'sine.inOut' }, 0)
    .to(openImg, { opacity: 1, duration: blend, ease: 'none' }, flapHalfDur * 1.45)
    .to(closedImg, { opacity: 0, duration: blend, ease: 'none' }, flapHalfDur * 1.45)
    .to(wingsEl, { scaleX: 1, duration: flapHalfDur, ease: 'sine.inOut' }, flapHalfDur);
  return tl;
}

/**
 * Continuous off-screen-to-off-screen crossing butterflies for Scene 2.
 * - 6 on desktop (>=1024px), 4 on mobile (<1024px)
 * - Mixes left->right (mirrored) and right->left (default)
 * - Some start already mid-screen so Scene 2 has butterflies immediately on entry
 * - Re-enters with new height, size, and speed (10-18s) after leaving screen
 */
function initScene2Butterflies(container, prefersReducedMotion) {
  if (!container || prefersReducedMotion) return { setRunning: () => {} };

  const isDesktop = window.innerWidth >= 1024;
  const count = isDesktop ? 6 : 4;
  const activeTweens = new Set();
  let isRunning = false;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 's2-butterfly';

    const flip = document.createElement('div');
    flip.className = 's2-butterfly__flip';

    const wings = document.createElement('div');
    wings.className = 's2-butterfly__wings';

    const openImg = document.createElement('img');
    openImg.src = '/assets/butterfly-open.webp';
    openImg.alt = '';
    openImg.className = 's2-butterfly__img s2-butterfly__img--open';

    const closedImg = document.createElement('img');
    closedImg.src = '/assets/butterfly-closed.webp';
    closedImg.alt = '';
    closedImg.className = 's2-butterfly__img s2-butterfly__img--closed';

    wings.append(openImg, closedImg);
    flip.appendChild(wings);
    el.appendChild(flip);
    container.appendChild(el);

    // Distinct flap timing per butterfly
    const flapHalf = gsap.utils.random(0.19, 0.30);
    const flapTween = createWingFlapTween(wings, openImg, closedImg, flapHalf, i * 0.14);
    flapTween.pause();
    activeTweens.add(flapTween);

    // Gentle vertical wave + slight tilt (independent of horizontal crossing)
    const waveTween = gsap.to(wings, {
      y: gsap.utils.random(-18, -10),
      rotation: gsap.utils.random(-5, 5),
      duration: gsap.utils.random(2.4, 3.6),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    waveTween.pause();
    activeTweens.add(waveTween);

    let passTween = null;
    const launchPass = (initialProgress = 0, initialDelay = 0) => {
      if (passTween) {
        activeTweens.delete(passTween);
        passTween.kill();
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const size = isDesktop ? gsap.utils.random(42, 86) : gsap.utils.random(30, 62);
      const goRight = i % 2 === 0 ? Math.random() < 0.75 : Math.random() < 0.25;
      const duration = gsap.utils.random(10, 18);
      const startY = gsap.utils.random(vh * 0.10, vh * 0.80);
      const endY = gsap.utils.clamp(vh * 0.08, vh * 0.84, startY + gsap.utils.random(-vh * 0.16, vh * 0.16));
      const pad = size + 40;
      const startX = goRight ? -pad : vw + pad;
      const endX = goRight ? vw + pad : -pad;

      el.style.width = `${Math.round(size)}px`;
      // Mirror only while off-screen before the pass begins
      gsap.set(flip, { scaleX: goRight ? -1 : 1 });
      gsap.set(el, {
        x: startX,
        y: startY,
        rotation: goRight ? 6 : -6,
      });

      passTween = gsap.to(el, {
        x: endX,
        y: endY,
        duration,
        delay: initialDelay,
        ease: 'none',
        onComplete: () => launchPass(0, gsap.utils.random(0.2, 1.5)),
      });

      if (initialProgress > 0) {
        passTween.progress(initialProgress);
      }

      if (!isRunning) {
        passTween.pause();
      }
      activeTweens.add(passTween);
    };

    // Stagger: first 3 (or 4 on desktop) are already mid-screen when Scene 2 appears
    const initialProgresses = isDesktop
      ? [0.22, 0.48, 0.74, 0.35, 0, 0]
      : [0.25, 0.58, 0.80, 0];
    const initProg = initialProgresses[i] ?? 0;
    const initDelay = initProg > 0 ? 0 : gsap.utils.random(0.8, 3.2);
    launchPass(initProg, initDelay);
  }

  return {
    setRunning: (running) => {
      isRunning = running;
      activeTweens.forEach((tw) => (running ? tw.play() : tw.pause()));
    },
  };
}

/**
 * Group [1–2]:
 * - Scene 1: Butterfly always faces left, flaps & floats gently in place; on scroll flies upper-left & bursts
 * - Scene 2: Brahma (100% opacity) + single softened chakra (45% opacity) + 5 wandering butterflies
 */
export function initScenes1to2(petals, prefersReducedMotion) {
  const group12 = document.getElementById('group-1-2');
  const scene1 = document.getElementById('scene-1');
  const scene2 = document.getElementById('scene-2');
  if (!group12 || !scene1 || !scene2) return;

  const sparklesContainer = scene1.querySelector('.s1-sparkles');
  const s1Stars = buildSparkleStars(sparklesContainer);

  const s1Wrap = scene1.querySelector('.s1-butterfly-wrap');
  const s1Wings = scene1.querySelector('.s1-butterfly__wings');
  const s1Open = scene1.querySelector('.s1-butterfly__img--open');
  const s1Closed = scene1.querySelector('.s1-butterfly__img--closed');

  const s2Chakra = scene2.querySelector('.s2-chakra');
  const s2ButterfliesWrap = scene2.querySelector('.s2-butterflies');
  const s2ButterflyCtrl = initScene2Butterflies(s2ButterfliesWrap, prefersReducedMotion);

  const ambientTweens = [];

  if (!prefersReducedMotion) {
    // Scene 1 butterfly: ALWAYS faces left, gentle in-place float & small tilt + crisp 2-frame flap
    if (s1Wings && s1Open && s1Closed) {
      ambientTweens.push(createWingFlapTween(s1Wings, s1Open, s1Closed, 0.26, 0));
    }
    if (s1Wrap) {
      ambientTweens.push(
        gsap.to(s1Wrap, {
          y: -14,
          rotation: -3,
          duration: 2.6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      );
    }

    // Every individual star twinkles independently (1.2–3.0s, random delay, varied opacity)
    s1Stars.forEach((star) => {
      const dur = gsap.utils.random(1.2, 3.0);
      const delay = gsap.utils.random(0, 2.8);
      const minScale = gsap.utils.random(0.65, 0.84);
      const maxScale = gsap.utils.random(1.06, 1.24);
      const minOp = gsap.utils.random(0.18, 0.42);
      const maxOp = gsap.utils.random(0.75, 1.0);
      ambientTweens.push(
        gsap.fromTo(
          star,
          { scale: minScale, opacity: minOp },
          {
            scale: maxScale,
            opacity: maxOp,
            duration: dur,
            delay,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          }
        )
      );
    });

    // Single chakra rotating slowly around its own centre
    if (s2Chakra) {
      ambientTweens.push(
        gsap.to(s2Chakra, {
          rotation: 360,
          duration: 32,
          ease: 'none',
          repeat: -1,
        })
      );
    }
  }

  const setAmbientRunning = (running) => {
    ambientTweens.forEach((t) => (running ? t.play() : t.pause()));
    s2ButterflyCtrl.setRunning(running);
  };

  gsap.set(scene1, { autoAlpha: 1 });
  gsap.set(scene2, { autoAlpha: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: group12,
      start: 'top top',
      end: '+=220%',
      pin: true,
      scrub: 0.6,
      onToggle: (self) => {
        setAmbientRunning(self.isActive);
        if (self.isActive) petals?.setVisible(false);
      },
      onUpdate: (self) => {
        const show2 = self.progress >= 0.45;
        scene1.classList.toggle('is-active', !show2);
        scene2.classList.toggle('is-active', show2);
      },
    },
  });

  if (prefersReducedMotion) {
    tl.to({}, { duration: 0.2 })
      .to(scene1, { autoAlpha: 0, duration: 0.35 }, 0.2)
      .to(scene2, { autoAlpha: 1, duration: 0.35 }, 0.25)
      .to({}, { duration: 0.45 });
  } else {
    // On scroll, butterfly flies toward upper-left while facing left, then bursts into sparkles
    tl.to({}, { duration: 0.12 })
      .to(
        s1Wrap,
        {
          x: '-36vw',
          y: '-28vh',
          scale: 0.45,
          rotation: -14,
          autoAlpha: 0,
          duration: 0.32,
          ease: 'power2.inOut',
        },
        0.12
      )
      .to(
        s1Stars,
        {
          scale: 1.9,
          autoAlpha: 0,
          stagger: 0.01,
          duration: 0.3,
          ease: 'power2.out',
        },
        0.2
      )
      .to(scene1, { autoAlpha: 0, duration: 0.2 }, 0.36)
      .fromTo(
        scene2,
        { autoAlpha: 0, scale: 0.96 },
        { autoAlpha: 1, scale: 1, duration: 0.28, ease: 'power1.out' },
        0.34
      )
      .to({}, { duration: 0.48 });
  }
}

/**
 * Scene 3:
 * - Sequential betel-leaf date reveal scrubbed by scroll
 * - Both elephants driven by ONE shared timeline (no delay or offset)
 */
export function initScene3(petals, prefersReducedMotion) {
  const scene3 = document.getElementById('scene-3');
  if (!scene3) return;

  const ornament = scene3.querySelector('.s3-ornament');
  const salutation = scene3.querySelector('.s3-salutation-wrap');
  const leaves = scene3.querySelectorAll('.s3-leaf');
  const weekday = scene3.querySelector('.s3-weekday');

  const tilts = scene3.querySelectorAll('.s3-elephant__tilt');
  const f1All = scene3.querySelectorAll('.s3-elephant__frame--1');
  const f2All = scene3.querySelectorAll('.s3-elephant__frame--2');

  let sharedElephantLoop = null;
  if (!prefersReducedMotion && tilts.length && f1All.length && f2All.length) {
    sharedElephantLoop = gsap.timeline({ repeat: -1 });
    sharedElephantLoop
      .to({}, { duration: 1.8 })
      .to(f1All, { opacity: 0, duration: 0.15, ease: 'none' }, 1.8)
      .to(f2All, { opacity: 1, duration: 0.15, ease: 'none' }, 1.8)
      .to(tilts, { rotation: 2.5, duration: 0.18, ease: 'sine.out' }, 1.8)
      .to({}, { duration: 0.8 })
      .to(f1All, { opacity: 1, duration: 0.15, ease: 'none' }, 2.75)
      .to(f2All, { opacity: 0, duration: 0.15, ease: 'none' }, 2.75)
      .to(tilts, { rotation: 0, duration: 0.2, ease: 'sine.inOut' }, 2.75);
    sharedElephantLoop.pause();
  }

  ScrollTrigger.create({
    trigger: scene3,
    start: 'top 50%',
    end: 'bottom 50%',
    onToggle: (self) => {
      if (self.isActive) petals?.setVisible(true);
      if (sharedElephantLoop) {
        self.isActive ? sharedElephantLoop.play() : sharedElephantLoop.pause();
      }
    },
  });

  if (prefersReducedMotion) {
    gsap.from([ornament, salutation, leaves, weekday], {
      autoAlpha: 0,
      duration: 0.4,
      scrollTrigger: {
        trigger: scene3,
        start: 'top 75%',
        end: 'top 35%',
        scrub: true,
      },
    });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene3,
      start: 'top 80%',
      end: 'center center',
      scrub: 0.6,
    },
  });

  tl.from(ornament, { autoAlpha: 0, y: -18, duration: 0.18 })
    .from(salutation, { autoAlpha: 0, y: 16, duration: 0.18 }, 0.08)
    .from(
      leaves,
      {
        autoAlpha: 0,
        scale: 0.72,
        y: 18,
        stagger: 0.1,
        duration: 0.22,
        ease: 'back.out(1.4)',
      },
      0.2
    )
    .from(weekday, { autoAlpha: 0, y: 18, scale: 0.92, duration: 0.2 }, 0.72);
}
