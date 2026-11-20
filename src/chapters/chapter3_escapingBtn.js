/**
 * ===================================================================
 * CHAPTER 3 — THE ESCAPING BUTTON
 * ===================================================================
 * Playful interaction: "Are you curious what is next, my angel?"
 * When she attempts to say "No", the button playfully dodges away,
 * progressively changing its text:
 *   "Sure? 😏" -> "??? 🤔" -> "Try again? 😜" -> "Think again! 😉"
 * After several attempts, it surrenders and transforms into a second "Yes!" button!
 * Clicking either "Yes!" button triggers floating hearts and advances to Chapter 4.
 * ===================================================================
 */

import { gsap } from 'gsap';
import { config } from '../config.js';

export function createChapter3(app) {
  let attemptCount = 0;
  let hasSurrendered = false;
  let isCompleted = false;

  function render() {
    const container = document.getElementById('chapter-3');
    if (!container) return;

    attemptCount = 0;
    hasSurrendered = false;
    isCompleted = false;

    container.innerHTML = `
      <div class="glass-card ch3-play-area">
        <span class="badge" style="margin-bottom: 1rem;">Chapter 3 • A Little Question</span>
        <h2 class="ch3-question-title">"${config.chapter3.question}"</h2>

        <!-- Interactive Arena -->
        <div id="ch3-arena" class="ch3-options-arena">
          <div id="ch3-toast" class="ch3-toast" aria-live="polite"></div>

          <!-- Standard button ("Yes! ✨") -->
          <button id="ch3-btn-standard" class="btn-glow btn-standard" aria-label="Yes">
            <span>${config.chapter3.standardButtonText}</span>
          </button>

          <!-- Evasive button (Starts as "No 🙈", escapes, transforms to "Yes! 🥰") -->
          <button id="ch3-btn-evasive" class="btn-glass btn-evasive" aria-label="No">
            <span>${config.chapter3.evasiveButtonText}</span>
          </button>
        </div>

        <!-- Surrender & Success Panel -->
        <div id="ch3-surrender-panel" class="ch3-surrender-panel" style="display: none;">
          <p id="ch3-surrender-msg" class="ch3-surrender-msg">${config.chapter3.giveUpMessage}</p>
          <button id="ch3-continue-btn" class="btn-glow">
            <span>${config.chapter3.continueButtonText}</span>
          </button>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const arena = document.getElementById('ch3-arena');
    const evasiveBtn = document.getElementById('ch3-btn-evasive');
    const standardBtn = document.getElementById('ch3-btn-standard');
    const continueBtn = document.getElementById('ch3-continue-btn');

    if (!arena || !evasiveBtn) return;

    // Position buttons cleanly in arena on mount
    requestAnimationFrame(() => {
      resetButtonPositions();
    });

    // Cursor proximity detection for desktop
    arena.addEventListener('pointermove', (e) => {
      if (hasSurrendered || isCompleted) return;
      if (e.pointerType === 'touch') return; // Handled separately by touchstart/pointerdown

      const btnRect = evasiveBtn.getBoundingClientRect();
      const btnCenterX = btnRect.left + btnRect.width / 2;
      const btnCenterY = btnRect.top + btnRect.height / 2;

      const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

      // Trigger dodge when cursor comes within 45px (close enough so it's playful, not annoying)
      if (dist < 45) {
        dodgeButton();
      }
    });

    // Touch and click handling for mobile and desktop attempts
    const dodgeTriggerEvents = ['pointerdown', 'touchstart'];
    dodgeTriggerEvents.forEach((evtName) => {
      evasiveBtn.addEventListener(evtName, (e) => {
        if (hasSurrendered) {
          // If already surrendered into second Yes button, handle answer!
          handleYesChoice(evasiveBtn);
          return;
        }
        if (isCompleted) return;
        e.preventDefault();
        dodgeButton();
      }, { passive: false });
    });

    // Standard "Yes! ✨" button interaction
    if (standardBtn) {
      standardBtn.addEventListener('click', () => {
        if (isCompleted) return;
        handleYesChoice(standardBtn);
      });
    }

    // Continue button after surrender
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        app.progress.nextChapter();
      });
    }
  }

  function resetButtonPositions() {
    const arena = document.getElementById('ch3-arena');
    const evasiveBtn = document.getElementById('ch3-btn-evasive');
    const standardBtn = document.getElementById('ch3-btn-standard');

    if (!arena || !evasiveBtn || !standardBtn) return;

    const arenaWidth = arena.clientWidth;
    const isMobile = arenaWidth < 480;

    if (isMobile) {
      standardBtn.style.left = '50%';
      standardBtn.style.top = '32%';
      standardBtn.style.transform = 'translate(-50%, -50%)';

      evasiveBtn.style.left = '50%';
      evasiveBtn.style.top = '68%';
      evasiveBtn.style.transform = 'translate(-50%, -50%)';
    } else {
      standardBtn.style.left = '25%';
      standardBtn.style.top = '50%';
      standardBtn.style.transform = 'translate(-50%, -50%)';

      evasiveBtn.style.left = '75%';
      evasiveBtn.style.top = '50%';
      evasiveBtn.style.transform = 'translate(-50%, -50%)';
    }
  }

  function dodgeButton() {
    if (hasSurrendered || isCompleted) return;

    const arena = document.getElementById('ch3-arena');
    const evasiveBtn = document.getElementById('ch3-btn-evasive');
    if (!arena || !evasiveBtn) return;

    attemptCount++;

    // Reactions cycle: "Sure? 😏" -> "??? 🤔" -> "Try again? 😜" -> "Think again! 😉"
    const reactions = config.chapter3.evasiveReactions;
    const reactionText = reactions[(attemptCount - 1) % reactions.length];

    // Update the button's own label
    const btnSpan = evasiveBtn.querySelector('span');
    if (btnSpan) {
      btnSpan.textContent = reactionText;
    } else {
      evasiveBtn.textContent = reactionText;
    }

    // Show dynamic cheeky toast
    showToast(reactionText);

    // Check if max attempts reached -> Surrender and transform into second YES!
    if (attemptCount >= config.chapter3.maxAttempts) {
      triggerSurrender();
      return;
    }

    // Calculate safe screen-bounded coordinates
    const arenaRect = arena.getBoundingClientRect();
    const btnRect = evasiveBtn.getBoundingClientRect();

    const padding = 20;
    const minX = padding;
    const maxX = Math.max(minX, arenaRect.width - btnRect.width - padding);
    const minY = padding;
    const maxY = Math.max(minY, arenaRect.height - btnRect.height - padding);

    // Pick random target coordinate with safe displacement
    let newX = Math.random() * (maxX - minX) + minX;
    let newY = Math.random() * (maxY - minY) + minY;

    // Smooth, graceful physics dodge animation via GSAP (slower and gentle so she can see it slide)
    gsap.to(evasiveBtn, {
      left: newX,
      top: newY,
      transform: 'none',
      duration: 0.7,
      ease: 'power2.out',
    });

    // Subtle motion trail and micro-particle puff at the escape point
    if (app.particles) {
      app.particles.emitTrail(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2, 6, { palette: 'sapphire' });
      app.particles.burst(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2, 10, { palette: 'default', speed: 0.7 });
    }
  }

  function triggerSurrender() {
    hasSurrendered = true;

    const arena = document.getElementById('ch3-arena');
    const evasiveBtn = document.getElementById('ch3-btn-evasive');
    const standardBtn = document.getElementById('ch3-btn-standard');
    const panel = document.getElementById('ch3-surrender-panel');

    // Change evasive button into a second glowing "Yes! 🥰" button
    const btnSpan = evasiveBtn ? evasiveBtn.querySelector('span') : null;
    const convertedText = config.chapter3.evasiveConvertedText || "Yes! 🥰";
    if (btnSpan) {
      btnSpan.textContent = convertedText;
    } else if (evasiveBtn) {
      evasiveBtn.textContent = convertedText;
    }

    if (evasiveBtn) {
      evasiveBtn.classList.remove('btn-glass', 'btn-evasive');
      evasiveBtn.classList.add('btn-glow', 'btn-converted-yes');
      evasiveBtn.style.pointerEvents = 'auto';
      evasiveBtn.style.cursor = 'pointer';

      // Position both Yes buttons gracefully side by side
      if (arena && standardBtn) {
        const isMobile = arena.clientWidth < 480;
        if (isMobile) {
          gsap.to(standardBtn, { left: '50%', top: '32%', transform: 'translate(-50%, -50%)', duration: 0.5, ease: 'power2.out' });
          gsap.to(evasiveBtn, { left: '50%', top: '68%', transform: 'translate(-50%, -50%)', duration: 0.5, ease: 'power2.out' });
        } else {
          gsap.to(standardBtn, { left: '30%', top: '50%', transform: 'translate(-50%, -50%)', duration: 0.5, ease: 'power2.out' });
          gsap.to(evasiveBtn, { left: '70%', top: '50%', transform: 'translate(-50%, -50%)', duration: 0.5, ease: 'power2.out' });
        }
      }

      // Clicking either button handles the Yes choice
      evasiveBtn.onclick = () => {
        handleYesChoice(evasiveBtn);
      };
    }

    // Show surrender panel with celebratory explanation
    if (panel) {
      panel.style.display = 'flex';
      const msg = document.getElementById('ch3-surrender-msg');
      if (msg) msg.textContent = config.chapter3.giveUpMessage;
      gsap.fromTo(panel, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.2 });
    }

    // Trigger lovely floating heart cascade
    spawnHeartCascade();
  }

  function handleYesChoice(clickedBtn) {
    if (isCompleted) return;
    isCompleted = true;

    const panel = document.getElementById('ch3-surrender-panel');
    const msg = document.getElementById('ch3-surrender-msg');

    if (clickedBtn) {
      gsap.to(clickedBtn, { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1 });
    }

    if (msg) {
      msg.textContent = "I knew it! Let's see what comes next, my angel... 💖";
    }

    if (panel) {
      panel.style.display = 'flex';
      gsap.fromTo(panel, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6 });
    }

    spawnHeartCascade();

    // Advance smoothly to Chapter 4 after 1.2s of celebratory hearts
    setTimeout(() => {
      app.progress.nextChapter();
    }, 1200);
  }

  function showToast(text) {
    const toast = document.getElementById('ch3-toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 1200);
  }

  function spawnHeartCascade() {
    const container = document.getElementById('chapter-3');
    if (!container) return;

    const heartSymbols = ['💙', '✨', '💖', '💍', '🌸'];

    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        
        // Random horizontal position across card
        const leftPercent = Math.random() * 80 + 10;
        const tx = (Math.random() - 0.5) * 160;
        const ty = -(Math.random() * 180 + 100);
        const rot = (Math.random() - 0.5) * 60;

        heart.style.left = `${leftPercent}%`;
        heart.style.bottom = '15%';
        heart.style.setProperty('--tx', `${tx}px`);
        heart.style.setProperty('--ty', `${ty}px`);
        heart.style.setProperty('--rot', `${rot}deg`);

        container.appendChild(heart);

        setTimeout(() => {
          heart.remove();
        }, 1900);
      }, i * 75);
    }

    // Canvas particle burst
    if (app.particles) {
      app.particles.burst(window.innerWidth / 2, window.innerHeight / 2, 70);
    }
  }

  return {
    mount() {
      render();
    },
  };
}
