import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FILE_URL = `file://${path.resolve('dist/index.html')}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPhase5Tests() {
  console.log('🚀 Starting Phase 5 The Letter & Finale Verification Suite...\n');

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
      if (msg.text().includes('ERR_NAME_NOT_RESOLVED')) return; // Ignore offline font warning
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString());
  });

  try {
    // -----------------------------------------------------------
    // TEST 1: Load Application & Jump Directly to Chapter 6 (The Letter)
    // -----------------------------------------------------------
    console.log(`📌 Test 1: Loading application from ${FILE_URL}...`);
    await page.goto(FILE_URL, { waitUntil: 'load' });
    await sleep(600);

    console.log('  Navigating directly to Chapter 6 (The Letter)...');
    await page.evaluate(() => {
      localStorage.setItem('sapphire_blossom_progress', JSON.stringify({
        currentChapter: 6,
        unlockedChapters: [1, 2, 3, 4, 5, 6],
        dateUnlocked: true,
        missYouCount: 5,
        quizPassed: true,
      }));
      window.location.reload();
    });
    await sleep(800);

    const ch6Active = await page.$eval('#chapter-6', el => el.classList.contains('active'));
    const bodyTheme = await page.$eval('body', el => el.className);
    console.log(`  ✓ Chapter 6 active: ${ch6Active}, Body Theme: "${bodyTheme}"`);
    if (!ch6Active || !bodyTheme.includes('theme-ch-6')) {
      throw new Error('Chapter 6 failed to activate with theme-ch-6');
    }

    // -----------------------------------------------------------
    // TEST 2: Verify Envelope, Wax Seal & Hidden Letter
    // -----------------------------------------------------------
    console.log('\n📌 Test 2: Verifying 3D Envelope, Sapphire Wax Seal & Initial State...');
    const envelopeWrapper = await page.$('#envelope-wrapper');
    const waxSeal = await page.$('#wax-seal');
    const parchmentInitialOpacity = await page.$eval('#letter-parchment', el => {
      return window.getComputedStyle(el).opacity;
    });

    console.log(`  ✓ Envelope Wrapper present: ${!!envelopeWrapper}`);
    console.log(`  ✓ Wax Seal present: ${!!waxSeal}`);
    console.log(`  ✓ Parchment initially hidden (opacity: ${parchmentInitialOpacity})`);

    if (!envelopeWrapper || !waxSeal || parchmentInitialOpacity > 0.1) {
      throw new Error('Envelope or Wax Seal missing, or letter prematurely exposed');
    }

    // -----------------------------------------------------------
    // TEST 3: Click Wax Seal & Animate Letter Reveal
    // -----------------------------------------------------------
    console.log('\n📌 Test 3: Clicking Sapphire Wax Seal to unseal and unfold letter...');
    await page.click('#wax-seal');
    await sleep(1400); // Allow GSAP unsealing and unfolding sequence to complete

    const parchmentOpenedOpacity = await page.$eval('#letter-parchment', el => {
      return parseFloat(window.getComputedStyle(el).opacity);
    });
    const salutationText = await page.$eval('.letter-salutation', el => el.textContent.trim());
    const paragraphsCount = await page.$$eval('.letter-paragraph', els => els.length);
    const signatureText = await page.$eval('.letter-signature', el => el.textContent.trim());

    console.log(`  ✓ Parchment revealed (opacity: ${parchmentOpenedOpacity})`);
    console.log(`  ✓ Letter Salutation: "${salutationText}"`);
    console.log(`  ✓ Letter Paragraphs Count: ${paragraphsCount}`);
    console.log(`  ✓ Letter Signature: "${signatureText}"`);

    if (parchmentOpenedOpacity < 0.8 || paragraphsCount === 0) {
      throw new Error('Letter failed to reveal or missing paragraphs');
    }

    // -----------------------------------------------------------
    // TEST 4: Advance to Chapter 7 (Video & Finale)
    // -----------------------------------------------------------
    console.log('\n📌 Test 4: Clicking "One last surprise..." button to transition to Chapter 7...');
    await page.click('#btn-letter-continue');
    await sleep(1200); // Wait for scene transition

    const ch7Active = await page.$eval('#chapter-7', el => el.classList.contains('active'));
    const ch7BodyTheme = await page.$eval('body', el => el.className);
    console.log(`  ✓ Chapter 7 active: ${ch7Active}, Body Theme: "${ch7BodyTheme}"`);
    if (!ch7Active || !ch7BodyTheme.includes('theme-ch-7')) {
      throw new Error('Chapter 7 failed to activate with theme-ch-7');
    }

    // -----------------------------------------------------------
    // TEST 5: Verify Video Stage & Placeholders
    // -----------------------------------------------------------
    console.log('\n📌 Test 5: Verifying Video Stage & Controls...');
    const videoIntro = await page.$eval('#video-stage .chapter-title', el => el.textContent.trim());
    const videoContainer = await page.$('.video-frame-container');
    const celebrateBtn = await page.$('#btn-reveal-finale');

    console.log(`  ✓ Video Stage Intro: "${videoIntro}"`);
    console.log(`  ✓ Video Frame Container present: ${!!videoContainer}`);
    console.log(`  ✓ Celebrate Birthday Button present: ${!!celebrateBtn}`);

    if (!videoContainer || !celebrateBtn) {
      throw new Error('Video Stage components missing');
    }

    // -----------------------------------------------------------
    // TEST 6: Trigger Grand Birthday Celebration Climax
    // -----------------------------------------------------------
    console.log('\n📌 Test 6: Triggering Grand Birthday Celebration Climax...');
    await page.click('#btn-reveal-finale');
    await sleep(1500); // Allow celebration entrance & cascade to render

    const finaleDisplay = await page.$eval('#grand-finale-stage', el => {
      const style = window.getComputedStyle(el);
      return {
        display: style.display,
        opacity: parseFloat(style.opacity),
      };
    });

    const headlineText = await page.$eval('.finale-headline', el => el.textContent.trim());
    const subtextText = await page.$eval('.finale-subtext', el => el.textContent.trim());
    const emblemPresent = await page.$('.finale-gem-bloom');
    const replayBtn = await page.$('#btn-replay-journey');
    const readLetterAgainBtn = await page.$('#btn-read-letter-again');

    console.log(`  ✓ Grand Finale Visible: display="${finaleDisplay.display}", opacity=${finaleDisplay.opacity}`);
    console.log(`  ✓ Climax Headline: "${headlineText}"`);
    console.log(`  ✓ Climax Subtext: "${subtextText}"`);
    console.log(`  ✓ Radiant Sapphire Emblem present: ${!!emblemPresent}`);
    console.log(`  ✓ Replay Journey Button present: ${!!replayBtn}`);
    console.log(`  ✓ Read Letter Again Button present: ${!!readLetterAgainBtn}`);

    if (finaleDisplay.opacity < 0.8 || !headlineText.includes('Happy Birthday')) {
      throw new Error('Grand finale failed to properly reveal with headline');
    }

    // -----------------------------------------------------------
    // TEST 7: Revisit Letter via "Read Letter Again"
    // -----------------------------------------------------------
    console.log('\n📌 Test 7: Testing return navigation ("Read Letter Again")...');
    await page.click('#btn-read-letter-again');
    await sleep(1200);

    const backInCh6 = await page.$eval('#chapter-6', el => el.classList.contains('active'));
    console.log(`  ✓ Returned to Chapter 6 successfully: ${backInCh6}`);
    if (!backInCh6) {
      throw new Error('Failed to return to Chapter 6');
    }

    // -----------------------------------------------------------
    // TEST 8: Full End-to-End Stepper Navigation Check
    // -----------------------------------------------------------
    console.log('\n📌 Test 8: Verifying all 7 Navigation Stepper Dots...');
    const stepperDotsCount = await page.$$eval('.step-dot', els => els.length);
    console.log(`  ✓ Total Chapter Stepper Dots: ${stepperDotsCount}`);
    if (stepperDotsCount !== 7) {
      throw new Error(`Expected 7 stepper dots, found ${stepperDotsCount}`);
    }

    // -----------------------------------------------------------
    // TEST 9: Console Error Verification
    // -----------------------------------------------------------
    console.log('\n📌 Test 9: Checking for Unhandled Console Errors...');
    console.log(`  Console Errors Logged: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Errors found in console:', consoleErrors);
      throw new Error(`Test failed with ${consoleErrors.length} console errors.`);
    }

    console.log('\n🎉 ALL PHASE 5 TESTS PASSED WITH 100% SUCCESS!\n');
  } catch (error) {
    console.error('\n❌ Phase 5 Verification Failed:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runPhase5Tests();
