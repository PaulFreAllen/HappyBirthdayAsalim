/**
 * ===================================================================
 * BACKGROUND PARTICLES — BIOLUMINESCENT CELESTIAL STARDUST
 * ===================================================================
 * Lightweight, high-performance Canvas particle system.
 * Creates an ambient atmosphere of sapphire dust, cyan embers,
 * and subtle glowing stars.
 *
 * Features:
 * - Ambient drifting particles with natural twinkling & mouse parallax
 * - Configurable palette bursts (cyan, sapphire, gold, error-crimson, rose)
 * - Motion trail micro-emissions for fleeing elements
 * - Shimmering celebration cascades
 * - Tab visibility listener (pauses RAF when hidden for 0 idle CPU)
 * - Prefers-reduced-motion compliance
 * ===================================================================
 */

export class BackgroundParticles {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.particles = [];
    this.burstParticles = [];
    this.trailParticles = [];
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.animationFrameId = null;
    this.isPaused = false;
    this.mouse = { x: this.width / 2, y: this.height / 2, targetX: this.width / 2, targetY: this.height / 2 };
    
    // Check reduced motion preference
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Density calculation (capped for mobile performance)
    const baseDensity = this.reducedMotion ? 35000 : 13000;
    this.particleCount = Math.min(Math.floor((this.width * this.height) / baseDensity), this.reducedMotion ? 25 : 85);

