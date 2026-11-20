/**
 * ===================================================================
 * SAPPHIRE BLOSSOM — CENTRAL PERSONALIZATION CONFIGURATION
 * ===================================================================
 * All personalized dates, memories, quiz questions, letters,
 * photographs, music, and video paths are configured in this file.
 *
 * You can edit any value below safely to match your real story.
 * ===================================================================
 */

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
  // 6. CHAPTER 4: OUR MEMORIES QUIZ (WITH OPTIONAL PHOTOGRAPHS)
  // -----------------------------------------------------------------
  chapter4: {
    title: "Our Memories",
    subtitle: "A few little moments that made us 'us'.",

    // 4 Configurable relationship questions:
    // To include a photograph with any memory, add photoSrc: "/images/your_photo.jpg"
    questions: [
      {
        id: 1,
        category: "Our First Memory",
        question: "Where did we first share a moment where time seemed to stop?",
        photoSrc: "", // Optional: e.g. "/images/memory-1.jpg"
        photoAlt: "Our first special memory together",
        photoCaption: "That quiet corner felt like our own universe",
        options: [
          "Under the twinkling city lights",
          "At that cozy corner café table",
          "During that spontaneous late-night drive",
          "While getting caught in the sudden rain",
        ],
        correctIndex: 1, // 0-based index of correct option
        reflection: "That quiet corner felt like our own little universe. ☕✨",
      },
      {
        id: 2,
        category: "Milestone Moment",
        question: "What is something we did that neither of us will ever forget?",
        photoSrc: "", // Optional: e.g. "/images/memory-2.jpg"
        photoAlt: "Our unforgettable adventure together",
        photoCaption: "Watching the sky turn to gold with you",
        options: [
          "Cooking together and making a total mess",
          "Staying awake talking until the sunrise",
          "Our first long road trip with terrible music",
          "Getting lost in a museum for hours",
        ],
        correctIndex: 1,
        reflection: "The sky turned gold, and I knew I never wanted that night to end. 🌅",
      },
      {
        id: 3,
        category: "Our Inside Joke",
        question: "Whenever this happens, we both instantly burst out laughing:",
        photoSrc: "", // Optional: e.g. "/images/memory-3.jpg"
        photoAlt: "A moment of uncontrollable laughter",
        photoCaption: "Nobody else gets it, but to us it's the funniest thing",
        options: [
          "Our ridiculous signature mispronounced word",
          "That dramatic impression we both pull off",
          "Ordering food and regretting how much we got",
          "Making eye contact across a crowded room",
        ],
        correctIndex: 0,
        reflection: "Nobody else gets it, but to us it's the funniest thing on earth. 😂",
      },
      {
        id: 4,
        category: "Little Details",
        question: "What is my absolute favorite little thing about you?",
        photoSrc: "", // Optional: e.g. "/images/memory-4.jpg"
        photoAlt: "The little things I adore about you",
        photoCaption: "Every single piece of you",
        options: [
          "The way your eyes crinkle when you really laugh",
          "How deeply you care about the little things",
          "Your warmth whenever you hold my hand",
          "All of the above, endlessly and completely",
        ],
        correctIndex: 3,
        reflection: "Every single piece of you is my favorite part of every day. 💙",
      },
    ],
    completionText: "Funny how so many little moments can become something so important.",
    completionSubtext: "Every memory with you is a treasure. Let's step into the garden...",
    continueButtonText: "Enter the Sapphire Garden 🌿",
  },

  // -----------------------------------------------------------------
  // 7. CHAPTER 5: SAPPHIRE BLOSSOM (THE LIVING GARDEN)
  // -----------------------------------------------------------------
  chapter5: {
    prologue1: "There was something I wanted to give you...",
    prologue2: "I couldn't bring you flowers today.",
    seedPrompt: "Scroll gently to nurture the blossom ↓",
    epilogue1: "Next year...",
    epilogue2: "I hope these flowers will be in your hands.",
    epilogue3: "Until then, this garden is yours. ❤️",
    continueButtonText: "Open the letter ✉️",
  },

  // -----------------------------------------------------------------
  // 8. CHAPTER 6: THE LETTER
  // -----------------------------------------------------------------
  chapter6: {
    title: "A Letter For You",
    envelopeLabel: "For my favorite person",
    letter: {
      salutation: "My Dearest,",
      paragraphs: [
        "Happy Birthday. As another year begins, I find myself thinking about all the ways you've brought gentle warmth, bright laughter, and steady peace into my life.",
        "Distance, time, or busy days can never diminish how much you mean to me. Every shared glance, every late-night conversation, and every little dream we talk about has woven itself into who I am.",
        "You deserve a world filled with joy, tenderness, and endless sapphire skies. I hope this little world reminds you, even for a moment, just how deeply cherished you are.",
      ],
      closing: "With all my heart and always by your side,",
      signature: "Yours, always ❤️",
    },
    continueButtonText: "One last surprise... 🎥",
  },

  // -----------------------------------------------------------------
  // 9. CHAPTER 7: THE VIDEO & GRAND FINALE
  // -----------------------------------------------------------------
  chapter7: {
    introText: "I still have something to tell you...",
    // Path to your personal birthday video file (place in public/media/):
    videoSrc: "", // e.g. "/media/birthday_video.mp4"
    videoPoster: "", // Optional poster/thumbnail: e.g. "/media/video_poster.jpg"
    videoFallbackNotice: "Drop your birthday video file into /public/media/ or configure the video path in config.js.",
    finaleHeadline: "Happy Birthday, my love.",
    finaleSubtext: "May your year bloom as brightly as the sapphire garden.",
    restartButtonText: "Revisit our journey ↺",
  },
};
