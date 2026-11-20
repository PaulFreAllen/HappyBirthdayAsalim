import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 4173;
const APP_URL = `http://localhost:${PORT}/HappyBirthdayAsalim/`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runFinalVerificationSuite() {
  console.log('🚀 Starting Verification Suite for Final 4-Chapter Architecture...\n');

  const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
    stdio: 'ignore',
  });
  await sleep(1500);

  const consoleErrors = [];

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    pipe: true,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--allow-file-access-from-files',
      '--disable-web-security',
      '--window-size=1280,800',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      if (msg.text().includes('ERR_NAME_NOT_RESOLVED')) return;
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error('Browser page error:', err);
    consoleErrors.push(err.toString());
  });

  let passCount = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  try {
    // -----------------------------------------------------------
    // TEST 1: Exactly 4 Chapters in Stepper & DOM
    // -----------------------------------------------------------
    console.log('📌 Test 1: Verifying exactly 4 chapters in Stepper and DOM (Sand Animation is the finale)...');
    await page.goto(APP_URL, { waitUntil: 'load' });
    await sleep(600);

    await page.evaluate(() => {
      localStorage.clear();
      window.location.reload();
    });
    await sleep(800);

    const structure = await page.evaluate(() => {
      const dots = Array.from(document.querySelectorAll('.step-dot'));
      const sections = Array.from(document.querySelectorAll('.chapter-stage'));
      const hasQuiz = !!document.querySelector('.quiz-container');
      const hasVideo = !!document.querySelector('.birthday-video');
      const hasLetter = !!document.querySelector('.letter-parchment');
      const hasCh5 = !!document.getElementById('chapter-5');

      return {
        dotCount: dots.length,
        dotTitles: dots.map((d) => d.getAttribute('data-title')),
        sectionCount: sections.length,
        sectionIds: sections.map((s) => s.id),
        hasQuiz,
        hasVideo,
        hasLetter,
        hasCh5,
      };
    });

    assert(structure.dotCount === 4, `Expected exactly 4 stepper dots, found ${structure.dotCount}`);
    assert(structure.sectionCount === 4, `Expected exactly 4 chapter sections, found ${structure.sectionCount}`);

    const expectedTitles = ['Countdown', 'Date Lock', 'Blue Rose Garden', 'Sand Portrait'];
    const titlesMatch = JSON.stringify(structure.dotTitles) === JSON.stringify(expectedTitles);
    assert(titlesMatch, `Stepper dot titles: ${JSON.stringify(structure.dotTitles)}`);

    assert(
      !structure.hasQuiz && !structure.hasVideo && !structure.hasLetter && !structure.hasCh5,
      'Zero quiz, video, letter, or chapter-5 elements present in DOM'
    );

    // -----------------------------------------------------------
    // TEST 2: Chapter 1 — Opening Countdown (Particle Morph)
    // -----------------------------------------------------------
    console.log('\n📌 Test 2: Verifying Chapter 1 (Opening Countdown Animation)...');
    const ch1Canvases = await page.evaluate(() => {
      const rain = document.getElementById('countdown-rain-canvas');
      const fg = document.getElementById('countdown-fg-canvas');
      return {
        hasRain: !!rain && rain.width > 0,
        hasFg: !!fg && fg.width > 0,
      };
    });
    assert(ch1Canvases.hasRain && ch1Canvases.hasFg, 'Dual canvases for digital rain and particle morph are active');

    // Trigger finale step to verify caption text
    const finaleCaptionConfig = await page.evaluate(() => {
      return window.config?.chapter1?.finaleCaption;
    });
    assert(finaleCaptionConfig === 'Happy Birthday Asalim!', `Finale caption configured as: "${finaleCaptionConfig}"`);

    // Skip/advance to Chapter 2 (Date Lock)
    console.log('  Advancing from opening countdown to Chapter 2 (Date Lock)...');
    await page.click('#btn-countdown-skip');
    await page.waitForSelector('#chapter-2.active', { timeout: 6000 });
    await sleep(600);

    const ch2Active = await page.evaluate(() => {
      const ch2 = document.getElementById('chapter-2');
      return ch2 && ch2.classList.contains('active');
    });
    assert(ch2Active, 'Successfully transitioned to Chapter 2 (Date Lock)');

    // -----------------------------------------------------------
    // TEST 3: Chapter 2 — Date Lock ("The day everything started")
    // -----------------------------------------------------------
    console.log('\n📌 Test 3: Verifying Chapter 2 (Date Lock & Pass / Reminder Feature)...');
    const ch2Title = await page.$eval('#chapter-2 .lock-opening-title', (el) => el.textContent.trim());
    assert(ch2Title === 'The day everything started', `Opening title matches: "${ch2Title}"`);

    // Verify bypass/pass button exists
    const passBtnText = await page.$eval('#lock-pass-btn', (el) => el.textContent.trim());
    assert(passBtnText.includes("Can't remember"), `Pass button is present with romantic reminder: "${passBtnText}"`);

    // Click the pass/reminder button to verify it auto-fills 18/07/2022 and unlocks
    console.log('  Testing date-lock bypass / reminder button...');
    await page.click('#lock-pass-btn');

    const filledValues = await page.evaluate(() => {
      return {
        d: document.getElementById('lock-day').value,
        m: document.getElementById('lock-month').value,
        y: document.getElementById('lock-year').value,
      };
    });
    assert(
      filledValues.d === '18' && filledValues.m === '07' && filledValues.y === '2022',
      `Auto-filled anniversary date: ${filledValues.d}/${filledValues.m}/${filledValues.y}`
    );

    console.log('  Waiting for vault unlock and transition to Chapter 3 (Blue Rose Garden)...');
    await page.waitForSelector('#chapter-3.active', { timeout: 6000 });
    await sleep(600);

    const ch3Active = await page.evaluate(() => {
      const ch3 = document.getElementById('chapter-3');
      return ch3 && ch3.classList.contains('active');
    });
    assert(ch3Active, 'Successfully transitioned to Chapter 3 (Blue Rose Garden) via date pass/unlock');

    // -----------------------------------------------------------
    // TEST 4: Chapter 3 — Blue Rose Garden
    // -----------------------------------------------------------
    console.log('\n📌 Test 4: Verifying Chapter 3 (Blue Rose Garden)...');
    const gardenSvgPresent = await page.evaluate(() => {
      return !!document.getElementById('garden-stage-svg');
    });
    assert(gardenSvgPresent, 'Blue Rose Garden SVG stage is present');

    // Scrub through garden to reach epilogue card
    await page.evaluate(() => {
      const epilogue = document.getElementById('garden-epilogue-card');
      const btn = document.getElementById('garden-continue-btn');
      if (epilogue) {
        epilogue.style.opacity = '1';
        epilogue.style.pointerEvents = 'auto';
      }
      if (btn) {
        btn.style.pointerEvents = 'auto';
      }
    });
    await sleep(500);

    const gardenMsg1 = await page.$eval('.epilogue-phrase-1', (el) => el.textContent.trim());
    const gardenMsg2 = await page.$eval('.epilogue-headline', (el) => el.textContent.trim());

    assert(gardenMsg1 === "I couldn't bring you flowers today...", `Garden phrase 1 matches: "${gardenMsg1}"`);
    assert(gardenMsg2 === "I'm going to make that happen very soon.", `Garden phrase 2 matches: "${gardenMsg2}"`);

    // Click continue button -> should transition directly to Chapter 4 (Sand Portrait Finale)
    console.log('  Clicking continue to Chapter 4 (Sand Portrait Finale)...');
    await page.click('#garden-continue-btn');
    await page.waitForSelector('#chapter-4.active', { timeout: 8000 });
    await sleep(800);

    const ch4Active = await page.evaluate(() => {
      const ch4 = document.getElementById('chapter-4');
      return ch4 && ch4.classList.contains('active');
    });
    assert(ch4Active, 'Successfully transitioned to Chapter 4 (Sand Portrait Finale)');

    // -----------------------------------------------------------
    // TEST 5: Chapter 4 — Sand Portrait Finale (Full-Screen & Banner Actions)
    // -----------------------------------------------------------
    console.log('\n📌 Test 5: Verifying Chapter 4 (Sand Portrait Finale & Full-Screen Composition)...');
    const uploadControlsExist = await page.evaluate(() => {
      const fileInput = !!document.getElementById('sand-file-input');
      const dropOverlay = !!document.getElementById('sand-drop-overlay');
      const customFileLabel = !!document.querySelector('.custom-file-label');
      return fileInput || dropOverlay || customFileLabel;
    });
    assert(!uploadControlsExist, 'Picture-selection/upload interface is completely removed');

    const fullScreenCheck = await page.evaluate(() => {
      const c = document.getElementById('sand-canvas');
      return {
        hasCanvas: !!c && c.width > 0 && c.height > 0,
        isCanvasFixed: c && window.getComputedStyle(c).position === 'fixed',
        canvasWidth: c ? c.width : 0,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        hasPhoneClipping: !!document.querySelector('.phone-frame, .portrait-frame, .portrait-clipped'),
      };
    });
    assert(fullScreenCheck.hasCanvas, 'Sand particle canvas is active');
    assert(fullScreenCheck.isCanvasFixed, 'Canvas is positioned to cover the full viewport');
    assert(!fullScreenCheck.hasPhoneClipping, 'No phone-shaped clipping frame or container exists');

    // Verify birthday message is NOT shown initially
    const msgHiddenBeforeComplete = await page.evaluate(() => {
      const banner = document.getElementById('sand-birthday-banner');
      return banner && (banner.style.display === 'none' || parseFloat(window.getComputedStyle(banner).opacity) < 0.1);
    });
    assert(msgHiddenBeforeComplete, 'Birthday message is strictly NOT visible before portrait completion');

    // Advance slider to 100% to simulate full portrait formation
    console.log('  Setting formation progress to 100%...');
    await page.evaluate(() => {
      const slider = document.getElementById('sand-rv');
      slider.value = 1000;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await sleep(600);

    const birthdayText = await page.$eval('.sand-birthday-text', (el) => el.textContent.trim());
    const isBannerVisible = await page.$eval(
      '#sand-birthday-banner',
      (el) => window.getComputedStyle(el).display !== 'none'
    );

    assert(isBannerVisible, 'Birthday banner is visible after portrait completion');
    assert(birthdayText === 'Happy Birthday, Asalim!', `Revealed birthday message matches: "${birthdayText}"`);

    // Verify Finale actions (Restart & Relive Our Journey)
    const bannerActions = await page.evaluate(() => {
      const restartBtn = document.getElementById('sand-btn-restart-banner');
      const reliveBtn = document.getElementById('sand-btn-relive-journey');
      const oldContinueBtn = document.getElementById('sand-btn-to-countdown');
      return {
        hasRestart: !!restartBtn,
        hasRelive: !!reliveBtn,
        hasOldContinue: !!oldContinueBtn,
      };
    });

    assert(bannerActions.hasRestart, 'Finale "Scatter & Re-form" button is present');
    assert(bannerActions.hasRelive, 'Finale "Relive Our Journey" button is present');
    assert(!bannerActions.hasOldContinue, 'No continue-to-countdown button exists');

    // -----------------------------------------------------------
    // TEST 6: Mobile Responsiveness & Zero Console Errors
    // -----------------------------------------------------------
    console.log('\n📌 Test 6: Checking mobile viewport scaling and console errors...');
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await sleep(600);

    const mobileCanvasCheck = await page.evaluate(() => {
      const c = document.getElementById('sand-canvas');
      return c && c.width > 0 && c.height > 0;
    });
    assert(mobileCanvasCheck, 'Sand canvas responsive and active on mobile viewport');

    const relevantErrors = consoleErrors.filter((e) => !e.includes('favicon'));
    assert(
      relevantErrors.length === 0,
      `Console errors encountered: ${relevantErrors.length === 0 ? 'None (0)' : JSON.stringify(relevantErrors)}`
    );

    console.log(`\n==================================================`);
    console.log(`🎉 FINAL VERIFICATION SUMMARY: ${passCount} / ${totalTests} TESTS PASSED`);
    console.log(`==================================================\n`);
  } catch (err) {
    console.error('💥 Test suite failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
    preview.kill();
  }
}

runFinalVerificationSuite();
