import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/scenes1to3.css';

/**
 * Group [1–2]:
 * - Ambient butterfly flight & twinkling sparkles on Scene 1
 * - Scroll-scrubbed butterfly flight + sparkle burst revealing Scene 2
 * - Ambient rotating chakra halo & drifting small butterflies on Scene 2
 */
export function initScenes1to2(petals, prefersReducedMotion) {
  const group12 = document.getElementById('group-1-2');
  const scene1 = document.getElementById('scene-1');
  const scene2 = document.getElementById('scene-2');
  if (!group12 || !scene1 || !scene2) return;

  const s1Butterfly = scene1.querySelector('.s1-butterfly');
  const s1Sparkles = scene1.querySelectorAll('.s1-sparkle');
  const s2Chakra = scene2.querySelector('.s2-chakra');
  const s2Butterflies = scene2.querySelectorAll('.s2-butterfly');

  // Ambient loops (paused when Group [1–2] is off-screen)
  const ambientTweens = [];

  if (!prefersReducedMotion) {
    if (s1Butterfly) {
      ambientTweens.push(
        gsap.to(s1Butterfly, {
          y: -14,
          rotation: -3,
          duration: 2.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      );
    }

    s1Sparkles.forEach((sp, i) => {
      ambientTweens.push(
        gsap.to(sp, {
          scale: 1.14,
          opacity: 0.65,
          duration: 1.3 + i * 0.25,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      );
    });

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

    s2Butterflies.forEach((bf, i) => {
      ambientTweens.push(
        gsap.to(bf, {
          x: i % 2 === 0 ? 10 : -10,
          y: -12,
          rotation: i % 2 === 0 ? '+=6' : '-=6',
          duration: 3.2 + i * 0.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      );
    });
  }

  const setAmbientRunning = (running) => {
    ambientTweens.forEach((t) => (running ? t.play() : t.pause()));
  };

  // Initial state: Scene 1 visible, Scene 2 hidden
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
    // Simple cross-fade for reduced motion
    tl.to({}, { duration: 0.2 })
      .to(scene1, { autoAlpha: 0, duration: 0.35 }, 0.2)
      .to(scene2, { autoAlpha: 1, duration: 0.35 }, 0.25)
      .to({}, { duration: 0.45 });
  } else {
    // Hold Scene 1 briefly, then butterfly flies across & bursts into sparkles revealing Scene 2
    tl.to({}, { duration: 0.12 })
      .to(
        s1Butterfly,
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
        s1Sparkles,
        {
          scale: 1.9,
          autoAlpha: 0,
          stagger: 0.03,
          duration: 0.3,
          ease: 'power2.out',
        },
        0.22
      )
      .to(scene1, { autoAlpha: 0, duration: 0.2 }, 0.36)
      .fromTo(
        scene2,
        { autoAlpha: 0, scale: 0.96 },
        { autoAlpha: 1, scale: 1, duration: 0.28, ease: 'power1.out' },
        0.34
      )
      // Hold Scene 2 still so it can be read comfortably before unpinning
      .to({}, { duration: 0.48 });
  }
}

/**
 * Scene 3:
 * - Sequential betel-leaf date reveal scrubbed by scroll
 * - Two golden elephants at bottom with trumpeting trunk animation
 */
export function initScene3(petals, prefersReducedMotion) {
  const scene3 = document.getElementById('scene-3');
  if (!scene3) return;

  const ornament = scene3.querySelector('.s3-ornament');
  const salutation = scene3.querySelector('.s3-salutation-wrap');
  const leaves = scene3.querySelectorAll('.s3-leaf');
  const weekday = scene3.querySelector('.s3-weekday');
  const trunks = scene3.querySelectorAll('.s3-elephant__trunk');

  const trunkTweens = [];
  if (!prefersReducedMotion) {
    trunks.forEach((trunk, i) => {
      const tw = gsap.to(trunk, {
        rotation: 12,
        duration: 1.9,
        delay: i * 0.35,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      tw.pause();
      trunkTweens.push(tw);
    });
  }

  ScrollTrigger.create({
    trigger: scene3,
    start: 'top 50%',
    end: 'bottom 50%',
    onToggle: (self) => {
      if (self.isActive) petals?.setVisible(true);
      trunkTweens.forEach((t) => (self.isActive ? t.play() : t.pause()));
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
