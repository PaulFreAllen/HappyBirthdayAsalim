/**
 * ===================================================================
 * CHAPTER 4 — OUR MEMORIES QUIZ
 * ===================================================================
 * A 4-question interactive journey revisiting key memories:
 * 1. Our first memories
 * 2. Important moments in our journey
 * 3. Inside jokes
 * 4. Small personal details
 *
 * Features 4 glowing hearts as a progress indicator, affectionate
 * feedback, gentle hints after repeated misses, and romantic reflections.
 * ===================================================================
 */

import { gsap } from 'gsap';
import { config } from '../config.js';

export function createChapter4(app) {
  let currentQuestionIndex = 0;
  let attemptsOnCurrentQuestion = 0;
  let isAnswered = false;

  const questions = config.chapter4.questions;

  function render() {
    const container = document.getElementById('chapter-4');
    if (!container) return;

    currentQuestionIndex = 0;
    attemptsOnCurrentQuestion = 0;
    isAnswered = false;

    container.innerHTML = `
      <div class="glass-card quiz-container">
        <div class="quiz-header">
          <span class="badge" id="quiz-category-badge">Memory 1 of 4</span>
          
          <!-- 4 Glowing Hearts Progress Indicator -->
          <div class="quiz-hearts-track" id="quiz-hearts-track" aria-label="Quiz Progress">
            ${[0, 1, 2, 3].map((idx) => `
              <div class="quiz-heart-item" data-heart="${idx}" title="Memory ${idx + 1}">
                <svg class="quiz-heart-svg" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Dynamic Question Stage Area -->
        <div id="quiz-stage-area"></div>
      </div>
    `;

    renderQuestion(0);
  }

  function updateHeartsUI(currentIndex, isComplete = false) {
    const heartItems = document.querySelectorAll('.quiz-heart-item');
    heartItems.forEach((item, idx) => {
      item.classList.remove('active', 'completed');
      if (idx < currentIndex || isComplete) {
        item.classList.add('completed');
      } else if (idx === currentIndex) {
        item.classList.add('active');
      }
    });
  }

  function renderQuestion(index) {
    const stageArea = document.getElementById('quiz-stage-area');
    const badge = document.getElementById('quiz-category-badge');
    if (!stageArea) return;

    currentQuestionIndex = index;
    attemptsOnCurrentQuestion = 0;
    isAnswered = false;

    const q = questions[index];
    if (badge) {
      badge.textContent = `${q.category} • ${index + 1} of ${questions.length}`;
    }

    updateHeartsUI(index);

    const letters = ['A', 'B', 'C', 'D'];

    stageArea.innerHTML = `
      <div class="quiz-card fade-in-up">
        ${q.photoSrc ? `
          <div class="quiz-photo-wrapper">
            <div class="quiz-photo-frame">
              <img 
                src="${q.photoSrc}" 
                alt="${q.photoAlt || 'Our memory photograph'}" 
                class="quiz-memory-img" 
                loading="lazy" 
              />
              ${q.photoCaption ? `<span class="quiz-photo-caption">${q.photoCaption}</span>` : ''}
            </div>
          </div>
        ` : ''}

        <h3 class="quiz-question-text">"${q.question}"</h3>

        <div class="quiz-options-list">
          ${q.options.map((opt, optIdx) => `
            <button class="quiz-option-btn" data-opt-index="${optIdx}">
              <span class="quiz-option-letter">${letters[optIdx]}</span>
              <span class="quiz-option-label">${opt}</span>
            </button>
          `).join('')}
        </div>

        <div id="quiz-feedback" class="quiz-feedback-box" role="status" aria-live="polite"></div>

        <div id="quiz-reflection" style="display: none;"></div>
      </div>
    `;

    bindOptionClicks(q);
  }

  function bindOptionClicks(questionData) {
    const optionBtns = document.querySelectorAll('.quiz-option-btn');

    optionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (isAnswered) return;

        const selectedIndex = parseInt(btn.getAttribute('data-opt-index'), 10);
        handleAnswerSelection(selectedIndex, questionData, btn);
      });
    });
  }

  function handleAnswerSelection(selectedIndex, questionData, clickedBtn) {
    const feedback = document.getElementById('quiz-feedback');
    const reflectionContainer = document.getElementById('quiz-reflection');
    const isCorrect = selectedIndex === questionData.correctIndex;

    if (isCorrect) {
      isAnswered = true;
      clickedBtn.classList.add('correct');

      // Update current heart to completed
      const heartItem = document.querySelector(`.quiz-heart-item[data-heart="${currentQuestionIndex}"]`);
      if (heartItem) {
        heartItem.classList.remove('active');
        heartItem.classList.add('completed');
        
        // Burst celebratory golden stardust over completed heart
        const rect = heartItem.getBoundingClientRect();
        if (app.particles) {
          app.particles.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35, { palette: 'gold' });
        }
      }

      // Clear any previous error feedback
      if (feedback) feedback.textContent = '';

      // Reveal romantic reflection
      if (reflectionContainer) {
        const isLastQuestion = currentQuestionIndex === questions.length - 1;
        const nextButtonText = isLastQuestion ? "Complete our memories ✨" : "Next Memory →";

        reflectionContainer.innerHTML = `
          <div class="quiz-reflection-card fade-in-up">
            <p class="quiz-reflection-text">${questionData.reflection}</p>
            <button id="quiz-next-btn" class="btn-glow" style="margin-top: 0.5rem;">
              <span>${nextButtonText}</span>
            </button>
          </div>
        `;
        reflectionContainer.style.display = 'block';

        const nextBtn = document.getElementById('quiz-next-btn');
        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            if (isLastQuestion) {
              renderCompletionScreen();
            } else {
              transitionToNextQuestion(currentQuestionIndex + 1);
            }
          });
        }
      }
    } else {
      attemptsOnCurrentQuestion++;
      clickedBtn.classList.add('incorrect');
      shakeElement(clickedBtn);

      // Playful affectionate feedback
      if (attemptsOnCurrentQuestion >= 2) {
        // Reveal gentle hint so user is never stuck
        const correctText = questionData.options[questionData.correctIndex];
        if (feedback) {
          feedback.innerHTML = `💡 Gentle whisper: It's actually <strong>"${correctText}"</strong> ✨`;
          feedback.style.color = 'var(--gold-glow)';
        }

        // Highlight correct option in soft gold
        const correctBtn = document.querySelector(`.quiz-option-btn[data-opt-index="${questionData.correctIndex}"]`);
        if (correctBtn) {
          correctBtn.classList.add('hint-revealed');
        }
      } else {
        if (feedback) {
          feedback.textContent = "Not quite, my love! Give it another try 💕";
          feedback.style.color = 'var(--cyan-subtle)';
        }
      }
    }
  }

  function transitionToNextQuestion(nextIndex) {
    const card = document.querySelector('.quiz-card');
    if (card) {
      gsap.to(card, {
        opacity: 0,
        y: -15,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          renderQuestion(nextIndex);
        },
      });
    } else {
      renderQuestion(nextIndex);
    }
  }

  function renderCompletionScreen() {
    const stageArea = document.getElementById('quiz-stage-area');
    const badge = document.getElementById('quiz-category-badge');
    if (!stageArea) return;

    if (badge) {
      badge.textContent = "All Memories Unlocked 💙";
    }

    updateHeartsUI(4, true);

    stageArea.innerHTML = `
      <div class="quiz-complete-card fade-in-up">
        <h3 class="quiz-complete-title">
          "${config.chapter4.completionText}"
        </h3>
        <p class="quiz-reflection-text">
          ${config.chapter4.completionSubtext}
        </p>
        <button id="quiz-to-garden-btn" class="btn-glow" style="margin-top: 1rem;">
          <span>${config.chapter4.continueButtonText}</span>
        </button>
      </div>
    `;

    // Ambient celebration particle burst and stardust cascade
    if (app.particles) {
      app.particles.burst(window.innerWidth / 2, window.innerHeight * 0.45, 80, { palette: 'sapphire' });
      app.particles.cascade(2600);
    }

    const gardenBtn = document.getElementById('quiz-to-garden-btn');
    if (gardenBtn) {
      gardenBtn.addEventListener('click', () => {
        app.progress.nextChapter();
      });
    }
  }

  function shakeElement(el) {
    if (!el) return;
    el.classList.remove('animate-shake');
    void el.offsetWidth;
    el.classList.add('animate-shake');
  }

  return {
    mount() {
      render();
    },
  };
}
