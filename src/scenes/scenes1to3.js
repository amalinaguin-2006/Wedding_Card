import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/scenes1to3.css';

/**
 * Create individual twinkling star elements from the cropped sparkle.png sprites.
 * Places 4 groups closer around the butterfly + 5 extra small stars in varied sizes.
 */
function buildSparkleStars(container) {
  if (!container) return [];

  // Positions carefully placed around the butterfly (center-right) without covering it
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
  ];

  return starSpecs.map((spec) => {
    const img = document.createElement('img');
    img.src = `/assets/sparkles/star-${spec.sprite}.webp`;
    img.alt = '';
    img.className = 's1-star';
    img.style.left = spec.left;
    img.style.top = spec.top;
    img.style.width = spec.size;
    container.appendChild(img);
    return img;
  });
}

/**
 * Natural 2-frame wing flap (open <-> closed with short blend + slight horizontal squeeze at joint 34% 65%).
 */
function createWingFlapTween(wingsEl, openImg, closedImg, flapHalfDur = 0.24, delay = 0) {
  const tl = gsap.timeline({ repeat: -1, delay });
  tl.to(openImg, { opacity: 0.12, duration: flapHalfDur * 0.55, ease: 'sine.in' }, 0)
    .to(closedImg, { opacity: 1, duration: flapHalfDur * 0.55, ease: 'sine.in' }, 0)
    .to(wingsEl, { scaleX: 0.88, duration: flapHalfDur, ease: 'sine.inOut' }, 0)
    .to(openImg, { opacity: 1, duration: flapHalfDur * 0.65, ease: 'sine.out' }, flapHalfDur)
    .to(closedImg, { opacity: 0, duration: flapHalfDur * 0.65, ease: 'sine.out' }, flapHalfDur)
    .to(wingsEl, { scaleX: 1, duration: flapHalfDur, ease: 'sine.inOut' }, flapHalfDur);
  return tl;
}

/**
 * Group [1–2]:
 * - Scene 1: 2-frame flapping butterfly along curved path + independent twinkling stars
 * - Scroll: butterfly flies across & stars burst to reveal Scene 2
 * - Scene 2: Brahma (no old halo) + single rotating chakra centered on middle face + 5 varied butterflies
 */
