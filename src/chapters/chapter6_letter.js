/**
 * ===================================================================
 * CHAPTER 6: THE LETTER
 * ===================================================================
 * An intimate, romantic letter experience nestled in an interactive
 * 3D digital envelope with a glowing sapphire wax seal.
 * ===================================================================
 */

import { gsap } from 'gsap';
import { config } from '../config.js';
import { getRoseGradients, createRoseSVG } from './garden/roseGenerator.js';
import { getGardenComposition } from './garden/gardenLayout.js';

export function createChapter6(app) {
  const container = document.getElementById('chapter-6');
  let isOpen = false;
  let animTimeline = null;

  function render() {
    // Generate bloomed garden backdrop so garden remains dreamily visible behind envelope
    const roseConfigs = getGardenComposition(window.innerWidth, window.innerHeight);
    const rosesSvgString = roseConfigs.map((cfg) => createRoseSVG(cfg)).join('\n');

    container.innerHTML = `
      <!-- Soft Ambient Garden Backdrop (Preserved from Chapter 5) -->
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
          <span class="chapter-badge">Chapter VI</span>
          <h1 class="chapter-title">${config.chapter6.title}</h1>
          <p class="chapter-subtitle">${config.chapter6.envelopeLabel}</p>
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
                <h2 class="letter-salutation">${config.chapter6.letter.salutation}</h2>

                <!-- Letter Body Paragraphs -->
                <div class="letter-body">
                  ${config.chapter6.letter.paragraphs.map(p => `<p class="letter-paragraph">${p}</p>`).join('')}
                </div>

                <!-- Closing & Signature -->
                <div class="letter-footer">
                  <p class="letter-closing">${config.chapter6.letter.closing}</p>
                  <p class="letter-signature">${config.chapter6.letter.signature}</p>
                </div>

                <!-- Chapter 7 Continue Button -->
                <div class="letter-action">
                  <button id="btn-letter-continue" class="btn-glow">
                    <span>${config.chapter6.continueButtonText}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Envelope Front Pocket (Lower & Side Folds) -->
            <div class="envelope-front-pocket">
              <svg class="envelope-pocket-svg" viewBox="0 0 400 260" preserveAspectRatio="none">
                <!-- Left Fold -->
                <polygon points="0,0 200,140 0,260" fill="#0a1533" stroke="rgba(56, 189, 248, 0.2)" stroke-width="1" />
                <!-- Right Fold -->
                <polygon points="400,0 200,140 400,260" fill="#0b1738" stroke="rgba(56, 189, 248, 0.2)" stroke-width="1" />
                <!-- Bottom Fold -->
                <polygon points="0,260 200,130 400,260" fill="#0d1b42" stroke="rgba(56, 189, 248, 0.25)" stroke-width="1.5" />
              </svg>
            </div>

            <!-- Envelope Top Flap (Folds down over pocket when closed) -->
            <div id="envelope-flap" class="envelope-flap">
              <svg class="envelope-flap-svg" viewBox="0 0 400 150" preserveAspectRatio="none">
                <polygon points="0,0 400,0 200,150" fill="#0f2254" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1.5" />
              </svg>
            </div>

            <!-- Sapphire Wax Seal with Embossed Monogram -->
            <button id="wax-seal" class="wax-seal" aria-label="Break wax seal and open letter">
              <div class="wax-seal-ring"></div>
              <div class="wax-seal-disc">
                <svg class="wax-seal-icon" viewBox="0 0 100 100" fill="none">
                  <!-- Outer beaded border -->
                  <circle cx="50" cy="50" r="44" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.8" />
                  <circle cx="50" cy="50" r="38" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1" />
                  <!-- Embossed Sapphire Rose Symbol -->
                  <path d="M50 25 C42 25, 36 32, 38 40 C34 43, 33 49, 37 54 C35 60, 40 66, 48 67 C50 67, 52 67, 54 66 C62 65, 66 59, 64 53 C67 48, 66 42, 62 39 C64 32, 58 25, 50 25 Z" 
                    fill="url(#sealGrad)" 
                    stroke="#93c5fd" 
                    stroke-width="1.2" 
                  />
                  <!-- Inner spiral heart -->
                  <path d="M46 44 Q50 38, 54 44 Q56 50, 50 54 Q44 50, 46 44" fill="#60a5fa" opacity="0.9" />
                  <!-- Bottom stem/ribbon hint -->
                  <path d="M50 67 Q47 75, 42 82 M50 67 Q53 75, 58 82" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
                  <defs>
                    <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#38bdf8" />
                      <stop offset="50%" stop-color="#1d4ed8" />
                      <stop offset="100%" stop-color="#0f2b6b" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span class="wax-seal-tooltip">Click seal to open ✉️</span>
            </button>

          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const seal = document.getElementById('wax-seal');
    const continueBtn = document.getElementById('btn-letter-continue');

    if (seal) {
      seal.addEventListener('click', handleOpenEnvelope);
    }

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        // Burst celebratory particles before advancing
        const rect = continueBtn.getBoundingClientRect();
        if (app.particles) {
          app.particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20, {
            palette: 'sapphire',
            speed: 1.4,
          });
        }
        app.progress.nextChapter();
      });
    }
  }

  function handleOpenEnvelope(e) {
    if (isOpen) return;
    isOpen = true;

    const seal = document.getElementById('wax-seal');
    const flap = document.getElementById('envelope-flap');
    const parchment = document.getElementById('letter-parchment');
    const wrapper = document.getElementById('envelope-wrapper');

    // Calculate position for particle burst
    const sealRect = seal.getBoundingClientRect();
    const burstX = sealRect.left + sealRect.width / 2;
    const burstY = sealRect.top + sealRect.height / 2;

    if (app.particles) {
      app.particles.burst(burstX, burstY, 24, { palette: 'sapphire', speed: 1.6 });
      app.particles.burst(burstX, burstY, 12, { palette: 'gold', speed: 1.2 });
    }

    animTimeline = gsap.timeline({
      onStart: () => {
        parchment.classList.add('is-open');
      },
      onComplete: () => {
        parchment.setAttribute('aria-hidden', 'false');
      },
    });

    // 1. Seal dissolves with a sparkling pop
    animTimeline.to(seal, {
      scale: 1.4,
      opacity: 0,
      filter: 'blur(6px)',
      duration: 0.45,
      ease: 'power2.out',
      pointerEvents: 'none',
    });

    // 2. Flap unfolds upward (3D rotation)
    animTimeline.to(flap, {
      rotateX: 180,
      duration: 0.75,
      ease: 'power2.inOut',
      transformOrigin: 'top center',
    }, '-=0.2');

    // 3. Envelope body softens & parchment rises out
    animTimeline.to(wrapper, {
      y: 35,
      duration: 0.8,
      ease: 'power2.out',
    }, '-=0.5');

    // 4. Parchment pulls up and unfolds into full view
    animTimeline.fromTo(parchment, 
      {
        opacity: 0,
        y: 80,
        scale: 0.88,
        filter: 'blur(4px)',
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.95,
        ease: 'power3.out',
      },
      '-=0.4'
    );

    // 5. Stagger paragraph text entrance
    const paragraphs = parchment.querySelectorAll('.letter-paragraph, .letter-salutation, .letter-footer, .letter-action');
    animTimeline.fromTo(paragraphs,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' },
      '-=0.4'
    );
  }

  function cleanup() {
    if (animTimeline) {
      animTimeline.kill();
      animTimeline = null;
    }
    isOpen = false;
  }

  return {
    mount() {
      isOpen = false;
      render();
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
    unmount() {
      cleanup();
    },
  };
}
