import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/scenes10to11.css';

/**
 * Draw an image onto a canvas using a weighted triangle mesh warp.
 * Only vertices where weightFn(u, v) > 0 move; zero-weight regions (face, body, hands, jewellery, pots, wall, window, road) stay 100% still.
 */
function createWeightedMeshWarp(canvas, imgSrc, cols, rows, weightFn, pad = { left: 20, top: 20, right: 60, bottom: 60 }) {
  if (!canvas) return { start: () => {}, stop: () => {} };
  const ctx = canvas.getContext('2d');
  const img = new Image();
  let loaded = false;
  let rafId = null;
  let startTime = 0;

  const drawFrame = (t) => {
    if (!loaded) return;
    const cw = canvas.width - pad.left - pad.right;
    const ch = canvas.height - pad.top - pad.bottom;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih || cw <= 0 || ch <= 0) return;

    // Cover-fit source crop so aspect ratio matches inner bride area
    const cRatio = cw / ch;
    const iRatio = iw / ih;
    let sx = 0, sy = 0, sw = iw, sh = ih;
    if (iRatio > cRatio) {
      sw = ih * cRatio;
      sx = (iw - sw) * 0.5;
    } else {
      sh = iw / cRatio;
      sy = (ih - sh) * 0.5;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Precompute displaced vertices (offset by pad.left/pad.top so tips never clip at canvas edges)
    const pts = [];
    for (let r = 0; r <= rows; r++) {
      const v = r / rows;
      const rowPts = [];
      for (let c = 0; c <= cols; c++) {
        const u = c / cols;
        const { wx, wy } = weightFn(u, v, t);
        rowPts.push({
          sx: sx + u * sw,
          sy: sy + v * sh,
          dx: pad.left + u * cw + wx,
          dy: pad.top + v * ch + wy,
        });
      }
      pts.push(rowPts);
    }

    const drawTri = (p0, p1, p2) => {
      const denom = (p0.sx - p2.sx) * (p1.sy - p2.sy) - (p1.sx - p2.sx) * (p0.sy - p2.sy);
      if (Math.abs(denom) < 0.001) return;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p0.dx, p0.dy);
      ctx.lineTo(p1.dx, p1.dy);
      ctx.lineTo(p2.dx, p2.dy);
      ctx.closePath();
      ctx.clip();

      const m11 = ((p0.dx - p2.dx) * (p1.sy - p2.sy) - (p1.dx - p2.dx) * (p0.sy - p2.sy)) / denom;
      const m12 = ((p1.dx - p2.dx) * (p0.sx - p2.sx) - (p0.dx - p2.dx) * (p1.sx - p2.sx)) / denom;
      const m21 = ((p0.dy - p2.dy) * (p1.sy - p2.sy) - (p1.dy - p2.dy) * (p0.sy - p2.sy)) / denom;
      const m22 = ((p1.dy - p2.dy) * (p0.sx - p2.sx) - (p0.dy - p2.dy) * (p1.sx - p2.sx)) / denom;
      const dx = p2.dx - m11 * p2.sx - m12 * p2.sy;
      const dy = p2.dy - m21 * p2.sx - m22 * p2.sy;

      ctx.transform(m11, m21, m12, m22, dx, dy);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const a = pts[r][c];
        const b = pts[r][c + 1];
        const d = pts[r + 1][c];
        const e = pts[r + 1][c + 1];
        drawTri(a, b, d);
        drawTri(b, e, d);
      }
    }
  };

  img.onload = () => {
    loaded = true;
    drawFrame(0);
  };
  img.src = imgSrc;

  const tick = (now) => {
    if (!startTime) startTime = now;
    drawFrame((now - startTime) * 0.001);
    rafId = requestAnimationFrame(tick);
  };

  return {
    drawStatic: () => drawFrame(0),
    start: () => {
      if (rafId !== null) return;
      startTime = 0;
      rafId = requestAnimationFrame(tick);
    },
    stop: () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
  };
}

