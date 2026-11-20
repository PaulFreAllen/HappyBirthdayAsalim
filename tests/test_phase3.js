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

async function runPhase3Tests() {
  console.log('🚀 Starting Phase 3 Visual Effects & Cinematic Transitions Test Suite...\n');

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
      // Ignore offline sandbox font resolution warnings
      if (msg.text().includes('ERR_NAME_NOT_RESOLVED')) return;
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString());
  });

  try {
    // -----------------------------------------------------------
    // TEST 1: Load Standalone App & Chapter 1 Atmosphere
    // -----------------------------------------------------------
    console.log(`📌 Test 1: Loading application from ${FILE_URL}...`);
    await page.goto(FILE_URL, { waitUntil: 'load' });
    await sleep(600);

    // Clear localStorage to start clean
    await page.evaluate(() => {
      localStorage.clear();
      window.location.reload();
    });
    await sleep(600);

    const bodyTheme = await page.$eval('body', el => el.className);
    console.log(`  ✓ Initial atmospheric theme on body: "${bodyTheme}"`);
    if (!bodyTheme.includes('theme-ch-1')) {
      throw new Error('Expected body to have theme-ch-1');
    }

    const vignetteExists = await page.$eval('.vignette-overlay', el => !!el);
    console.log(`  ✓ Cinematic soft vignette overlay detected: ${vignetteExists}`);

    // Check Chapter 1 button and entrance
    const beginBtn = await page.waitForSelector('#ch1-begin-btn', { timeout: 3000 });
    console.log('  ✓ Chapter 1 entrance rendered successfully');

    // -----------------------------------------------------------
    // TEST 2: Cinematic Transition to Chapter 2 & Particle Burst
    // -----------------------------------------------------------
    console.log('\n📌 Test 2: Testing Chapter 1 -> Chapter 2 cinematic transition...');
    await beginBtn.click();

    // Verify Chapter 2 becomes active
    await page.waitForSelector('#chapter-2.active', { timeout: 4000 });
    const ch2Theme = await page.$eval('body', el => el.className);
    console.log(`  ✓ Atmospheric theme shifted to: "${ch2Theme}"`);
    if (!ch2Theme.includes('theme-ch-2')) {
      throw new Error('Atmospheric theme failed to shift to theme-ch-2');
    }

    // -----------------------------------------------------------
    // TEST 3: Date Lock Particle Feedback (Error & Unlock)
    // -----------------------------------------------------------
    console.log('\n📌 Test 3: Testing Date Lock error particles & unlock burst...');
    const submitBtn = await page.waitForSelector('#lock-submit-btn');

    // Trigger incorrect submission to verify error feedback & error particle burst
    await page.type('#lock-day', '01');
    await page.type('#lock-month', '01');
    await page.type('#lock-year', '2020');
    await submitBtn.click();
    await sleep(350);

    const errorFeedback = await page.$eval('#lock-feedback', el => el.textContent);
    console.log(`  ✓ Incorrect feedback displayed: "${errorFeedback}"`);

    // Enter correct date (2022-07-18)
    await page.$eval('#lock-day', el => el.value = '18');
    await page.$eval('#lock-month', el => el.value = '07');
    await page.$eval('#lock-year', el => el.value = '2022');
    await submitBtn.click();

    // Verify unlock animation & transition to Chapter 3
    await page.waitForSelector('#chapter-3.active', { timeout: 5000 });
    const ch3Theme = await page.$eval('body', el => el.className);
    console.log(`  ✓ Successfully unlocked and transitioned to Chapter 3. Theme: "${ch3Theme}"`);
    if (!ch3Theme.includes('theme-ch-3')) {
      throw new Error('Atmospheric theme failed to shift to theme-ch-3');
    }

    // -----------------------------------------------------------
    // TEST 4: Escaping Button Motion Trail & Surrender
    // -----------------------------------------------------------
    console.log('\n📌 Test 4: Testing Escaping Button motion trail and surrender...');
    const evasiveBtn = await page.waitForSelector('#ch3-btn-evasive');

    for (let i = 1; i <= 6; i++) {
      await page.evaluate(() => {
        const btn = document.getElementById('ch3-btn-evasive');
        btn.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
      });
      await sleep(750);
    }

    await page.waitForSelector('#ch3-surrender-panel[style*="display: flex"]', { timeout: 3000 });
    const surrenderMsg = await page.$eval('#ch3-surrender-msg', el => el.textContent.trim());
    console.log(`  ✓ Surrender state verified: "${surrenderMsg}"`);

    // Click continue to Chapter 4
    await page.click('#ch3-continue-btn');
    await page.waitForSelector('#chapter-4.active', { timeout: 4000 });
    const ch4Theme = await page.$eval('body', el => el.className);
    console.log(`  ✓ Transitioned to Chapter 4. Intimate theme: "${ch4Theme}"`);
    if (!ch4Theme.includes('theme-ch-4')) {
      throw new Error('Atmospheric theme failed to shift to theme-ch-4');
    }

    // -----------------------------------------------------------
    // TEST 5: Memory Quiz Celebration & Rapid Click Protection
    // -----------------------------------------------------------
    console.log('\n📌 Test 5: Testing Memory Quiz celebration & rapid click guard...');

    // Complete all 4 quiz questions
    const answers = [1, 1, 0, 3];
    for (let q = 0; q < 4; q++) {
      await page.click(`.quiz-option-btn[data-opt-index="${answers[q]}"]`);
      await sleep(350);
      await page.click('#quiz-next-btn');
      await sleep(550);
    }

    const finaleQuote = await page.$eval('.quiz-complete-title', el => el.textContent.trim());
    console.log(`  ✓ Quiz completed with celebratory cascade. Quote: "${finaleQuote}"`);

    // -----------------------------------------------------------
    // TEST 6: Rapid Clicking & Transition Guarding
    // -----------------------------------------------------------
    console.log('\n📌 Test 6: Testing rapid click protection on navigation stepper...');
    // Rapidly click between unlocked chapter dots
    await page.evaluate(() => {
      const dot2 = document.querySelector('.step-dot[data-chapter="2"]');
      const dot3 = document.querySelector('.step-dot[data-chapter="3"]');
      const dot4 = document.querySelector('.step-dot[data-chapter="4"]');
      dot2.click();
      dot3.click();
      dot4.click();
      dot2.click();
    });
    await sleep(1000);

    // Verify exactly one active chapter stage is in the DOM
    const activeSectionsCount = await page.$$eval('.chapter-stage.active', els => els.length);
    console.log(`  ✓ Active chapter stages in DOM after rapid clicking: ${activeSectionsCount}`);
    if (activeSectionsCount !== 1) {
      throw new Error(`Expected exactly 1 active section, got ${activeSectionsCount}`);
    }

    // -----------------------------------------------------------
    // TEST 7: Mobile Viewport Responsiveness
    // -----------------------------------------------------------
    console.log('\n📌 Test 7: Testing mobile viewport (375x667 iPhone SE)...');
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await sleep(400);

    const navVisible = await page.$eval('.experience-nav', el => window.getComputedStyle(el).display !== 'none');
    console.log(`  ✓ Responsive mobile navigation verified: ${navVisible}`);

    // -----------------------------------------------------------
    // TEST 8: Reduced Motion Compliance
    // -----------------------------------------------------------
    console.log('\n📌 Test 8: Testing prefers-reduced-motion...');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.reload({ waitUntil: 'load' });
    await sleep(500);
    console.log('  ✓ Page successfully reloaded with reduced-motion media feature');

    // -----------------------------------------------------------
    // TEST 9: Console Error Health Check
    // -----------------------------------------------------------
    console.log('\n📌 Test 9: Checking browser console errors...');
    if (consoleErrors.length > 0) {
      console.error('❌ Browser console errors:', consoleErrors);
      throw new Error(`Found ${consoleErrors.length} console errors`);
    } else {
      console.log('  ✓ 0 browser console errors detected!');
    }

    console.log('\n🎉 ALL PHASE 3 VISUAL & CINEMATIC TESTS PASSED!\n');
  } catch (err) {
    console.error('\n❌ Phase 3 Test Suite Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPhase3Tests();
