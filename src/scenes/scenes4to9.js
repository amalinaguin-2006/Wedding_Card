import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/scenes4to6.css';

/**
 * Pinned Group [4–9]:
 * - Phase 3 implements Scenes 4, 5, and 6
 * - Scenes 7, 8, and 9 remain placeholders until Phase 4
 */
export function initScenes4to9(petals, prefersReducedMotion) {
  const group49 = document.getElementById('group-4-9');
  if (!group49) return;

  const scene4 = document.getElementById('scene-4');
  const scene5 = document.getElementById('scene-5');
  const scene6 = document.getElementById('scene-6');
  const scene7 = document.getElementById('scene-7');
  const scene8 = document.getElementById('scene-8');
  const scene9 = document.getElementById('scene-9');
  const familyCorner = group49.querySelector('.s56-family-groom');

  const allScenes = [scene4, scene5, scene6, scene7, scene8, scene9];
  const activateScene = (num) => {
    allScenes.forEach((el) => {
      if (!el) return;
      el.classList.toggle('is-active', Number(el.dataset.scene) === num);
    });
  };

  // Start with Scene 4 visible when group enters, others hidden
  gsap.set([scene5, scene6, scene7, scene8, scene9], { autoAlpha: 0 });
  gsap.set(scene4, { autoAlpha: 1 });
  gsap.set(familyCorner, { autoAlpha: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: group49,
      start: 'top top',
      end: '+=640%',
      pin: true,
      scrub: 0.6,
      onToggle: (self) => {
        if (self.isActive) petals?.setVisible(true);
      },
      onUpdate: (self) => {
        const p = self.progress;
        let active = 4;
        if (p >= 0.84) active = 9;
        else if (p >= 0.68) active = 8;
        else if (p >= 0.52) active = 7;
        else if (p >= 0.34) active = 6;
        else if (p >= 0.17) active = 5;
        activateScene(active);
      },
    },
  });

  // Scene 4 elements
  const s4Father = scene4.querySelector('.s4-father .parent-img');
  const s4FatherName = scene4.querySelector('.s4-father-name');
  const s4And = scene4.querySelector('.s4-and');
  const s4Mother = scene4.querySelector('.s4-mother .parent-img');
  const s4MotherName = scene4.querySelector('.s4-mother-name');
  const s4Role = scene4.querySelector('.s4-role');

  // Scene 5 elements
  const s5Groom = scene5.querySelector('.s5-groom-frame');
  const s5Name = scene5.querySelector('.s5-groom-name');
  const s5Suffix = scene5.querySelector('.s5-suffix');

  // Scene 6 elements
  const s6Father = scene6.querySelector('.s6-father .parent-img');
  const s6FatherName = scene6.querySelector('.s6-father-name');
  const s6And = scene6.querySelector('.s6-and');
  const s6Mother = scene6.querySelector('.s6-mother .parent-img');
  const s6MotherName = scene6.querySelector('.s6-mother-name');
  const s6Only = scene6.querySelector('.s6-only');
  const s6Role = scene6.querySelector('.s6-role');

  // Compute upper-left target position for familyCorner (relative to center of pinned-stage)
  const getCornerTarget = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isDesktop = vw >= 1024;
    const targetScale = isDesktop ? 0.52 : 0.48;
    const xOffset = isDesktop ? -vw * 0.36 : -vw * 0.24;
    const yOffset = isDesktop ? -vh * 0.34 : -vh * 0.415;
    return { x: xOffset, y: yOffset, scale: targetScale };
  };

  if (prefersReducedMotion) {
    // Simple cross-fades for reduced motion
    tl.to({}, { duration: 1.0 })
      .to(scene4, { autoAlpha: 0, duration: 0.2 }, 1.0)
      .to(scene5, { autoAlpha: 1, duration: 0.2 }, 1.1)
      .to({}, { duration: 1.0 })
      .to(scene5, { autoAlpha: 0, duration: 0.2 }, 2.2)
      .to(scene6, { autoAlpha: 1, duration: 0.2 }, 2.3)
      .to({}, { duration: 1.0 })
      .to(scene6, { autoAlpha: 0, duration: 0.2 }, 3.4)
      .to(scene7, { autoAlpha: 1, duration: 0.2 }, 3.5)
      .to({}, { duration: 0.8 })
      .to(scene7, { autoAlpha: 0, duration: 0.2 }, 4.4)
      .to(scene8, { autoAlpha: 1, duration: 0.2 }, 4.5)
      .to({}, { duration: 0.8 })
      .to(scene8, { autoAlpha: 0, duration: 0.2 }, 5.4)
      .to(scene9, { autoAlpha: 1, duration: 0.2 }, 5.5)
      .to({}, { duration: 0.8 });
    return;
  }

  // --- SCENE 4 (0.0 -> 1.7) ---
  tl.from(s4Father, { x: -70, autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, 0.02)
    .from(s4FatherName, { y: 12, autoAlpha: 0, duration: 0.18 }, 0.18)
    .from(s4And, { scale: 0.8, autoAlpha: 0, duration: 0.16 }, 0.30)
    .from(s4Mother, { x: 70, autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, 0.40)
    .from(s4MotherName, { y: 12, autoAlpha: 0, duration: 0.18 }, 0.54)
    .from(s4Role, { y: 16, scale: 0.92, autoAlpha: 0, duration: 0.2 }, 0.68)
    // Hold Scene 4
    .to({}, { duration: 0.55 }, 0.88)
    .to(scene4, { autoAlpha: 0, duration: 0.2 }, 1.45);

  // --- SCENE 5 (1.6 -> 3.3) ---
  const corner = getCornerTarget();
  tl.set(scene5, { autoAlpha: 1 }, 1.58)
    .from(s5Groom, { scale: 0.7, autoAlpha: 0, duration: 0.35, ease: 'power2.out' }, 1.62)
    .from(s5Name, { y: 16, autoAlpha: 0, duration: 0.22 }, 1.92)
    .from(s5Suffix, { y: 12, autoAlpha: 0, duration: 0.18 }, 2.10)
    // Hold Scene 5 groom & name
    .to({}, { duration: 0.35 }, 2.28)
    // Fade out groom text/portrait while family picture appears and shrinks to upper-left
    .to([s5Groom, s5Name, s5Suffix], { autoAlpha: 0, duration: 0.2 }, 2.65)
    .fromTo(
      familyCorner,
      { autoAlpha: 0, scale: 0.85, x: 0, y: 0, filter: 'blur(0px)' },
      { autoAlpha: 1, scale: 1, x: 0, y: 0, filter: 'blur(0px)', duration: 0.25, ease: 'power2.out' },
      2.72
    )
    .to(
      familyCorner,
      {
        x: corner.x,
        y: corner.y,
        scale: corner.scale,
        opacity: 0.58,
        filter: 'blur(1.2px)',
        duration: 0.38,
        ease: 'power2.inOut',
      },
      3.02
    )
    .to(scene5, { autoAlpha: 0, duration: 0.1 }, 3.25);

  // --- SCENE 6 (3.3 -> 5.1) ---
  tl.set(scene6, { autoAlpha: 1 }, 3.35)
    .from(s6Father, { x: -70, autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, 3.40)
    .from(s6FatherName, { y: 12, autoAlpha: 0, duration: 0.18 }, 3.56)
    .from(s6And, { scale: 0.8, autoAlpha: 0, duration: 0.16 }, 3.68)
    .from(s6Mother, { x: 70, autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, 3.78)
    .from(s6MotherName, { y: 12, autoAlpha: 0, duration: 0.18 }, 3.92)
    .from(s6Only, { y: 12, autoAlpha: 0, duration: 0.16 }, 4.06)
    .from(s6Role, { y: 16, scale: 0.92, autoAlpha: 0, duration: 0.2 }, 4.20)
    // Hold Scene 6
    .to({}, { duration: 0.55 }, 4.40)
    .to([scene6, familyCorner], { autoAlpha: 0, duration: 0.22 }, 4.95);

  // --- SCENES 7–9 Placeholders (5.2 -> 9.6, replaced in Phase 4) ---
  tl.to(scene7, { autoAlpha: 1, duration: 0.2 }, 5.20)
    .to({}, { duration: 1.1 }, 5.40)
    .to(scene7, { autoAlpha: 0, duration: 0.2 }, 6.50)
    .to(scene8, { autoAlpha: 1, duration: 0.2 }, 6.70)
    .to({}, { duration: 1.1 }, 6.90)
    .to(scene8, { autoAlpha: 0, duration: 0.2 }, 8.00)
    .to(scene9, { autoAlpha: 1, duration: 0.2 }, 8.20)
    .to({}, { duration: 1.2 }, 8.40);
}
