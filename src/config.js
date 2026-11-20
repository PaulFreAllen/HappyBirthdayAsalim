/**
 * ===================================================================
 * SAPPHIRE BLOSSOM — CENTRAL PERSONALIZATION CONFIGURATION
 * ===================================================================
 * All personalized dates, memories, letters,
 * photographs, music, and video paths are configured in this file.
 *
 * You can edit any value below safely to match your real story.
 * ===================================================================
 */

import { DEFAULT_SAND_CAPTION, DEFAULT_SAND_PHOTO } from './assets/sandPortraitData.js';

export const config = {
  // -----------------------------------------------------------------
  // 1. GENERAL METADATA & PARTNER NICKNAME
  // -----------------------------------------------------------------
  meta: {
    title: "Sapphire Blossom",
    tagline: "A little journey, made with love.",
    partnerNickname: "beautiful", // Used in salutations
  },

  // -----------------------------------------------------------------
  // 2. OPTIONAL BACKGROUND AMBIENT AUDIO
  // -----------------------------------------------------------------
  // To enable, place an .mp3 in public/media/ and set enabled: true
  audio: {
    enabled: false, // Set to true to enable soft background music
    src: "/media/background_song.mp3", // Path relative to public/
    volume: 0.35, // 0.0 to 1.0 (recommended soft background: 0.3 to 0.4)
    title: "Romantic Ambient Melody",
  },

  // -----------------------------------------------------------------
  // 3. CHAPTER 1: THE INVITATION
  // -----------------------------------------------------------------
  chapter1: {
    salutation: "Hey, beautiful...",
    introText: "I wanted to make something special for you. But before you see it, I have a few little things for you to discover.",
    buttonText: "Let's begin ✨",
  },

  // -----------------------------------------------------------------
  // 4. CHAPTER 2: THE DATE LOCK
  // -----------------------------------------------------------------
  chapter2: {
    title: "The Date Lock",
    quote1: "Some dates are just dates. Others become memories that stay with us.",
    quote2: "Can you remember this one?",

    // Enter your special date:
    targetDate: {
      year: "2022",  // 4-digit year (YYYY)
      month: "07",   // 2-digit month (01-12)
      day: "18",     // 2-digit day (01-31)
    },

    // Hint displayed after 3 failed attempts
    hintAfterFailedAttempts: 3,
    hintText: "💡 Hint: That unforgettable July day in 2022 when we officially became 'us'... ✨",

    // Playful feedback on incorrect guesses
    errorMessages: [
      "Hmm, close... but not quite! Think back 💭",
      "Nice guess, but that's not our magic day! 😉",
      "Are you sure? Try searching your heart again 🔍",
      "Almost there! Don't worry, take your time 💖",
      "Not quite, but I love that you're trying! 💫",
    ],

    // Skip button for a gentle, pressure-free experience
    skipText: "Can't remember right now? Let me help you through ✨",
    skipRevealMessage: "July 18, 2022 — the day our beautiful relationship began. Always right here in my heart. ✨",
    successMessage: "You remembered. The lock clicks open... ✨",
  },

  // -----------------------------------------------------------------
  // 5. CHAPTER 3: THE ESCAPING BUTTON
  // -----------------------------------------------------------------
  chapter3: {
    title: "A Little Question",
    question: "Are you curious what is next, my angel?",
    standardButtonText: "Yes! ✨", // The cooperative button
    evasiveButtonText: "No 🙈",    // The playfully dodging button
    maxAttempts: 6,               // Number of dodges before converting to Yes
    evasiveReactions: [
      "Sure? 😏",
      "??? 🤔",
      "Try again? 😜",
      "Think again! 😉",
      "Really no? 🥺",
      "Last chance! 🏃💨",
    ],
    evasiveConvertedText: "Yes! 🥰", // The second Yes button
    giveUpMessage: "Now you have two Yes buttons! You couldn't say no anyway. Happy now? 😂💖",
    continueButtonText: "Let's see what's next! 💖",
  },

  // -----------------------------------------------------------------
  // 6. CHAPTER 4: SAPPHIRE BLOSSOM (THE LIVING GARDEN)
  // -----------------------------------------------------------------
  chapter4: {
    prologue1: "There was something I wanted to give you...",
    prologue2: "I couldn't bring you flowers today.",
    seedPrompt: "Scroll gently to nurture the blossom ↓",
    epilogue1: "Next year...",
    epilogue2: "I hope these flowers will be in your hands.",
    epilogue3: "Until then, this garden is yours. ❤️",
    continueButtonText: "Open the letter ✉️",
  },

  // -----------------------------------------------------------------
  // 7. CHAPTER 5: THE LETTER
  // -----------------------------------------------------------------
  chapter5: {
    title: "A Letter For You",
    envelopeLabel: "For my favorite person",
    letter: {
      salutation: "My Dearest,",
      paragraphs: [
        "Happy Birthday. As another year begins, I find myself thinking about all the ways you've brought gentle warmth, bright laughter, and steady peace into my life.",
        "You have this quiet way of making ordinary days feel softer and bright days feel even more golden. Thank you for every shared laugh, every late-night conversation, and every little moment that only we understand.",
        "I hope this coming year brings you all the happiness, gentle surprises, and beautiful dreams you so deeply deserve. I'm endlessly grateful to celebrate you today.",
      ],
      closing: "With all my love and devotion,",
      signature: "Forever yours ✨",
    },
    continueButtonText: "A Special Message For You ✨",
  },

  // -----------------------------------------------------------------
  // 8. CHAPTER 6: THE VIDEO & FINALE
  // -----------------------------------------------------------------
  chapter6: {
    introText: "A Birthday Message",
    videoSrc: "", // Optional: e.g. "/media/birthday_video.mp4"
    videoPoster: "", // Optional: e.g. "/media/video_poster.jpg"
    videoFallbackNotice: "Place your personal video in public/media/birthday_video.mp4 to play your message here.",
    finaleHeadline: "Happy Birthday, My Angel",
    wishes: [
      "May your day be filled with endless warmth, wonder, and joy.",
      "Here is to another year of unforgettable adventures and beautiful memories together.",
      "Thank you for being the most incredible part of my world.",
    ],
    closingMessage: "Forever celebrating you. 💙✨",
    replayButtonText: "Relive Our Journey ✨",
    readLetterButtonText: "Read the Letter Again ✉️",
    continueToSandText: "One Last Surprise ✨",
  },

  // -----------------------------------------------------------------
  // 9. CHAPTER 7: THE SAND PORTRAIT & FINAL SURPRISE
  // -----------------------------------------------------------------
  chapter7: {
    badge: "Chapter VII",
    title: "One Last Surprise",
    subtitle: "Carved in stardust and memory...",
    quote: "Like sand through time, every grain holds a piece of our story.",
    caption: DEFAULT_SAND_CAPTION,
    photoSrc: DEFAULT_SAND_PHOTO,
    duration: 16,
    reducedMotionDuration: 4,
    replayButtonText: "Scatter & Re-form ✨",
    restartJourneyText: "Relive Our Whole Journey 💫",
  },
};
