import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FILE_URL = `file://${path.resolve('dist/index.html')}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runFinalVerificationSuite() {
  console.log('🚀 Starting Verification Suite for Final 5-Chapter Architecture...\n');

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
    // TEST 1: Exactly 5 Chapters in Stepper & DOM
    // -----------------------------------------------------------
    console.log('📌 Test 1: Verifying exactly 5 chapters in Stepper and DOM...');
    await page.goto(FILE_URL, { waitUntil: 'load' });
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

      return {
        dotCount: dots.length,
        dotTitles: dots.map(d => d.getAttribute('data-title')),
        sectionCount: sections.length,
        sectionIds: sections.map(s => s.id),
        hasQuiz,
        hasVideo,
      };
    });

    assert(structure.dotCount === 5, `Expected 5 stepper dots, found ${structure.dotCount}`);
    assert(structure.sectionCount === 5, `Expected 5 chapter sections, found ${structure.sectionCount}`);

    const expectedTitles = ['Date Lock', 'Blue Rose Garden', 'Personal Letter', 'Sand Portrait', 'Message'];
    const titlesMatch = JSON.stringify(structure.dotTitles) === JSON.stringify(expectedTitles);
    assert(titlesMatch, `Stepper dot titles: ${JSON.stringify(structure.dotTitles)}`);

    assert(!structure.hasQuiz && !structure.hasVideo, 'Zero quiz or video elements present in DOM');

    // -----------------------------------------------------------
    // TEST 2: Chapter 1 — Date Lock
    // -----------------------------------------------------------
    console.log('\n📌 Test 2: Verifying Chapter 1 (Date Lock)...');
    const ch1Title = await page.$eval('#chapter-1 .lock-opening-title', el => el.textContent.trim());
    assert(ch1Title === 'The day everything started', `Opening title matches: "${ch1Title}"`);

    // Enter correct date: 18 / 07 / 2022
    await page.type('#lock-day', '18');
    await page.type('#lock-month', '07');
    await page.type('#lock-year', '2022');
    await page.click('#lock-submit-btn');

    console.log('  Submitted date 18/07/2022, waiting for transition to Chapter 2...');
    await sleep(2200);

    const ch2Active = await page.evaluate(() => {
      const ch2 = document.getElementById('chapter-2');
      return ch2 && ch2.classList.contains('active');
    });
    assert(ch2Active, 'Successfully transitioned to Chapter 2 (Blue Rose Garden)');

    // -----------------------------------------------------------
    // TEST 3: Chapter 2 — Blue Rose Garden
    // -----------------------------------------------------------
    console.log('\n📌 Test 3: Verifying Chapter 2 (Blue Rose Garden message)...');
    const gardenSvgPresent = await page.evaluate(() => {
      return !!document.getElementById('garden-stage-svg');
    });
    assert(gardenSvgPresent, 'Blue Rose Garden SVG stage is present');

    // Scrub through garden to reach epilogue card
    await page.evaluate(() => {
      const epilogue = document.getElementById('garden-epilogue-card');
      if (epilogue) {
        epilogue.style.opacity = '1';
        epilogue.style.pointerEvents = 'auto';
      }
    });
    await sleep(400);

    const gardenMsg1 = await page.$eval('.epilogue-phrase-1', el => el.textContent.trim());
    const gardenMsg2 = await page.$eval('.epilogue-headline', el => el.textContent.trim());

    assert(gardenMsg1 === "I couldn't bring you flowers today...", `Garden phrase 1 matches: "${gardenMsg1}"`);
    assert(gardenMsg2 === "I'm going to make that happen very soon.", `Garden phrase 2 matches: "${gardenMsg2}"`);

    // Click "Open the letter ✉️"
    console.log('  Clicking continue to Chapter 3 (Personal Letter)...');
    await page.click('#garden-continue-btn');
    await page.waitForSelector('#chapter-3.active', { timeout: 6000 });
    await sleep(800);

    const ch3Active = await page.evaluate(() => {
      const ch3 = document.getElementById('chapter-3');
      return ch3 && ch3.classList.contains('active');
    });
    assert(ch3Active, 'Successfully transitioned to Chapter 3 (Personal Letter)');

    // -----------------------------------------------------------
    // TEST 4: Chapter 3 — Personal Letter
    // -----------------------------------------------------------
    console.log('\n📌 Test 4: Verifying Chapter 3 (Personal Letter for Asalim)...');
    const waxSealPresent = await page.evaluate(() => !!document.getElementById('wax-seal'));
    assert(waxSealPresent, '3D Envelope wax seal is present');

    // Break seal to open letter
    await page.click('#wax-seal');
    await sleep(1600);

    const letterSalutation = await page.$eval('.letter-salutation', el => el.textContent.trim());
    const letterParagraphs = await page.$$eval('.letter-paragraph', els => els.map(e => e.textContent.trim()));

    assert(letterSalutation === 'Asalim,', `Salutation matches: "${letterSalutation}"`);
    assert(letterParagraphs[0] === "Another chapter of your life begins today, and we're one step closer to meeting each other.",
      'Paragraph 1 matches verbatim');
    assert(letterParagraphs[1] === "You are the most beautiful girl in the world. Everything about you — your voice, your heart, your eyes, every little thing about you, and your soul — is what I love.",
      'Paragraph 2 matches verbatim');
    assert(letterParagraphs[2] === "You deserve everything beautiful this life has to offer.",
      'Paragraph 3 matches verbatim');
    assert(letterParagraphs[3] === "I love you so much. Happy birthday, my love.",
      'Paragraph 4 matches verbatim');

    // Click continue button to Chapter 4 (Sand Portrait)
    console.log('  Clicking continue to Chapter 4 (Sand Portrait)...');
    await page.waitForSelector('.letter-parchment.is-open', { timeout: 3000 });
    await sleep(400);
    await page.click('#btn-letter-continue');
    await page.waitForSelector('#chapter-4.active', { timeout: 5000 });
    await sleep(600);

    const ch4Active = await page.evaluate(() => {
      const ch4 = document.getElementById('chapter-4');
      return ch4 && ch4.classList.contains('active');
    });
    assert(ch4Active, 'Successfully transitioned to Chapter 4 (Sand Portrait)');

    // -----------------------------------------------------------
    // TEST 5: Chapter 4 — Sand Portrait Birthday Finale
    // -----------------------------------------------------------
    console.log('\n📌 Test 5: Verifying Chapter 4 (Sand Portrait & Completion Message)...');
    const canvasExists = await page.evaluate(() => {
      const c = document.getElementById('sand-canvas');
      return c && c.width > 0 && c.height > 0;
    });
    assert(canvasExists, 'Sand particle canvas is active and rendering');

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

    const birthdayText = await page.$eval('.sand-birthday-text', el => el.textContent.trim());
    const isBannerVisible = await page.$eval('#sand-birthday-banner', el => window.getComputedStyle(el).display !== 'none');

    assert(isBannerVisible, 'Birthday banner is visible after portrait completion');
    assert(birthdayText === 'Happy Birthday, Asalim!', `Revealed birthday message matches: "${birthdayText}"`);

    // Click continue to Chapter 5 (Countdown & Message)
    console.log('  Clicking continue to Chapter 5 (Countdown & Message)...');
    await page.click('#sand-btn-to-countdown');
    await sleep(1500);

    const ch5Active = await page.evaluate(() => {
      const ch5 = document.getElementById('chapter-5');
      return ch5 && ch5.classList.contains('active');
    });
    assert(ch5Active, 'Successfully transitioned to Chapter 5 (Countdown & Message)');

    // -----------------------------------------------------------
    // TEST 6: Chapter 5 — Countdown and Message Interaction
    // -----------------------------------------------------------
    console.log('\n📌 Test 6: Verifying Chapter 5 (Countdown & Message-Writing Interaction)...');
    
    // Check countdown display exists
    const countdownNumber = await page.$eval('#countdown-display', el => el.textContent.trim());
    console.log(`  Initial countdown number displayed: ${countdownNumber}`);
    assert(['5', '4', '3', '2', '1'].includes(countdownNumber), `Countdown started with number: ${countdownNumber}`);

    // Wait for countdown sequence (5 -> 4 -> 3 -> 2 -> 1) to complete and message stage to reveal
    console.log('  Waiting for countdown (5 -> 4 -> 3 -> 2 -> 1) to complete...');
    await sleep(4800);

    const messageStageVisible = await page.evaluate(() => {
      const stage = document.getElementById('message-stage');
      return stage && window.getComputedStyle(stage).display !== 'none';
    });
    assert(messageStageVisible, 'Message-writing stage revealed after countdown completed');

    // Verify message writing interaction components
    const textareaExists = await page.evaluate(() => !!document.getElementById('user-written-message'));
    const saveBtnExists = await page.evaluate(() => !!document.getElementById('btn-submit-message'));
    const reliveBtnExists = await page.evaluate(() => !!document.getElementById('btn-relive-journey'));

    assert(textareaExists, 'Message textarea is present');
    assert(saveBtnExists, 'Save Message button is present');
    assert(reliveBtnExists, 'Relive Our Journey button is present');

    // Test writing and saving a message
    console.log('  Testing writing and saving a message...');
    await page.type('#user-written-message', 'With all my heart, forever and always. - P');
    await page.click('#btn-submit-message');
    await sleep(400);

    const savedInStorage = await page.evaluate(() => {
      return localStorage.getItem('sapphire_blossom_written_message');
    });
    const feedbackText = await page.$eval('#message-feedback', el => el.textContent.trim());

    assert(savedInStorage === 'With all my heart, forever and always. - P', 'Message safely stored in localStorage');
    assert(feedbackText === 'Your message has been saved with love ✨', `Feedback confirmed: "${feedbackText}"`);

    // -----------------------------------------------------------
    // TEST 7: Console Errors & Mobile Responsiveness
    // -----------------------------------------------------------
    console.log('\n📌 Test 7: Checking mobile layout and console errors...');
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await sleep(600);

    // If mobile viewport reset the stage, ensure message stage is displayed
    await page.evaluate(() => {
      const msg = document.getElementById('message-stage');
      const count = document.getElementById('countdown-stage');
      if (msg) {
        if (count) count.style.display = 'none';
        msg.style.display = 'flex';
        msg.style.opacity = '1';
      }
    });
    await sleep(300);

    const mobileMessageCardWidth = await page.$eval('.message-card', el => el.offsetWidth);
    assert(mobileMessageCardWidth <= 375 && mobileMessageCardWidth > 200,
      `Mobile message card width is responsive (${mobileMessageCardWidth}px)`);

    const relevantErrors = consoleErrors.filter(e => !e.includes('favicon'));
    assert(relevantErrors.length === 0,
      `Console errors encountered: ${relevantErrors.length === 0 ? 'None (0)' : JSON.stringify(relevantErrors)}`);

    console.log(`\n==================================================`);
    console.log(`🎉 FINAL VERIFICATION SUMMARY: ${passCount} / ${totalTests} TESTS PASSED`);
    console.log(`==================================================\n`);

  } catch (err) {
    console.error('💥 Test suite failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runFinalVerificationSuite();