const smoothstep = (e0, e1, x) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/**
 * Scenes 10 & 11:
 * - Scene 10: Time-based 2.8s motorbike entry (bike-body over two rotating bike-wheel copies), weighted mesh warp for hair & saree
 * - Scene 11: Heading, then two 90°-rotated paper scrolls unrolling sequentially from center outward (petals active)
 */
export function initScenes10to11(petals, prefersReducedMotion) {
  const scene10 = document.getElementById('scene-10');
  const scene11 = document.getElementById('scene-11');

  // --- SCENE 10 ---
  if (scene10) {
    // Preload Scene 10 assets so entry begins immediately with zero delay
    [
      '/assets/p10-bride.webp',
      '/assets/bike-body.webp',
      '/assets/bike-wheel.webp',
      '/assets/p10-plant-1.webp',
      '/assets/p10-plant-2.webp',
      '/assets/p10-plant-3.webp',
      '/assets/p10-plant-4.webp',
      '/assets/p10-plant-5.webp',
      '/assets/p10-garland-left.webp',
      '/assets/p10-garland-right.webp',
    ].forEach((src) => {
      const pre = new Image();
      pre.src = src;
    });

    const brideCanvas = scene10.querySelector('.s10-bride-canvas');
    const groomWrap = scene10.querySelector('.s10-groom-wrap');
    const chassis = scene10.querySelector('.s10-bike-chassis');
    const rearWheel = scene10.querySelector('.s10-wheel--rear');
    const frontWheel = scene10.querySelector('.s10-wheel--front');
    const wheels = [rearWheel, frontWheel].filter(Boolean);
    const titleBlock = scene10.querySelector('.s10-title-block');
    const detailsBlock = scene10.querySelector('.s10-details-block');

    // Weighted mesh warp for Bride (572x436 inside 652x516 padded canvas):
    // ~2.5s cycle; hair ends move ~3px and saree trail ~5px at 390px phone width, scaling proportionally on desktop.
    const brideWarp = createWeightedMeshWarp(brideCanvas, '/assets/p10-bride.webp', 28, 22, (u, v, t) => {
      if (t === 0) return { wx: 0, wy: 0 };
      const hairWeight = smoothstep(0.27, 0.41, u) * (1 - smoothstep(0.46, 0.54, u)) * smoothstep(0.54, 0.88, v);
      const sareeWeight = smoothstep(0.46, 0.86, u) * smoothstep(0.42, 0.84, v);
      if (hairWeight <= 0 && sareeWeight <= 0) return { wx: 0, wy: 0 };

      const hairOmega = (Math.PI * 2) / 2.45;
      const sareeOmega = (Math.PI * 2) / 2.58;

      const hx = hairWeight * Math.sin(t * hairOmega + v * 4.5 + u * 2.0) * 6.0;
      const hy = hairWeight * Math.cos(t * hairOmega + u * 4.0) * 3.8;

      const sx = sareeWeight * Math.sin(t * sareeOmega + u * 4.0 + v * 2.5) * 10.0;
      const sy = sareeWeight * Math.cos(t * sareeOmega + u * 3.5) * 6.0;

      return {
        wx: hx + sx,
        wy: hy + sy,
      };
    });

    // Gentle plant sway tweens (2-4 deg, 3-5s cycles; desktop garlands sway 1.5 deg + 1.02 scale)
    const plantTweens = [];
    if (!prefersReducedMotion) {
      const isDesktop = window.innerWidth >= 1024;
      const plantConfigs = [
        ['.s10-plant-sway--tl', isDesktop ? 1.5 : 2.6, 3.8, 0, isDesktop ? 1.02 : 1],
        ['.s10-plant-sway--tr', isDesktop ? 1.5 : 2.8, 4.3, 0.4, isDesktop ? 1.02 : 1],
        ['.s10-plant-sway--window', 3.2, 4.1, 0.2, 1],
        ['.s10-pot-leaves--left', 2.8, 4.7, 0.6, 1],
        ['.s10-pot-leaves--right', 3.4, 3.5, 0.3, 1],
        ['.s10-plant-sway--bl', 2.5, 4.9, 0.5, 1],
        ['.s10-plant-sway--br', 2.7, 3.3, 0.1, 1],
      ];
      plantConfigs.forEach(([sel, deg, dur, delay, scaleVal]) => {
        const el = scene10.querySelector(sel);
        if (!el) return;
        plantTweens.push(
          gsap.fromTo(
            el,
            { rotation: -deg, scale: scaleVal },
            {
              rotation: deg,
              scale: scaleVal,
              duration: dur,
              delay,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              paused: true,
            }
          )
        );
      });
    }

    const getWheelRotationDeg = (wheelEl) => {
      const travelPx = window.innerWidth * 1.15;
      const wheelDiameter = wheelEl?.getBoundingClientRect().width || 92;
      const rawDeg = (travelPx / (Math.PI * wheelDiameter)) * 360;
      // For power2.out over 4.0s, peak slope is 2x average speed -> 1080deg caps peak speed at 1.5 turns/sec
      return Math.min(rawDeg, 1080);
    };

    // Time-based 4.0s Groom Entry + Clockwise Wheel Rotation + Engine Bounce + Post-Stop Text Reveal
    let entryTl = null;
    let bounceTween = null;

    const resetEntry = () => {
      entryTl?.pause(0);
      bounceTween?.pause(0);
      if (prefersReducedMotion) {
        gsap.set(groomWrap, { x: 0, autoAlpha: 1 });
        gsap.set([titleBlock, detailsBlock], { autoAlpha: 1, y: 0 });
      } else {
        gsap.set(groomWrap, { x: '-115vw' });
        gsap.set(wheels, { rotation: 0 });
        gsap.set(chassis, { y: 0 });
        gsap.set([titleBlock, detailsBlock], { autoAlpha: 0, y: 14 });
      }
    };

    if (!prefersReducedMotion) {
      bounceTween = gsap.to(chassis, {
        y: -1.5,
        duration: 0.14,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        paused: true,
      });

      entryTl = gsap.timeline({
        paused: true,
        onComplete: () => {
          bounceTween?.pause(0);
          gsap.set(chassis, { y: 0 });
        },
      });

      entryTl
        .fromTo(
          groomWrap,
          { x: '-115vw' },
          { x: 0, duration: 4.0, ease: 'power2.out' },
          0
        )
        .fromTo(
          rearWheel,
          { rotation: 0 },
          { rotation: () => getWheelRotationDeg(rearWheel), duration: 4.0, ease: 'power2.out' },
          0
        )
        .fromTo(
          frontWheel,
          { rotation: 0 },
          { rotation: () => getWheelRotationDeg(frontWheel), duration: 4.0, ease: 'power2.out' },
          0
        )
        .fromTo(
          titleBlock,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' },
          3.85
        )
        .fromTo(
          detailsBlock,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' },
          4.0
        );
    }

    resetEntry();

    // Petal visibility trigger (exact 50% boundary)
    ScrollTrigger.create({
      trigger: scene10,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (self.isActive) petals?.setVisible(false);
      },
    });

    // Entry trigger: begins as soon as Scene 10 is ~60% visible; replays only after leaving & returning
    ScrollTrigger.create({
      trigger: scene10,
      start: 'top 40%',
      end: 'bottom 60%',
      onEnter: () => {
        if (!prefersReducedMotion) {
          brideWarp.start();
          plantTweens.forEach((tw) => tw.play());
          bounceTween?.restart();
          entryTl?.invalidate().restart();
        }
      },
      onEnterBack: () => {
        if (!prefersReducedMotion) {
          brideWarp.start();
          plantTweens.forEach((tw) => tw.play());
          bounceTween?.restart();
          entryTl?.invalidate().restart();
        }
      },
      onLeave: () => {
        brideWarp.stop();
        plantTweens.forEach((tw) => tw.pause());
        resetEntry();
      },
      onLeaveBack: () => {
        brideWarp.stop();
        plantTweens.forEach((tw) => tw.pause());
        resetEntry();
      },
    });
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