    // Color palettes
    this.palettes = {
      default: [
        'rgba(0, 240, 255, ',     // Cyan
        'rgba(56, 189, 248, ',    // Sky blue
        'rgba(37, 99, 235, ',     // Royal sapphire
        'rgba(147, 197, 253, ',   // Pale ice
      ],
      sapphire: [
        'rgba(0, 240, 255, ',
        'rgba(37, 99, 235, ',
        'rgba(96, 165, 250, ',
        'rgba(255, 255, 255, ',
      ],
      gold: [
        'rgba(251, 191, 36, ',    // Amber gold
        'rgba(245, 158, 11, ',    // Warm gold
        'rgba(254, 240, 138, ',   // Pale sunlight
        'rgba(255, 255, 255, ',
      ],
      error: [
        'rgba(244, 63, 94, ',     // Rose red
        'rgba(168, 85, 247, ',    // Purple spark
        'rgba(225, 29, 72, ',     // Crimson
        'rgba(251, 113, 133, ',   // Soft red
      ],
      rose: [
        'rgba(244, 114, 182, ',   // Pink
        'rgba(192, 132, 252, ',   // Lavender
        'rgba(56, 189, 248, ',    // Cyan-blue
        'rgba(255, 255, 255, ',
      ],
    };

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Smooth mouse parallax
    window.addEventListener('pointermove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    }, { passive: true });

    // Listen for tab visibility to conserve device power
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isPaused = true;
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      } else {
        this.isPaused = false;
        this.loop();
      }
    });

    this.createAmbientField();
    this.loop();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  createAmbientField() {
    this.particles = [];
    const colors = this.palettes.default;

    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 2.0 + 0.5,
        baseAlpha: Math.random() * 0.55 + 0.15,
        colorPrefix: colors[Math.floor(Math.random() * colors.length)],
        vx: this.reducedMotion ? 0 : (Math.random() - 0.5) * 0.2,
        vy: this.reducedMotion ? 0 : -Math.random() * 0.3 - 0.08, // Gently drifting upward
        twinkleSpeed: Math.random() * 0.02 + 0.008,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  /**
   * Scatter/Burst effect triggered on button click or milestone
   * @param {number} originX Screen X
   * @param {number} originY Screen Y
   * @param {number} count Number of bursting embers
   * @param {object} options { palette: 'default'|'gold'|'error'|'sapphire'|'rose', speed: number }
   */
  burst(originX = this.width / 2, originY = this.height / 2, count = 45, options = {}) {
    if (this.reducedMotion) return;

    const paletteKey = options.palette || 'default';
    const burstColors = this.palettes[paletteKey] || this.palettes.default;
    const speedMultiplier = options.speed || 1;

    // Cap active bursts to maintain 60 FPS
    if (this.burstParticles.length > 140) {
      this.burstParticles.splice(0, 40);
    }

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 5 + 1.8) * speedMultiplier;
      this.burstParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.6 + 0.8,
        colorPrefix: burstColors[Math.floor(Math.random() * burstColors.length)],
        alpha: 1,
        decay: Math.random() * 0.022 + 0.016,
        gravity: 0.04,
      });
    }
  }

  /**
   * Floating stardust particles that converge toward the center
   * @param {number} targetX Destination X
   * @param {number} targetY Destination Y
   * @param {number} count Number of particles
   * @param {object} options
   */
  converge(targetX, targetY, count = 25, options = {}) {
    if (this.reducedMotion) return;
    const paletteKey = options.palette || 'sapphire';
    const burstColors = this.palettes[paletteKey] || this.palettes.default;
    const speedMultiplier = options.speed || 1;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 220 + 130;
      const startX = targetX + Math.cos(angle) * distance;
      const startY = targetY + Math.sin(angle) * distance;
      const dx = targetX - startX;
      const dy = targetY - startY;
      const len = Math.hypot(dx, dy) || 1;
      const speed = (Math.random() * 2.6 + 1.2) * speedMultiplier;

      this.burstParticles.push({
        x: startX,
        y: startY,
        vx: (dx / len) * speed,
        vy: (dy / len) * speed,
        size: Math.random() * 2.2 + 0.8,
        colorPrefix: burstColors[Math.floor(Math.random() * burstColors.length)],
        alpha: 0.95,
        decay: 0.012, // Long life to reach center
        gravity: 0,
      });
    }
  }

  /**
   * Subtle micro-trail emitted behind escaping buttons or moving elements
   * @param {number} x Screen X
   * @param {number} y Screen Y
   * @param {number} count Number of trail particles
   * @param {object} options
   */
  emitTrail(x, y, count = 3, options = {}) {
    if (this.reducedMotion) return;

    const paletteKey = options.palette || 'default';
    const colors = this.palettes[paletteKey] || this.palettes.default;

    for (let i = 0; i < count; i++) {
      this.trailParticles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        size: Math.random() * 2.0 + 0.8,
        colorPrefix: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.75,
        decay: 0.04, // Dissipates rapidly (~25 frames)
      });
    }
  }

  /**
   * Grand celebration cascade across the screen (used for quiz completion)
   */
  cascade(durationMs = 2000) {
    if (this.reducedMotion) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - startTime > durationMs || this.isPaused) {
        clearInterval(interval);
        return;
      }
      const x = Math.random() * this.width;
      this.burst(x, -10, 3, { palette: 'gold', speed: 0.7 });
    }, 120);
  }

  loop() {
    if (this.isPaused) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Smooth mouse parallax easing
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;
    const parallaxOffsetX = (this.mouse.x - this.width / 2) * 0.018;
    const parallaxOffsetY = (this.mouse.y - this.height / 2) * 0.018;

    const time = Date.now() * 0.001;

    // 1. Draw Ambient Bioluminescent Stardust
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around screen smoothly
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;
      if (p.y < -10) p.y = this.height + 10;
      if (p.y > this.height + 10) p.y = -10;

      const alpha = p.baseAlpha + Math.sin(time * 2 + p.twinkleOffset) * 0.22;
      const clampedAlpha = Math.max(0.04, Math.min(0.85, alpha));

      const drawX = p.x + parallaxOffsetX * (p.size * 0.5);
      const drawY = p.y + parallaxOffsetY * (p.size * 0.5);

      this.ctx.beginPath();
      this.ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `${p.colorPrefix}${clampedAlpha})`;
      this.ctx.fill();

      // Soft halo for larger particles
      if (p.size > 1.6) {
        this.ctx.beginPath();
        this.ctx.arc(drawX, drawY, p.size * 2.2, 0, Math.PI * 2);
        this.ctx.fillStyle = `${p.colorPrefix}${clampedAlpha * 0.2})`;
        this.ctx.fill();
      }
    }

    // 2. Draw Motion Trail Particles
    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const tp = this.trailParticles[i];
      tp.x += tp.vx;
      tp.y += tp.vy;
      tp.alpha -= tp.decay;

      if (tp.alpha <= 0) {
        this.trailParticles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(tp.x, tp.y, tp.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `${tp.colorPrefix}${tp.alpha})`;
      this.ctx.fill();
    }

    // 3. Draw Active Burst Particles
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const bp = this.burstParticles[i];
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.vy += bp.gravity;
      bp.vx *= 0.98;
      bp.vy *= 0.98;
      bp.alpha -= bp.decay;

      if (bp.alpha <= 0) {
        this.burstParticles.splice(i, 1);
        continue;
      }

      this.ctx.beginPath();
      this.ctx.arc(bp.x, bp.y, bp.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `${bp.colorPrefix}${bp.alpha})`;
      this.ctx.fill();
    }

    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
