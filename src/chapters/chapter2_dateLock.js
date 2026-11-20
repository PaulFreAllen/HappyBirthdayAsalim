/**
 * ===================================================================
 * CHAPTER 2 — THE DATE LOCK
 * ===================================================================
 * "The day everything started"
 * Features:
 * - Interactive celestial vault lock
 * - Segmented date tumbler inputs (Day, Month, Year: 18.07.2022)
 * - Auto-advancing focus, error feedback, and progressive hints
 * - Smooth transition into Chapter 3 (Blue Rose Garden) upon unlocking
 * ===================================================================
 */

import { gsap } from 'gsap';
import { config } from '../config.js';

export function getDateLockHTML() {
  const lockConfig = config.chapter2 || {};

  return `
    <div class="glass-card lock-container">
      <div class="lock-header">
        <span class="chapter-badge">${lockConfig.badge || 'Chapter I'}</span>
        <h1 class="chapter-title lock-opening-title">${lockConfig.title || 'The day everything started'}</h1>
      </div>

      <!-- Celestial Lock Graphic -->
      <div class="lock-vault-graphic" aria-hidden="true">
        <svg class="lock-svg" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="46" stroke="rgba(56, 189, 248, 0.25)" stroke-width="1.5" stroke-dasharray="4 4" />
          <circle cx="50" cy="50" r="38" stroke="rgba(0, 240, 255, 0.18)" stroke-width="1" />
          <path class="lock-shackle" d="M35 52 V32 C35 22 65 22 65 32 V52" stroke="url(#lockGradient)" stroke-width="6" stroke-linecap="round" fill="none" />
          <rect x="24" y="46" width="52" height="42" rx="14" fill="rgba(8, 15, 36, 0.95)" stroke="url(#lockGradient)" stroke-width="2.5" />
          <circle cx="50" cy="63" r="6" fill="#00f0ff" opacity="0.95" />
          <path d="M47 65 L44 76 H56 L53 65 Z" fill="#00f0ff" opacity="0.95" />
        </svg>
      </div>

      <h2 class="lock-quote-main">"${lockConfig.quote1 || 'Some dates are just dates. Others become memories that stay with us.'}"</h2>
      <p class="lock-quote-sub">${lockConfig.quote2 || 'Can you remember this one?'}</p>

      <!-- Segmented Date Tumbler Inputs -->
      <form id="date-lock-form" class="date-lock-form" novalidate onsubmit="return false;">
        <div class="date-inputs-wrapper">
          <div class="date-input-group">
            <label for="lock-day" class="date-input-label">Day</label>
            <input 
              id="lock-day" 
              class="date-tumbler-input" 
              type="text" 
              inputmode="numeric" 
              pattern="[0-9]*" 
              maxlength="2" 
              placeholder="DD"
              autocomplete="off"
              aria-label="Two-digit day"
            />
          </div>

          <span class="date-separator">.</span>

          <div class="date-input-group">
            <label for="lock-month" class="date-input-label">Month</label>
            <input 
              id="lock-month" 
              class="date-tumbler-input" 
              type="text" 
              inputmode="numeric" 
              pattern="[0-9]*" 
              maxlength="2" 
              placeholder="MM"
              autocomplete="off"
              aria-label="Two-digit month"
            />
          </div>

          <span class="date-separator">.</span>

          <div class="date-input-group">
            <label for="lock-year" class="date-input-label">Year</label>
            <input 
              id="lock-year" 
              class="date-tumbler-input input-year" 
              type="text" 
              inputmode="numeric" 
              pattern="[0-9]*" 
              maxlength="4" 
              placeholder="YYYY"
              autocomplete="off"
              aria-label="Four-digit year"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="lock-actions">
          <button id="lock-submit-btn" class="btn-glow" type="button">
            <span>Unlock Memories ✨</span>
          </button>
        </div>

        <!-- Dynamic Feedback Status Message -->
        <div id="lock-feedback-msg" class="lock-feedback" role="status" aria-live="polite"></div>

        <!-- Progressive Romantic Hint / Skip Box -->
        <div id="lock-hint-box" class="lock-hint-box" style="display: none;">
          <p id="lock-hint-text" class="lock-hint-text"></p>
          <button id="lock-skip-btn" class="btn-subtle" type="button">
            <span>${lockConfig.skipText || "Can't remember right now? Let me help you through ✨"}</span>
          </button>
        </div>
      </form>
    </div>
  `;
}

