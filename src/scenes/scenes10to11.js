import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/scenes10to11.css';

/**
 * Scenes 10 & 11:
 * - Scene 10: Motorbike entry from left, stops in position, then text reveals (no petals, no language toggle)
 * - Scene 11: Heading, then two 90°-rotated paper scrolls unrolling sequentially from center outward (petals active)
 */
export function initScenes10to11(petals, prefersReducedMotion) {
  const scene10 = document.getElementById('scene-10');
  const scene11 = document.getElementById('scene-11');

  // --- SCENE 10 ---
  if (scene10) {
    const groomWrap = scene10.querySelector('.s10-groom-wrap');
    const titleBlock = scene10.querySelector('.s10-title-block');
    const detailsBlock = scene10.querySelector('.s10-details-block');

    ScrollTrigger.create({
      trigger: scene10,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (self.isActive) petals?.setVisible(false);
      },
    });

    if (prefersReducedMotion) {
      gsap.from([groomWrap, titleBlock, detailsBlock], {
        autoAlpha: 0,
        duration: 0.4,
        scrollTrigger: {
          trigger: scene10,
          start: 'top 75%',
          end: 'top 35%',
          scrub: true,
        },
      });
    } else {
      const tl10 = gsap.timeline({
        scrollTrigger: {
          trigger: scene10,
          start: 'top 80%',
          end: 'center center',
          scrub: 0.6,
        },
      });

      tl10
        .from(groomWrap, { x: '-90vw', duration: 0.55, ease: 'power2.out' }, 0)
        .from(titleBlock, { y: 16, autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, 0.48)
        .from(detailsBlock, { y: 16, autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, 0.62);
    }
  }

  // --- SCENE 11 ---
  if (scene11) {
    const heading = scene11.querySelector('.s11-heading');
    const paper1 = scene11.querySelector('.s11-scroll--1 .s11-scroll__paper-clip');
    const content1 = scene11.querySelector('.s11-scroll--1 .s11-scroll__content');
    const paper2 = scene11.querySelector('.s11-scroll--2 .s11-scroll__paper-clip');
    const content2 = scene11.querySelector('.s11-scroll--2 .s11-scroll__content');

    ScrollTrigger.create({
      trigger: scene11,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (self.isActive) petals?.setVisible(true);
      },
    });

    if (prefersReducedMotion) {
      gsap.from([heading, scene11.querySelectorAll('.s11-scroll')], {
        autoAlpha: 0,
        duration: 0.4,
        scrollTrigger: {
          trigger: scene11,
          start: 'top 75%',
          end: 'top 35%',
          scrub: true,
        },
      });
    } else {
      const tl11 = gsap.timeline({
        scrollTrigger: {
          trigger: scene11,
          start: 'top 80%',
          end: 'center center',
          scrub: 0.6,
        },
      });

      tl11
        .from(heading, { y: -14, autoAlpha: 0, duration: 0.18 }, 0)
        // Scroll 1 unrolls from center outward
        .fromTo(
          paper1,
          { clipPath: 'inset(0 44% 0 44%)' },
          { clipPath: 'inset(0 0% 0 0%)', duration: 0.38, ease: 'power2.out' },
          0.14
        )
        .fromTo(
          content1,
          { clipPath: 'inset(0 50% 0 50%)' },
          { clipPath: 'inset(0 0% 0 0%)', duration: 0.36, ease: 'power2.out' },
          0.16
        )
        // Scroll 2 unrolls from center outward
        .fromTo(
          paper2,
          { clipPath: 'inset(0 44% 0 44%)' },
          { clipPath: 'inset(0 0% 0 0%)', duration: 0.38, ease: 'power2.out' },
          0.54
        )
        .fromTo(
          content2,
          { clipPath: 'inset(0 50% 0 50%)' },
          { clipPath: 'inset(0 0% 0 0%)', duration: 0.36, ease: 'power2.out' },
          0.56
        );
    }
  }
}
