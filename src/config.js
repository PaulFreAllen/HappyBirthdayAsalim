/**
 * ===================================================================
 * SAPPHIRE BLOSSOM — CENTRAL PERSONALIZATION CONFIGURATION
 * ===================================================================
 * Finalized Content and 5-Chapter Organization:
 * 1. Date Lock ("The day everything started" - 18.07.2022)
 * 2. Blue Rose Garden ("I couldn't bring you flowers today..." -> "I'm going to make that happen very soon.")
 * 3. Personal Letter (Exact letter for Asalim)
 * 4. Sand Portrait Finale (Reveals "Happy Birthday, Asalim!" on completion)
 * 5. Countdown and Message Interaction (5 -> 4 -> 3 -> 2 -> 1, message-writing interaction)
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
    src: "/media/background_song.mp3",
    volume: 0.35,
    title: "Romantic Ambient Melody",
  },

  // -----------------------------------------------------------------
  // CHAPTER 1: DATE LOCK
  // -----------------------------------------------------------------
  chapter1: {
    badge: "Chapter I",
    title: "The day everything started",
    quote1: "Some dates are just dates. Others become memories that stay with us.",
    quote2: "Can you remember this one?",
    targetDate: {
      year: "2022",
      month: "07",
      day: "18",
    },
    hintAfterFailedAttempts: 3,
    hintText: "💡 Hint: That unforgettable July day in 2022 when we officially became 'us'... ✨",
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
  // CHAPTER 2: BLUE ROSE GARDEN
  // -----------------------------------------------------------------
  chapter2: {
    badge: "Chapter II",
    title: "Sapphire Blossom",
    prologue1: "I couldn't bring you flowers today...",
    prologue2: "I'm going to make that happen very soon.",
    seedPrompt: "Scroll gently to nurture the blossom ↓",
    epilogue1: "I couldn't bring you flowers today...",
    epilogue2: "I'm going to make that happen very soon.",
    epilogue3: "",
    continueButtonText: "Open the letter ✉️",
  },

  // -----------------------------------------------------------------
  // CHAPTER 3: PERSONAL LETTER
  // -----------------------------------------------------------------
  chapter3: {
    badge: "Chapter III",
    title: "A Letter For You",
    envelopeLabel: "For my favorite person",
    letter: {
      salutation: "Asalim,",
      paragraphs: [
        "Another chapter of your life begins today, and we're one step closer to meeting each other.",
        "You are the most beautiful girl in the world. Everything about you — your voice, your heart, your eyes, every little thing about you, and your soul — is what I love.",
        "You deserve everything beautiful this life has to offer.",
        "I love you so much. Happy birthday, my love.",
      ],
      closing: "",
      signature: "",
    },
    continueButtonText: "One Last Surprise ✨",
  },

  // -----------------------------------------------------------------
  // CHAPTER 4: SAND PORTRAIT FINALE
  // -----------------------------------------------------------------
  chapter4: {
    badge: "Chapter IV",
    title: "Sand Portrait",
    subtitle: "Carved in stardust and memory...",
    birthdayMessage: "Happy Birthday, Asalim!",
    continueButtonText: "Continue ✨",
    caption: DEFAULT_SAND_CAPTION,
    photoSrc: DEFAULT_SAND_PHOTO,
    duration: 16,
    reducedMotionDuration: 4,
    replayButtonText: "Scatter & Re-form ✨",
  },

  // -----------------------------------------------------------------
  // CHAPTER 5: COUNTDOWN AND MESSAGE INTERACTION
  // -----------------------------------------------------------------
  chapter5: {
    badge: "Chapter V",
    countdownStart: 5,
    placeholder: "Write your message here...",
    submitButtonText: "Save Message ✨",
    successNotice: "Your message has been saved with love ✨",
    restartJourneyText: "Relive Our Journey 💫",
  },
};
