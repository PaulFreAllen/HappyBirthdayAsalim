/**
 * ===================================================================
 * CHAPTER 4 — SAND PORTRAIT BIRTHDAY FINALE
 * ===================================================================
 * A mesmerizing sand particle physics simulation that gradually
 * draws her portrait and birthday caption from thousands of
 * luminous stardust and sand grains on a dark sapphire backdrop.
 *
 * Requirements:
 * - Preserves the original sand animation particle physics, Sobel edge
 *   detection, flow field, and target sampling.
 * - After the sand animation has completely formed her portrait, reveals:
 *   "Happy Birthday, Asalim!"
 * - Does not show the birthday message before the portrait is complete.
 * - Continue button advances to Chapter 5 (Countdown & Message Interaction).
 * ===================================================================
 */

import { gsap } from 'gsap';
import { config } from '../config.js';
import { DEFAULT_SAND_PHOTO, DEFAULT_SAND_CAPTION } from '../assets/sandPortraitData.js';

export function createChapter4(app) {
  let animId = null;
  let isMounted = false;
  let resizeTimer = null;
  let dragCounter = 0;
  let isMessageRevealed = false;

  // Sand particle physics configuration
  const SR = 236, SG = 222, SB = 190; // Pale gold-silver sand
  const getPointBudget = () => {
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    const vmax = Math.max(window.innerWidth, window.innerHeight);
    return vmax >= 1200 ? 110000 : vmin < 600 ? 45000 : 75000;
  };

  const CFG = {
    MAX_POINTS: getPointBudget(),
    NOISE_SPEED: 1.0,
    POINT_SIZE: 1,
    INVERT: false,
    GAMMA: 1.1,
    DURATION: config.chapter4?.duration || 8,
    JITTER: 0.2,
    ALPHA: 0.9,
  };

  if (app.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    CFG.NOISE_SPEED = 0.3;
    CFG.DURATION = config.chapter4?.reducedMotionDuration || 3;
  }

  // Simulation variables & buffers
  let cv, ctx, lay, lctx, wk, wctx;
  let W = 0, H = 0, D = 1;
  let imgData, buf, N = 0;
  let X, Y, VX, VY, TX, TY, R, TR, TG, TB;
  let ww = 0, wh = 0, lum0 = null, rgb0 = null, lo = 0, hi = 1, hasSrc = false;
  let prog = 0, el = 0, playing = true, time = 0, last = performance.now();
  let GX, GY, gw = 0, gh = 0, G = 22, capFrac = 1;

  function renderUI() {
    const container = document.getElementById('chapter-4');
    if (!container) return;

    const ch4Config = config.chapter4 || {};
    const badge = ch4Config.badge || 'Chapter IV';
    const title = ch4Config.title || 'Sand Portrait';
    const subtitle = ch4Config.subtitle || 'Carved in stardust and memory...';
    const birthdayMsg = ch4Config.birthdayMessage || 'Happy Birthday, Asalim!';
    const continueBtnText = ch4Config.continueButtonText || 'Continue ✨';

    isMessageRevealed = false;

    container.innerHTML = `
      <div class="sand-chapter-wrapper">
        <!-- Interactive Fullscreen Sand Canvas -->
        <canvas id="sand-canvas" class="sand-canvas"></canvas>

        <!-- Atmospheric Chapter Title Bar (Gentle Top Floating) -->
        <header class="sand-header">
          <span class="chapter-badge">${badge}</span>
          <h1 class="sand-title">${title}</h1>
          <p class="sand-subtitle">${subtitle}</p>
        </header>

        <!-- Birthday Climax Banner: STRICTLY REVEALED ONLY AFTER PORTRAIT COMPLETION -->
        <div id="sand-birthday-banner" class="sand-birthday-banner" style="display: none; opacity: 0;" aria-live="polite">
          <div class="glass-card sand-birthday-card">
            <div class="sand-birthday-sparkle">✨</div>
            <h2 class="sand-birthday-text">${birthdayMsg}</h2>
            <div class="sand-birthday-actions">
              <button id="sand-btn-to-countdown" class="btn-glow">
                <span>${continueBtnText}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Bottom Elegant Glassmorphic Control Bar -->
        <footer class="sand-controls-bar">
          <div class="sand-controls-inner glass-card">
            
            <!-- Quick Actions: Scatter & Re-form + Reveal Slider -->
            <div class="sand-actions-row">
              <button id="sand-btn-restart" class="btn-glow" title="Watch the sand gather again">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                <span>${ch4Config.replayButtonText || 'Scatter & Re-form ✨'}</span>
              </button>

              <div class="sand-scrub-group">
                <label for="sand-rv" class="sand-scrub-label">Formation</label>
                <input id="sand-rv" class="sand-range-slider" type="range" min="0" max="1000" step="1" value="0" aria-label="Formation scrub progress" />
                <span id="sand-rv-o" class="sand-scrub-value">0%</span>
              </div>
            </div>

          </div>
        </footer>
      </div>
    `;
  }

  function initCanvases() {
    cv = document.getElementById('sand-canvas');
    if (!cv) return;

    ctx = cv.getContext('2d');
    lay = document.createElement('canvas');
    lctx = lay.getContext('2d');
    wk = document.createElement('canvas');
    wctx = wk.getContext('2d', { willReadFrequently: true });

    resize();
    alloc();
  }

  function resize() {
    if (!cv || !isMounted) return;

    D = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.round(window.innerWidth * D);
    H = Math.round(window.innerHeight * D);

    cv.width = lay.width = W;
    cv.height = lay.height = H;

    imgData = lctx.createImageData(W, H);
    buf = new Uint32Array(imgData.data.buffer);

    ctx.fillStyle = '#040711';
    ctx.fillRect(0, 0, W, H);

    G = Math.round(22 * D);
    gw = Math.ceil(W / G) + 2;
    gh = Math.ceil(H / G) + 2;
    GX = new Float32Array(gw * gh);
    GY = new Float32Array(gw * gh);

    if (N) {
      scatter();
      if (hasSrc) buildTargets();
    }
  }

  function alloc() {
    N = CFG.MAX_POINTS;
    X = new Float32Array(N);
    Y = new Float32Array(N);
    VX = new Float32Array(N);
    VY = new Float32Array(N);
    TX = new Float32Array(N);
    TY = new Float32Array(N);
    R = new Float32Array(N);
    TR = new Uint8Array(N);
    TG = new Uint8Array(N);
    TB = new Uint8Array(N);

    scatter();
    if (hasSrc) buildTargets();
  }

  function scatter() {
    for (let i = 0; i < N; i++) {
      X[i] = Math.random() * W;
      Y[i] = Math.random() * H;
      VX[i] = 0;
      VY[i] = 0;
    }
  }

  function setSource(src, sw, sh) {
    const k = 900 / Math.max(sw, sh);
    ww = Math.max(2, Math.round(sw * k));
    wh = Math.max(2, Math.round(sh * k));

    wk.width = ww;
    wk.height = wh;
    wctx.fillStyle = '#ffffff';
    wctx.fillRect(0, 0, ww, wh);
    wctx.drawImage(src, 0, 0, ww, wh);

    const d = wctx.getImageData(0, 0, ww, wh).data;
    const n = ww * wh;
    rgb0 = d;
    lum0 = new Float32Array(n);
    const hist = new Uint32Array(256);

    for (let i = 0; i < n; i++) {
      const v = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
      lum0[i] = v;
      hist[(v * 255) | 0]++;
    }

    let c = 0, a = 0;
    lo = 0;
    hi = 1;

    for (let b = 0; b < 256; b++) {
      c += hist[b];
      if (!a && c >= n * 0.01) {
        lo = b / 255;
        a = 1;
      }
      if (c >= n * 0.99) {
        hi = b / 255;
        break;
      }
    }

    hasSrc = true;
    buildTargets();
  }

  function buildTargets() {
    const n = ww * wh;
    const L = new Float32Array(n);
    const E = new Float32Array(n);
    const span = (hi - lo) || 1;

    for (let i = 0; i < n; i++) {
      let v = (lum0[i] - lo) / span;
      v = v < 0 ? 0 : v > 1 ? 1 : v;
      v = Math.pow(v, CFG.GAMMA);
      L[i] = CFG.INVERT ? v : 1 - v;
    }

    for (let y = 1; y < wh - 1; y++) {
      for (let x = 1; x < ww - 1; x++) {
        const i = y * ww + x;
        const gx = L[i - ww + 1] + 2 * L[i + 1] + L[i + ww + 1] - L[i - ww - 1] - 2 * L[i - 1] - L[i + ww - 1];
        const gy = L[i + ww - 1] + 2 * L[i + ww] + L[i + ww + 1] - L[i - ww - 1] - 2 * L[i - ww] - L[i - ww + 1];
        const bm = x < 4 || x >= ww - 4 || y < 4 || y >= wh - 4 || Math.abs(y - Math.floor(wh * capFrac)) < 4;
        const e = bm ? 0 : Math.sqrt(gx * gx + gy * gy) * 0.6;
        E[i] = e > 1 ? 1 : e;
      }
    }

    const cdf = new Float64Array(n);
    let s = 0;
    const capRow = Math.floor(wh * capFrac);

    for (let i = 0; i < n; i++) {
      const d = L[i] - 0.05;
      let w = (d > 0 ? Math.pow(d, 1.2) : 0) + 0.9 * E[i];
      const cr = rgb0[i * 4];
      const cg = rgb0[i * 4 + 1];
      const cb = rgb0[i * 4 + 2];
      const sat = (Math.max(cr, cg, cb) - Math.min(cr, cg, cb)) / 255;
      if (sat > 0.1) w += 5 * (sat - 0.1);
      if (((i / ww) | 0) >= capRow) w *= 6;
      s += w;
      cdf[i] = s;
    }

    if (s <= 0) return;

    // Desktop: cover whole desktop (object-fit: cover) so particles span edge-to-edge
    // Mobile: responsive fill
    const isDesktop = (W / H) >= 1.0 || window.innerWidth >= 768;

    let f, ox, oy;
    if (isDesktop) {
      // Scale to cover the entire desktop viewport width and height
      f = Math.max(W / ww, H / (wh * capFrac));
      ox = (W - ww * f) / 2;
      // Center vertically around face and upper portrait region
      oy = (H - (wh * capFrac) * f) * 0.35;
    } else {
      f = Math.max(W / ww, (H * 0.88) / wh);
      ox = (W - ww * f) / 2;
      oy = (H - wh * f) / 2 - 10 * D;
    }

    for (let i = 0; i < N; i++) {
      const r = Math.random() * s;
      let a = 0, b = n - 1;
      while (a < b) {
        const m = (a + b) >> 1;
        if (cdf[m] < r) a = m + 1;
        else b = m;
      }

      TX[i] = ox + ((a % ww) + Math.random()) * f;
      TY[i] = oy + (((a / ww) | 0) + Math.random()) * f;
      R[i] = (1 - E[a]) * 0.45 + Math.random() * 0.3;

      if (((a / ww) | 0) >= capRow) {
        TR[i] = 255;
        TG[i] = 224;
        TB[i] = 168;
      } else {
        let cr = rgb0[a * 4], cg = rgb0[a * 4 + 1], cb = rgb0[a * 4 + 2];
        const lu = 0.299 * cr + 0.587 * cg + 0.114 * cb;
        cr = lu + (cr - lu) * 1.5;
        cg = lu + (cg - lu) * 1.5;
        cb = lu + (cb - lu) * 1.5;

        const lift = (c) => {
          c = c < 0 ? 0 : c > 255 ? 255 : c;
          return 255 * Math.pow(c / 255, 0.5);
        };

        TR[i] = lift(cr);
        TG[i] = lift(cg);
        TB[i] = lift(cb);
      }
    }
  }

  function withCaption(im, captionText) {
    const w = im.naturalWidth || im.width;
    const h = im.naturalHeight || im.height;
    const m = document.createElement('canvas').getContext('2d');
    let fs = w * 0.088;
    const font = (s) => `italic 700 ${s}px Georgia, "Times New Roman", serif`;

    m.font = font(fs);
    const tw = m.measureText(captionText).width;
    fs *= Math.min(1, (w * 0.9) / tw);

    const band = Math.round(fs * 2.1);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h + band;
    const g = c.getContext('2d');

    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, w, h + band);
    g.drawImage(im, 0, 0);

    g.fillStyle = '#000000';
    g.font = font(fs);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(captionText, w / 2, h + band * 0.5);

    capFrac = h / (h + band);
    return c;
  }

  function updateFlow(t) {
    for (let j = 0; j < gh; j++) {
      for (let i = 0; i < gw; i++) {
        const fx = (i * G) / D, fy = (j * G) / D;
        const a = Math.sin(fx * 0.006 + t * 0.7) * 2 +
                  Math.cos(fy * 0.007 - t * 0.5) * 2 +
                  Math.sin((fx + fy) * 0.004 + t * 0.3) * 2;
        GX[j * gw + i] = Math.cos(a);
        GY[j * gw + i] = Math.sin(a);
      }
    }
  }

  const ease = (p) => p * p * (3 - 2 * p);

  function revealBirthdayClimax() {
    if (isMessageRevealed) return;
    isMessageRevealed = true;

    const banner = document.getElementById('sand-birthday-banner');
    if (!banner) return;

    banner.style.display = 'flex';

    if (app.particles) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight * 0.42;
      app.particles.burst(cx, cy, 60, { palette: 'gold', speed: 1.6 });
      app.particles.burst(cx, cy, 40, { palette: 'sapphire', speed: 1.4 });
      app.particles.cascade(3000);
    }

    gsap.fromTo(banner,
      { opacity: 0, scale: 0.9, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );
  }

  function hideBirthdayClimax() {
    if (!isMessageRevealed) return;
    isMessageRevealed = false;

    const banner = document.getElementById('sand-birthday-banner');
    if (banner) {
      gsap.to(banner, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          banner.style.display = 'none';
        },
      });
    }
  }

  function frame(now) {
    if (!isMounted) return;

    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt * CFG.NOISE_SPEED;

    if (playing) {
      el += dt;
      prog = ease(Math.max(0, Math.min(1, (el - 0.4) / (CFG.DURATION - 0.4))));
      const rvSlider = document.getElementById('sand-rv');
      const rvOutput = document.getElementById('sand-rv-o');
      if (rvSlider) rvSlider.value = Math.round(prog * 1000);
      if (rvOutput) rvOutput.textContent = Math.round(prog * 100) + '%';
    }

    // STRICT REQUIREMENT: Only reveal birthday message AFTER portrait is completely formed
    if (prog >= 0.98) {
      revealBirthdayClimax();
    } else if (prog < 0.90) {
      hideBirthdayClimax();
    }

    updateFlow(time);

    const push = 0.06 * CFG.NOISE_SPEED * D;
    const jit = CFG.JITTER * D;
    const ps = Math.max(1, Math.round(CFG.POINT_SIZE * D));
    const A = CFG.ALPHA * 255;
    const pull = 0.024 * (8 / CFG.DURATION);

    buf.fill(0);

    for (let i = 0; i < N; i++) {
      let x = X[i], y = Y[i], vx = VX[i], vy = VY[i];
      let s = (prog - R[i]) * 4;
      s = s < 0 ? 0 : s > 1 ? 1 : s;

      const gi = (((y / G) | 0) * gw) + ((x / G) | 0);
      const fl = 1 - s * 0.92;

      vx += (GX[gi] * push + (Math.random() - 0.5) * 0.08 * D) * fl;
      vy += (GY[gi] * push + (Math.random() - 0.5) * 0.08 * D) * fl;

      if (s > 0) {
        vx += (TX[i] - x) * pull * s;
        vy += (TY[i] - y) * pull * s;
      }

      const damp = 0.965 - 0.075 * s;
      vx *= damp;
      vy *= damp;

      x += vx + (Math.random() - 0.5) * jit;
      y += vy + (Math.random() - 0.5) * jit;

      if (x < 0) x += W;
      else if (x >= W) x -= W;
      if (y < 0) y += H;
      else if (y >= H) y -= H;

      X[i] = x;
      Y[i] = y;
      VX[i] = vx;
      VY[i] = vy;

      const aa = (A * (0.4 + 0.6 * s)) | 0;
      const xi = x | 0;
      const yi = y | 0;

      const ct = s * s * (3 - 2 * s);
      const col =
        ((SB + (TB[i] - SB) * ct) << 16) |
        ((SG + (TG[i] - SG) * ct) << 8) |
        (SR + (TR[i] - SR) * ct);

      if (ps === 1) {
        const k = yi * W + xi;
        let a = (buf[k] >>> 24) + aa;
        if (a > 255) a = 255;
        buf[k] = (a << 24) | col;
      } else {
        const xe = Math.min(W, xi + ps);
        const ye = Math.min(H, yi + ps);
        for (let yy = yi; yy < ye; yy++) {
          for (let xx = xi; xx < xe; xx++) {
            const k = yy * W + xx;
            let a = (buf[k] >>> 24) + aa;
            if (a > 255) a = 255;
            buf[k] = (a << 24) | col;
          }
        }
      }
    }

    lctx.putImageData(imgData, 0, 0);

    ctx.fillStyle = 'rgba(4, 7, 17, 0.08)';
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(lay, 0, 0);

    animId = requestAnimationFrame(frame);
  }

  function restart() {
    scatter();
    el = 0;
    prog = 0;
    playing = true;
    hideBirthdayClimax();
    if (ctx && cv) {
      ctx.fillStyle = '#040711';
      ctx.fillRect(0, 0, W, H);
    }
  }

  function loadImageSource(srcUrl) {
    const im = new Image();
    im.onload = () => {
      const captionText = config.chapter4?.caption || DEFAULT_SAND_CAPTION;
      const compositeCanvas = withCaption(im, captionText);
      setSource(compositeCanvas, compositeCanvas.width, compositeCanvas.height);
      restart();
    };
    im.src = srcUrl;
  }

  function bindEvents() {
    const btnRestart = document.getElementById('sand-btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        restart();
        if (app.particles) {
          app.particles.burst(window.innerWidth / 2, window.innerHeight / 2, 40, { palette: 'gold', speed: 1.2 });
        }
      });
    }

    // Continue to Chapter 5 (Countdown & Message)
    const btnToCountdown = document.getElementById('sand-btn-to-countdown');
    if (btnToCountdown) {
      btnToCountdown.addEventListener('click', () => {
        app.progress.nextChapter();
      });
    }

    // Scrub slider
    const rv = document.getElementById('sand-rv');
    const rv_o = document.getElementById('sand-rv-o');
    if (rv) {
      rv.addEventListener('input', (e) => {
        playing = false;
        prog = e.target.value / 1000;
        if (rv_o) rv_o.textContent = Math.round(prog * 100) + '%';
      });
    }

    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (isMounted) resize();
    }, 150);
  }

  return {
    mount() {
      if (isMounted) return;
      isMounted = true;

      renderUI();
      initCanvases();
      bindEvents();

      const photoSrc = config.chapter4?.photoSrc || DEFAULT_SAND_PHOTO;
      loadImageSource(photoSrc);

      last = performance.now();
      animId = requestAnimationFrame(frame);
    },

    unmount() {
      isMounted = false;

      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }

      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onWindowResize);
    },
  };
}
