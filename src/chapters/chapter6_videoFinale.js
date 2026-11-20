/**
 * ===================================================================
 * CHAPTER 6: THE VIDEO & FINALE
 * ===================================================================
 * A personal video message framed in sapphire light, culminating
 * in the grand birthday celebration with cascading stardust,
 * an iconic glowing blossom, and heartfelt wishes.
 * ===================================================================
 */

import { gsap } from 'gsap';
import { config } from '../config.js';

export function createChapter6(app) {
  let currentStage = 'video'; // 'video' or 'finale'
  let clickBurstListener = null;
  const finaleConfig = config.chapter6 || config.chapter7;

  function render() {
    const container = document.getElementById('chapter-6') || document.getElementById('chapter-7');
    if (!container) return;

    container.innerHTML = `
      <div class="chapter-content finale-stage-container">
        
        <!-- STAGE 1: PERSONAL VIDEO MESSAGE -->
        <div id="video-stage" class="video-stage">
          <div class="video-header">
            <span class="chapter-badge">Chapter VI</span>
            <h1 class="chapter-title">${finaleConfig.introText}</h1>
          </div>

          <div class="video-frame-container">
            ${finaleConfig.videoSrc ? `
              <div class="video-player-wrapper">
                <video 
                  id="birthday-video-element" 
                  class="birthday-video"
                  src="${finaleConfig.videoSrc}"
                  poster="${finaleConfig.videoPoster || ''}"
                  playsinline
                  controls
                  preload="metadata"
                ></video>
              </div>
            ` : `
              <!-- Elegant Interactive Video Placeholder -->
              <div class="video-placeholder-card">
                <div class="video-placeholder-glow"></div>
                <div class="video-placeholder-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 3" />
                    <polygon points="10 8 16 12 10 16 10 8" fill="#00f0ff" />
                  </svg>
                </div>
                <h3 class="placeholder-title">A Special Video Message</h3>
                <p class="placeholder-notice">${finaleConfig.videoFallbackNotice}</p>
                <div class="placeholder-hint">Ready for your personal message anytime ✨</div>
              </div>
            `}
          </div>

          <!-- Video Navigation Actions -->
          <div class="video-actions">
            <button id="btn-reveal-finale" class="btn-glow">
              <span>Celebrate Birthday ✨</span>
            </button>
          </div>
        </div>

        <!-- STAGE 2: GRAND CELEBRATION FINALE -->
        <div id="grand-finale-stage" class="grand-finale-stage" style="display: none; opacity: 0;">
          
          <!-- Iconic Radiant Sapphire Blossom Emblem -->
          <div class="finale-emblem-wrapper">
            <div class="finale-halo-rays"></div>
            <div class="finale-gem-bloom">
              <svg class="finale-rose-svg" viewBox="0 0 160 160" width="130" height="130">
                <defs>
                  <radialGradient id="finaleGlowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.8" />
                    <stop offset="60%" stop-color="#2563eb" stop-opacity="0.4" />
                    <stop offset="100%" stop-color="#080f24" stop-opacity="0" />
                  </radialGradient>
                  <linearGradient id="finalePetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#38bdf8" />
                    <stop offset="50%" stop-color="#2563eb" />
                    <stop offset="100%" stop-color="#0f2b6b" />
                  </linearGradient>
                </defs>
                <circle cx="80" cy="80" r="75" fill="url(#finaleGlowGrad)" />
                <!-- Concentric Petal Layers -->
                <path d="M80 25 C65 25, 45 42, 52 65 C38 72, 35 90, 50 108 C45 125, 65 138, 80 135 C95 138, 115 125, 110 108 C125 90, 122 72, 108 65 C115 42, 95 25, 80 25 Z" fill="url(#finalePetalGrad)" stroke="#38bdf8" stroke-width="1.5" />
                <path d="M80 45 C70 45, 60 55, 65 72 C55 80, 58 95, 70 102 C68 112, 80 118, 80 118 C80 118, 92 112, 90 102 C102 95, 105 80, 95 72 C100 55, 90 45, 80 45 Z" fill="#1d4ed8" stroke="#93c5fd" stroke-width="1.2" />
                <!-- Core Diamond Light -->
                <polygon points="80,68 88,80 80,92 72,80" fill="#00f0ff" filter="drop-shadow(0 0 8px #00f0ff)" />
              </svg>
            </div>
          </div>

          <!-- Emotional Climax Typography -->
          <div class="finale-typography">
            <h1 class="finale-headline">${finaleConfig.finaleHeadline}</h1>
            
            <div class="finale-wishes-list">
              ${finaleConfig.wishes.map(wish => `
                <p class="finale-wish-item">
                  <span class="wish-bullet">✨</span>
                  <span>${wish}</span>
                </p>
              `).join('')}
            </div>

            <p class="finale-closing-text">${finaleConfig.closingMessage}</p>
          </div>

          <!-- Post-Finale Interactive Journey Controls -->
          <div class="finale-controls">
            <button id="btn-replay-journey" class="btn-glow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              <span>${finaleConfig.replayButtonText}</span>
            </button>

            <button id="btn-read-letter" class="btn-glass">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>${finaleConfig.readLetterButtonText}</span>
            </button>

            <button id="btn-back-to-video" class="btn-subtle" title="Watch video again">
              <span>← Back to video</span>
            </button>
          </div>

          <div class="finale-interactive-hint">
            <span>Click anywhere to cast stardust ✨</span>
          </div>

        </div>

      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const btnRevealFinale = document.getElementById('btn-reveal-finale');
    const btnReplayJourney = document.getElementById('btn-replay-journey');
    const btnReadLetter = document.getElementById('btn-read-letter');
    const btnBackToVideo = document.getElementById('btn-back-to-video');

    if (btnRevealFinale) {
      btnRevealFinale.addEventListener('click', () => {
        revealGrandFinale();
      });
    }

    if (btnReplayJourney) {
      btnReplayJourney.addEventListener('click', () => {
        if (confirm('Revisit our journey from the very beginning?')) {
          app.progress.resetProgress();
        }
      });
    }

    if (btnReadLetter) {
      btnReadLetter.addEventListener('click', () => {
        app.progress.goToChapter(5); // The Letter is Chapter 5
      });
    }

    if (btnBackToVideo) {
      btnBackToVideo.addEventListener('click', () => {
        showVideoStage();
      });
    }
  }

  function revealGrandFinale() {
    if (currentStage === 'finale') return;
    currentStage = 'finale';

    const videoStage = document.getElementById('video-stage');
    const finaleStage = document.getElementById('grand-finale-stage');

    // Pause video playback if running
    const videoEl = document.getElementById('birthday-video-element');
    if (videoEl && !videoEl.paused) {
      videoEl.pause();
    }

    // Grand celestial particle burst
    if (app.particles) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight * 0.45;
      app.particles.burst(centerX, centerY, 80, { palette: 'sapphire', speed: 1.8 });
      app.particles.burst(centerX, centerY, 40, { palette: 'gold', speed: 1.4 });
      app.particles.cascade(3500);
    }

    const tl = gsap.timeline();

    // 1. Transition out video stage
    tl.to(videoStage, {
      opacity: 0,
      scale: 0.94,
      filter: 'blur(8px)',
      duration: 0.6,
      ease: 'power2.inOut',
      onComplete: () => {
        videoStage.style.display = 'none';
        finaleStage.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'instant' });
      },
    });

    // 2. Transition in grand celebration finale
    tl.fromTo(finaleStage,
      { opacity: 0, scale: 0.92, filter: 'blur(10px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }
    );

    // 3. Stagger headline and wishes entrance
    const typographyEls = finaleStage.querySelectorAll('.finale-headline, .finale-wish-item, .finale-closing-text, .finale-controls, .finale-interactive-hint');
    tl.fromTo(typographyEls,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.65, stagger: 0.12, ease: 'power2.out' },
      '-=0.4'
    );

    setupClickBurst();
  }

  function showVideoStage() {
    currentStage = 'video';
    removeClickBurst();

    const videoStage = document.getElementById('video-stage');
    const finaleStage = document.getElementById('grand-finale-stage');

    const tl = gsap.timeline();

    tl.to(finaleStage, {
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        finaleStage.style.display = 'none';
        videoStage.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'instant' });
      },
    });

    tl.fromTo(videoStage,
      { opacity: 0, scale: 0.96, filter: 'blur(6px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power2.out' }
    );
  }

  function setupClickBurst() {
    removeClickBurst();
    const finaleStage = document.getElementById('grand-finale-stage');
    if (!finaleStage) return;

    clickBurstListener = (e) => {
      // Don't burst on clicking action buttons
      if (e.target.closest('button')) return;
      if (app.particles) {
        const palette = Math.random() > 0.4 ? 'sapphire' : 'gold';
        app.particles.burst(e.clientX, e.clientY, 16, { palette, speed: 1.2 });
      }
    };

    document.addEventListener('pointerdown', clickBurstListener);
  }

  function removeClickBurst() {
    if (clickBurstListener) {
      document.removeEventListener('pointerdown', clickBurstListener);
      clickBurstListener = null;
    }
  }

  function cleanup() {
    removeClickBurst();
    currentStage = 'video';
  }

  return {
    mount() {
      currentStage = 'video';
      render();
      window.scrollTo({ top: 0, behavior: 'instant' });
    },
    unmount() {
      cleanup();
    },
  };
}

export const createChapter7 = createChapter6;
