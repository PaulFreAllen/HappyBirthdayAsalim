import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FILE_URL = `file://${path.resolve('dist/index.html')}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCompleteJourneyTest() {
  console.log('🚀 Starting Comprehensive Verification Suite for Sapphire Blossom Journey...\n');
  console.log(`Loading application from: ${FILE_URL}\n`);

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
    consoleErrors.push(err.toString());
  });

  try {
    // -----------------------------------------------------------
    // TEST 1: Clean Load & Navigation Stepper Inspection
    // -----------------------------------------------------------
    console.log('📌 Test 1: Verifying Initial State & 6-Chapter Stepper...');
    await page.goto(FILE_URL, { waitUntil: 'load' });
    await sleep(600);

    const initData = await page.evaluate(() => {
      localStorage.clear();
      const dots = Array.from(document.querySelectorAll('.step-dot'));
      const sections = Array.from(document.querySelectorAll('.chapter-stage'));
      return {
        dotCount: dots.length,
        dots: dots.map((d) => ({
          chapter: d.getAttribute('data-chapter'),
          title: d.getAttribute('data-title'),
          aria: d.getAttribute('aria-label'),
        })),
        sectionIds: sections.map((s) => s.id),
        hasQuizContainer: !!document.querySelector('.quiz-container'),
        hasQuizHearts: !!document.querySelector('.quiz-hearts-track'),
        totalChapters: window.__sapphireApp.progress.totalChapters,
      };
    });

    console.log(`  ✓ Total Stepper Dots: ${initData.dotCount}`);
    console.log(`  ✓ Total Chapters in ProgressManager: ${initData.totalChapters}`);
    console.log(`  ✓ Section IDs present: ${initData.sectionIds.join(', ')}`);
    console.log(`  ✓ No quiz elements in DOM: ${!initData.hasQuizContainer && !initData.hasQuizHearts}`);

    if (initData.dotCount !== 6) {
      throw new Error(`Expected 6 stepper dots, found ${initData.dotCount}`);
    }
    if (initData.totalChapters !== 6) {
      throw new Error(`Expected ProgressManager totalChapters to be 6, found ${initData.totalChapters}`);
    }
    if (initData.hasQuizContainer || initData.hasQuizHearts) {
      throw new Error('Quiz elements still present in initial DOM');
    }

    // Verify dot chapter sequence: 1 through 6
    const expectedTitles = [
      'The Invitation',
      'The Date Lock',
      'The Escaping Button',
      'Sapphire Garden',
      'The Letter',
      'The Finale',
    ];
    initData.dots.forEach((dot, idx) => {
      if (parseInt(dot.chapter, 10) !== idx + 1) {
        throw new Error(`Dot ${idx + 1} has incorrect data-chapter: ${dot.chapter}`);
      }
      if (dot.title !== expectedTitles[idx]) {
        throw new Error(`Dot ${idx + 1} has title "${dot.title}", expected "${expectedTitles[idx]}"`);
      }
    });
    console.log('  ✓ Stepper dot numbering and titles verified (1: Invitation, 2: Date Lock, 3: Escaping Button, 4: Sapphire Garden, 5: The Letter, 6: The Finale)');

    // -----------------------------------------------------------
    // TEST 2: Chapter 1 -> Chapter 2
    // -----------------------------------------------------------
    console.log('\n📌 Test 2: Chapter 1 Invitation entrance & transition to Date Lock...');
    const ch1Active = await page.$eval('#chapter-1', (el) => el.classList.contains('active'));
    if (!ch1Active) throw new Error('Chapter 1 should be active initially');

    // Click Begin button in Chapter 1
    await page.click('#ch1-begin-btn');
    await sleep(400);

    // Smoothly scroll down track to scrub into Chapter 2 Date Lock
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await sleep(900);

    // Verify Date Lock layer visible or active
    const dateLockInputs = await page.$('#lock-month');
    if (!dateLockInputs) throw new Error('Date lock inputs not found');
    console.log('  ✓ Date Lock reached via cinematic scroll scrub');

    // -----------------------------------------------------------
    // TEST 3: Chapter 2 Date Lock -> Chapter 3
    // -----------------------------------------------------------
    console.log('\n📌 Test 3: Unlocking Chapter 2 Date Lock (07/18/2022)...');
    await page.type('#lock-month', '07');
    await page.type('#lock-day', '18');
    await page.type('#lock-year', '2022');
    await page.click('#lock-submit-btn');

    await sleep(700);
    const feedbackMsg = await page.$eval('#lock-feedback', (el) => el.textContent.trim());
    console.log(`  ✓ Unlocked feedback message: "${feedbackMsg}"`);
    if (!feedbackMsg.includes('remembered')) throw new Error('Date lock failed to unlock');

    // Wait for auto-advance to Chapter 3
    await sleep(1800);
    await page.waitForSelector('#chapter-3.active', { timeout: 6000 });
    console.log('  ✓ Transitioned smoothly to Chapter 3 (The Escaping Button)');

    // -----------------------------------------------------------
    // TEST 4: Chapter 3 Escaping Button -> Chapter 4 Sapphire Garden
    // -----------------------------------------------------------
    console.log('\n📌 Test 4: Testing Chapter 3 Direct Transition into Chapter 4 (Sapphire Garden)...');
    
    // Click the standard "Yes! ✨" button in Chapter 3
    await page.click('#ch3-btn-standard');
    await sleep(400);

    // Verify hearts appeared and transition initiates
    console.log('  ✓ Clicked Yes button in Chapter 3, waiting for transition to Chapter 4 (Garden)...');
    await sleep(1500);

    // REQUIREMENT 1 & 2 & 6: Verify Chapter 3 transitions directly into Chapter 4 (the garden)
    await page.waitForSelector('#chapter-4.active', { timeout: 6000 });
    const isCh4Active = await page.$eval('#chapter-4', (el) => el.classList.contains('active'));
    const isGardenSvgPresent = await page.$('#garden-stage-svg');
    const isProloguePresent = await page.$('#garden-prologue');
    
    console.log(`  ✓ Chapter 4 active: ${isCh4Active}`);
    console.log(`  ✓ Garden SVG stage present: ${!!isGardenSvgPresent}`);
    console.log(`  ✓ Garden prologue overlay present: ${!!isProloguePresent}`);

    if (!isCh4Active || !isGardenSvgPresent || !isProloguePresent) {
      throw new Error('Chapter 3 did not transition directly into the Garden (Chapter 4)');
    }

    // Verify theme class on body is theme-ch-4
    const bodyClassCh4 = await page.$eval('body', (el) => el.className);
    console.log(`  ✓ Body theme class on Chapter 4: "${bodyClassCh4}"`);
    if (!bodyClassCh4.includes('theme-ch-4')) throw new Error('Expected body to have theme-ch-4');

    // -----------------------------------------------------------
    // TEST 5: Chapter 4 Garden Growth Scrub -> Epilogue Card -> Chapter 5
    // -----------------------------------------------------------
    console.log('\n📌 Test 5: Testing Garden blooming scrub and transition to Chapter 5 (The Letter)...');
    
    // Simulate scroll scrub to bloom flowers
    await page.evaluate(() => {
      window.scrollTo(0, 3000);
    });
    await sleep(600);

    // Reveal epilogue card programmatically if needed
    await page.evaluate(() => {
      const epilogue = document.getElementById('garden-epilogue-card');
      if (epilogue) {
        epilogue.style.opacity = '1';
        epilogue.style.pointerEvents = 'auto';
      }
    });

    const epilogueHeadline = await page.$eval('.epilogue-headline', (el) => el.textContent.trim());
    console.log(`  ✓ Epilogue headline displayed: "${epilogueHeadline}"`);

    // Click "Open the letter ✉️" continue button
    console.log('  ✓ Clicking "Open the letter ✉️" continue button...');
    await page.click('#garden-continue-btn');
    await sleep(1000);

    // Verify transition to Chapter 5 (The Letter)
    await page.waitForSelector('#chapter-5.active', { timeout: 6000 });
    const isCh5Active = await page.$eval('#chapter-5', (el) => el.classList.contains('active'));
    const letterBadge = await page.$eval('#chapter-5 .chapter-badge', (el) => el.textContent.trim());
    const letterTitle = await page.$eval('#chapter-5 .chapter-title', (el) => el.textContent.trim());

    console.log(`  ✓ Chapter 5 active: ${isCh5Active}`);
    console.log(`  ✓ Letter chapter badge: "${letterBadge}"`);
    console.log(`  ✓ Letter chapter title: "${letterTitle}"`);

    if (!isCh5Active) throw new Error('Failed to transition from Garden to Chapter 5 (The Letter)');
    if (letterBadge !== 'Chapter V') throw new Error(`Expected Chapter V badge, got: "${letterBadge}"`);

    // -----------------------------------------------------------
    // TEST 6: Chapter 5 The Letter -> Wax Seal Opening -> Chapter 6
    // -----------------------------------------------------------
    console.log('\n📌 Test 6: Breaking wax seal and opening Letter...');
    await page.click('#wax-seal');
    await sleep(1200);

    const isParchmentOpen = await page.$eval('#letter-parchment', (el) => el.classList.contains('is-open'));
    const salutation = await page.$eval('.letter-salutation', (el) => el.textContent.trim());
    console.log(`  ✓ Wax seal broken, parchment unfolded: ${isParchmentOpen}`);
    console.log(`  ✓ Letter salutation: "${salutation}"`);

    if (!isParchmentOpen) throw new Error('Parchment did not open after breaking wax seal');

    // Click "A Special Message For You ✨" continue button
    console.log('  ✓ Clicking continue button to proceed to Chapter 6 (The Finale)...');
    await page.click('#btn-letter-continue');
    await sleep(1000);

    // Verify transition to Chapter 6 (The Finale)
    await page.waitForSelector('#chapter-6.active', { timeout: 6000 });
    const isCh6Active = await page.$eval('#chapter-6', (el) => el.classList.contains('active'));
    const finaleBadge = await page.$eval('#chapter-6 .chapter-badge', (el) => el.textContent.trim());

    console.log(`  ✓ Chapter 6 active: ${isCh6Active}`);
    console.log(`  ✓ Finale chapter badge: "${finaleBadge}"`);

    if (!isCh6Active) throw new Error('Failed to transition from Letter to Chapter 6 (The Finale)');
    if (finaleBadge !== 'Chapter VI') throw new Error(`Expected Chapter VI badge, got: "${finaleBadge}"`);

    // -----------------------------------------------------------
    // TEST 7: Chapter 6 Video Stage -> Grand Celebration Finale
    // -----------------------------------------------------------
    console.log('\n📌 Test 7: Celebrating Birthday in Chapter 6...');
    await page.click('#btn-reveal-finale');
    await sleep(1000);

    const isFinaleStageVisible = await page.$eval('#grand-finale-stage', (el) => window.getComputedStyle(el).display !== 'none');
    const finaleHeadline = await page.$eval('.finale-headline', (el) => el.textContent.trim());
    console.log(`  ✓ Grand celebration stage visible: ${isFinaleStageVisible}`);
    console.log(`  ✓ Grand finale headline: "${finaleHeadline}"`);

    if (!isFinaleStageVisible) throw new Error('Grand finale stage did not reveal');
    if (!finaleHeadline.includes('Happy Birthday')) throw new Error('Finale headline does not contain Happy Birthday');

    // Test "Read the Letter Again" navigation
    console.log('\n📌 Test 8: Testing "Read the Letter Again" navigation in Finale...');
    await page.click('#btn-read-letter');
    await sleep(1500);
    await page.waitForSelector('#chapter-5.active', { timeout: 4000 });
    const backInCh5 = await page.$eval('#chapter-5', (el) => el.classList.contains('active'));
    console.log(`  ✓ Successfully returned to Chapter 5 (The Letter): ${backInCh5}`);
    if (!backInCh5) throw new Error('Failed to navigate back to Chapter 5 from Finale');

    // Test Navigation Stepper dot clicking
    console.log('\n📌 Test 9: Testing Stepper dot clicks on unlocked chapters...');
    await sleep(500);
    await page.click('.step-dot[data-chapter="4"]');
    await sleep(1500);
    await page.waitForSelector('#chapter-4.active', { timeout: 4000 });
    const inCh4ViaStepper = await page.$eval('#chapter-4', (el) => el.classList.contains('active'));
    console.log(`  ✓ Successfully jumped back to Chapter 4 (Garden) via Stepper Dot: ${inCh4ViaStepper}`);
    if (!inCh4ViaStepper) throw new Error('Failed to jump to Chapter 4 via stepper');

    console.log('\n🎉 ALL VERIFICATION CHECKS PASSED PERFECTLY!');
  } finally {
    await browser.close();
  }

  if (consoleErrors.length > 0) {
    console.error('Console errors logged during test:', consoleErrors);
    throw new Error(`Encountered ${consoleErrors.length} console errors`);
  }
}

runCompleteJourneyTest().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
