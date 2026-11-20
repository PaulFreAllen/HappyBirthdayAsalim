/**
 * ===================================================================
 * CHAPTER 1 — OPENING PARTICLE MORPH COUNTDOWN
 * ===================================================================
 * Integrated from Pink rain particle morph animation:
 * - Dual-layer HTML5 Canvas:
 *   1. Atmospheric digital rain background in sapphire/rose neon
 *   2. High-performance spring particle physics foreground
 * - Seamless morph sequence:
 *   3 -> 2 -> 1 -> You -> Are -> My -> Love -> Procedural Glowing Heart
 * - Responsive particle allocation (1100-2800 particles with DPR scaling)
 * - Interactive pointer repelling and burst physics
 * - Finale reveal of romantic caption & "Begin Our Journey ✨" transition button
 * - Clean lifecycle management (mount/unmount, memory leak prevention)
 * ===================================================================
 */

import { gsap } from 'gsap';
import { config } from '../config.js';

export function createChapter1(app) {
  let animId = null;
  let isMounted = false;
  let resizeTimer = null;
  let runId = 0;
  let currentStep = null;

  // Canvases & contexts
  let rainCv = null, fgCv = null;
  let rctx = null, ctx = null;
  let off = null, octx = null;
  let heartCv = null;

  // Sizing & particles
  let W = 0, H = 0, DPR = 1, N = 0;
  let P = [];
  let sizeScale = 1;
  let springMul = 0, springGoal = 0;
  let mx = -999, my = -999;

  // Digital rain state
  const FS = 16;
  const rainColors = ['#00f0ff', '#38bdf8', '#ff65a3', '#ff2d75', '#2563eb'];
  let cols = 0, drops = [], rainAcc = 0;
  let lastFrameTime = 0;

  // Color palettes for particles (glowing core, mid, rim)
  const fills = ['#ffffff', '#38bdf8', '#ff65a3'];
  const glows = ['#00f0ff', '#2563eb', '#ff2d75'];

  const reducedMotion = app.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ch1Config = config.chapter1 || {};

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function createHeartCanvas() {
    heartCv = document.createElement('canvas');
    heartCv.width = 600;
    heartCv.height = 560;
    const c = heartCv.getContext('2d');
    if (!c) return;

    const g = c.createRadialGradient(300, 230, 10, 300, 260, 300);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.35, '#38bdf8');
    g.addColorStop(0.7, '#2563eb');
    g.addColorStop(1, '#ff2d75');

    c.fillStyle = g;
    c.beginPath();
    for (let t = 0; t <= Math.PI * 2 + 0.05; t += 0.02) {
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      const px = 300 + x * 17;
      const py = 250 - y * 17;
      if (t === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
    c.fill();
  }

  function resetRain() {
    if (!rainCv || !rctx) return;
    cols = Math.ceil(W / FS);
    drops = Array.from({ length: cols }, () => ((Math.random() * H) / FS) | 0);
    rctx.fillStyle = '#030612';
    rctx.fillRect(0, 0, W, H);
  }

  function rainStep() {
    if (!rainCv || !rctx) return;
    rctx.fillStyle = 'rgba(3, 6, 18, 0.16)';
    rctx.fillRect(0, 0, W, H);
    rctx.font = `${FS}px ui-monospace, Menlo, Consolas, monospace`;

    for (let i = 0; i < cols; i++) {
      const y = drops[i] * FS;
      const c = Math.random() < 0.12 ? '#e0f2fe' : rainColors[(Math.random() * rainColors.length) | 0];
      rctx.fillStyle = c;
      rctx.shadowColor = c;
      rctx.shadowBlur = 8;
      rctx.fillText(Math.random() < 0.5 ? '0' : '1', i * FS, y);
      if (y > H && Math.random() > 0.975) {
        drops[i] = 0;
      } else {
        drops[i]++;
      }
    }
    rctx.shadowBlur = 0;
  }

  function makeParticle() {
    const r = Math.random();
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: 0,
      vy: 0,
      tx: W / 2,
      ty: H / 2,
      k: 0.04 + Math.random() * 0.05,
      s: 0.8 + Math.random() * 0.9,
      ph: Math.random() * 6.283,
      rb: r < 0.6 ? 0 : r < 0.85 ? 1 : 2,
      b: 0,
    };
  }

  function resize() {
    if (!rainCv || !fgCv) return;
    const oldW = W || window.innerWidth;
    const oldH = H || window.innerHeight;

    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);

    fgCv.width = W * DPR;
    fgCv.height = H * DPR;
    rainCv.width = W;
    rainCv.height = H;

    resetRain();

    N = Math.round(Math.min(2800, Math.max(1100, (W * H) / 650)));
    sizeScale = Math.max(0.8, Math.min(1.6, Math.sqrt((W * H) / N) / 18));

    for (const p of P) {
      p.x *= W / oldW;
      p.y *= H / oldH;
    }

    while (P.length < N) P.push(makeParticle());
    P.length = N;

    if (currentStep) setTargets(currentStep);
  }

  function textPoints(txt) {
    if (!off || !octx) return [];
    const sc = 0.5;
    off.width = Math.ceil(W * sc);
    off.height = Math.ceil(H * sc);
    octx.setTransform(sc, 0, 0, sc, 0, 0);
    octx.clearRect(0, 0, W, H);

    let fs = Math.min(H * 0.44, W * 0.44);
    const font = (s) => `800 ${s}px "Cinzel Decorative", Georgia, system-ui, -apple-system, sans-serif`;
    octx.font = font(fs);
    const w = octx.measureText(txt).width;
    if (w > W * 0.82) {
      fs *= (W * 0.82) / w;
      octx.font = font(fs);
    }
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillStyle = '#ffffff';
    octx.fillText(txt, W / 2, H * 0.44);
    octx.setTransform(1, 0, 0, 1, 0, 0);

    const d = octx.getImageData(0, 0, off.width, off.height).data;
    const sample = (st) => {
      const pts = [];
      for (let y = 0; y < off.height; y += st) {
        for (let x = 0; x < off.width; x += st) {
          if (d[(y * off.width + x) * 4 + 3] > 128) {
            pts.push({ x: x / sc, y: y / sc });
          }
        }
      }
      return pts;
    };

    let pts = sample(2);
    if (pts.length < N * 0.8) pts = sample(1);
    return pts;
  }

  function imagePoints() {
    if (!heartCv || !off || !octx) return [];
    const iw = heartCv.width, ih = heartCv.height;
    const sc = Math.min((W * 0.66) / iw, (H * 0.54) / ih);
    const ow = Math.max(2, Math.round(iw * sc));
    const oh = Math.max(2, Math.round(ih * sc));

    off.width = ow;
    off.height = oh;
    octx.setTransform(1, 0, 0, 1, 0, 0);
    octx.clearRect(0, 0, ow, oh);
    octx.drawImage(heartCv, 0, 0, ow, oh);

    const d = octx.getImageData(0, 0, ow, oh).data;
    const ox = (W - ow) / 2;
    const oy = H * 0.44 - oh / 2;
    const st = Math.max(1, Math.floor(Math.sqrt((ow * oh) / (N * 1.6))));

    let cand = [];
    for (let y = 0; y < oh; y += st) {
      for (let x = 0; x < ow; x += st) {
        const i = (y * ow + x) * 4;
        if (d[i + 3] < 40) continue;
        const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        cand.push({ x: ox + x, y: oy + y, l });
      }
    }

    cand.forEach((c) => {
      c.b = c.l > 170 ? 0 : c.l > 85 ? 1 : 2;
    });
    return cand;
  }

  function setTargets(step) {
    const isImg = step.type === 'image';
    let pts = isImg ? imagePoints() : textPoints(step.text);
    if (!pts.length) pts = [{ x: W / 2, y: H / 2, b: 0 }];
    shuffle(pts);

    for (let i = 0; i < N; i++) {
      const q = pts[i % pts.length];
      const p = P[i];
      const j = i >= pts.length ? 1.8 : 0;
      p.tx = q.x + (Math.random() - 0.5) * j * 2;
      p.ty = q.y + (Math.random() - 0.5) * j * 2;
      p.b = isImg ? q.b : p.rb;
    }
  }

  function burst(power) {
    for (const p of P) {
      const a = Math.random() * 6.283;
      const sp = (3 + Math.random() * 10) * power;
      const dx = p.x - W / 2;
      const dy = p.y - H / 2;
      const d = Math.hypot(dx, dy) || 1;
      p.vx = Math.cos(a) * sp * 0.6 + (dx / d) * sp * 0.7;
      p.vy = Math.sin(a) * sp * 0.6 + (dy / d) * sp * 0.7;
    }
  }

  function buildSteps() {
    const phrases = ch1Config.phrases || ['You', 'Are', 'My', 'Love'];
    const numbers = ch1Config.numbers || ['3', '2', '1'];
    const numHold = reducedMotion ? 700 : 1500;
    const wordHold = reducedMotion ? 600 : 1300;

    return [
      ...numbers.map((t) => ({ type: 'text', text: t, hold: numHold })),
      ...phrases.map((t) => ({ type: 'text', text: t, hold: wordHold })),
      { type: 'image', hold: 0 },
    ];
  }

  async function morph(step, id) {
    if (!isMounted || id !== runId) return;
    currentStep = step;

    const caption = document.getElementById('countdown-caption');
    if (caption) caption.classList.remove('on');

    springMul = springGoal = 0;
    burst(step.type === 'image' ? 1.4 : 1.0);

    await wait(reducedMotion ? 180 : 420);
    if (!isMounted || id !== runId) return;

    setTargets(step);
    springGoal = 1;

    if (step.type === 'image') {
      const finaleCaption = ch1Config.finaleCaption || 'Happy Birthday Asalim!';
      if (caption) {
        caption.textContent = finaleCaption;
        setTimeout(() => {
          if (isMounted && id === runId) {
            caption.classList.add('on');
            revealContinueButton();
          }
        }, 400);
      } else {
        revealContinueButton();
      }
    }
  }

  function revealContinueButton() {
    const actionWrap = document.getElementById('countdown-action-wrap');
    if (actionWrap) {
      gsap.to(actionWrap, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        pointerEvents: 'auto',
      });
    }
  }

  async function playTimeline() {
    const id = ++runId;
    const steps = buildSteps();

    for (let i = 0; i < steps.length; i++) {
      if (!isMounted || id !== runId) return;
      await morph(steps[i], id);
      if (!isMounted || id !== runId) return;
      await wait(steps[i].hold);
      if (!isMounted || id !== runId) return;
    }
  }

  function onPointerMove(e) {
    mx = e.clientX;
    my = e.clientY;
  }

  function onPointerLeave() {
    mx = -999;
    my = -999;
  }

  function onPointerDown(e) {
    for (const p of P) {
      const dx = p.x - e.clientX;
      const dy = p.y - e.clientY;
      const d = Math.hypot(dx, dy);
      if (d < 220) {
        const f = ((1 - d / 220) * 14) / (d || 1);
        p.vx += dx * f;
        p.vy += dy * f;
      }
    }
  }

  function frame(ts) {
    if (!isMounted) return;

    const dt = Math.min(3, (ts - (lastFrameTime || ts)) / 16.67);
    lastFrameTime = ts;

    rainAcc += ts - (frame.t || ts);
    frame.t = ts;
    if (rainAcc > 55) {
      rainStep();
      rainAcc = 0;
    }

    springMul += (springGoal - springMul) * 0.07 * dt;
    const damp = Math.pow(springGoal > 0 ? 0.87 : 0.975, dt);

    for (const p of P) {
      if (springMul > 0.001) {
        p.vx += (p.tx - p.x) * p.k * springMul * dt;
        p.vy += (p.ty - p.y) * p.k * springMul * dt;
      } else {
        p.vx += Math.cos(p.ph + ts * 0.0012) * 0.03 * dt;
        p.vy += Math.sin(p.ph + ts * 0.0011) * 0.03 * dt;
      }

      if (mx > 0) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < 11000) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / 105) * 2.4;
          p.vx += (dx / d) * f * dt;
          p.vy += (dy / d) * f * dt;
        }
      }

      p.vx *= damp;
      p.vy *= damp;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    if (ctx) {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      for (let b = 0; b < 3; b++) {
        ctx.fillStyle = fills[b];
        ctx.shadowColor = glows[b];
        ctx.shadowBlur = (b === 0 ? 12 : 9) * DPR;
        ctx.beginPath();

        for (const p of P) {
          if (p.b !== b) continue;
          const r = p.s * sizeScale * 0.9;
          const sx = p.x + (springMul > 0.9 ? Math.sin(ts * 0.002 + p.ph) * 0.6 : 0);
          ctx.moveTo(sx + r, p.y);
          ctx.arc(sx, p.y, r, 0, 6.2832);
        }
        ctx.fill();
      }
    }

    animId = requestAnimationFrame(frame);
  }

  function onWindowResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (isMounted) resize();
    }, 120);
  }

  function advanceToDateLock() {
    if (!isMounted) return;

    if (app.particles) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      app.particles.burst(cx, cy, 45, { palette: 'sapphire', speed: 1.4 });
    }

    // Transition smoothly to Chapter 2 (Date Lock)
    app.progress.nextChapter();
  }

  function render() {
    const container = document.getElementById('chapter-1');
    if (!container) return;

    container.innerHTML = `
      <div class="countdown-chapter-wrapper">
        <!-- Dual Canvases for Rain & Foreground Particle Morph -->
        <canvas id="countdown-rain-canvas" class="countdown-rain-canvas"></canvas>
        <canvas id="countdown-fg-canvas" class="countdown-fg-canvas"></canvas>

        <!-- Ambient Vignette -->
        <div class="countdown-vignette" aria-hidden="true"></div>

        <!-- Finale Romantic Caption -->
        <div id="countdown-caption" class="countdown-caption"></div>

        <!-- Bottom Action Bar (Revealed on Finale) -->
        <div id="countdown-action-wrap" class="countdown-action-wrap" style="opacity: 0; pointer-events: none; transform: translateY(18px);">
          <button id="btn-countdown-begin" class="btn-glow" type="button">
            <span>${ch1Config.continueButtonText || 'Begin Our Journey ✨'}</span>
          </button>
        </div>

        <!-- Discreet Skip Option -->
        <button id="btn-countdown-skip" class="countdown-skip-btn" title="Skip to memories" aria-label="Skip to memories">
          <span>Skip →</span>
        </button>
      </div>
    `;

    rainCv = document.getElementById('countdown-rain-canvas');
    fgCv = document.getElementById('countdown-fg-canvas');

    if (rainCv) rctx = rainCv.getContext('2d');
    if (fgCv) ctx = fgCv.getContext('2d');

    off = document.createElement('canvas');
    octx = off.getContext('2d', { willReadFrequently: true });

    createHeartCanvas();
    resize();

    // Bind interaction events
    if (fgCv) {
      fgCv.addEventListener('pointermove', onPointerMove);
      fgCv.addEventListener('pointerleave', onPointerLeave);
      fgCv.addEventListener('pointerdown', onPointerDown);
    }

    window.addEventListener('resize', onWindowResize);

    const btnBegin = document.getElementById('btn-countdown-begin');
    if (btnBegin) {
      btnBegin.addEventListener('click', advanceToDateLock);
    }

    const btnSkip = document.getElementById('btn-countdown-skip');
    if (btnSkip) {
      btnSkip.addEventListener('click', advanceToDateLock);
    }
  }

  function cleanup() {
    isMounted = false;
    runId++;

    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }

    clearTimeout(resizeTimer);
    window.removeEventListener('resize', onWindowResize);

    if (fgCv) {
      fgCv.removeEventListener('pointermove', onPointerMove);
      fgCv.removeEventListener('pointerleave', onPointerLeave);
      fgCv.removeEventListener('pointerdown', onPointerDown);
    }

    P = [];
  }

  return {
    mount() {
      cleanup();
      isMounted = true;
      render();
      window.scrollTo({ top: 0, behavior: 'instant' });

      lastFrameTime = performance.now();
      animId = requestAnimationFrame(frame);
      playTimeline();
    },
    unmount() {
      cleanup();
    },
  };
}
