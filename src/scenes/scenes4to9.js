import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/scenes4to6.css';
import '../styles/scenes7to9.css';

/**
 * Pinned Group [4–9]:
 * - Phase 3: Scenes 4, 5, 6
 * - Phase 4: Scenes 7, 8, 9
 */
export function initScenes4to9(petals, prefersReducedMotion) {
  const group49 = document.getElementById('group-4-9');
  if (!group49) return;

  const scene4 = document.getElementById('scene-4');
  const scene4b = document.getElementById('scene-4b');
  const scene5 = document.getElementById('scene-5');
  const scene6 = document.getElementById('scene-6');
  const scene7 = document.getElementById('scene-7');
  const scene8 = document.getElementById('scene-8');
  const scene9 = document.getElementById('scene-9');
  const familyCorner = group49.querySelector('.s56-family-groom');

  const allScenes = [scene4, scene4b, scene5, scene6, scene7, scene8, scene9];
  const activateScene = (id) => {
    allScenes.forEach((el) => {
      if (!el) return;
      el.classList.toggle('is-active', el.dataset.scene === String(id));
    });
  };

  // Start with Scene 4 visible when group enters, others hidden
  gsap.set([scene4b, scene5, scene6, scene7, scene8, scene9], { autoAlpha: 0 });
  gsap.set(scene4, { autoAlpha: 1 });
  gsap.set(familyCorner, { autoAlpha: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: group49,
      start: 'top top',
      end: '+=745%',
      pin: true,
      scrub: 0.6,
      onToggle: (self) => {
        if (self.isActive) petals?.setVisible(true);
      },
      onUpdate: (self) => {
        const p = self.progress;
        let active = '4';
        if (p >= 0.85) active = '9';
        else if (p >= 0.69) active = '8';
        else if (p >= 0.56) active = '7';
        else if (p >= 0.41) active = '6';
        else if (p >= 0.27) active = '5';
        else if (p >= 0.14) active = '4b';
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

  // Scene 4B elements
  const s4bBrother = scene4b.querySelector('.s4b-brother-frame');
  const s4bName = scene4b.querySelector('.s4b-name');
  const s4bRole = scene4b.querySelector('.s4b-role');

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

  // Scene 7 & 8 elements
  const s7Bride = scene7.querySelector('.s78-bride-wrap');
  const s7LeafLeft = scene7.querySelector('.s7-leaf-pos--left');
  const s7LeafRight = scene7.querySelector('.s7-leaf-pos--right');
  const s8Name = scene7.querySelector('.s8-bride-name');

  // Scene 9 elements
  const s9ClothRed = scene9.querySelector('.s9-cloth--red');
  const s9ClothWhite = scene9.querySelector('.s9-cloth--white');
  const s9Grid = scene9.querySelector('.s9-grid');
  const s9Knot = scene9.querySelector('.s9-knot');
  const s9Heading = scene9.querySelector('.s9-heading');
  const s9Families = scene9.querySelectorAll('.s9-groom-family, .s9-bride-family');
  const s9Boxes = scene9.querySelectorAll('.s9-box-wrap');

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
      .to(scene4b, { autoAlpha: 1, duration: 0.2 }, 1.25)
      .to({}, { duration: 1.0 })
      .to(scene4b, { autoAlpha: 0, duration: 0.2 }, 2.5)
      .to(scene5, { autoAlpha: 1, duration: 0.2 }, 2.75)
      .to({}, { duration: 1.0 })
      .to(scene5, { autoAlpha: 0, duration: 0.2 }, 3.9)
      .to(scene6, { autoAlpha: 1, duration: 0.2 }, 4.0)
      .to({}, { duration: 1.0 })
      .to(scene6, { autoAlpha: 0, duration: 0.2 }, 5.1)
      .to(scene7, { autoAlpha: 1, duration: 0.2 }, 5.2)
      .to({}, { duration: 0.8 })
      .to(scene7, { autoAlpha: 0, duration: 0.2 }, 6.1)
      .to(scene8, { autoAlpha: 1, duration: 0.2 }, 6.2)
      .to({}, { duration: 0.8 })
      .to(scene8, { autoAlpha: 0, duration: 0.2 }, 7.1)
      .to(scene9, { autoAlpha: 1, duration: 0.2 }, 7.2)
      .to({}, { duration: 0.8 });
    return;
  }

  // --- SCENE 4 (0.0 -> 1.65) ---
  tl.from(s4Father, { x: -70, autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, 0.02)
    .from(s4FatherName, { y: 12, autoAlpha: 0, duration: 0.18 }, 0.18)
    .from(s4And, { scale: 0.8, autoAlpha: 0, duration: 0.16 }, 0.30)
    .from(s4Mother, { x: 70, autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, 0.40)
    .from(s4MotherName, { y: 12, autoAlpha: 0, duration: 0.18 }, 0.54)
    .from(s4Role, { y: 16, scale: 0.92, autoAlpha: 0, duration: 0.2 }, 0.68)
    // Hold Scene 4
    .to({}, { duration: 0.55 }, 0.88)
    .to(scene4, { autoAlpha: 0, duration: 0.2 }, 1.45);

  // --- SCENE 4B (1.70 -> 3.27) ---
  // Scene 4 is completely faded out (1.65) before Scene 4B enters; Scene 4B fades out completely (3.27) before Scene 5 enters.
  tl.set(scene4b, { autoAlpha: 1 }, 1.70)
    .from(s4bBrother, { scale: 0.72, autoAlpha: 0, duration: 0.35, ease: 'power2.out' }, 1.72)
    .from(s4bName, { y: 12, autoAlpha: 0, duration: 0.20 }, 2.05)
    .from(s4bRole, { y: 16, scale: 0.92, autoAlpha: 0, duration: 0.22 }, 2.25)
    // Hold Scene 4B long enough to read
    .to({}, { duration: 0.58 }, 2.47)
    .to(scene4b, { autoAlpha: 0, duration: 0.22 }, 3.05);

  // --- SCENE 5 (3.30 -> 5.05) ---
  const corner = getCornerTarget();
  tl.set(scene5, { autoAlpha: 1 }, 3.30)
    .from(s5Groom, { scale: 0.7, autoAlpha: 0, duration: 0.35, ease: 'power2.out' }, 3.34)
    .from(s5Name, { y: 16, autoAlpha: 0, duration: 0.22 }, 3.64)
    .from(s5Suffix, { y: 12, autoAlpha: 0, duration: 0.18 }, 3.82)
    // Hold Scene 5 groom & name
    .to({}, { duration: 0.35 }, 4.00)
    // Fade out groom text/portrait while family picture appears and shrinks to upper-left
    .to([s5Groom, s5Name, s5Suffix], { autoAlpha: 0, duration: 0.2 }, 4.37)
    .fromTo(
      familyCorner,
      { autoAlpha: 0, scale: 0.85, x: 0, y: 0, filter: 'blur(0px)' },
      { autoAlpha: 1, scale: 1, x: 0, y: 0, filter: 'blur(0px)', duration: 0.25, ease: 'power2.out' },
      4.44
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
      4.74
    )
    .to(scene5, { autoAlpha: 0, duration: 0.1 }, 4.97);

  // --- SCENE 6 (5.07 -> 6.87) ---
  tl.set(scene6, { autoAlpha: 1 }, 5.07)
    .from(s6Father, { x: -70, autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, 5.12)
    .from(s6FatherName, { y: 12, autoAlpha: 0, duration: 0.18 }, 5.28)
    .from(s6And, { scale: 0.8, autoAlpha: 0, duration: 0.16 }, 5.40)
    .from(s6Mother, { x: 70, autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, 5.50)
    .from(s6MotherName, { y: 12, autoAlpha: 0, duration: 0.18 }, 5.64)
    .from(s6Only, { y: 12, autoAlpha: 0, duration: 0.16 }, 5.78)
    .from(s6Role, { y: 16, scale: 0.92, autoAlpha: 0, duration: 0.2 }, 5.92)
    // Hold Scene 6
    .to({}, { duration: 0.55 }, 6.12)
    .to([scene6, familyCorner], { autoAlpha: 0, duration: 0.22 }, 6.67);

  // --- SCENES 7 & 8: Opaque Entrance -> Mirrored Leaf Reveal (6.96 -> 9.16) ---
  tl.set(scene7, { autoAlpha: 1 }, 6.96)
    .set([s7Bride, s7LeafLeft, s7LeafRight], { opacity: 1 }, 6.96)
    .set(s8Name, { autoAlpha: 0, y: 16 }, 6.96)
    .fromTo(
      s7Bride,
      { scale: 0.35 },
      { scale: 1, duration: 0.38, ease: 'power2.out' },
      6.96
    )
    // Hold Scene 7 (face fully hidden by mirrored leaves)
    .to({}, { duration: 0.42 }, 7.36)
    // Scene 8: left leaf goes left, right leaf goes right symmetrically (both stay 100% opaque)
    .to(s7LeafLeft, { x: '-120vw', rotation: -22, duration: 0.45, ease: 'power2.inOut' }, 7.80)
    .to(s7LeafRight, { x: '120vw', rotation: 22, duration: 0.45, ease: 'power2.inOut' }, 7.80)
    .to(s7Bride, { scale: 1.07, duration: 0.45, ease: 'power1.out' }, 7.84)
    .to(s8Name, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 8.14)
    // Hold Scene 8
    .to({}, { duration: 0.50 }, 8.42)
    .to(scene7, { autoAlpha: 0, duration: 0.22 }, 8.94);

  // --- SCENE 9: 45° Long Cloths -> Large Knot -> Shrink -> Heading, Families & Boxes (9.20 -> 12.17) ---
  const isMobile = window.innerWidth < 1024;
  const s9OverflowY = isMobile
    ? Math.max(0, s9Grid.scrollHeight - window.innerHeight + 56)
    : 0;

  tl.set(scene9, { autoAlpha: 1 }, 9.18)
    .set(s9Grid, { y: 0 }, 9.18)
    .set([s9Knot, s9Heading, ...s9Families, ...s9Boxes], { autoAlpha: 0 }, 9.18)
    .fromTo(
      s9ClothRed,
      { x: '-100%', opacity: 1 },
      { x: '-44%', opacity: 1, duration: 0.45, ease: 'power2.out' },
      9.20
    )
    .fromTo(
      s9ClothWhite,
      { x: '100%', opacity: 1 },
      { x: '44%', opacity: 1, duration: 0.45, ease: 'power2.out' },
      9.20
    )
    .to([s9ClothRed, s9ClothWhite], { opacity: 0, duration: 0.16, ease: 'power1.in' }, 9.67)
    .fromTo(
      s9Knot,
      { scale: 1.65, y: 0, autoAlpha: 0 },
      { scale: 1.65, autoAlpha: 1, duration: 0.18, ease: 'power1.out' },
      9.67
    )
    .to({}, { duration: 0.25 }, 9.86)
    .to(s9Knot, { scale: 1, duration: 0.35, ease: 'power2.inOut' }, 10.12)
    .fromTo(s9Heading, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.2 }, 10.40)
    .fromTo(
      s9Families,
      { y: 16, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.24, ease: 'power2.out' },
      10.56
    )
    .fromTo(
      s9Boxes,
      { y: 18, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.26, ease: 'power2.out' },
      10.66
    );

  if (s9OverflowY > 0) {
    tl.to({}, { duration: 0.35 }, 10.94)
      .to(s9Grid, { y: -s9OverflowY, duration: 0.55, ease: 'sine.inOut' }, 11.29)
      .to({}, { duration: 0.35 }, 11.84);
  } else {
    tl.to({}, { duration: 0.85 }, 10.94);
  }
}
