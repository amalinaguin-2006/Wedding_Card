import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/scenes10to11.css';

/**
 * Draw an image onto a canvas using a weighted triangle mesh warp.
 * Only vertices where weightFn(u, v) > 0 move; zero-weight regions (face, body, hands, jewellery, pots, wall, window, road) stay 100% still.
 */
function createWeightedMeshWarp(canvas, imgSrc, cols, rows, weightFn) {
  if (!canvas) return { start: () => {}, stop: () => {} };
  const ctx = canvas.getContext('2d');
  const img = new Image();
  let loaded = false;
  let rafId = null;
  let startTime = 0;

  const drawFrame = (t) => {
    if (!loaded) return;
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (!iw || !ih) return;

    // Cover-fit source crop so aspect ratio matches canvas
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

    ctx.clearRect(0, 0, cw, ch);

    // Precompute displaced vertices
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
          dx: u * cw + wx,
          dy: v * ch + wy,
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
 * - Scene 10: Time-based 5s motorbike entry with rotating masked wheels, weighted mesh warp for hair/saree & leaf tips
 * - Scene 11: Heading, then two 90°-rotated paper scrolls unrolling sequentially from center outward (petals active)
 */
export function initScenes10to11(petals, prefersReducedMotion) {
  const scene10 = document.getElementById('scene-10');
  const scene11 = document.getElementById('scene-11');

  // --- SCENE 10 ---
  if (scene10) {
    const brideCanvas = scene10.querySelector('.s10-bride-canvas');
    const groomWrap = scene10.querySelector('.s10-groom-wrap');
    const chassis = scene10.querySelector('.s10-bike-chassis');
    const wheels = scene10.querySelectorAll('.s10-wheel');
    const titleBlock = scene10.querySelector('.s10-title-block');
    const detailsBlock = scene10.querySelector('.s10-details-block');

    // Weighted mesh warp for Bride (572x436): ONLY outer hair ends & saree trail wave; face, body, hands, jewellery stay still
    const brideWarp = createWeightedMeshWarp(brideCanvas, '/assets/p10-bride.webp', 22, 18, (u, v, t) => {
      if (t === 0) return { wx: 0, wy: 0 };
      const hairWeight = smoothstep(0.28, 0.42, u) * (1 - smoothstep(0.46, 0.54, u)) * smoothstep(0.56, 0.88, v);
      const sareeWeight = smoothstep(0.45, 0.72, u) * smoothstep(0.42, 0.78, v);
      const w = Math.max(hairWeight, sareeWeight);
      if (w <= 0) return { wx: 0, wy: 0 };
      return {
        wx: w * Math.sin(t * 1.5 + v * 5.0 + u * 2.0) * 5.0,
        wy: w * Math.cos(t * 1.25 + u * 4.5) * 3.5,
      };
    });

    // Time-based 5s Groom Entry + Wheel Rotation + Engine Bounce + Post-Stop Text Reveal
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
        y: -1.8,
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
          { x: 0, duration: 4.8, ease: 'power2.out' },
          0
        )
        .fromTo(
          wheels,
          { rotation: 0 },
          { rotation: 1080, duration: 4.8, ease: 'power2.out' },
          0
        )
        .fromTo(
          titleBlock,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' },
          4.82
        )
        .fromTo(
          detailsBlock,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' },
          5.02
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

    // Entry trigger: begins ONLY when Scene 10 is almost fully in view; replays only after leaving & returning
    ScrollTrigger.create({
      trigger: scene10,
      start: 'top 18%',
      end: 'bottom 18%',
      onEnter: () => {
        if (!prefersReducedMotion) {
          brideWarp.start();
          bounceTween?.restart();
          entryTl?.restart();
        }
      },
      onEnterBack: () => {
        if (!prefersReducedMotion) {
          brideWarp.start();
          bounceTween?.restart();
          entryTl?.restart();
        }
      },
      onLeave: () => {
        brideWarp.stop();
        resetEntry();
      },
      onLeaveBack: () => {
        brideWarp.stop();
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
