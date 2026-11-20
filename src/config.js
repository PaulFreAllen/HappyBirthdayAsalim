/**
 * ===================================================================
 * SAPPHIRE BLOSSOM — CENTRAL PERSONALIZATION CONFIGURATION
 * ===================================================================
 * Finalized 5-Chapter Architecture:
 * 1. Opening Countdown Animation (Particle Morph 3 -> 2 -> 1 -> You -> Are -> My -> Love -> Heart)
 * 2. Date Lock ("The day everything started" - 18.07.2022)
 * 3. Blue Rose Garden ("I couldn't bring you flowers today..." -> "I'm going to make that happen very soon.")
 * 4. Sand Portrait Finale (Reveals "Happy Birthday, Asalim!" on completion)
 * 5. Final Countdown & Message Interaction (5 -> 4 -> 3 -> 2 -> 1, message-writing interaction)
 * ===================================================================
 */

import { DEFAULT_SAND_CAPTION, DEFAULT_SAND_PHOTO } from './assets/sandPortraitData.js';

export const config = {
  // -----------------------------------------------------------------
  // GENERAL METADATA & PARTNER NICKNAME
  // -----------------------------------------------------------------
  meta: {
    title: "Sapphire Blossom",
    tagline: "A little journey, made with love.",
    partnerNickname: "Asalim",
  },

  // -----------------------------------------------------------------
  // OPTIONAL BACKGROUND AMBIENT AUDIO
  // -----------------------------------------------------------------
  audio: {
    enabled: false,
    src: "./media/background_song.mp3",
    volume: 0.35,
    title: "Romantic Ambient Melody",
  },

  // -----------------------------------------------------------------
  // CHAPTER 1: OPENING COUNTDOWN & PARTICLE MORPH
  // -----------------------------------------------------------------
  chapter1: {
    badge: "Prologue",
    title: "Particle Rain",
    numbers: ['3', '2', '1'],
    phrases: ['You', 'Are', 'My', 'Love'],
    finaleCaption: "Happy Birthday Asalim!",
    continueButtonText: "Begin our journey ✨",
  },

  // -----------------------------------------------------------------
  // CHAPTER 2: DATE LOCK
  // -----------------------------------------------------------------
  chapter2: {
    badge: "Chapter I",
    title: "The day everything started",
    quote1: "Some dates are just dates. Others become memories that stay with us.",
    quote2: "Can you remember this one?",
    targetDate: {
      year: "2022",
      month: "07",
      day: "18",
    },
    hintAfterFailedAttempts: 2,
    hintText: "💡 Hint: That unforgettable July day in 2022 when we officially became 'us'... ✨",
    passLinkText: "Can't remember the date? Let me remind you 💭",
    errorMessages: [
      "Hmm, close... but not quite! Think back 💭",
      "Nice guess, but that's not our magic day! 😉",
      "Are you sure? Try searching your heart again 🔍",
      "Almost there! Don't worry, take your time 💖",
      "Not quite, but I love that you're trying! 💫",
    ],
    skipText: "Can't remember right now? Let me help you through ✨",
    skipRevealMessage: "July 18, 2022 — the day our beautiful relationship began. Always right here in my heart. ✨",
    successMessage: "You remembered. The lock clicks open... ✨",
  },

  // -----------------------------------------------------------------
  // CHAPTER 3: BLUE ROSE GARDEN
  // -----------------------------------------------------------------
  chapter3: {
    badge: "Chapter II",
    title: "Sapphire Blossom",
    prologue1: "I couldn't bring you flowers today...",
    prologue2: "I'm going to make that happen very soon.",
    seedPrompt: "Scroll gently to nurture the blossom ↓",
    epilogue1: "I couldn't bring you flowers today...",
    epilogue2: "I'm going to make that happen very soon.",
    epilogue3: "",
    continueButtonText: "Continue to our portrait ✨",
  },

  // -----------------------------------------------------------------
  // CHAPTER 4: SAND PORTRAIT BIRTHDAY FINALE (FINAL SCENE)
  // -----------------------------------------------------------------
  chapter4: {
    badge: "Finale",
    title: "Sand Portrait",
    subtitle: "Carved in stardust and memory...",
    birthdayMessage: "Happy Birthday, Asalim!",
    caption: DEFAULT_SAND_CAPTION,
    photoSrc: DEFAULT_SAND_PHOTO,
    duration: 16,
    reducedMotionDuration: 4,
    replayButtonText: "Scatter & Re-form ✨",
    reliveButtonText: "Relive Our Journey 💫",
  },
};
