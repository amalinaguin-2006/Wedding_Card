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
    const isDesktop = window.innerWidth >= 1024;
    const bgCanvas = scene10.querySelector('.s10-bg-canvas');
    const brideCanvas = scene10.querySelector('.s10-bride-canvas');
    const groomWrap = scene10.querySelector('.s10-groom-wrap');
    const chassis = scene10.querySelector('.s10-bike-chassis');
    const wheels = scene10.querySelectorAll('.s10-wheel');
    const titleBlock = scene10.querySelector('.s10-title-block');
    const detailsBlock = scene10.querySelector('.s10-details-block');

    // Size background canvas to stage
    const syncBgSize = () => {
      if (!bgCanvas) return;
      const rect = bgCanvas.getBoundingClientRect();
      bgCanvas.width = Math.max(360, Math.round(rect.width));
      bgCanvas.height = Math.max(540, Math.round(rect.height));
    };
    syncBgSize();

    // Weighted mesh warp for background leaf tips only (pots, wall, window, road stay still)
    const bgSrc = isDesktop ? '/assets/p10-desktop-background.webp' : '/assets/p10-background.webp';
    const bgWarp = createWeightedMeshWarp(bgCanvas, bgSrc, 22, 22, (u, v, t) => {
      if (t === 0) return { wx: 0, wy: 0 };
      let wx = 0, wy = 0;

      if (isDesktop) {
        // Top-left hanging vines (tips hang down from top edge)
        const tl = (1 - smoothstep(0.0, 0.36, u)) * smoothstep(0.05, 0.42, v) * (1 - smoothstep(0.42, 0.50, v));
        wx += tl * Math.sin(t * 1.15 + v * 5) * 4.5;
        wy += tl * Math.cos(t * 0.95 + u * 4) * 1.5;

        // Top-right hanging vines
        const tr = smoothstep(0.64, 1.0, u) * smoothstep(0.05, 0.42, v) * (1 - smoothstep(0.42, 0.50, v));
        wx += tr * Math.sin(t * 1.0 + 1.4 + v * 5) * 4.5;

        // Window hanging pothos tips (around u: 0.58-0.65, v: 0.22-0.35)
        const wp = smoothstep(0.57, 0.61, u) * (1 - smoothstep(0.64, 0.67, u)) * smoothstep(0.20, 0.32, v) * (1 - smoothstep(0.32, 0.38, v));
        wx += wp * Math.sin(t * 1.4 + 2.2) * 3.5;

        // Lower-left potted plant tips (above pots v: 0.43-0.73, pots sit at v > 0.75)
        const ll = (1 - smoothstep(0.18, 0.35, u)) * smoothstep(0.73, 0.45, v) * smoothstep(0.38, 0.48, v);
        wx += ll * Math.sin(t * 0.9 + 0.7 + u * 6) * 4.0;
      } else {
        // Mobile: top-left hanging vine tips
        const tl = (1 - smoothstep(0.0, 0.56, u)) * smoothstep(0.04, 0.32, v) * (1 - smoothstep(0.32, 0.38, v));
        wx += tl * Math.sin(t * 1.1 + v * 5) * 4.0;

        // Mobile: window hanging pothos tips (right side)
        const wp = smoothstep(0.88, 0.94, u) * smoothstep(0.18, 0.26, v) * (1 - smoothstep(0.26, 0.32, v));
        wx += wp * Math.sin(t * 1.45 + 1.8) * 3.2;

        // Mobile: left potted monstera tips (pot is below v=0.72)
        const ll = (1 - smoothstep(0.10, 0.25, u)) * smoothstep(0.72, 0.55, v) * smoothstep(0.50, 0.57, v);
        wx += ll * Math.sin(t * 0.95 + 0.6) * 3.5;

        // Mobile: right lower plant tips (pot below v=0.76)
        const rl = smoothstep(0.78, 0.92, u) * smoothstep(0.76, 0.62, v) * smoothstep(0.58, 0.65, v);
        wx += rl * Math.sin(t * 1.2 + 2.6) * 3.5;
      }

      return { wx, wy };
    });

    // Weighted mesh warp for Bride: ONLY outer hair ends & saree trail wave; face, body, hands, jewellery stay still
    const brideWarp = createWeightedMeshWarp(brideCanvas, '/assets/p10-bride.webp', 20, 20, (u, v, t) => {
      if (t === 0) return { wx: 0, wy: 0 };
      const hairWeight = smoothstep(0.57, 0.72, u) * smoothstep(0.55, 0.85, v);
      const sareeWeight = smoothstep(0.72, 0.95, u) * smoothstep(0.58, 0.86, v);
      const w = Math.max(hairWeight, sareeWeight);
      if (w <= 0) return { wx: 0, wy: 0 };
      return {
        wx: w * Math.sin(t * 1.6 + v * 5.0 + u * 2.0) * 5.5,
        wy: w * Math.cos(t * 1.3 + u * 4.5) * 3.5,
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
          bgWarp.start();
          brideWarp.start();
          bounceTween?.restart();
          entryTl?.restart();
        }
      },
      onEnterBack: () => {
        if (!prefersReducedMotion) {
          bgWarp.start();
          brideWarp.start();
          bounceTween?.restart();
          entryTl?.restart();
        }
      },
      onLeave: () => {
        bgWarp.stop();
        brideWarp.stop();
        resetEntry();
      },
      onLeaveBack: () => {
        bgWarp.stop();
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