export function bindDateLockEvents(container, app) {
  const lockConfig = config.chapter2 || {};
  const targetDate = lockConfig.targetDate || { day: '18', month: '07', year: '2022' };

  const inputDay = container.querySelector('#lock-day');
  const inputMonth = container.querySelector('#lock-month');
  const inputYear = container.querySelector('#lock-year');
  const submitBtn = container.querySelector('#lock-submit-btn');
  const feedbackMsg = container.querySelector('#lock-feedback-msg');
  const hintBox = container.querySelector('#lock-hint-box');
  const hintText = container.querySelector('#lock-hint-text');
  const skipBtn = container.querySelector('#lock-skip-btn');
  const shackle = container.querySelector('.lock-shackle');

  let failedAttempts = 0;
  let isUnlocked = false;

  const autoAdvance = (currentInput, nextInput, maxLen) => {
    currentInput.addEventListener('input', (e) => {
      currentInput.value = currentInput.value.replace(/\D/g, '');
      if (currentInput.value.length >= maxLen && nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    });

    currentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && currentInput.value.length === 0) {
        const prevInput = currentInput === inputYear ? inputMonth : currentInput === inputMonth ? inputDay : null;
        if (prevInput) {
          prevInput.focus();
        }
      }
      if (e.key === 'Enter') {
        attemptUnlock();
      }
    });
  };

  autoAdvance(inputDay, inputMonth, 2);
  autoAdvance(inputMonth, inputYear, 2);
  autoAdvance(inputYear, null, 4);

  submitBtn?.addEventListener('click', attemptUnlock);

  skipBtn?.addEventListener('click', () => {
    inputDay.value = targetDate.day;
    inputMonth.value = targetDate.month;
    inputYear.value = targetDate.year;

    showFeedback(
      lockConfig.skipRevealMessage || "July 18, 2022 — the day our beautiful relationship began. Always right here in my heart. ✨",
      'var(--cyan-glow)'
    );

    setTimeout(() => {
      unlockVault();
    }, 1200);
  });

  function attemptUnlock() {
    if (isUnlocked) return;

    const day = inputDay.value.trim().padStart(2, '0');
    const month = inputMonth.value.trim().padStart(2, '0');
    const year = inputYear.value.trim();

    if (!day || !month || !year || year.length < 4) {
      showFeedback('Please enter the full date 💭', 'var(--gold-glow)');
      shakeElement(container.querySelector('.date-inputs-wrapper'));
      return;
    }

    if (day === targetDate.day && month === targetDate.month && year === targetDate.year) {
      unlockVault();
    } else {
      handleFailedAttempt();
    }
  }

  function handleFailedAttempt() {
    failedAttempts++;

    const errors = lockConfig.errorMessages || [
      'Hmm, close... but not quite! Think back 💭',
      "Nice guess, but that's not our magic day! 😉",
      'Are you sure? Try searching your heart again 🔍',
    ];
    const errorMsg = errors[(failedAttempts - 1) % errors.length];

    showFeedback(errorMsg, '#f87171');
    shakeElement(container.querySelector('.lock-container'));

    [inputDay, inputMonth, inputYear].forEach((input) => {
      input.classList.add('input-error');
      setTimeout(() => input.classList.remove('input-error'), 1200);
    });

    if (failedAttempts >= (lockConfig.hintAfterFailedAttempts || 3) && hintBox) {
      hintBox.style.display = 'block';
      if (hintText) {
        hintText.textContent =
          lockConfig.hintText ||
          "💡 Hint: That unforgettable July day in 2022 when we officially became 'us'... ✨";
      }
      gsap.fromTo(hintBox, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });
    }
  }

  function unlockVault() {
    isUnlocked = true;

    [inputDay, inputMonth, inputYear].forEach((inp) => {
      inp.disabled = true;
      inp.classList.add('input-success');
    });
    if (submitBtn) submitBtn.disabled = true;

    showFeedback(
      lockConfig.successMessage || 'You remembered. The lock clicks open... ✨',
      'var(--cyan-glow)'
    );

    const tl = gsap.timeline({
      onComplete: () => {
        app.progress.nextChapter();
      },
    });

    if (shackle) {
      tl.to(shackle, {
        y: -14,
        rotation: -20,
        transformOrigin: 'top right',
        duration: 0.65,
        ease: 'back.out(2)',
      });
    }

    tl.to(
      container.querySelector('.lock-vault-graphic'),
      {
        scale: 1.15,
        filter: 'drop-shadow(0 0 25px rgba(0, 240, 255, 0.8))',
        duration: 0.5,
      },
      '-=0.3'
    );

    if (app.particles) {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.35;
      app.particles.burst(cx, cy, 60, { palette: 'sapphire', speed: 1.6 });
      app.particles.burst(cx, cy, 30, { palette: 'gold', speed: 1.2 });
    }

    tl.to(
      container.querySelector('.lock-container'),
      {
        opacity: 0,
        y: -30,
        scale: 0.95,
        filter: 'blur(8px)',
        duration: 0.8,
        ease: 'power2.inOut',
      },
      '+=0.6'
    );
  }

  function showFeedback(msg, color) {
    const el = feedbackMsg;
    if (!el) return;
    el.textContent = msg;
    el.style.color = color;
    gsap.fromTo(el, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.3 });
  }

  function shakeElement(el) {
    if (!el) return;
    el.classList.remove('animate-shake');
    void el.offsetWidth;
    el.classList.add('animate-shake');
  }
}

export function createChapter2(app) {
  function render() {
    const container = document.getElementById('chapter-2');
    if (!container) return;

    container.innerHTML = getDateLockHTML();
    bindDateLockEvents(container, app);
  }

  return {
    mount() {
      render();
      const firstInput = document.getElementById('lock-day');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 300);
      }
    },
    unmount() {},
  };
}
