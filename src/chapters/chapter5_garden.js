/**
 * ===================================================================
 * CHAPTER 5 — SAPPHIRE BLOSSOM: THE ANIMATED ROSE GARDEN
 * ===================================================================
 * The central visual centerpiece of the experience.
 * Features:
 * - Prologue introduction with poetic reveal
 * - ScrollTrigger pinned viewport with scrubbed GSAP timeline
 * - Multi-stage botanical growth: seed -> roots -> stems -> buds -> blooming
 * - Layered depth composition (foreground, midground, background)
 * - Calibrated SVG roses with realistic reflexed petals and cyan rims
 * - Gentle idle breeze sway once fully bloomed
 * - Emotional epilogue revelation
 * ===================================================================
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { config } from '../config.js';
import { getRoseGradients, createRoseSVG } from './garden/roseGenerator.js';
import { getGardenComposition } from './garden/gardenLayout.js';
import { createGrowthTimeline } from './garden/flowerGrowth.js';

export function createChapter5(app) {
  let scrollTriggerInstance = null;
  let growthTimeline = null;
  let idleAnimationId = null;
  let isIdleActive = false;
  let roseConfigs = [];

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render() {
    const container = document.getElementById('chapter-5');
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
            <p class="prologue-line line-1">"${config.chapter5.prologue1}"</p>
            <p class="prologue-line line-2">"${config.chapter5.prologue2}"</p>
            <div class="scroll-prompt-hint">
              <span>${config.chapter5.seedPrompt}</span>
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
              <!-- Soft horizon mist glow -->
              <ellipse cx="600" cy="790" rx="750" ry="120" fill="radial-gradient(circle, rgba(14, 43, 107, 0.45) 0%, transparent 70%)" />
              <!-- Ground hill base -->
              <path 
                d="M -100,800 Q 250,730 600,750 T 1300,740 L 1300,850 L -100,850 Z" 
                fill="#030712" 
                stroke="rgba(56, 189, 248, 0.12)" 
                stroke-width="1.5" 
              />
            </g>

            <!-- Awakening Glowing Seed (Stage A) -->
            <g id="garden-seed-group" transform="translate(600, 755)">
              <circle id="garden-seed-ring" cx="0" cy="0" r="30" fill="none" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="3 3" opacity="0" />
              <circle id="garden-seed-orb" cx="0" cy="0" r="10" fill="#00f0ff" filter="drop-shadow(0 0 12px #00f0ff)" opacity="0" />
            </g>

            <!-- Procedural Sapphire Roses (Grouped by depth) -->
            <g id="garden-roses-group" class="garden-roses-group">
              ${rosesSvgString}
            </g>
          </svg>

          <!-- Emotional Epilogue Card (Reveals in Stage D) -->
          <div id="garden-epilogue-card" class="garden-epilogue-card" style="opacity: 0;">
            <p class="epilogue-phrase-1">${config.chapter5.epilogue1}</p>
            <h2 class="epilogue-headline">${config.chapter5.epilogue2}</h2>
            <p class="epilogue-phrase-3">${config.chapter5.epilogue3}</p>
            <button id="garden-continue-btn" class="btn-glow" style="margin-top: 1.25rem;">
              <span>${config.chapter5.continueButtonText}</span>
            </button>
          </div>

        </div>
      </div>
    `;

    bindPrologue();
    setupScrollAnimation();
  }

  function bindPrologue() {
    const prologue = document.getElementById('garden-prologue');
    const continueBtn = document.getElementById('garden-continue-btn');

    // Button advances to Chapter 6 with gentle cinematic transition
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (continueBtn.disabled) return;
        continueBtn.disabled = true;

        const epilogueCard = document.getElementById('garden-epilogue-card');
        const viewport = document.getElementById('garden-viewport');
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Converge celestial blue particles toward the center
        if (app.particles) {
          app.particles.converge(centerX, centerY, 35, { palette: 'sapphire', speed: 1.3 });
        }

        const tl = gsap.timeline({
          onComplete: () => {
            app.progress.nextChapter();
          },
        });

        if (epilogueCard) {
          tl.to(epilogueCard, { opacity: 0, scale: 0.95, duration: 0.5, ease: 'power2.inOut' });
        }

        if (viewport) {
          tl.to(viewport, {
            filter: 'blur(8px) brightness(0.55)',
            duration: 0.75,
            ease: 'power2.inOut',
          }, '<');
        }
      });
    }

    // Fade out prologue text on first scroll
    if (prologue) {
      gsap.fromTo('.prologue-line.line-1', 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 1.2, delay: 0.2, ease: 'power2.out' }
      );
      gsap.fromTo('.prologue-line.line-2', 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 1.2, delay: 1.5, ease: 'power2.out' }
      );
    }
  }

  function setupScrollAnimation() {
    const track = document.getElementById('garden-scroll-track');
    const viewport = document.getElementById('garden-viewport');
    const prologue = document.getElementById('garden-prologue');
    if (!track || !viewport) return;

    // Clean up any existing instances
    cleanup();

    // Create scrubbed master growth timeline
    growthTimeline = createGrowthTimeline(viewport, roseConfigs);

    if (reducedMotion) {
      // Instant bloom for reduced-motion users
      growthTimeline.progress(1);
      const epilogue = document.getElementById('garden-epilogue-card');
      if (epilogue) {
        epilogue.style.opacity = '1';
        epilogue.style.pointerEvents = 'auto';
      }
      return;
    }

    // Register GSAP ScrollTrigger for pinned scrubbed growth
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      pin: viewport,
      scrub: 1.2,
      animation: growthTimeline,
      onUpdate: (self) => {
        const progress = self.progress;

        // Fade prologue out as scroll advances beyond 8%
        if (prologue) {
          if (progress > 0.05) {
            gsap.to(prologue, { opacity: Math.max(0, 1 - (progress - 0.05) * 8), duration: 0.2 });
          } else {
            gsap.to(prologue, { opacity: 1, duration: 0.2 });
          }
        }

        // Trigger gentle idle sway when blooming is near complete (>= 94%)
        if (progress >= 0.94 && !isIdleActive) {
          startIdleSway();
        } else if (progress < 0.94 && isIdleActive) {
          stopIdleSway();
        }

        // Spawn occasional stardust particles as flowers bloom
        if (progress > 0.45 && progress < 0.85 && Math.random() < 0.12 && app.particles) {
          const randX = Math.random() * window.innerWidth;
          const randY = window.innerHeight * (0.3 + Math.random() * 0.4);
          app.particles.burst(randX, randY, 2, { palette: 'sapphire', speed: 0.5 });
        }
      },
    });

    // Refresh ScrollTrigger to calculate proper heights
    ScrollTrigger.refresh();
  }

  function startIdleSway() {
    isIdleActive = true;
    let startTime = performance.now();

    const flowerHeads = document.querySelectorAll('.garden-rose .rose-head');
    const stems = document.querySelectorAll('.garden-rose .rose-stem');

    function idleLoop(now) {
      if (!isIdleActive) return;
      const elapsed = (now - startTime) * 0.001;

      flowerHeads.forEach((head, idx) => {
        const offset = idx * 0.8;
        const sway = Math.sin(elapsed * 1.5 + offset) * 1.6;
        head.style.transform = `rotate(${sway}deg)`;
      });

      stems.forEach((stem, idx) => {
        const offset = idx * 0.7;
        const swayX = Math.sin(elapsed * 1.2 + offset) * 1.2;
        stem.style.transform = `translateX(${swayX}px)`;
      });

      idleAnimationId = requestAnimationFrame(idleLoop);
    }

    idleAnimationId = requestAnimationFrame(idleLoop);
  }

  function stopIdleSway() {
    isIdleActive = false;
    if (idleAnimationId) {
      cancelAnimationFrame(idleAnimationId);
      idleAnimationId = null;
    }
    const flowerHeads = document.querySelectorAll('.garden-rose .rose-head');
    const stems = document.querySelectorAll('.garden-rose .rose-stem');
    flowerHeads.forEach((head) => (head.style.transform = ''));
    stems.forEach((stem) => (stem.style.transform = ''));
  }

  function cleanup() {
    stopIdleSway();
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill();
      scrollTriggerInstance = null;
    }
    if (growthTimeline) {
      growthTimeline.kill();
      growthTimeline = null;
    }
  }

  return {
    mount() {
      render();
      // Scroll to top of section on entering
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
    unmount() {
      cleanup();
    },
  };
}
