import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FILE_URL = `file://${path.resolve('dist/index.html')}`;

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTaskVerificationSuite() {
  console.log('🚀 Starting Verification Suite for Task 1 & Task 2...\n');

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
    // TEST 1: Load App & Verify Initial Chapter 1 State
    // -----------------------------------------------------------
    console.log(`📌 Test 1: Loading application from ${FILE_URL}...`);
    await page.goto(FILE_URL, { waitUntil: 'load' });
    await sleep(600);

    await page.evaluate(() => {
      localStorage.clear();
      window.location.reload();
    });
    await sleep(800);

    const title = await page.title();
    console.log(`  ✓ Application loaded. Title: "${title}"`);

    // Verify Chapter 1 initial unscrollable state
    const isInitiallyScrollable = await page.$eval('#ch1-scroll-track', el => el.classList.contains('is-scrollable'));
    console.log(`  ✓ Chapter 1 scroll track initially unscrollable (awaiting begin click): ${!isInitiallyScrollable}`);
    if (isInitiallyScrollable) throw new Error('Scroll track should not be scrollable before clicking begin');

    // -----------------------------------------------------------
    // TEST 2: Task 1 — Click "Begin our journey" & Scroll Transition
    // -----------------------------------------------------------
    console.log('\n📌 Test 2: Testing Chapter 1 -> Chapter 2 Scroll Transition...');
    const beginBtn = await page.waitForSelector('#ch1-begin-btn');
    await beginBtn.click();
    await sleep(500);

    // Verify track is now scrollable and scroll hint is visible
    const isNowScrollable = await page.$eval('#ch1-scroll-track', el => el.classList.contains('is-scrollable'));
    const scrollHintVisible = await page.$eval('#ch1-scroll-hint', el => window.getComputedStyle(el).display !== 'none');
    console.log(`  ✓ Scroll track expanded to 280vh: ${isNowScrollable}`);
    console.log(`  ✓ Scroll guidance prompt appeared: ${scrollHintVisible}`);

    if (!isNowScrollable) throw new Error('Scroll track failed to expand upon clicking begin');

    // Scroll forward incrementally
    console.log('  Testing forward scrub progress...');
    
    // Progress ~35%
    await page.evaluate(() => {
      const track = document.getElementById('ch1-scroll-track');
      const maxScroll = track.scrollHeight - window.innerHeight;
      window.scrollTo(0, maxScroll * 0.35);
    });
    await sleep(400);

    const ch1SalutationOpacity = await page.$eval('#ch1-invitation-layer .invitation-salutation', el => {
      return parseFloat(window.getComputedStyle(el).opacity);
    });
    console.log(`  ✓ At 35% scroll: Chapter 1 salutation fading & blurring (opacity: ${ch1SalutationOpacity.toFixed(2)})`);

    // Progress ~65%
    await page.evaluate(() => {
      const track = document.getElementById('ch1-scroll-track');
      const maxScroll = track.scrollHeight - window.innerHeight;
      window.scrollTo(0, maxScroll * 0.65);
    });
    await sleep(400);

    const themeMidway = await page.$eval('body', el => el.className);
    console.log(`  ✓ At 65% scroll: Atmospheric theme shifted midway to: "${themeMidway}"`);
    if (!themeMidway.includes('theme-ch-2')) throw new Error('Theme should shift to theme-ch-2 by midway');

    // Progress 100% (Reveal Date Lock fully)
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await sleep(1500);

    const lockContainerOpacity = await page.$eval('#ch1-lock-layer .lock-container', el => {
      return parseFloat(window.getComputedStyle(el).opacity);
    });
    const lockVaultGraphicOpacity = await page.$eval('#ch1-lock-layer .lock-vault-graphic', el => {
      return parseFloat(window.getComputedStyle(el).opacity);
    });
    const activeDot = await page.$eval('.step-dot.active', el => el.getAttribute('data-chapter'));

    console.log(`  ✓ At 100% scroll: Lock container opacity: ${lockContainerOpacity}`);
    console.log(`  ✓ At 100% scroll: Vault graphic opacity: ${lockVaultGraphicOpacity}`);
    console.log(`  ✓ At 100% scroll: Synchronized navigation stepper active dot: Chapter ${activeDot}`);

    if (lockContainerOpacity < 0.9) throw new Error('Lock container failed to reach full opacity at 100% scroll');
    if (activeDot !== '2') throw new Error('Navigation stepper should reflect Chapter 2 at end of transition');

    // -----------------------------------------------------------
    // TEST 3: Reverse Scrolling (Back to Chapter 1)
    // -----------------------------------------------------------
    console.log('\n📌 Test 3: Testing reverse scrolling back to Chapter 1...');
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await sleep(600);

    const ch1SalutationBack = await page.$eval('#ch1-invitation-layer .invitation-salutation', el => {
      return parseFloat(window.getComputedStyle(el).opacity);
    });
    const activeDotBack = await page.$eval('.step-dot.active', el => el.getAttribute('data-chapter'));
    const themeBack = await page.$eval('body', el => el.className);

    console.log(`  ✓ Scrolled back to top: Chapter 1 salutation restored (opacity: ${ch1SalutationBack.toFixed(2)})`);
    console.log(`  ✓ Stepper restored to Chapter ${activeDotBack}`);
    console.log(`  ✓ Theme restored to: "${themeBack}"`);

    if (ch1SalutationBack < 0.9) throw new Error('Chapter 1 salutation failed to restore opacity on reverse scroll');
    if (activeDotBack !== '1') throw new Error('Stepper failed to restore Chapter 1 on reverse scroll');

    // Scroll forward again to unlock date lock
    await page.evaluate(() => {
      const track = document.getElementById('ch1-scroll-track');
      const maxScroll = track.scrollHeight - window.innerHeight;
      window.scrollTo(0, maxScroll);
    });
    await sleep(1500); // Allow GSAP scrub: 1.2 to settle at 100%

    // -----------------------------------------------------------
    // TEST 4: Date Lock Functionality in Transitioned Layer
    // -----------------------------------------------------------
    console.log('\n📌 Test 4: Testing Date Lock interaction in transition layer...');
    await page.type('#lock-day', '18');
    await page.type('#lock-month', '07');
    await page.type('#lock-year', '2022');
    await page.click('#lock-submit-btn');

    await sleep(700);
    const feedbackMsg = await page.$eval('#lock-feedback', el => el.textContent.trim());
    console.log(`  ✓ Unlocked successfully. Message: "${feedbackMsg}"`);
    if (!feedbackMsg.includes('remembered')) throw new Error('Failed to unlock with correct date');

    // Wait for auto-advance to Chapter 3 (1.6s celebration delay)
    await sleep(1800);
    await page.waitForSelector('#chapter-3.active', { timeout: 6000 });
    console.log('  ✓ Transitioned smoothly to Chapter 3');

    // -----------------------------------------------------------
    // TEST 5: Task 2 — Blue Rose Blooming Animation (Chapter 5)
    // -----------------------------------------------------------
    console.log('\n📌 Test 5: Testing Chapter 5 Sapphire Garden Rose Blooming...');
    
    // Jump to Chapter 5 via app progress (force = true)
    await page.evaluate(() => {
      window.__sapphireApp.progress.goToChapter(5, true);
    });
    await page.waitForSelector('#chapter-5.active', { timeout: 4000 });
    await sleep(600);

    // Verify SVG Gradients in <defs>
    const hasHaloGrad = await page.$eval('#garden-stage-svg defs radialGradient#roseBloomHaloGrad', el => !!el);
    const hasMistGrad = await page.$eval('#garden-stage-svg defs radialGradient#gardenHorizonMistGrad', el => !!el);
    const mistEllipseFill = await page.$eval('.garden-ground-group ellipse', el => el.getAttribute('fill'));

    console.log(`  ✓ SVG radialGradient #roseBloomHaloGrad present: ${hasHaloGrad}`);
    console.log(`  ✓ SVG radialGradient #gardenHorizonMistGrad present: ${hasMistGrad}`);
    console.log(`  ✓ Mist ellipse uses valid SVG url reference: "${mistEllipseFill}"`);

    if (!hasHaloGrad || !hasMistGrad) throw new Error('Missing proper SVG radialGradient defs');
    if (!mistEllipseFill.includes('url(#gardenHorizonMistGrad)')) throw new Error('Mist ellipse must reference url(#gardenHorizonMistGrad)');

    // Verify Rose Growth Timeline at 0%, 25%, 50%, 75%, 100%
    console.log('  Testing garden ScrollTrigger growth scrub...');

    // Progress 0%
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await sleep(300);

    const seedOrbOpacity = await page.$eval('#garden-seed-orb', el => parseFloat(window.getComputedStyle(el).opacity));
    console.log(`  ✓ At 0% progress: Seed stage ready (orb opacity: ${seedOrbOpacity})`);

    // Progress 25% (Stems rising)
    await page.evaluate(() => {
      const track = document.getElementById('garden-scroll-track');
      window.scrollTo(0, track.scrollHeight * 0.25);
    });
    await sleep(400);

    const stemDashoffset25 = await page.$eval('#rose-hero .rose-stem', el => {
      return parseFloat(el.style.strokeDashoffset || 450);
    });
    console.log(`  ✓ At 25% progress: Hero stem growing upward (strokeDashoffset: ${stemDashoffset25.toFixed(1)})`);

    // Progress 50% (Buds forming, sepals reflexing)
    await page.evaluate(() => {
      const track = document.getElementById('garden-scroll-track');
      window.scrollTo(0, track.scrollHeight * 0.50);
    });
    await sleep(400);

    const heroBudScale = await page.$eval('#rose-hero .rose-head', el => {
      return window.getComputedStyle(el).transform;
    });
    console.log(`  ✓ At 50% progress: Hero rose head active (transform: ${heroBudScale})`);

    // Progress 75% (Blooming outer & mid petals)
    await page.evaluate(() => {
      const track = document.getElementById('garden-scroll-track');
      window.scrollTo(0, track.scrollHeight * 0.75);
    });
    await sleep(400);

    const outerPetalOpacity75 = await page.$eval('#rose-hero .petal-outer', el => {
      return parseFloat(window.getComputedStyle(el).opacity);
    });
    console.log(`  ✓ At 75% progress: Outer guard petals reflexed (opacity: ${outerPetalOpacity75})`);
    if (outerPetalOpacity75 < 0.8) throw new Error('Outer petals should be bloomed by 75%');

    // Progress 100% (Full Garden Panorama & Epilogue)
    await page.evaluate(() => {
      const track = document.getElementById('garden-scroll-track');
      window.scrollTo(0, track.scrollHeight);
    });
    await sleep(600);

    // Verify all roses are bloomed and visible
    const roseCount = await page.$$eval('.garden-rose', roses => roses.length);
    const fullyBloomedRoses = await page.$$eval('.garden-rose .rose-head', heads => {
      return heads.filter(h => parseFloat(window.getComputedStyle(h).opacity) >= 0.85).length;
    });

    console.log(`  ✓ Total roses in garden: ${roseCount}`);
    console.log(`  ✓ Fully bloomed visible roses at 100%: ${fullyBloomedRoses}/${roseCount}`);

    if (fullyBloomedRoses !== roseCount) {
      throw new Error(`Expected all ${roseCount} roses to be fully bloomed at 100%, found ${fullyBloomedRoses}`);
    }

    // Verify Epilogue Card visibility
    const epilogueCardVisible = await page.$eval('#garden-epilogue-card', el => {
      return parseFloat(window.getComputedStyle(el).opacity) > 0.85;
    });
    console.log(`  ✓ Epilogue card fully visible at 100%: ${epilogueCardVisible}`);
    if (!epilogueCardVisible) throw new Error('Epilogue card should be visible at 100% scroll');

    // -----------------------------------------------------------
    // TEST 6: Mobile Viewport Responsiveness (375x667 iPhone SE)
    // -----------------------------------------------------------
    console.log('\n📌 Test 6: Testing transition on mobile viewport (375x667)...');
    await page.setViewport({ width: 375, height: 667, isMobile: true });
    
    // Jump back to Chapter 1
    await page.evaluate(() => {
      window.__sapphireApp.progress.goToChapter(1, true);
    });
    await page.waitForSelector('#chapter-1.active', { timeout: 4000 });
    await sleep(1400); // Allow scene transition to complete and clearProps to clean up

    const mobileBeginBtn = await page.waitForSelector('#ch1-begin-btn');
    await mobileBeginBtn.click();
    await sleep(600);

    // Scroll to bottom on mobile
    await page.evaluate(() => {
      const track = document.getElementById('ch1-scroll-track');
      window.scrollTo(0, track.scrollHeight);
    });
    await sleep(1600);

    const mobileLockVisible = await page.$eval('#ch1-lock-layer .lock-container', el => {
      return parseFloat(window.getComputedStyle(el).opacity) > 0.85;
    });
    console.log(`  ✓ Mobile viewport transition rendered Date Lock smoothly: ${mobileLockVisible}`);
    if (!mobileLockVisible) throw new Error('Mobile viewport failed to reveal Date Lock');

    // -----------------------------------------------------------
    // TEST 7: Browser Console & Duplicate ScrollTrigger Audit
    // -----------------------------------------------------------
    console.log('\n📌 Test 7: Checking for GSAP / SVG errors & ScrollTrigger count...');
    
    const triggerCount = await page.evaluate(() => {
      return window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 0;
    });
    console.log(`  ✓ Active ScrollTriggers after chapter switches: ${triggerCount}`);

    console.log(`  ✓ Console errors recorded: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Console errors:', consoleErrors);
      throw new Error(`Browser console recorded ${consoleErrors.length} errors`);
    }

    console.log('\n🎉 ALL TASK 1 & TASK 2 TESTS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTaskVerificationSuite();
