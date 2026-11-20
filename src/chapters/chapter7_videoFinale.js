/**
 * ===================================================================
 * CHAPTER 7: THE VIDEO & FINALE
 * ===================================================================
 * A personal video message framed in sapphire light, culminating
 * in the grand birthday celebration with cascading stardust,
 * an iconic glowing blossom, and heartfelt wishes.
 * ===================================================================
 */

import { gsap } from 'gsap';
import { config } from '../config.js';

export function createChapter7(app) {
  const container = document.getElementById('chapter-7');
  let currentStage = 'video'; // 'video' or 'finale'
  let clickBurstListener = null;

  function render() {
    container.innerHTML = `
      <div class="chapter-content finale-stage-container">
        
        <!-- STAGE 1: PERSONAL VIDEO MESSAGE -->
        <div id="video-stage" class="video-stage">
          <div class="video-header">
            <span class="chapter-badge">Chapter VII</span>
            <h1 class="chapter-title">${config.chapter7.introText}</h1>
          </div>

          <div class="video-frame-container">
            ${config.chapter7.videoSrc ? `
              <div class="video-player-wrapper">
                <video 
                  id="birthday-video-element" 
                  class="birthday-video"
                  src="${config.chapter7.videoSrc}"
                  poster="${config.chapter7.videoPoster || ''}"
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
                <p class="placeholder-notice">${config.chapter7.videoFallbackNotice}</p>
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
            <h1 class="finale-headline">${config.chapter7.finaleHeadline}</h1>
            <p class="finale-subtext">${config.chapter7.finaleSubtext}</p>
          </div>

          <!-- Warm Personal Closing Card -->
          <div class="finale-card glass-card">
            <p class="finale-wish-line">
              "To the one who brings wonder into every quiet day, and light into every dark sky."
            </p>
            <p class="finale-wish-sub">
              Every step of this journey was created with love, just for you. 💙
            </p>
          </div>

          <!-- Final Journey Navigation Controls -->
          <div class="finale-actions">
            <button id="btn-replay-journey" class="btn-glow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              <span>${config.chapter7.restartButtonText}</span>
            </button>

            <button id="btn-read-letter-again" class="btn-secondary">
              <span>Read Letter Again ✉️</span>
            </button>

            <button id="btn-back-to-video" class="btn-secondary">
              <span>Back to Video 🎥</span>
            </button>
          </div>

          <!-- Interactive prompt -->
          <p class="finale-tap-hint">Tap anywhere to shower starry stardust ✨</p>
        </div>

      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const btnRevealFinale = document.getElementById('btn-reveal-finale');
    const btnReplayJourney = document.getElementById('btn-replay-journey');
    const btnReadLetter = document.getElementById('btn-read-letter-again');
    const btnBackToVideo = document.getElementById('btn-back-to-video');
    const videoEl = document.getElementById('birthday-video-element');

    if (btnRevealFinale) {
      btnRevealFinale.addEventListener('click', () => {
        revealGrandFinale();
      });
    }

    // Automatically transition to finale when video finishes
    if (videoEl) {
      videoEl.addEventListener('ended', () => {
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
        app.progress.goToChapter(6);
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

    // Trigger celebratory stardust cascade
    if (app.particles) {
      app.particles.cascade({ duration: 5500, palette: 'sapphire' });
      // Extra bursts
      app.particles.burst(window.innerWidth * 0.3, window.innerHeight * 0.4, 18, { palette: 'gold' });
      app.particles.burst(window.innerWidth * 0.7, window.innerHeight * 0.4, 18, { palette: 'sapphire' });
    }

    const tl = gsap.timeline();

    // 1. Fade out video stage
    tl.to(videoStage, {
      opacity: 0,
      y: -20,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        videoStage.style.display = 'none';
        finaleStage.style.display = 'flex';
      },
    });

    // 2. Reveal Grand Finale with majestic scale & blur resolution
    tl.fromTo(finaleStage,
      { opacity: 0, scale: 0.94, filter: 'blur(8px)', y: 25 },
      { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, duration: 0.9, ease: 'power3.out' }
    );

    // 3. Stagger children entrance
    const children = finaleStage.querySelectorAll('.finale-emblem-wrapper, .finale-headline, .finale-subtext, .finale-card, .finale-actions, .finale-tap-hint');
    tl.fromTo(children,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.65, stagger: 0.12, ease: 'power2.out' },
      '-=0.5'
    );

    // Setup interactive tap celebration on the finale screen
    setupTapCelebration();
  }

  function showVideoStage() {
    currentStage = 'video';
    const videoStage = document.getElementById('video-stage');
    const finaleStage = document.getElementById('grand-finale-stage');

    gsap.to(finaleStage, {
      opacity: 0,
      duration: 0.4,
      onComplete: () => {
        finaleStage.style.display = 'none';
        videoStage.style.display = 'flex';
        gsap.to(videoStage, { opacity: 1, y: 0, duration: 0.5 });
      },
    });
  }

  function setupTapCelebration() {
    if (clickBurstListener) return;

    clickBurstListener = (e) => {
      // Don't burst when clicking buttons
      if (e.target.closest('button')) return;

      if (app.particles) {
        const palette = Math.random() > 0.4 ? 'sapphire' : 'gold';
        app.particles.burst(e.clientX, e.clientY, 14, {
          palette: palette,
          speed: 1.2,
        });
      }
    };

    container.addEventListener('pointerdown', clickBurstListener);
  }

  function cleanup() {
    if (clickBurstListener) {
      container.removeEventListener('pointerdown', clickBurstListener);
      clickBurstListener = null;
    }
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
