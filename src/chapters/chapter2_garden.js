/**
 * ===================================================================
 * CHAPTER 2 — SAPPHIRE BLOSSOM: BLUE ROSE GARDEN
 * ===================================================================
 * Features:
 * - Prologue introduction with poetic reveal
 * - ScrollTrigger pinned viewport with scrubbed GSAP timeline
 * - Multi-stage botanical growth: seed -> roots -> stems -> buds -> blooming
 * - Layered depth composition (foreground, midground, background)
 * - Calibrated SVG roses with realistic reflexed petals and cyan rims
 * - Gentle idle breeze sway once fully bloomed
 * - Emotional epilogue revelation:
 *   "I couldn't bring you flowers today..."
 *   "I'm going to make that happen very soon."
 * ===================================================================
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { config } from '../config.js';
import { getRoseGradients, createRoseSVG } from './garden/roseGenerator.js';
import { getGardenComposition } from './garden/gardenLayout.js';
import { createGrowthTimeline } from './garden/flowerGrowth.js';

export function createChapter2(app) {
  let scrollTriggerInstance = null;
  let growthTimeline = null;
  let idleAnimationId = null;
  let isIdleActive = false;
  let roseConfigs = [];

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gardenConfig = config.chapter2;

  function render() {
    const container = document.getElementById('chapter-2');
    if (!container) return;

    // Get responsive composition based on screen width
    const viewWidth = window.innerWidth;
    roseConfigs = getGardenComposition(viewWidth, window.innerHeight);

    // Build SVG roses
    const rosesSvgString = roseConfigs.map((cfg) => createRoseSVG(cfg)).join('\n');

    container.innerHTML = `
      <!-- Pinned Scroll Track Container (360vh scroll depth for smooth scrub) -->
      <div id="garden-scroll-track" class="garden-scroll-track">
        <!-- Pinned Stage Viewport -->
        <div id="garden-viewport" class="garden-viewport">
          
          <!-- Opening Poetic Prologue -->
          <div id="garden-prologue" class="garden-prologue-overlay">
            <p class="prologue-line line-1">"${gardenConfig.prologue1}"</p>
            <p class="prologue-line line-2">"${gardenConfig.prologue2}"</p>
            <div class="scroll-prompt-hint">
              <span>${gardenConfig.seedPrompt}</span>
              <svg class="scroll-arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            </div>
          </div>

          <!-- Atmospheric Sapphire Aura Overlay -->
          <div class="garden-atmospheric-aura" aria-hidden="true"></div>

          <!-- Master Garden SVG Stage -->
          <svg 
            id="garden-stage-svg" 
            class="garden-stage-svg" 
            viewBox="0 0 1200 800" 
            preserveAspectRatio="xMidYMax slice"
            aria-label="Sapphire Rose Garden"
          >
            ${getRoseGradients()}

            <!-- Distant Horizon Mist & Navy Ground Silhouette -->
            <g class="garden-ground-group">
              <ellipse cx="600" cy="790" rx="750" ry="120" fill="url(#gardenHorizonMistGrad)" />
              <path 
                d="M -100,800 Q 250,730 600,750 T 1300,740 L 1300,850 L -100,850 Z" 
                fill="#030712" 
                stroke="rgba(56, 189, 248, 0.12)" 
                stroke-width="1.5" 
              />
            </g>

            <!-- Awakening Glowing Seed -->
            <g id="garden-seed-group" transform="translate(600, 755)">
              <circle id="garden-seed-ring" cx="0" cy="0" r="30" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="3 3" opacity="0" />
              <circle id="garden-seed-orb" cx="0" cy="0" r="10" fill="#00f0ff" filter="drop-shadow(0 0 12px #00f0ff)" opacity="0" />
            </g>

            <!-- Procedural Sapphire Roses (Grouped by depth) -->
            <g id="garden-roses-group" class="garden-roses-group">
              ${rosesSvgString}
            </g>
          </svg>

          <!-- Emotional Epilogue Card -->
          <div id="garden-epilogue-card" class="garden-epilogue-card" style="opacity: 0;">
            <p class="epilogue-phrase-1">${gardenConfig.epilogue1}</p>
            <h2 class="epilogue-headline">${gardenConfig.epilogue2}</h2>
            ${gardenConfig.epilogue3 ? `<p class="epilogue-phrase-3">${gardenConfig.epilogue3}</p>` : ''}
            <button id="garden-continue-btn" class="btn-glow" style="margin-top: 1.25rem;">
              <span>${gardenConfig.continueButtonText || 'Open the letter ✉️'}</span>
            </button>
          </div>

        </div>
      </div>
    `;

    bindPrologue();
    setupScrollAnimation();
  }

  function bindPrologue() {
    const continueBtn = document.getElementById('garden-continue-btn');

    // Button advances to Chapter 3 (The Letter)
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (continueBtn.disabled) return;
        continueBtn.disabled = true;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        if (app.particles) {
          app.particles.converge(centerX, centerY, 35, { palette: 'sapphire', speed: 1.3 });
        }

        const tl = gsap.timeline({
          onComplete: () => {
            app.progress.nextChapter();
          },
        });

        tl.to('#garden-epilogue-card', {
          opacity: 0,
          scale: 0.95,
          filter: 'blur(8px)',
          duration: 0.45,
          ease: 'power2.in',
        });
        tl.to('#garden-viewport', {
          opacity: 0,
          duration: 0.45,
          ease: 'power2.in',
        }, '-=0.2');
      });
    }
  }

  function setupScrollAnimation() {
    const track = document.getElementById('garden-scroll-track');
    const viewport = document.getElementById('garden-viewport');
    const prologue = document.getElementById('garden-prologue');
    const aura = document.querySelector('.garden-atmospheric-aura');
    const epilogueCard = document.getElementById('garden-epilogue-card');

    if (!track || !viewport) return;

    // Build the GSAP timeline that choreographs growth stages
    growthTimeline = createGrowthTimeline(viewport, roseConfigs);

    if (reducedMotion) {
      // For reduced-motion, play directly without scrub
      growthTimeline.play();
      return;
    }

    // Bind scrubbed ScrollTrigger
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      pin: viewport,
      pinSpacing: false,
      scrub: 1.2,
      animation: growthTimeline,
      onUpdate: (self) => {
        if (self.progress > 0.05 && prologue && prologue.style.opacity !== '0') {
          gsap.to(prologue, { opacity: 0, duration: 0.3, overwrite: 'auto' });
        } else if (self.progress <= 0.02 && prologue) {
          gsap.to(prologue, { opacity: 1, duration: 0.4, overwrite: 'auto' });
        }

        if (self.progress >= 0.88 && epilogueCard) {
          gsap.to(epilogueCard, { opacity: 1, y: 0, duration: 0.5, overwrite: 'auto', pointerEvents: 'auto' });
        } else if (self.progress < 0.82 && epilogueCard) {
          gsap.to(epilogueCard, { opacity: 0, y: 20, duration: 0.4, overwrite: 'auto', pointerEvents: 'none' });
        }
      },
    });

    // Refresh ScrollTrigger to calculate pins
    ScrollTrigger.refresh();
  }

  function startIdleBreeze() {
    if (isIdleActive || reducedMotion) return;
    isIdleActive = true;

    const roseHeads = document.querySelectorAll('.rose-head-sway');
    if (!roseHeads || roseHeads.length === 0) return;

    const startTime = performance.now();

    function breezeLoop(now) {
      if (!isIdleActive) return;

      const elapsed = (now - startTime) * 0.001;

      roseHeads.forEach((head, index) => {
        const freq = 1.1 + (index % 3) * 0.25;
        const phase = index * 0.85;
        const angle = Math.sin(elapsed * freq + phase) * 2.2;
        head.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      });

      idleAnimationId = requestAnimationFrame(breezeLoop);
    }

    idleAnimationId = requestAnimationFrame(breezeLoop);
  }

  function stopIdleBreeze() {
    isIdleActive = false;
    if (idleAnimationId) {
      cancelAnimationFrame(idleAnimationId);
      idleAnimationId = null;
    }

    const roseHeads = document.querySelectorAll('.rose-head-sway');
    roseHeads.forEach((head) => {
      head.style.transform = 'rotate(0deg)';
    });
  }

  function cleanup() {
    stopIdleBreeze();

    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill();
      scrollTriggerInstance = null;
    }

    if (growthTimeline) {
      growthTimeline.kill();
      growthTimeline = null;
    }

    ScrollTrigger.getAll().forEach((st) => {
      if (st.vars.trigger === '#garden-scroll-track') {
        st.kill();
      }
    });
  }

  return {
    mount() {
      cleanup();
      render();
      window.scrollTo({ top: 0, behavior: 'instant' });
      ScrollTrigger.refresh();
    },
    unmount() {
      cleanup();
    },
  };
}
