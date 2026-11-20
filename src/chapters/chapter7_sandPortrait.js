/**
 * ===================================================================
 * CHAPTER 7: THE SAND PORTRAIT & FINAL SURPRISE
 * ===================================================================
 * A mesmerizing sand particle physics simulation that gradually
 * draws her portrait and birthday caption from thousands of
 * luminous stardust and sand grains on a dark sapphire backdrop.
 *
 * Preserves the full particle physics, Sobel edge detection,
 * CDF target sampling, flow-field turbulence, and direct pixel
 * buffer rendering from the original Sand Portrait engine.
 * ===================================================================
 */

import { gsap } from 'gsap';
import { config } from '../config.js';
import { DEFAULT_SAND_PHOTO, DEFAULT_SAND_CAPTION } from '../assets/sandPortraitData.js';

export function createChapter7(app) {
  let animId = null;
  let isMounted = false;
  let resizeTimer = null;
  let dragCounter = 0;

  // Sand particle physics configuration
  const SR = 236, SG = 222, SB = 190; // Pale gold-silver sand
  const getPointBudget = () => {
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    return vmin < 600 ? 40000 : vmin < 800 ? 60000 : 85000;
  };

  const CFG = {
    MAX_POINTS: getPointBudget(),
    NOISE_SPEED: 1.0,
    POINT_SIZE: 1,
    INVERT: false,
    GAMMA: 1.1,
    DURATION: config.chapter7?.duration || 16,
    JITTER: 0.2,
    ALPHA: 0.9,
  };

  if (app.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    CFG.NOISE_SPEED = 0.3;
    CFG.DURATION = config.chapter7?.reducedMotionDuration || 4;
  }

  // Simulation variables & buffers
  let cv, ctx, lay, lctx, wk, wctx;
  let W = 0, H = 0, D = 1;
  let imgData, buf, N = 0;
  let X, Y, VX, VY, TX, TY, R, TR, TG, TB;
  let ww = 0, wh = 0, lum0 = null, rgb0 = null, lo = 0, hi = 1, hasSrc = false;
  let prog = 0, el = 0, playing = true, time = 0, last = performance.now();
  let GX, GY, gw = 0, gh = 0, G = 22, capFrac = 1;
  let currentLoadedImage = null;

  function renderUI() {
    const container = document.getElementById('chapter-7');
    if (!container) return;

    const ch7Config = config.chapter7 || {};
    const badge = ch7Config.badge || 'Chapter VII';
    const title = ch7Config.title || 'One Last Surprise';
    const subtitle = ch7Config.subtitle || 'Carved in stardust and memory...';

    container.innerHTML = `
      <div class="sand-chapter-wrapper">
        <!-- Interactive Fullscreen Sand Canvas -->
        <canvas id="sand-canvas" class="sand-canvas"></canvas>

        <!-- Drop overlay for custom photo testing -->
        <div id="sand-drop-overlay" class="sand-drop-overlay">
          <div class="sand-drop-content">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>Drop a photo to transform it into stardust</p>
          </div>
        </div>

        <!-- Atmospheric Chapter Title Bar (Gentle Top Floating) -->
        <header class="sand-header">
          <span class="chapter-badge">${badge}</span>
          <h1 class="sand-title">${title}</h1>
          <p class="sand-subtitle">${subtitle}</p>
        </header>

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
                <span>${ch7Config.replayButtonText || 'Scatter & Re-form ✨'}</span>
              </button>

              <div class="sand-scrub-group">
                <label for="sand-rv" class="sand-scrub-label">Formation</label>
                <input id="sand-rv" class="sand-range-slider" type="range" min="0" max="1000" step="1" value="0" aria-label="Formation scrub progress" />
                <span id="sand-rv-o" class="sand-scrub-value">0%</span>
              </div>

              <button id="sand-btn-toggle-panel" class="btn-glass icon-btn-text" aria-expanded="false" title="Fine-tune sand particle parameters">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <span id="sand-toggle-label">Settings</span>
              </button>

              <button id="sand-btn-replay-all" class="btn-subtle" title="Revisit journey from Chapter 1">
                <span>Relive Journey 💫</span>
              </button>
            </div>

            <!-- Expandable Advanced Settings Panel (Discreet Drawer) -->
            <div id="sand-advanced-panel" class="sand-advanced-drawer closed">
              <div class="sand-panel-grid">
                <div class="sand-param-row">
                  <span>Points</span>
                  <input id="sand-pts" type="range" min="10000" max="150000" step="5000" value="${CFG.MAX_POINTS}" />
                  <output id="sand-pts-o">${Math.round(CFG.MAX_POINTS / 1000)}k</output>
                </div>
                <div class="sand-param-row">
                  <span>Turbulence</span>
                  <input id="sand-nz" type="range" min="0" max="3" step="0.05" value="${CFG.NOISE_SPEED}" />
                  <output id="sand-nz-o">${CFG.NOISE_SPEED.toFixed(2)}</output>
                </div>
                <div class="sand-param-row">
                  <span>Point Size</span>
                  <input id="sand-ps" type="range" min="1" max="3" step="0.5" value="${CFG.POINT_SIZE}" />
                  <output id="sand-ps-o">${CFG.POINT_SIZE}</output>
                </div>
                <div class="sand-param-row">
                  <span>Gamma</span>
                  <input id="sand-gm" type="range" min="0.5" max="2.5" step="0.05" value="${CFG.GAMMA}" />
                  <output id="sand-gm-o">${CFG.GAMMA.toFixed(2)}</output>
                </div>
              </div>

              <div class="sand-panel-footer">
                <label class="btn-subtle custom-file-label" for="sand-file-input">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>Load Custom Photo</span>
                </label>
                <input id="sand-file-input" type="file" accept="image/*" style="display: none;" />

                <label class="sand-chk-label">
                  <input id="sand-inv" type="checkbox" ${CFG.INVERT ? 'checked' : ''} />
                  <span>Invert Colors</span>
                </label>
              </div>
            </div>

          </div>
        </footer>
      </div>
    `;
  }

  // --- Sand Simulation Lifecycle & Physics Engine ---

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

    // Sobel edge detection
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

    // CDF sampling weights
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

    const f = Math.min((W * 0.92) / ww, (H * 0.86) / wh);
    const ox = (W - ww * f) / 2;
    const oy = (H - wh * f) / 2 - 10 * D; // Slight optical lift

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
        // Caption text: radiant golden stardust
        TR[i] = 255;
        TG[i] = 224;
        TB[i] = 168;
      } else {
        let cr = rgb0[a * 4], cg = rgb0[a * 4 + 1], cb = rgb0[a * 4 + 2];
        const lu = 0.299 * cr + 0.587 * cg + 0.114 * cb;
        cr = lu + (cr - lu) * 1.5;
        cg = lu + (cg - lu) * 1.5;
        cb = lu + (cb - lu) * 1.5;

        // Luminous lift on dark sapphire backdrop
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

  // Fallback procedural demo portrait if image fails to load
  function demoPortrait() {
    const c = document.createElement('canvas');
    c.width = 600;
    c.height = 760;
    const g = c.getContext('2d');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, 600, 760);
    g.fillStyle = '#4a4a4a';
    g.beginPath();
    g.moveTo(40, 760);
    g.quadraticCurveTo(80, 600, 230, 570);
    g.lineTo(370, 570);
    g.quadraticCurveTo(520, 600, 560, 760);
    g.fill();
    g.fillStyle = '#8c8c8c';
    g.fillRect(250, 480, 100, 110);
    g.fillStyle = '#111';
    g.beginPath();
    g.ellipse(300, 290, 175, 230, 0, 0, 7);
    g.fill();
    const rg = g.createRadialGradient(270, 290, 20, 300, 300, 200);
    rg.addColorStop(0, '#f4f4f4');
    rg.addColorStop(1, '#7a7a7a');
    g.fillStyle = rg;
    g.beginPath();
    g.ellipse(300, 320, 125, 165, 0, 0, 7);
    g.fill();
    g.fillStyle = '#111';
    g.beginPath();
    g.moveTo(165, 300);
    g.quadraticCurveTo(190, 130, 300, 125);
    g.quadraticCurveTo(420, 130, 440, 300);
    g.quadraticCurveTo(400, 200, 300, 190);
    g.quadraticCurveTo(210, 200, 165, 300);
    g.fill();
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

  function frame(now) {
    if (!isMounted) return;

    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt * CFG.NOISE_SPEED;

    if (playing) {
      el += dt;
      prog = ease(Math.max(0, Math.min(1, (el - 1.2) / CFG.DURATION)));
      const rvSlider = document.getElementById('sand-rv');
      const rvOutput = document.getElementById('sand-rv-o');
      if (rvSlider) rvSlider.value = Math.round(prog * 1000);
      if (rvOutput) rvOutput.textContent = Math.round(prog * 100) + '%';
    }

    updateFlow(time);

    const push = 0.06 * CFG.NOISE_SPEED * D;
    const jit = CFG.JITTER * D;
    const ps = Math.max(1, Math.round(CFG.POINT_SIZE * D));
    const A = CFG.ALPHA * 255;

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
        vx += (TX[i] - x) * 0.012 * s;
        vy += (TY[i] - y) * 0.012 * s;
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

    // Deep sapphire-tinted persistence overlay
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
    if (ctx && cv) {
      ctx.fillStyle = '#040711';
      ctx.fillRect(0, 0, W, H);
    }
  }

  function loadImageSource(srcUrl) {
    const im = new Image();
    im.onload = () => {
      currentLoadedImage = im;
      const captionText = config.chapter7?.caption || DEFAULT_SAND_CAPTION;
      const compositeCanvas = withCaption(im, captionText);
      setSource(compositeCanvas, compositeCanvas.width, compositeCanvas.height);
      restart();
    };
    im.onerror = () => {
      console.warn('Could not load target portrait image, falling back to procedural demo.');
      const dm = demoPortrait();
      setSource(dm, dm.width, dm.height);
      restart();
    };
    im.src = srcUrl;
  }

  function loadCustomFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const im = new Image();
    im.onload = () => {
      currentLoadedImage = im;
      capFrac = 1; // Direct photo without forced caption band
      setSource(im, im.naturalWidth, im.naturalHeight);
      URL.revokeObjectURL(im.src);
      restart();
    };
    im.src = URL.createObjectURL(file);
  }

  function bindEvents() {
    // Restart / Re-form
    const btnRestart = document.getElementById('sand-btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        restart();
        if (app.particles) {
          app.particles.burst(window.innerWidth / 2, window.innerHeight / 2, 40, { palette: 'gold', speed: 1.2 });
        }
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

    // Toggle advanced settings drawer
    const btnToggle = document.getElementById('sand-btn-toggle-panel');
    const panel = document.getElementById('sand-advanced-panel');
    const toggleLabel = document.getElementById('sand-toggle-label');
    if (btnToggle && panel) {
      btnToggle.addEventListener('click', () => {
        const isClosed = panel.classList.toggle('closed');
        btnToggle.setAttribute('aria-expanded', !isClosed);
        if (toggleLabel) toggleLabel.textContent = isClosed ? 'Settings' : 'Close';
      });
    }

    // Relive entire journey from beginning
    const btnReplayAll = document.getElementById('sand-btn-replay-all');
    if (btnReplayAll) {
      btnReplayAll.addEventListener('click', () => {
        if (confirm('Revisit our journey from the very beginning?')) {
          app.progress.resetProgress();
        }
      });
    }

    // Sliders binding helper
    const bindControl = (id, key, fmt, onChange) => {
      const el_ = document.getElementById(id);
      const out_ = document.getElementById(id + '-o');
      if (!el_) return;
      const show = () => {
        if (out_) out_.textContent = fmt(CFG[key]);
      };
      el_.value = CFG[key];
      show();
      el_.addEventListener(onChange ? 'change' : 'input', () => {
        CFG[key] = parseFloat(el_.value);
        show();
        if (onChange) onChange();
      });
    };

    bindControl('sand-pts', 'MAX_POINTS', (v) => Math.round(v / 1000) + 'k', alloc);
    bindControl('sand-nz', 'NOISE_SPEED', (v) => v.toFixed(2));
    bindControl('sand-ps', 'POINT_SIZE', (v) => v);
    bindControl('sand-gm', 'GAMMA', (v) => v.toFixed(2), () => {
      if (hasSrc) buildTargets();
    });

    const inv = document.getElementById('sand-inv');
    if (inv) {
      inv.addEventListener('change', (e) => {
        CFG.INVERT = e.target.checked;
        if (hasSrc) buildTargets();
      });
    }

    // File input for custom photos
    const fileInput = document.getElementById('sand-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          loadCustomFile(e.target.files[0]);
        }
      });
    }

    // Drag and drop photo onto screen
    const dropOverlay = document.getElementById('sand-drop-overlay');
    const container = document.getElementById('chapter-7');

    if (container && dropOverlay) {
      container.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;
        dropOverlay.classList.add('active');
      });

      container.addEventListener('dragleave', (e) => {
        e.preventDefault();
        if (--dragCounter <= 0) {
          dragCounter = 0;
          dropOverlay.classList.remove('active');
        }
      });

      container.addEventListener('dragover', (e) => e.preventDefault());

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        dropOverlay.classList.remove('active');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          loadCustomFile(e.dataTransfer.files[0]);
        }
      });
    }

    // Debounced window resize
    window.addEventListener('resize', onWindowResize);
  }

  function onWindowResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (isMounted) resize();
    }, 150);
  }

  // --- Public Lifecycle Methods ---

  return {
    mount() {
      if (isMounted) return;
      isMounted = true;

      renderUI();
      initCanvases();
      bindEvents();

      // Load portrait photo
      const photoSrc = config.chapter7?.photoSrc || DEFAULT_SAND_PHOTO;
      loadImageSource(photoSrc);

      // Start animation loop
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
