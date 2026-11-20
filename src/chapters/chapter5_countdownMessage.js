/**
 * ===================================================================
 * CHAPTER 5 — COUNTDOWN AND MESSAGE INTERACTION
 * ===================================================================
 * Features:
 * - Animated Countdown: 5 → 4 → 3 → 2 → 1
 * - Followed immediately by the personal message-writing interaction
 * - Strict adherence to instructions:
 *   - No introductory countdown message
 *   - No invitation sentence (left empty)
 *   - Preserves message-writing interaction
 *   - No invented additional romantic text
 * ===================================================================
 */

import { gsap } from 'gsap';
import { config } from '../config.js';

const STORAGE_MESSAGE_KEY = 'sapphire_blossom_written_message';

export function createChapter5(app) {
  let countdownTimeline = null;
  let isCountdownFinished = false;

  const ch5Config = config.chapter5 || {};
  const reducedMotion = app.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render() {
    const container = document.getElementById('chapter-5');
    if (!container) return;

    isCountdownFinished = false;

    container.innerHTML = `
      <div class="chapter-content countdown-message-stage">
        
        <!-- STAGE 1: COUNTDOWN ANIMATION (5 -> 4 -> 3 -> 2 -> 1) -->
        <div id="countdown-stage" class="countdown-stage" aria-live="assertive">
          <div class="countdown-number-wrapper">
            <span id="countdown-display" class="countdown-number">5</span>
          </div>
        </div>

        <!-- STAGE 2: MESSAGE-WRITING INTERACTION (Displayed after countdown) -->
        <div id="message-stage" class="message-stage" style="display: none; opacity: 0;">
          <div class="glass-card message-card">
            
            <!-- Message Input Area (No introductory or invitation text per requirements) -->
            <form id="message-writing-form" class="message-form" onsubmit="return false;">
              <div class="message-input-wrapper">
                <textarea 
                  id="user-written-message" 
                  class="message-textarea" 
                  rows="6" 
                  placeholder="${ch5Config.placeholder || 'Write your message here...'}"
                  aria-label="Write a message"
                ></textarea>
              </div>

              <div class="message-actions">
                <button id="btn-submit-message" type="button" class="btn-glow">
                  <span>${ch5Config.submitButtonText || 'Save Message ✨'}</span>
                </button>

                <button id="btn-relive-journey" type="button" class="btn-glass">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                  <span>${ch5Config.restartJourneyText || 'Relive Our Journey 💫'}</span>
                </button>
              </div>

              <!-- Subtle Status Feedback -->
              <div id="message-feedback" class="message-feedback" role="status" aria-live="polite"></div>
            </form>

          </div>
        </div>

      </div>
    `;

    bindFormEvents();
    startCountdown();
  }

  function startCountdown() {
    const countdownStage = document.getElementById('countdown-stage');
    const display = document.getElementById('countdown-display');
    const messageStage = document.getElementById('message-stage');

    if (!countdownStage || !display) return;

    const numbers = [5, 4, 3, 2, 1];
    const stepDuration = reducedMotion ? 0.35 : 0.85;

    countdownTimeline = gsap.timeline({
      onComplete: () => {
        isCountdownFinished = true;
        revealMessageInteraction();
      },
    });

    numbers.forEach((num, index) => {
      // Set number text
      countdownTimeline.call(() => {
        if (display) display.textContent = num;
        if (app.particles && !reducedMotion) {
          const cx = window.innerWidth / 2;
          const cy = window.innerHeight / 2;
          app.particles.burst(cx, cy, 18 + (5 - num) * 5, {
            palette: num === 1 ? 'gold' : 'sapphire',
            speed: 1.2,
          });
        }
      });

      // Animate current number (scale pop from 1.5 to 1.0, then fade)
      countdownTimeline.fromTo(
        display,
        { scale: 1.5, opacity: 0, filter: 'blur(10px)' },
        { scale: 1, opacity: 1, filter: 'blur(0px)', duration: stepDuration * 0.45, ease: 'back.out(1.5)' }
      );

      countdownTimeline.to(display, {
        scale: 0.85,
        opacity: 0,
        filter: 'blur(6px)',
        duration: stepDuration * 0.45,
        ease: 'power2.in',
      }, `+=${stepDuration * 0.1}`);
    });
  }

  function revealMessageInteraction() {
    const countdownStage = document.getElementById('countdown-stage');
    const messageStage = document.getElementById('message-stage');

    if (!messageStage) return;

    if (countdownStage) {
      gsap.to(countdownStage, {
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          countdownStage.style.display = 'none';
        },
      });
    }

    messageStage.style.display = 'flex';

    if (app.particles) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight * 0.45;
      app.particles.burst(cx, cy, 50, { palette: 'sapphire', speed: 1.4 });
      app.particles.burst(cx, cy, 30, { palette: 'gold', speed: 1.2 });
    }

    gsap.fromTo(messageStage,
      { opacity: 0, y: 24, scale: 0.96, filter: 'blur(8px)' },
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }
    );

    // Load any previously saved message
    try {
      const savedMsg = localStorage.getItem(STORAGE_MESSAGE_KEY);
      const textarea = document.getElementById('user-written-message');
      if (savedMsg && textarea) {
        textarea.value = savedMsg;
      }
    } catch (e) {
      console.warn('Could not read saved message:', e);
    }
  }

  function bindFormEvents() {
    const form = document.getElementById('message-writing-form');
    const textarea = document.getElementById('user-written-message');
    const feedback = document.getElementById('message-feedback');
    const btnSubmit = document.getElementById('btn-submit-message');
    const btnRelive = document.getElementById('btn-relive-journey');

    function saveMessage() {
      const content = textarea?.value?.trim() || '';

      if (!content) {
        if (feedback) {
          feedback.textContent = 'Please write something first 💭';
          feedback.style.color = 'var(--gold-glow)';
          gsap.fromTo(feedback, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.3 });
        }
        return;
      }

      try {
        localStorage.setItem(STORAGE_MESSAGE_KEY, content);
      } catch (err) {
        console.warn('Could not store message:', err);
      }

      if (feedback) {
        feedback.textContent = ch5Config.successNotice || 'Your message has been saved with love ✨';
        feedback.style.color = 'var(--cyan-glow)';
        gsap.fromTo(feedback, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.4 });
      }

      if (app.particles) {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        app.particles.burst(cx, cy, 40, { palette: 'gold', speed: 1.3 });
      }
    }

    if (btnSubmit) {
      btnSubmit.addEventListener('click', saveMessage);
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveMessage();
      });
    }

    if (btnRelive) {
      btnRelive.addEventListener('click', () => {
        if (confirm('Revisit our journey from the very beginning?')) {
          app.progress.resetProgress();
        }
      });
    }
  }

  function cleanup() {
    if (countdownTimeline) {
      countdownTimeline.kill();
      countdownTimeline = null;
    }
    isCountdownFinished = false;
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
