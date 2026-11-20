/**
 * ===================================================================
 * CHAPTER 1 — THE DATE LOCK
 * ===================================================================
 * Opening Scene: "The day everything started"
 * Features:
 * - Interactive celestial vault lock
 * - Segmented date tumbler inputs (Day, Month, Year)
 * - Auto-advancing focus, error feedback, and progressive hints
 * - Smooth transition into Chapter 2 (Blue Rose Garden) upon unlocking
 * ===================================================================
 */

import { gsap } from 'gsap';
import { config } from '../config.js';

export function getDateLockHTML() {
  const lockConfig = config.chapter1;

  return `
    <div class="glass-card lock-container">
      <div class="lock-header">
        <span class="chapter-badge">${lockConfig.badge || 'Chapter I'}</span>
        <h1 class="chapter-title lock-opening-title">${lockConfig.title}</h1>
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

      <h2 class="lock-quote-main">"${lockConfig.quote1}"</h2>
      <p class="lock-quote-sub">${lockConfig.quote2}</p>

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
              required 
            />
          </div>

          <span class="date-separator" aria-hidden="true">/</span>

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
              required 
            />
          </div>

          <span class="date-separator" aria-hidden="true">/</span>

          <div class="date-input-group">
            <label for="lock-year" class="date-input-label">Year</label>
            <input 
              id="lock-year" 
              class="date-tumbler-input" 
              type="text" 
              inputmode="numeric" 
              pattern="[0-9]*" 
              maxlength="4" 
              placeholder="YYYY" 
              autocomplete="off" 
              required 
            />
          </div>
        </div>

        <div class="lock-actions">
          <button id="lock-submit-btn" type="submit" class="btn-glow">
            <span>Unlock ✨</span>
          </button>

          <div id="lock-feedback" class="lock-feedback-msg" role="status" aria-live="polite"></div>

          <div id="lock-hint" class="lock-hint-box" style="display: none;" aria-live="polite">
            ${lockConfig.hintText}
          </div>

          <button id="lock-skip-btn" type="button" class="lock-skip-btn">
            ${lockConfig.skipText}
          </button>
        </div>
      </form>
    </div>
  `;
}

export function bindDateLockEvents(container, app) {
  const form = container.querySelector('#date-lock-form') || document.getElementById('date-lock-form');
  const dayInput = container.querySelector('#lock-day') || document.getElementById('lock-day');
  const monthInput = container.querySelector('#lock-month') || document.getElementById('lock-month');
  const yearInput = container.querySelector('#lock-year') || document.getElementById('lock-year');
  const skipBtn = container.querySelector('#lock-skip-btn') || document.getElementById('lock-skip-btn');

  let failedAttempts = 0;
  let isUnlocked = false;

  const lockConfig = config.chapter1;

  // Auto-focus and advance input logic
  const inputs = [dayInput, monthInput, yearInput];
  inputs.forEach((input, idx) => {
    if (!input) return;

    input.addEventListener('input', (e) => {
      // Only keep digits
      input.value = input.value.replace(/\D/g, '');

      // Auto-advance to next input once maxlength is reached
      if (input.value.length >= input.maxLength && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
        inputs[idx + 1].select();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && input.value.length === 0 && idx > 0) {
        inputs[idx - 1].focus();
      }
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleUnlockAttempt();
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      handleGentleSkip();
    });
  }

  function handleUnlockAttempt() {
    if (isUnlocked) return;

    const card = container.querySelector('.lock-container') || document.querySelector('.lock-container');
    const dayVal = dayInput?.value.trim() || '';
    const monthVal = monthInput?.value.trim() || '';
    const yearVal = yearInput?.value.trim() || '';

    if (!dayVal || !monthVal || !yearVal) {
      setFeedback('Please enter the day, month, and year 💭', 'var(--gold-glow)');
      shakeElement(card);
      return;
    }

    const enteredDay = parseInt(dayVal, 10);
    const enteredMonth = parseInt(monthVal, 10);
    const enteredYear = parseInt(yearVal, 10);

    if (enteredMonth < 1 || enteredMonth > 12 || enteredDay < 1 || enteredDay > 31 || enteredYear < 1900 || enteredYear > 2100) {
      setFeedback('Please check the date numbers again 💫', 'var(--gold-glow)');
      shakeElement(card);
      return;
    }

    const target = lockConfig.targetDate;
    const isCorrect = (
      enteredYear === parseInt(target.year, 10) &&
      enteredMonth === parseInt(target.month, 10) &&
      enteredDay === parseInt(target.day, 10)
    );

    if (isCorrect) {
      triggerSuccessUnlock(lockConfig.successMessage);
    } else {
      failedAttempts++;
      shakeElement(card);

      if (app.particles && card) {
        const rect = card.getBoundingClientRect();
        app.particles.burst(rect.left + rect.width / 2, rect.top + rect.height * 0.42, 20, { palette: 'error', speed: 0.85 });
      }

      const msgs = lockConfig.errorMessages;
      const msgIndex = (failedAttempts - 1) % msgs.length;
      setFeedback(msgs[msgIndex], 'var(--cyan-subtle)');

      if (failedAttempts >= lockConfig.hintAfterFailedAttempts) {
        const hintBox = container.querySelector('#lock-hint') || document.getElementById('lock-hint');
        if (hintBox && hintBox.style.display === 'none') {
          hintBox.style.display = 'block';
          gsap.fromTo(hintBox, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6 });
        }
      }
    }
  }

  function handleGentleSkip() {
    if (isUnlocked) return;

    const target = lockConfig.targetDate;
    if (dayInput && monthInput && yearInput) {
      dayInput.value = String(target.day).padStart(2, '0');
      monthInput.value = String(target.month).padStart(2, '0');
      yearInput.value = String(target.year);

      gsap.fromTo([dayInput, monthInput, yearInput], 
        { scale: 0.9, backgroundColor: 'rgba(56, 189, 248, 0.3)' },
        { scale: 1, backgroundColor: 'rgba(8, 15, 36, 0.85)', duration: 0.5, stagger: 0.1 }
      );
    }

    triggerSuccessUnlock(lockConfig.skipRevealMessage);
  }

  function triggerSuccessUnlock(message) {
    isUnlocked = true;
    setFeedback(message, 'var(--cyan-glow)');

    const shackle = container.querySelector('.lock-shackle') || document.querySelector('.lock-shackle');
    const lockSvg = container.querySelector('.lock-svg') || document.querySelector('.lock-svg');
    const submitBtn = container.querySelector('#lock-submit-btn') || document.getElementById('lock-submit-btn');
    const skipBtnEl = container.querySelector('#lock-skip-btn') || document.getElementById('lock-skip-btn');

    if (submitBtn) submitBtn.disabled = true;
    if (skipBtnEl) skipBtnEl.style.display = 'none';

    if (shackle) {
      shackle.classList.add('open');
    }
    if (lockSvg) {
      lockSvg.classList.add('unlocked');
    }

    const graphic = container.querySelector('.lock-vault-graphic') || document.querySelector('.lock-vault-graphic');
    if (graphic && app.particles) {
      const rect = graphic.getBoundingClientRect();
      app.particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 80);
    }

    gsap.delayedCall(1.6, () => {
      app.progress.goToChapter(2, true);
    });
  }

  function setFeedback(msg, color) {
    const el = container.querySelector('#lock-feedback') || document.getElementById('lock-feedback');
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

export function createChapter1(app) {
  function render() {
    const container = document.getElementById('chapter-1');
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
