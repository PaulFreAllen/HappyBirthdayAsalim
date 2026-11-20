/**
 * ===================================================================
 * SAPPHIRE BLOSSOM — MAIN APPLICATION CONTROLLER
 * ===================================================================
 * Orchestrates background canvas, navigation controls, chapter routers,
 * atmospheric lighting shifts, and cinematic scene transitions.
 * ===================================================================
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { config } from './config.js';
import { BackgroundParticles } from './components/backgroundParticles.js';
import { ProgressManager } from './components/progressManager.js';
import { createChapter1 } from './chapters/chapter1_invitation.js';
import { createChapter2 } from './chapters/chapter2_dateLock.js';
import { createChapter3 } from './chapters/chapter3_escapingBtn.js';
import { createChapter4 } from './chapters/chapter4_garden.js';
import { createChapter5 } from './chapters/chapter5_letter.js';
import { createChapter6 } from './chapters/chapter6_videoFinale.js';

gsap.registerPlugin(ScrollTrigger);
window.ScrollTrigger = ScrollTrigger;

class SapphireBlossomApp {
  constructor() {
    this.particles = null;
    this.progress = null;
    this.currentChapterIndex = 1;
    this.chapterModules = {};
    this.isTransitioning = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    // 1. Initialize Celestial Stardust Particles
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
      this.particles = new BackgroundParticles(canvas);
    }

    // 2. Initialize Progress State Manager
    this.progress = new ProgressManager(6, (newChapter) => {
      this.transitionToChapter(newChapter, true);
    });

    // 3. Register Chapter Modules
    this.registerChapterModule(1, createChapter1(this));
    this.registerChapterModule(2, createChapter2(this));
    this.registerChapterModule(3, createChapter3(this));
    this.registerChapterModule(4, createChapter4(this));
    this.registerChapterModule(5, createChapter5(this));
    this.registerChapterModule(6, createChapter6(this));

    // 4. Setup Navigation UI Listeners
    this.setupNavigation();

    // 5. Setup Optional Background Ambient Audio
    this.setupAudio();

    // 6. Restore progress or show current chapter
    const savedChapter = this.progress.getCurrentChapter();
    this.transitionToChapter(savedChapter, false);

    console.log(`✨ ${config.meta.title} initialized successfully. Current chapter: ${savedChapter}`);
  }

  setupNavigation() {
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        // Prevent rapid clicking during scene transition
        if (this.isTransitioning) return;

        const targetChapter = parseInt(dot.getAttribute('data-chapter'), 10);
        if (targetChapter === this.currentChapterIndex) return;

        if (this.progress.isUnlocked(targetChapter)) {
          this.progress.goToChapter(targetChapter);
        } else {
          // Playful visual cue that it's still locked
          gsap.fromTo(dot, { x: -4 }, { x: 4, duration: 0.1, repeat: 3, yoyo: true });
        }
      });
    });

    const resetBtn = document.getElementById('btn-restart');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (this.isTransitioning) return;
        if (confirm('Start our journey again from the very beginning?')) {
          this.progress.resetProgress();
        }
      });
    }
  }

  setupAudio() {
    if (!config.audio?.enabled || !config.audio?.src) return;

    const audioBtn = document.getElementById('btn-audio-toggle');
    if (!audioBtn) return;

    audioBtn.style.display = 'inline-flex';

    try {
      this.audio = new Audio(config.audio.src);
      this.audio.loop = true;
      this.audio.volume = config.audio.volume || 0.35;

      const iconPlaying = audioBtn.querySelector('.audio-icon-playing');
      const iconMuted = audioBtn.querySelector('.audio-icon-muted');

      const updateAudioUI = (isPlaying) => {
        if (iconPlaying && iconMuted) {
          iconPlaying.style.display = isPlaying ? 'block' : 'none';
          iconMuted.style.display = isPlaying ? 'none' : 'block';
        }
      };

      const toggleAudio = () => {
        if (!this.audio) return;
        if (this.audio.paused) {
          this.audio.play().then(() => {
            this.isAudioMuted = false;
            updateAudioUI(true);
          }).catch((e) => console.warn('Audio playback prevented:', e));
        } else {
          this.audio.pause();
          this.isAudioMuted = true;
          updateAudioUI(false);
        }
      };

      audioBtn.addEventListener('click', toggleAudio);

      // Gracefully unlock on first user click anywhere (browser autoplay requirement)
      const firstInteractionUnlock = () => {
        if (this.audio && this.audio.paused && !this.isAudioMuted) {
          this.audio.play().then(() => {
            updateAudioUI(true);
          }).catch(() => {});
        }
        document.removeEventListener('pointerdown', firstInteractionUnlock);
      };

      document.addEventListener('pointerdown', firstInteractionUnlock, { once: true });
    } catch (err) {
      console.warn('Could not initialize audio manager:', err);
    }
  }

  updateNavigationUI(currentChapter) {
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot) => {
      const ch = parseInt(dot.getAttribute('data-chapter'), 10);
      dot.classList.remove('active', 'completed');
      if (ch === currentChapter) {
        dot.classList.add('active');
      } else if (this.progress.isUnlocked(ch)) {
        dot.classList.add('completed');
      }
    });
  }

  transitionToChapter(targetChapterIndex, animate = true) {
    const currentSection = document.querySelector(`.chapter-stage.active`);
    const targetSection = document.getElementById(`chapter-${targetChapterIndex}`);

    if (!targetSection) return;

    // Reset window scroll on chapter transition
    window.scrollTo({ top: 0, behavior: 'instant' });

    this.currentChapterIndex = targetChapterIndex;
    this.updateNavigationUI(targetChapterIndex);
    document.body.className = `theme-ch-${targetChapterIndex}`;

    if (currentSection === targetSection && currentSection.classList.contains('active') && animate) return;

    // Instant switch without animation (e.g. on initial load)
    if (!animate) {
      document.querySelectorAll('.chapter-stage').forEach((sec) => {
        sec.classList.remove('active');
        sec.classList.add('inactive');
        sec.style.opacity = '';
        sec.style.transform = '';
        sec.style.filter = '';
      });
      targetSection.classList.remove('inactive');
      targetSection.classList.add('active');
      this.mountChapter(targetChapterIndex);
      this.isTransitioning = false;
      return;
    }

    // Set transition lock to prevent overlapping transitions
    this.isTransitioning = true;

    const tl = gsap.timeline({
      onComplete: () => {
        this.isTransitioning = false;
        ScrollTrigger.refresh();
      },
    });

    // Clean up previous chapter module if it defines unmount
    const prevIndex = currentSection ? parseInt(currentSection.getAttribute('data-index'), 10) : null;
    if (prevIndex && this.chapterModules[prevIndex]?.unmount) {
      this.chapterModules[prevIndex].unmount();
    }

    // 1. Exit previous scene (cinematic fade, blur, and subtle scale-down)
    if (currentSection) {
      if (this.reducedMotion) {
        tl.to(currentSection, {
          opacity: 0,
          duration: 0.35,
          onComplete: () => {
            currentSection.classList.remove('active');
            currentSection.classList.add('inactive');
          },
        });
      } else {
        tl.to(currentSection, {
          opacity: 0,
          scale: 0.96,
          filter: 'blur(8px)',
          y: -15,
          duration: 0.42,
          ease: 'power2.inOut',
          onComplete: () => {
            currentSection.classList.remove('active');
            currentSection.classList.add('inactive');
            currentSection.style.filter = '';
            currentSection.style.transform = '';
          },
        });
      }
    }

    // 2. Prepare and mount new scene
    tl.call(() => {
      targetSection.classList.remove('inactive');
      targetSection.classList.add('active');
      this.mountChapter(targetChapterIndex);
    });

    // 3. Enter new scene (gentle scale-in, de-blur, and fade-up)
    if (this.reducedMotion) {
      tl.fromTo(
        targetSection,
        { opacity: 0 },
        { opacity: 1, duration: 0.45, ease: 'power2.out' }
      );
    } else {
      tl.fromTo(
        targetSection,
        { opacity: 0, scale: 1.03, filter: 'blur(8px)', y: 22 },
        { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, duration: 0.68, ease: 'power3.out', clearProps: 'transform,filter' }
      );

      // Stagger entrance on card contents if present
      const cardChildren = targetSection.querySelectorAll('.glass-card > *');
      if (cardChildren.length > 0) {
        tl.fromTo(
          cardChildren,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
          '-=0.4'
        );
      }
    }
  }

  /**
   * Mount chapter-specific logic when activated
   */
  mountChapter(chapterIndex) {
    if (this.chapterModules[chapterIndex]?.mount) {
      this.chapterModules[chapterIndex].mount();
    }
  }

  registerChapterModule(index, module) {
    this.chapterModules[index] = module;
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.__sapphireApp = new SapphireBlossomApp();
});
