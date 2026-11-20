/**
 * ===================================================================
 * CHAPTER 1 — THE INVITATION
 * ===================================================================
 * Opening atmosphere and invitation screen.
 * Staggered typography entrance, luminous button micro-interaction,
 * and radial particle burst scatter.
 * ===================================================================
 */

import { gsap } from 'gsap';
import { config } from '../config.js';

export function createChapter1(app) {
  let isTransitioning = false;

  function render() {
    const container = document.getElementById('chapter-1');
    if (!container) return;

    isTransitioning = false;

    container.innerHTML = `
      <div class="invitation-content">
        <h1 class="invitation-salutation">${config.chapter1.salutation}</h1>
        <p class="invitation-text">${config.chapter1.introText}</p>
        <button id="ch1-begin-btn" class="btn-glow" aria-label="Begin our journey">
          <span>${config.chapter1.buttonText}</span>
        </button>
      </div>
    `;

    bindEvents();
    animateEntrance();
  }

  function animateEntrance() {
    const salutation = document.querySelector('.invitation-salutation');
    const text = document.querySelector('.invitation-text');
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
      if (isTransitioning) return;
      isTransitioning = true;

      const rect = beginBtn.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      // Burst particles outward in a celebratory wave
      if (app.particles) {
        app.particles.burst(originX, originY, 70, { palette: 'sapphire', speed: 1.3 });
      }

      // Animate button compression and advance
      gsap.to(beginBtn, {
        scale: 0.88,
        opacity: 0,
        filter: 'blur(4px)',
        duration: 0.38,
        ease: 'power2.in',
        onComplete: () => {
          app.progress.nextChapter();
        },
      });
    });
  }

  return {
    mount() {
      render();
    },
  };
}
