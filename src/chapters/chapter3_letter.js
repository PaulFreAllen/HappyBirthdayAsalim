/**
 * ===================================================================
 * CHAPTER 3 — THE PERSONAL LETTER
 * ===================================================================
 * An intimate, romantic letter experience nestled in an interactive
 * 3D digital envelope with a glowing sapphire wax seal.
 *
 * Dedicated letter content for Asalim:
 * "Asalim,
 * Another chapter of your life begins today, and we're one step closer to meeting each other.
 * You are the most beautiful girl in the world. Everything about you — your voice, your heart, your eyes, every little thing about you, and your soul — is what I love.
 * You deserve everything beautiful this life has to offer.
 * I love you so much. Happy birthday, my love."
 * ===================================================================
 */

import { gsap } from 'gsap';
import { config } from '../config.js';
import { getRoseGradients, createRoseSVG } from './garden/roseGenerator.js';
import { getGardenComposition } from './garden/gardenLayout.js';

export function createChapter3(app) {
  let isOpen = false;
  let animTimeline = null;
  const letterConfig = config.chapter3;

  function render() {
    const container = document.getElementById('chapter-3');
    if (!container) return;

    // Generate bloomed garden backdrop so garden remains dreamily visible behind envelope
    const roseConfigs = getGardenComposition(window.innerWidth, window.innerHeight);
    const rosesSvgString = roseConfigs.map((cfg) => createRoseSVG(cfg)).join('\n');

    container.innerHTML = `
      <!-- Soft Ambient Garden Backdrop -->
      <div class="letter-garden-backdrop" aria-hidden="true">
        <svg class="letter-garden-svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">
          ${getRoseGradients()}
          <g class="garden-roses-bloomed">
            ${rosesSvgString}
          </g>
        </svg>
        <div class="letter-garden-overlay"></div>
      </div>

      <div class="chapter-content letter-stage-container">
        <!-- Ambient Header -->
        <div class="letter-header">
          <span class="chapter-badge">${letterConfig.badge || 'Chapter III'}</span>
          <h1 class="chapter-title">${letterConfig.title}</h1>
          <p class="chapter-subtitle">${letterConfig.envelopeLabel}</p>
        </div>

        <!-- Interactive 3D Envelope & Letter Workspace -->
        <div class="envelope-scene">
          <div id="envelope-wrapper" class="envelope-wrapper" aria-label="Interactive Birthday Envelope">
            
            <!-- Envelope Back Wall -->
            <div class="envelope-back"></div>

            <!-- Parchment Letter (Housed inside, slides out upon opening) -->
            <div id="letter-parchment" class="letter-parchment" aria-hidden="true">
              <div class="letter-inner">
                <!-- Ornate Botanical Header Flourish -->
                <div class="letter-flourish">
                  <svg width="48" height="24" viewBox="0 0 100 40" fill="none" stroke="currentColor">
                    <path d="M10 20 Q 30 5, 50 20 Q 70 35, 90 20" stroke="#38bdf8" stroke-width="2" />
                    <circle cx="50" cy="20" r="4" fill="#00f0ff" />
                    <path d="M40 20 Q 50 10, 60 20" stroke="#fbbf24" stroke-width="1.5" />
                  </svg>
                </div>

                <!-- Salutation -->
                <h2 class="letter-salutation">${letterConfig.letter.salutation}</h2>

                <!-- Letter Body Paragraphs -->
                <div class="letter-body">
                  ${letterConfig.letter.paragraphs.map(p => `<p class="letter-paragraph">${p}</p>`).join('')}
                </div>

                <!-- Chapter 4 Continue Button -->
                <div class="letter-action">
                  <button id="btn-letter-continue" class="btn-glow">
                    <span>${letterConfig.continueButtonText || 'One Last Surprise ✨'}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Envelope Front Pocket -->
            <div class="envelope-front-pocket">
              <svg class="envelope-pocket-svg" viewBox="0 0 400 260" preserveAspectRatio="none">
                <polygon points="0,0 200,140 0,260" fill="#0a1533" stroke="rgba(56, 189, 248, 0.2)" stroke-width="1" />
                <polygon points="400,0 200,140 400,260" fill="#0b1738" stroke="rgba(56, 189, 248, 0.2)" stroke-width="1" />
                <polygon points="0,260 200,130 400,260" fill="#0d1b42" stroke="rgba(56, 189, 248, 0.25)" stroke-width="1.5" />
              </svg>
            </div>

            <!-- Envelope Triangular Top Flap -->
            <div id="envelope-flap" class="envelope-flap">
              <svg class="envelope-flap-svg" viewBox="0 0 400 170" preserveAspectRatio="none">
                <polygon points="0,0 200,170 400,0" fill="#0c1e4a" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1.5" />
              </svg>
            </div>

            <!-- Interactive Wax Seal -->
            <button id="wax-seal" class="wax-seal" title="Break the seal to read the letter" aria-label="Open letter">
              <div class="seal-glow"></div>
              <svg class="seal-gem" viewBox="0 0 60 60" width="46" height="46">
                <circle cx="30" cy="30" r="26" fill="#1d4ed8" stroke="#38bdf8" stroke-width="2" />
                <polygon points="30,12 44,22 44,38 30,48 16,38 16,22" fill="#0284c7" stroke="#00f0ff" stroke-width="1.5" />
                <polygon points="30,18 39,25 39,35 30,42 21,35 21,25" fill="#38bdf8" opacity="0.8" />
                <circle cx="30" cy="30" r="4" fill="#ffffff" />
              </svg>
              <span class="seal-prompt-text">Tap to open</span>
            </button>

          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const waxSeal = document.getElementById('wax-seal');
    const continueBtn = document.getElementById('btn-letter-continue');

    if (waxSeal) {
      waxSeal.addEventListener('click', () => {
        if (!isOpen) {
          openLetter();
        }
      });
    }

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        app.progress.nextChapter();
      });
    }
  }

  function openLetter() {
    if (isOpen) return;
    isOpen = true;

    const flap = document.getElementById('envelope-flap');
    const waxSeal = document.getElementById('wax-seal');
    const parchment = document.getElementById('letter-parchment');
    const envelope = document.getElementById('envelope-wrapper');

    // Trigger celestial stardust burst around wax seal
    if (waxSeal && app.particles) {
      const rect = waxSeal.getBoundingClientRect();
      app.particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 60, {
        palette: 'gold',
        speed: 1.6,
      });
      app.particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35, {
        palette: 'sapphire',
        speed: 1.2,
      });
    }

    animTimeline = gsap.timeline({
      onComplete: () => {
        if (parchment) {
          parchment.setAttribute('aria-hidden', 'false');
          parchment.classList.add('is-open');
        }
      },
    });

    // 1. Break wax seal with rotation, scale pop, and fade
    animTimeline.to(waxSeal, {
      scale: 1.35,
      filter: 'brightness(2)',
      duration: 0.22,
      ease: 'power2.out',
    });
    animTimeline.to(waxSeal, {
      scale: 0.2,
      opacity: 0,
      rotation: 45,
      duration: 0.32,
      ease: 'power2.in',
      onComplete: () => {
        if (waxSeal) waxSeal.style.display = 'none';
      },
    });

    // 2. Unfold envelope top flap upward
    animTimeline.to(flap, {
      rotateX: 180,
      duration: 0.65,
      ease: 'power2.inOut',
    }, '-=0.15');

    // 3. Elevate envelope z-index & slide parchment upward
    animTimeline.call(() => {
      if (envelope) envelope.classList.add('flap-opened');
    });

    // Slide parchment out of envelope
    animTimeline.to(parchment, {
      y: -180,
      opacity: 1,
      duration: 0.85,
      ease: 'power3.out',
      onStart: () => {
        if (parchment) {
          parchment.setAttribute('aria-hidden', 'false');
          parchment.classList.add('is-open');
        }
      },
    }, '-=0.2');

    // 4. Expand parchment to full reading modal dimension
    animTimeline.to(parchment, {
      y: 0,
      scale: 1.02,
      zIndex: 100,
      duration: 0.6,
      ease: 'power2.out',
    });

    animTimeline.to(parchment, {
      scale: 1,
      duration: 0.2,
      ease: 'power1.inOut',
    });

    // 5. Stagger paragraph text entrance
    const paragraphs = parchment ? parchment.querySelectorAll('.letter-paragraph, .letter-salutation, .letter-action') : [];
    if (paragraphs.length > 0) {
      animTimeline.fromTo(
        paragraphs,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power2.out' },
        '-=0.4'
      );
    }
  }

  function cleanup() {
    isOpen = false;
    if (animTimeline) {
      animTimeline.kill();
      animTimeline = null;
    }
  }

  return {
    mount() {
      cleanup();
      render();
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
    unmount() {
      cleanup();
    },
  };
}
