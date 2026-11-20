/**
 * ===================================================================
 * CHAPTER 1 — THE INVITATION & CINEMATIC SCROLL TRANSITION
 * ===================================================================
 * Features:
 * - Staggered typography entrance with glowing button micro-interaction
 * - Continuous, scroll-driven cinematic transformation into Chapter 2 (Date Lock)
 * - Pinned viewport with GSAP ScrollTrigger and inertial scrub
 * - 3D layered depth: Chapter 1 text departs -> celestial portal awakens ->
 *   date lock vault arrives from cosmic distance
 * - Bi-directional scrubbing (forward to Date Lock, reverse to Invitation)
 * - Navigation stepper and atmospheric theme synchronization
 * - Accessible fallback for prefers-reduced-motion
 * ===================================================================
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { config } from '../config.js';
import { getDateLockHTML, bindDateLockEvents } from './chapter2_dateLock.js';

gsap.registerPlugin(ScrollTrigger);

export function createChapter1(app) {
  let isTransitionActive = false;
  let scrollTriggerInstance = null;
  let transitionTimeline = null;

  function render() {
    const container = document.getElementById('chapter-1');
    if (!container) return;

    cleanup();
    isTransitionActive = false;

    container.innerHTML = `
      <!-- Pinned Scroll Track for Cinematic Scrub Transformation -->
      <div id="ch1-scroll-track" class="ch1-scroll-track">
        <div id="ch1-viewport" class="ch1-viewport">
          
          <!-- LAYER 1: Chapter 1 Invitation Scene -->
          <div id="ch1-invitation-layer" class="invitation-content ch1-invitation-layer">
            <h1 class="invitation-salutation">${config.chapter1.salutation}</h1>
            <p class="invitation-text">${config.chapter1.introText}</p>
            <button id="ch1-begin-btn" class="btn-glow" aria-label="Begin our journey">
              <span>${config.chapter1.buttonText}</span>
            </button>

            <!-- Scroll cue hint (revealed upon clicking Begin) -->
            <div id="ch1-scroll-hint" class="ch1-scroll-hint" style="opacity: 0; pointer-events: none;">
              <span>Scroll to journey deeper</span>
              <svg class="scroll-arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            </div>
          </div>

          <!-- LAYER 2: Celestial Aperture Portal -->
          <div id="ch1-portal-layer" class="ch1-portal-layer" aria-hidden="true">
            <div class="portal-core-orb"></div>
            <div class="portal-ring portal-ring-outer"></div>
            <div class="portal-ring portal-ring-inner"></div>
          </div>

          <!-- LAYER 3: Chapter 2 Date Lock Target (Morphed smoothly into view) -->
          <div id="ch1-lock-layer" class="ch1-lock-layer" style="opacity: 0; pointer-events: none;">
            ${getDateLockHTML()}
          </div>

        </div>
      </div>
    `;

    bindEvents();
    animateEntrance();
  }

  function animateEntrance() {
    const salutation = document.querySelector('#ch1-invitation-layer .invitation-salutation');
    const text = document.querySelector('#ch1-invitation-layer .invitation-text');
    const btn = document.getElementById('ch1-begin-btn');

    if (salutation && text && btn) {
      gsap.fromTo(salutation, 
        { opacity: 0, y: 24, filter: 'blur(4px)' }, 
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }
      );
      gsap.fromTo(text, 
        { opacity: 0, y: 18, filter: 'blur(3px)' }, 
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, delay: 0.25, ease: 'power3.out' }
      );
      gsap.fromTo(btn, 
        { opacity: 0, scale: 0.92 }, 
        { opacity: 1, scale: 1, duration: 0.8, delay: 0.5, ease: 'back.out(1.6)' }
      );
    }
  }

  function bindEvents() {
    const beginBtn = document.getElementById('ch1-begin-btn');
    if (!beginBtn) return;

    beginBtn.addEventListener('click', () => {
      if (isTransitionActive) return;

      const rect = beginBtn.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      // Burst celestial particles outward in a celebratory wave
      if (app.particles) {
        app.particles.burst(originX, originY, 65, { palette: 'sapphire', speed: 1.25 });
      }

      // Respect prefers-reduced-motion
      if (app.reducedMotion) {
        gsap.to(beginBtn, {
          scale: 0.88,
          opacity: 0,
          filter: 'blur(4px)',
          duration: 0.35,
          ease: 'power2.in',
          onComplete: () => {
            app.progress.nextChapter();
          },
        });
        return;
      }

      // Begin continuous scroll transition
      startScrollTransition();
    });
  }

  function startScrollTransition() {
    isTransitionActive = true;

    const beginBtn = document.getElementById('ch1-begin-btn');
    const scrollHint = document.getElementById('ch1-scroll-hint');
    const scrollTrack = document.getElementById('ch1-scroll-track');
    const lockLayer = document.getElementById('ch1-lock-layer');

    if (!scrollTrack || !lockLayer) return;

    // 1. Morph begin button into floating scroll hint
    if (beginBtn) {
      gsap.to(beginBtn, {
        scale: 0.85,
        opacity: 0,
        filter: 'blur(4px)',
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          beginBtn.style.display = 'none';
          if (scrollHint) {
            scrollHint.style.display = 'inline-flex';
            gsap.fromTo(scrollHint, 
              { opacity: 0, y: 12, scale: 0.92 }, 
              { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }
            );
          }
        },
      });
    }

    // 2. Expand scroll track to 280vh for comfortable scrub depth
    window.scrollTo({ top: 0, behavior: 'instant' });
    scrollTrack.classList.add('is-scrollable');

    // 3. Bind interactive date lock event handlers to the target layer
    bindDateLockEvents(lockLayer, app);

    // 4. Construct scrubbed master transformation timeline
    transitionTimeline = gsap.timeline({ paused: true });

    // --- STAGE 1 (0% to 35%): Chapter 1 Typography Departs ---
    transitionTimeline.to('#ch1-invitation-layer .invitation-salutation', {
      y: -55,
      scale: 1.15,
      opacity: 0,
      filter: 'blur(10px)',
      duration: 30,
      ease: 'power2.in',
    }, 0);

    transitionTimeline.to('#ch1-invitation-layer .invitation-text', {
      y: 40,
      opacity: 0,
      filter: 'blur(8px)',
      duration: 25,
      ease: 'power2.in',
    }, 5);

    transitionTimeline.to('#ch1-scroll-hint', {
      opacity: 0,
      y: -10,
      duration: 15,
      ease: 'power1.in',
    }, 5);

    // --- STAGE 2 (15% to 65%): Celestial Portal Awakens ---
    transitionTimeline.fromTo('.portal-core-orb', 
      { scale: 0.1, opacity: 0 }, 
      { scale: 2.2, opacity: 0.85, duration: 40, ease: 'power2.out' }, 
      15
    );

    transitionTimeline.fromTo('.portal-ring-outer', 
      { scale: 0.2, rotation: 0, opacity: 0 }, 
      { scale: 1.5, rotation: 180, opacity: 0.75, duration: 45, ease: 'sine.out' }, 
      18
    );

    transitionTimeline.fromTo('.portal-ring-inner', 
      { scale: 0.15, rotation: 0, opacity: 0 }, 
      { scale: 1.8, rotation: -180, opacity: 0.65, duration: 45, ease: 'sine.out' }, 
      20
    );

    // --- STAGE 3 (30% to 80%): Celestial Vault Lock Glides from Depth ---
    transitionTimeline.fromTo('#ch1-lock-layer .lock-vault-graphic', 
      { scale: 0.2, opacity: 0, filter: 'blur(14px)' }, 
      { scale: 1.0, opacity: 1, filter: 'blur(0px)', duration: 45, ease: 'power2.out' }, 
      30
    );

    transitionTimeline.fromTo('#ch1-lock-layer .lock-svg circle',
      { rotation: 0, transformOrigin: '50% 50%' },
      { rotation: 360, duration: 50, ease: 'power1.out' },
      30
    );

    // --- STAGE 4 (55% to 100%): Date Tumblers & Glass Card Materialize ---
    transitionTimeline.to('#ch1-lock-layer', {
      opacity: 1,
      duration: 10,
    }, 50);

    transitionTimeline.fromTo('#ch1-lock-layer .lock-container', 
      { y: 55, scale: 0.9, opacity: 0, filter: 'blur(10px)' }, 
      { y: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: 40, ease: 'power3.out' }, 
      55
    );

    transitionTimeline.fromTo('#ch1-lock-layer .date-input-group, #ch1-lock-layer .lock-actions',
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 25, stagger: 5, ease: 'power2.out' },
      70
    );

    // 5. Create GSAP ScrollTrigger with scrub
    scrollTriggerInstance = ScrollTrigger.create({
      trigger: '#ch1-scroll-track',
      start: 'top top',
      end: 'bottom bottom',
      pin: '#ch1-viewport',
      scrub: 1.2, // Smooth inertial scrub prevents skipping on fast wheel flings
      animation: transitionTimeline,
      onUpdate: (self) => {
        const p = self.progress;

        // Synchronize atmospheric theme shift
        if (p > 0.45 && document.body.className !== 'theme-ch-2') {
          document.body.className = 'theme-ch-2';
        } else if (p <= 0.45 && document.body.className !== 'theme-ch-1') {
          document.body.className = 'theme-ch-1';
        }

        // Synchronize navigation stepper and interactivity
        if (p >= 0.70) {
          lockLayer.style.pointerEvents = 'auto';

          if (p >= 0.85) {
            app.progress.setCurrentChapter(2);
            app.updateNavigationUI(2);
            app.currentChapterIndex = 2;

            // Gentle focus on day input when fully in view
            if (p >= 0.96) {
              const dayInput = lockLayer.querySelector('#lock-day');
              if (dayInput && document.activeElement !== dayInput && !dayInput.value) {
                dayInput.focus();
              }
            }
          }
        } else {
          app.progress.setCurrentChapter(1);
          app.updateNavigationUI(1);
          app.currentChapterIndex = 1;
          lockLayer.style.pointerEvents = 'none';
        }

        // Emit subtle celestial stardust as portal is crossed
        if (p > 0.25 && p < 0.75 && Math.random() < 0.08 && app.particles) {
          const randX = window.innerWidth * (0.35 + Math.random() * 0.3);
          const randY = window.innerHeight * (0.35 + Math.random() * 0.3);
          app.particles.burst(randX, randY, 3, { palette: 'sapphire', speed: 0.65 });
        }
      },
    });

    ScrollTrigger.refresh();
  }

  function cleanup() {
    isTransitionActive = false;
    if (scrollTriggerInstance) {
      scrollTriggerInstance.kill();
      scrollTriggerInstance = null;
    }
    if (transitionTimeline) {
      transitionTimeline.kill();
      transitionTimeline = null;
    }
    const track = document.getElementById('ch1-scroll-track');
    if (track) {
      track.classList.remove('is-scrollable');
    }
  }

  return {
    mount() {
      render();
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
    unmount() {
      cleanup();
    },
  };
}