export function initScenes1to2(petals, prefersReducedMotion) {
  const group12 = document.getElementById('group-1-2');
  const scene1 = document.getElementById('scene-1');
  const scene2 = document.getElementById('scene-2');
  if (!group12 || !scene1 || !scene2) return;

  const sparklesContainer = scene1.querySelector('.s1-sparkles');
  const s1Stars = buildSparkleStars(sparklesContainer);

  const s1Wrap = scene1.querySelector('.s1-butterfly-wrap');
  const s1Flip = scene1.querySelector('.s1-butterfly__flip');
  const s1Wings = scene1.querySelector('.s1-butterfly__wings');
  const s1Open = scene1.querySelector('.s1-butterfly__img--open');
  const s1Closed = scene1.querySelector('.s1-butterfly__img--closed');

  const s2Chakra = scene2.querySelector('.s2-chakra');
  const s2Butterflies = scene2.querySelectorAll('.s2-butterfly');

  const ambientTweens = [];

  if (!prefersReducedMotion) {
    // Main butterfly: natural 2-frame flap + curved flight path (mirroring when moving right)
    if (s1Wings && s1Open && s1Closed) {
      ambientTweens.push(createWingFlapTween(s1Wings, s1Open, s1Closed, 0.28, 0));
    }
    if (s1Wrap && s1Flip) {
      // Curved gentle hover/flight: glides left-up, arcs back right-down (mirrors right on return)
      const flightTl = gsap.timeline({ repeat: -1 });
      flightTl
        .to(s1Wrap, {
          x: '-=18',
          y: -16,
          rotation: -5,
          duration: 2.2,
          ease: 'sine.inOut',
        })
        .to(s1Flip, { scaleX: -1, duration: 0.25, ease: 'power1.inOut' }, 2.1)
        .to(s1Wrap, {
          x: '+=24',
          y: -6,
          rotation: 4,
          duration: 2.1,
          ease: 'sine.inOut',
        })
        .to(s1Flip, { scaleX: 1, duration: 0.25, ease: 'power1.inOut' }, 4.2)
        .to(s1Wrap, {
          x: '-=6',
          y: 0,
          rotation: 0,
          duration: 1.5,
          ease: 'sine.inOut',
        });
      ambientTweens.push(flightTl);
    }

    // Every individual star twinkles with its own random delay and duration (1.2–3.0s)
    s1Stars.forEach((star) => {
      const dur = gsap.utils.random(1.2, 3.0);
      const delay = gsap.utils.random(0, 2.6);
      const minScale = gsap.utils.random(0.65, 0.82);
      const maxScale = gsap.utils.random(1.08, 1.28);
      const minOp = gsap.utils.random(0.25, 0.45);
      ambientTweens.push(
        gsap.fromTo(
          star,
          { scale: minScale, opacity: minOp },
          {
            scale: maxScale,
            opacity: 1,
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

    // Scene 2 small butterflies: varied sizes, drift speeds, and flap timings
    const s2Configs = [
      { dx: 14, dy: -14, rot: 7, driftDur: 3.1, flapHalf: 0.22, delay: 0.0 },
      { dx: -12, dy: -16, rot: -6, driftDur: 3.8, flapHalf: 0.27, delay: 0.3 },
      { dx: 10, dy: -11, rot: 5, driftDur: 2.7, flapHalf: 0.19, delay: 0.7 },
      { dx: 15, dy: -13, rot: 8, driftDur: 4.1, flapHalf: 0.25, delay: 0.4 },
      { dx: -16, dy: -15, rot: -7, driftDur: 3.4, flapHalf: 0.30, delay: 0.15 },
    ];
    s2Butterflies.forEach((bf, i) => {
      const cfg = s2Configs[i % s2Configs.length];
      const wings = bf.querySelector('.s2-butterfly__wings');
      const openImg = bf.querySelector('.s2-butterfly__img--open');
      const closedImg = bf.querySelector('.s2-butterfly__img--closed');

      ambientTweens.push(
        gsap.to(bf, {
          x: cfg.dx,
          y: cfg.dy,
          rotation: cfg.rot,
          duration: cfg.driftDur,
          delay: cfg.delay,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      );

      if (wings && openImg && closedImg) {
        ambientTweens.push(createWingFlapTween(wings, openImg, closedImg, cfg.flapHalf, cfg.delay));
      }
    });
  }

  const setAmbientRunning = (running) => {
    ambientTweens.forEach((t) => (running ? t.play() : t.pause()));
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
    tl.to({}, { duration: 0.12 })
      .to(
        s1Wrap,
        {
          x: '-38vw',
          y: '-28vh',
          scale: 0.45,
          rotation: -18,
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
          stagger: 0.015,
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
 * - Two-frame elephants (elephant-1 -> quick cross-fade to elephant-2 with slight upward tilt -> hold -> return)
 */
export function initScene3(petals, prefersReducedMotion) {
  const scene3 = document.getElementById('scene-3');
  if (!scene3) return;

  const ornament = scene3.querySelector('.s3-ornament');
  const salutation = scene3.querySelector('.s3-salutation-wrap');
  const leaves = scene3.querySelectorAll('.s3-leaf');
  const weekday = scene3.querySelector('.s3-weekday');
  const elephants = scene3.querySelectorAll('.s3-elephant');

  const elephantTweens = [];
  if (!prefersReducedMotion) {
    elephants.forEach((el, i) => {
      const tilt = el.querySelector('.s3-elephant__tilt');
      const f1 = el.querySelector('.s3-elephant__frame--1');
      const f2 = el.querySelector('.s3-elephant__frame--2');
      if (!tilt || !f1 || !f2) return;

      const loop = gsap.timeline({
        repeat: -1,
        delay: i === 1 ? 1.15 : 0, // slight timing offset for the mirrored side
      });

      // Frame 1 for 1.8s -> 0.15s cross-fade to frame 2 + slight upward tilt -> hold 0.8s -> 0.15s return
      loop
        .to({}, { duration: 1.8 })
        .to(f1, { opacity: 0, duration: 0.15, ease: 'none' }, 1.8)
        .to(f2, { opacity: 1, duration: 0.15, ease: 'none' }, 1.8)
        .to(tilt, { rotation: 2.5, duration: 0.18, ease: 'sine.out' }, 1.8)
        .to({}, { duration: 0.8 })
        .to(f1, { opacity: 1, duration: 0.15, ease: 'none' }, 2.75)
        .to(f2, { opacity: 0, duration: 0.15, ease: 'none' }, 2.75)
        .to(tilt, { rotation: 0, duration: 0.2, ease: 'sine.inOut' }, 2.75);

      loop.pause();
      elephantTweens.push(loop);
    });
  }

  ScrollTrigger.create({
    trigger: scene3,
    start: 'top 50%',
    end: 'bottom 50%',
    onToggle: (self) => {
      if (self.isActive) petals?.setVisible(true);
      elephantTweens.forEach((t) => (self.isActive ? t.play() : t.pause()));
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
