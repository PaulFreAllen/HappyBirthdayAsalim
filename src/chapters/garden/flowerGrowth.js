/**
 * ===================================================================
 * FLOWER GROWTH — MASTER SCRUBBED GSAP ANIMATION TIMELINE
 * ===================================================================
 * Coordinates botanical rose growth and blooming across 4 scroll stages:
 * - Stage A: Awakening (0–20%)  — Seed glowing, particles gathering, root awakening
 * - Stage B: Growing (20–45%)    — Stems growing upward, leaves unfolding, buds forming
 * - Stage C: Blooming (45–75%)   — Sepals opening, outer petals reflexing, core unfurling
 * - Stage D: Full Garden (75–100%) — Panoramic garden, ambient sapphire aura, epilogue text
 * ===================================================================
 */

import { gsap } from 'gsap';

export function createGrowthTimeline(containerElement, roseConfigs) {
  // Master scrub timeline (normalized 0 to 100 duration)
  const tl = gsap.timeline({ paused: true });

  // Timeline Stage Labels
  tl.addLabel('stageA', 0);
  tl.addLabel('stageB', 20);
  tl.addLabel('stageC', 45);
  tl.addLabel('stageD', 75);

  // Setup initial element states
  roseConfigs.forEach((rose) => {
    const el = containerElement.querySelector(`#${rose.id}`);
    if (!el) return;

    // Stem path length setup for stroke-dashoffset growth
    const stem = el.querySelector('.rose-stem');
    if (stem) {
      const len = stem.getTotalLength ? stem.getTotalLength() : 450;
      gsap.set(stem, {
        strokeDasharray: len,
        strokeDashoffset: len,
      });
      stem._totalLength = len;
    }

    // Leaves initially collapsed
    const leaves = el.querySelectorAll('.rose-leaf');
    gsap.set(leaves, { scale: 0, opacity: 0, transformOrigin: '0 0' });

    // Rose head (flower) initially collapsed at bud apex
    const head = el.querySelector('.rose-head');
    if (head) {
      gsap.set(head, { scale: 0, opacity: 0, transformOrigin: '0 0' });
    }

    // Sepals initially hugging tight
    const sepals = el.querySelectorAll('.rose-sepal');
    gsap.set(sepals, { scaleY: 1.15, scaleX: 0.85, transformOrigin: '0 8px' });

    // Petals collapsed inside bud (anchored at center base 0 0)
    const outerPetals = el.querySelectorAll('.petal-outer');
    const midPetals = el.querySelectorAll('.petal-mid');
    const innerPetals = el.querySelectorAll('.petal-inner');
    const bloomGlow = el.querySelector('.rose-bloom-glow');

    gsap.set(outerPetals, { scale: 0.05, opacity: 0, transformOrigin: '0 0' });
    gsap.set(midPetals, { scale: 0.08, opacity: 0, transformOrigin: '0 0' });
    gsap.set(innerPetals, { scale: 0.12, opacity: 0, transformOrigin: '0 0' });
    if (bloomGlow) {
      gsap.set(bloomGlow, { opacity: 0, scale: 0.3, transformOrigin: '0 0' });
    }
  });

  // Seed initial appearance
  const seed = containerElement.querySelector('#garden-seed-orb');
  const seedRing = containerElement.querySelector('#garden-seed-ring');

  // ===================================================================
  // STAGE A: AWAKENING (0% to 20%)
  // Seed glow expands, particles gather, first roots awaken
  // ===================================================================
  if (seed && seedRing) {
    tl.fromTo(seed, 
      { scale: 0.3, opacity: 0 }, 
      { scale: 1.2, opacity: 1, duration: 12, ease: 'power2.out' }, 
      0
    );
    tl.fromTo(seedRing, 
      { scale: 0.2, opacity: 0 }, 
      { scale: 1.8, opacity: 0.75, duration: 16, ease: 'sine.out' }, 
      2
    );
    // Seed fades into ground as stem takes over
    tl.to([seed, seedRing], { opacity: 0, scale: 0.6, duration: 8, ease: 'power1.in' }, 18);
  }

  // ===================================================================
  // STAGE B: GROWING (20% to 45%)
  // Stems rise upward, leaves unfold, tight rosebuds appear
  // ===================================================================
  roseConfigs.forEach((rose) => {
    const el = containerElement.querySelector(`#${rose.id}`);
    if (!el) return;

    const stem = el.querySelector('.rose-stem');
    const leaves = el.querySelectorAll('.rose-leaf');
    const head = el.querySelector('.rose-head');
    const len = stem?._totalLength || 450;
    const startOffset = 18 + rose.bloomDelay * 12;

    // Stem growth animation (stroke-dashoffset from 100% to 0)
    if (stem) {
      tl.to(stem, {
        strokeDashoffset: 0,
        duration: 22,
        ease: 'power2.inOut',
      }, startOffset);
    }

    // Leaf unfolding (scales open as stem passes their height)
    if (leaves.length > 0) {
      tl.to(leaves, {
        scale: 1,
        opacity: 1,
        duration: 14,
        stagger: 4,
        ease: 'back.out(1.8)',
      }, startOffset + 8);
    }

    // Rosebud forms at apex
    if (head) {
      tl.fromTo(head, 
        { scale: 0, opacity: 0 }, 
        { scale: 0.45, opacity: 1, duration: 12, ease: 'power3.out' }, 
        startOffset + 14
      );
    }
  });

  // ===================================================================
  // STAGE C: BLOOMING (45% to 75%)
  // Rosebuds expand, sepals pull back, petals reflex & unfurl
  // ===================================================================
  roseConfigs.forEach((rose) => {
    const el = containerElement.querySelector(`#${rose.id}`);
    if (!el) return;

    const head = el.querySelector('.rose-head');
    const sepals = el.querySelectorAll('.rose-sepal');
    const outerPetals = el.querySelectorAll('.petal-outer');
    const midPetals = el.querySelectorAll('.petal-mid');
    const innerPetals = el.querySelectorAll('.petal-inner');
    const bloomGlow = el.querySelector('.rose-bloom-glow');

    const bloomStart = 45 + rose.bloomDelay * 15;

    // Flower head expands to full natural scale
    if (head) {
      tl.to(head, {
        scale: 1,
        duration: 25,
        ease: 'power2.out',
      }, bloomStart);
    }

    // Sepals reflex backward
    if (sepals.length > 0) {
      tl.to(sepals, {
        scaleY: 0.7,
        scaleX: 1.2,
        rotation: (i) => (i - 2) * 22,
        duration: 16,
        ease: 'power2.inOut',
      }, bloomStart + 2);
    }

    // 1. Outer guard petals reflex and unfold first
    if (outerPetals.length > 0) {
      tl.to(outerPetals, {
        scale: 1,
        opacity: 1,
        duration: 18,
        stagger: 2,
        ease: 'back.out(1.4)',
      }, bloomStart + 4);
    }

    // 2. Mid-whorl petals expand and lift upward next
    if (midPetals.length > 0) {
      tl.to(midPetals, {
        scale: 1,
        opacity: 1,
        duration: 16,
        stagger: 2,
        ease: 'back.out(1.2)',
      }, bloomStart + 9);
    }

    // 3. Inner heart petals spiral open last
    if (innerPetals.length > 0) {
      tl.to(innerPetals, {
        scale: 1,
        opacity: 1,
        rotation: (i) => (i % 2 === 0 ? 8 : -8),
        duration: 14,
        stagger: 2,
        ease: 'power2.out',
      }, bloomStart + 14);
    }

    // Soft cyan bloom glow radiates around flower head
    if (bloomGlow) {
      tl.to(bloomGlow, {
        opacity: 0.7,
        scale: 1.15,
        duration: 22,
        ease: 'sine.out',
      }, bloomStart + 10);
    }
  });

  // ===================================================================
  // STAGE D: FULL GARDEN & EPILOGUE (75% to 100%)
  // Full panoramic bloom, atmospheric luminescence, epilogue card reveal
  // ===================================================================
  const epilogueCard = containerElement.querySelector('#garden-epilogue-card');
  const gardenOverlay = containerElement.querySelector('.garden-atmospheric-aura');

  if (gardenOverlay) {
    tl.to(gardenOverlay, {
      opacity: 0.85,
      duration: 20,
      ease: 'sine.inOut',
    }, 75);
  }

  if (epilogueCard) {
    tl.fromTo(epilogueCard,
      { opacity: 0, y: 35, filter: 'blur(8px)', pointerEvents: 'none' },
      { opacity: 1, y: 0, filter: 'blur(0px)', pointerEvents: 'auto', duration: 18, ease: 'power3.out' },
      82
    );
  }

  return tl;
}
