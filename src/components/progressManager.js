/**
 * ===================================================================
 * PROGRESS MANAGER — STATE & CHAPTER NAVIGATION PERSISTENCE
 * ===================================================================
 * Safely persists visitor journey progress in localStorage.
 * Coordinates chapter switching, unlocking, and discrete step tracking.
 * ===================================================================
 */

const STORAGE_KEY = 'sapphire_blossom_progress';

export class ProgressManager {
  constructor(totalChapters = 7, onChapterChange = null) {
    this.totalChapters = totalChapters;
    this.onChapterChange = onChapterChange;
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          currentChapter: parsed.currentChapter || 1,
          unlockedChapters: parsed.unlockedChapters || [1],
          dateUnlocked: parsed.dateUnlocked || false,
          missYouCount: parsed.missYouCount || 0,
          quizPassed: parsed.quizPassed || false,
        };
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using fresh progress state.', e);
    }

    return {
      currentChapter: 1,
      unlockedChapters: [1],
      dateUnlocked: false,
      missYouCount: 0,
      quizPassed: false,
    };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not write to localStorage.', e);
    }
  }

  getCurrentChapter() {
    return this.state.currentChapter;
  }

  isUnlocked(chapterNumber) {
    return this.state.unlockedChapters.includes(chapterNumber);
  }

  unlockChapter(chapterNumber) {
    if (!this.state.unlockedChapters.includes(chapterNumber)) {
      this.state.unlockedChapters.push(chapterNumber);
      this.state.unlockedChapters.sort((a, b) => a - b);
    }
    this.saveState();
  }

  goToChapter(chapterNumber, force = false) {
    if (chapterNumber < 1 || chapterNumber > this.totalChapters) return;

    if (!force && !this.isUnlocked(chapterNumber)) {
      console.warn(`Chapter ${chapterNumber} is not unlocked yet.`);
      return;
    }

    this.unlockChapter(chapterNumber);
    this.state.currentChapter = chapterNumber;
    this.saveState();

    if (typeof this.onChapterChange === 'function') {
      this.onChapterChange(chapterNumber);
    }
  }

  nextChapter() {
    const next = this.state.currentChapter + 1;
    if (next <= this.totalChapters) {
      this.goToChapter(next, true);
    }
  }

  resetProgress() {
    this.state = {
      currentChapter: 1,
      unlockedChapters: [1],
      dateUnlocked: false,
      missYouCount: 0,
      quizPassed: false,
    };
    this.saveState();
    if (typeof this.onChapterChange === 'function') {
      this.onChapterChange(1);
    }
  }
}
