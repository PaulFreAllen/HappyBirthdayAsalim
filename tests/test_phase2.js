import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FILE_URL = `file://${path.resolve('dist/index.html')}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('🚀 Starting Automated Verification Suite for Phase 2...\n');

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
    // TEST 1: Page Load & Chapter 1
    // -----------------------------------------------------------
    console.log('📌 Test 1: Loading application and Chapter 1...');
    await page.goto(FILE_URL, { waitUntil: 'load' });
    await sleep(500);

    // Reset progress to clean Chapter 1
    await page.evaluate(() => {
      localStorage.setItem('sapphire_blossom_progress', JSON.stringify({
        currentChapter: 1,
        unlockedChapters: [1],
        dateUnlocked: false,
        missYouCount: 0,
        quizPassed: false,
      }));
      window.location.reload();
    });
    await sleep(800);

    const title = await page.title();
    console.log(`  ✓ Page title: "${title}"`);
    if (!title.includes('Sapphire Blossom')) throw new Error('Incorrect title');

    // Click "Let's begin ✨"
    await page.waitForSelector('#ch1-begin-btn', { timeout: 5000 });
    const beginBtn = await page.$('#ch1-begin-btn');
    if (!beginBtn) throw new Error('Chapter 1 begin button not found');
    await beginBtn.click();
    await page.waitForSelector('#chapter-2.active', { timeout: 4000 });

    // -----------------------------------------------------------
    // TEST 2: Chapter 2 — Date Lock Validation & Unlock
    // -----------------------------------------------------------
    console.log('\n📌 Test 2: Testing Chapter 2 Date Lock...');
    const ch2Active = await page.$eval('#chapter-2', el => el.classList.contains('active'));
    if (!ch2Active) throw new Error('Chapter 2 not active after clicking begin');
    console.log('  ✓ Chapter 2 active');

    const submitBtn = await page.$('#lock-submit-btn');

    // 2a. Empty submission
    await submitBtn.click();
    await sleep(300);
    let feedback = await page.$eval('#lock-feedback', el => el.textContent);
    console.log(`  ✓ Empty submission feedback: "${feedback}"`);
    if (!feedback.includes('Please enter the day, month, and year')) {
      throw new Error('Empty validation failed');
    }

    // 2b. Invalid date numbers (e.g. Day 45, Month 15)
    await page.type('#lock-day', '45');
    await page.type('#lock-month', '15');
    await page.type('#lock-year', '2023');
    await submitBtn.click();
    await sleep(300);
    feedback = await page.$eval('#lock-feedback', el => el.textContent);
    console.log(`  ✓ Invalid date feedback: "${feedback}"`);
    if (!feedback.includes('Please check the date numbers again')) {
      throw new Error('Invalid date validation failed');
    }

    // 2c. Incorrect attempt 1
    await page.$eval('#lock-day', el => el.value = '01');
    await page.$eval('#lock-month', el => el.value = '01');
    await page.$eval('#lock-year', el => el.value = '2020');
    await submitBtn.click();
    await sleep(300);
    feedback = await page.$eval('#lock-feedback', el => el.textContent);
    console.log(`  ✓ Incorrect attempt 1 feedback: "${feedback}"`);

    // 2d. Incorrect attempt 2 & 3 (trigger hint)
    await submitBtn.click();
    await sleep(200);
    await submitBtn.click();
    await sleep(400);

    const hintVisible = await page.$eval('#lock-hint', el => window.getComputedStyle(el).display !== 'none');
    const hintText = await page.$eval('#lock-hint', el => el.textContent.trim());
    console.log(`  ✓ Hint revealed after 3 attempts: "${hintText.slice(0, 50)}..."`);
    if (!hintVisible) throw new Error('Hint was not revealed after 3 attempts');

    // 2e. Correct date submission (2022-07-18)
    await page.$eval('#lock-day', el => el.value = '18');
    await page.$eval('#lock-month', el => el.value = '07');
    await page.$eval('#lock-year', el => el.value = '2022');
    await submitBtn.click();
    await sleep(400);

    const successMsg = await page.$eval('#lock-feedback', el => el.textContent);
    const shackleOpen = await page.$eval('.lock-shackle', el => el.classList.contains('open'));
    console.log(`  ✓ Correct date success message: "${successMsg}"`);
    console.log(`  ✓ Lock shackle opened: ${shackleOpen}`);
    if (!shackleOpen) throw new Error('Shackle failed to open on correct date');

    // Wait for transition to Chapter 3
    await page.waitForSelector('#chapter-3.active', { timeout: 6000 });

    // -----------------------------------------------------------
    // TEST 3: Chapter 3 — The Escaping Button (Desktop & Mobile)
    // -----------------------------------------------------------
    console.log('\n📌 Test 3: Testing Chapter 3 Escaping Button...');
    console.log('  ✓ Chapter 3 active');

    // Trigger escapes until surrender
    const evasiveBtn = await page.$('#ch3-btn-evasive');
    const arenaRect = await page.$eval('#ch3-arena', el => {
      const r = el.getBoundingClientRect();
      return { width: r.width, height: r.height };
    });

    for (let i = 1; i <= 6; i++) {
      // Trigger touch/pointer dodge
      await page.evaluate(() => {
        const btn = document.getElementById('ch3-btn-evasive');
        btn.dispatchEvent(new Event('touchstart', { bubbles: true, cancelable: true }));
      });
      await sleep(750);

      const btnPos = await page.$eval('#ch3-btn-evasive', el => ({
        left: parseFloat(el.style.left) || 0,
        top: parseFloat(el.style.top) || 0,
      }));

      console.log(`  ✓ Escape attempt ${i}: button dodged to (${btnPos.left.toFixed(1)}, ${btnPos.top.toFixed(1)})`);

      // Ensure button never exceeds screen or arena boundaries
      if (btnPos.left < 0 || btnPos.left > arenaRect.width || btnPos.top < 0 || btnPos.top > arenaRect.height) {
        throw new Error(`Button escaped out of bounds: ${JSON.stringify(btnPos)}`);
      }
    }

    // Verify surrender panel and message
    await sleep(600);
    const surrenderVisible = await page.$eval('#ch3-surrender-panel', el => window.getComputedStyle(el).display !== 'none');
    const surrenderMsg = await page.$eval('#ch3-surrender-msg', el => el.textContent.trim());
    console.log(`  ✓ Surrender panel displayed: ${surrenderVisible}`);
    console.log(`  ✓ Surrender message: "${surrenderMsg}"`);
    if (!surrenderVisible || !surrenderMsg.includes('Happy now? 😂')) {
      throw new Error('Surrender panel failed to display correct message');
    }

    // Click continue to Chapter 4
    await page.click('#ch3-continue-btn');
    await page.waitForSelector('#chapter-4.active', { timeout: 4000 });

    // -----------------------------------------------------------
    // TEST 4: Chapter 4 — Relationship Memories Quiz
    // -----------------------------------------------------------
    console.log('\n📌 Test 4: Testing Chapter 4 Relationship Quiz...');
    console.log('  ✓ Chapter 4 active');

    // Check 4 glowing hearts are rendered
    const heartsCount = await page.$$eval('.quiz-heart-item', els => els.length);
    console.log(`  ✓ Glowing hearts progress indicators found: ${heartsCount}`);
    if (heartsCount !== 4) throw new Error('Expected 4 hearts progress indicator');

    // Test Question 1: incorrect answer first, then gentle hint, then correct answer
    console.log('  Testing Question 1 (First memories)...');
    // Click option index 0 (incorrect)
    await page.click('.quiz-option-btn[data-opt-index="0"]');
    await sleep(300);
    let quizFeedback = await page.$eval('#quiz-feedback', el => el.textContent);
    console.log(`    ✓ Incorrect answer feedback: "${quizFeedback}"`);

    // Click option index 2 (second incorrect -> reveals gentle hint)
    await page.click('.quiz-option-btn[data-opt-index="2"]');
    await sleep(300);
    quizFeedback = await page.$eval('#quiz-feedback', el => el.textContent);
    console.log(`    ✓ Second incorrect revealed gentle hint: "${quizFeedback}"`);
    if (!quizFeedback.includes('Gentle whisper')) {
      throw new Error('Gentle hint failed to display on repeated incorrect');
    }

    // Click correct answer (index 1)
    await page.click('.quiz-option-btn[data-opt-index="1"]');
    await sleep(400);

    const heart0Completed = await page.$eval('.quiz-heart-item[data-heart="0"]', el => el.classList.contains('completed'));
    console.log(`    ✓ Heart 1 illuminated: ${heart0Completed}`);
    if (!heart0Completed) throw new Error('Heart 1 failed to illuminate');

    // Advance to Question 2
    await page.click('#quiz-next-btn');
    await sleep(600);

    // Question 2 (Milestone Moment) - Correct index 1
    console.log('  Testing Question 2 (Milestone Moment)...');
    await page.click('.quiz-option-btn[data-opt-index="1"]');
    await sleep(400);
    const heart1Completed = await page.$eval('.quiz-heart-item[data-heart="1"]', el => el.classList.contains('completed'));
    console.log(`    ✓ Heart 2 illuminated: ${heart1Completed}`);
    await page.click('#quiz-next-btn');
    await sleep(600);

    // Question 3 (Inside Joke) - Correct index 0
    console.log('  Testing Question 3 (Inside Joke)...');
    await page.click('.quiz-option-btn[data-opt-index="0"]');
    await sleep(400);
    const heart2Completed = await page.$eval('.quiz-heart-item[data-heart="2"]', el => el.classList.contains('completed'));
    console.log(`    ✓ Heart 3 illuminated: ${heart2Completed}`);
    await page.click('#quiz-next-btn');
    await sleep(600);

    // Question 4 (Little Details) - Correct index 3
    console.log('  Testing Question 4 (Little Details)...');
    await page.click('.quiz-option-btn[data-opt-index="3"]');
    await sleep(400);
    const heart3Completed = await page.$eval('.quiz-heart-item[data-heart="3"]', el => el.classList.contains('completed'));
    console.log(`    ✓ Heart 4 illuminated: ${heart3Completed}`);
    await page.click('#quiz-next-btn');
    await sleep(600);

    // Verify Quiz Finale Screen
    const finaleQuote = await page.$eval('.quiz-complete-title', el => el.textContent.trim());
    console.log(`  ✓ Quiz finale quote displayed: "${finaleQuote}"`);
    if (!finaleQuote.includes('Funny how so many little moments can become something so important.')) {
      throw new Error('Quiz completion text did not match required quote');
    }

    // -----------------------------------------------------------
    // TEST 5: Progress Persistence & Reload Check
    // -----------------------------------------------------------
    console.log('\n📌 Test 5: Testing LocalStorage persistence across page reload...');
    await page.reload({ waitUntil: 'networkidle0' });
    await sleep(600);

    const restoredChapter = await page.evaluate(() => {
      const activeSec = document.querySelector('.chapter-stage.active');
      return activeSec ? parseInt(activeSec.getAttribute('data-index'), 10) : null;
    });
    console.log(`  ✓ Restored active chapter after reload: Chapter ${restoredChapter}`);
    if (restoredChapter !== 4) {
      throw new Error(`Expected reload to restore Chapter 4, got ${restoredChapter}`);
    }

    // -----------------------------------------------------------
    // TEST 6: Navigation Stepper
    // -----------------------------------------------------------
    console.log('\n📌 Test 6: Testing Navigation Stepper between unlocked chapters...');
    // Jump to Chapter 2
    await page.click('.step-dot[data-chapter="2"]');
    await sleep(1500);
    const isCh2 = await page.$eval('#chapter-2', el => el.classList.contains('active'));
    console.log(`  ✓ Successfully jumped back to Chapter 2: ${isCh2}`);
    if (!isCh2) throw new Error('Failed to navigate to unlocked Chapter 2');

    // Jump back to Chapter 4
    await page.click('.step-dot[data-chapter="4"]');
    await sleep(1500);
    const isCh4 = await page.$eval('#chapter-4', el => el.classList.contains('active'));
    console.log(`  ✓ Successfully jumped back to Chapter 4: ${isCh4}`);
    if (!isCh4) throw new Error('Failed to navigate back to Chapter 4');

    // -----------------------------------------------------------
    // TEST 7: Console Errors Check
    // -----------------------------------------------------------
    console.log('\n📌 Test 7: Checking for browser console errors...');
    if (consoleErrors.length > 0) {
      console.error('❌ Browser console errors encountered:', consoleErrors);
      throw new Error(`Encountered ${consoleErrors.length} console error(s)`);
    } else {
      console.log('  ✓ Zero browser console errors recorded!');
    }

    console.log('\n🎉 ALL PHASE 2 TESTS PASSED PERFECTLY!\n');
  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTests();
