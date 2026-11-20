import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FILE_URL = `file://${path.resolve('dist/index.html')}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPhase4Tests() {
  console.log('🚀 Starting Phase 4 Sapphire Blossom Garden Verification Suite...\n');

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
    // TEST 1: Load Application & Jump Directly to Chapter 5
    // -----------------------------------------------------------
    console.log(`📌 Test 1: Loading application from ${FILE_URL}...`);
    await page.goto(FILE_URL, { waitUntil: 'load' });
    await sleep(600);

    // Fast-unlock up to Chapter 5 in localStorage to test direct garden entry
    console.log('  Navigating to Chapter 5 (Sapphire Blossom Garden)...');
    await page.evaluate(() => {
      localStorage.setItem('sapphire_blossom_progress', JSON.stringify({
        currentChapter: 5,
        unlockedChapters: [1, 2, 3, 4, 5],
        dateUnlocked: true,
        missYouCount: 5,
        quizPassed: true,
      }));
      window.location.reload();
    });
    await sleep(800);

    // Verify Chapter 5 active
    const ch5Active = await page.$eval('#chapter-5', el => el.classList.contains('active'));
    const bodyTheme = await page.$eval('body', el => el.className);
    console.log(`  ✓ Chapter 5 active: ${ch5Active}, Atmospheric Theme: "${bodyTheme}"`);
    if (!ch5Active || !bodyTheme.includes('theme-ch-5')) {
      throw new Error('Chapter 5 failed to activate with theme-ch-5');
    }

    // -----------------------------------------------------------
    // TEST 2: Verify Opening Prologue, Seed, and SVG Rose Elements
    // -----------------------------------------------------------
    console.log('\n📌 Test 2: Verifying Prologue, Seed, and SVG Roses presence...');
    const prologue1 = await page.$eval('.prologue-line.line-1', el => el.textContent.trim());
    const prologue2 = await page.$eval('.prologue-line.line-2', el => el.textContent.trim());
    console.log(`  ✓ Prologue Line 1: "${prologue1}"`);
    console.log(`  ✓ Prologue Line 2: "${prologue2}"`);

    // Verify SVG Rose Models exist with botanical layers
    const rosesCount = await page.$$eval('.garden-rose', els => els.length);
    const stemsCount = await page.$$eval('.rose-stem', els => els.length);
    const leavesCount = await page.$$eval('.rose-leaf', els => els.length);
    const petalsCount = await page.$$eval('.rose-petal', els => els.length);
    const sepalsCount = await page.$$eval('.rose-sepal', els => els.length);

    console.log(`  ✓ Rendered Roses in Garden: ${rosesCount}`);
    console.log(`  ✓ Rendered Botanical Stems: ${stemsCount}`);
    console.log(`  ✓ Rendered Leaves: ${leavesCount}`);
    console.log(`  ✓ Rendered Layered Petals (Outer, Mid, Inner): ${petalsCount}`);
    console.log(`  ✓ Rendered Botanical Sepals: ${sepalsCount}`);

    if (rosesCount < 5 || petalsCount < 50) {
      throw new Error('Expected rich procedural SVG roses with multiple layered petals');
    }

    // -----------------------------------------------------------
    // TEST 3: Scroll Slowly Forward Through Growth Stages
    // -----------------------------------------------------------
    console.log('\n📌 Test 3: Scrolling forward through Stage A, B, C, D...');
    const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    console.log(`  ✓ Max scroll distance: ${maxScroll}px`);

    // Stage A / Early Stage B (Scroll 30%)
    await page.evaluate((max) => window.scrollTo(0, max * 0.30), maxScroll);
    await sleep(1400); // Wait for scrub: 1.2 catchup

    const stemStrokeOffsetEarly = await page.$eval('#rose-hero .rose-stem', el => {
      return parseFloat(getComputedStyle(el).strokeDashoffset) || 0;
    });
    console.log(`  ✓ Stage B (30% scroll): Hero stem stroke-dashoffset: ${stemStrokeOffsetEarly.toFixed(1)}`);

    // Stage C: Blooming (Scroll 65%)
    await page.evaluate((max) => window.scrollTo(0, max * 0.65), maxScroll);
    await sleep(1400);

    const outerPetalOpacity = await page.$eval('#rose-hero .petal-outer', el => {
      return parseFloat(getComputedStyle(el).opacity) || 0;
    });
    console.log(`  ✓ Stage C (65% scroll): Outer reflexed petals blooming (opacity: ${outerPetalOpacity.toFixed(2)})`);

    // Stage D: Full Garden & Epilogue (Scroll 100%)
    await page.evaluate((max) => window.scrollTo(0, max), maxScroll);
    await sleep(1600);

    const epilogueOpacity = await page.$eval('#garden-epilogue-card', el => {
      return parseFloat(getComputedStyle(el).opacity) || 0;
    });
    const epilogueText = await page.$eval('.epilogue-headline', el => el.textContent.trim());
    console.log(`  ✓ Stage D (100% scroll): Epilogue Card visible (opacity: ${epilogueOpacity.toFixed(2)})`);
    console.log(`  ✓ Epilogue Message: "${epilogueText}"`);

    if (epilogueOpacity < 0.7 || !epilogueText.includes('hands')) {
      throw new Error('Epilogue card failed to reveal at 100% scroll');
    }

    // -----------------------------------------------------------
    // TEST 4: Scroll Backward (Reverse Animation Verification)
    // -----------------------------------------------------------
    console.log('\n📌 Test 4: Scrolling backward to verify reversible scrub...');
    // Scroll back to 10%
    await page.evaluate((max) => window.scrollTo(0, max * 0.10), maxScroll);
    await sleep(1400);

    const epilogueReversedOpacity = await page.$eval('#garden-epilogue-card', el => {
      return parseFloat(getComputedStyle(el).opacity) || 0;
    });
    console.log(`  ✓ Reversed to 10% scroll: Epilogue card hidden again (opacity: ${epilogueReversedOpacity.toFixed(2)})`);
    if (epilogueReversedOpacity > 0.3) {
      throw new Error('Scrub did not properly reverse epilogue visibility');
    }

    // -----------------------------------------------------------
    // TEST 5: Fast Scroll & Stability Check
    // -----------------------------------------------------------
    console.log('\n📌 Test 5: Testing rapid back-and-forth scrolling...');
    await page.evaluate((max) => {
      window.scrollTo(0, max);
      window.scrollTo(0, 0);
      window.scrollTo(0, max * 0.85);
    }, maxScroll);
    await sleep(1400);

    const heroRoseActive = await page.$eval('#rose-hero', el => !!el);
    console.log(`  ✓ Rapid scroll completed without errors. Hero rose DOM state intact: ${heroRoseActive}`);

    // -----------------------------------------------------------
    // TEST 6: Mobile Viewport Adaptation
    // -----------------------------------------------------------
    console.log('\n📌 Test 6: Testing mobile viewport (375x667 iPhone SE)...');
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(400);

    const viewportFixed = await page.$eval('#garden-viewport', el => {
      const s = getComputedStyle(el);
      return s.position === 'sticky' || s.position === 'fixed';
    });
    console.log(`  ✓ Mobile garden pinned viewport sticky/fixed: ${viewportFixed}`);

    // -----------------------------------------------------------
    // TEST 7: Cleanup When Leaving and Re-entering
    // -----------------------------------------------------------
    console.log('\n📌 Test 7: Testing unmount and re-entry cleanup...');
    // Jump back to Chapter 2
    await page.evaluate(() => document.querySelector('.step-dot[data-chapter="2"]').click());
    await page.waitForSelector('#chapter-2.active', { timeout: 4000 });
    await sleep(1500); // Allow full cinematic transition to complete
    const ch2Active = await page.$eval('#chapter-2', el => el.classList.contains('active'));
    console.log(`  ✓ Successfully jumped back to Chapter 2: ${ch2Active}`);

    // Jump back into Garden (Chapter 5)
    await page.evaluate(() => document.querySelector('.step-dot[data-chapter="5"]').click());
    await page.waitForSelector('#chapter-5.active', { timeout: 4000 });
    await sleep(1500); // Allow full cinematic transition to complete
    const ch5Reentered = await page.$eval('#chapter-5', el => el.classList.contains('active'));
    console.log(`  ✓ Successfully re-entered Chapter 5 Garden: ${ch5Reentered}`);

    // -----------------------------------------------------------
    // TEST 8: Console Errors Check
    // -----------------------------------------------------------
    console.log('\n📌 Test 8: Checking for console errors or unhandled rejections...');
    if (consoleErrors.length > 0) {
      console.error('❌ Browser console errors:', consoleErrors);
      throw new Error(`Encountered ${consoleErrors.length} console error(s)`);
    } else {
      console.log('  ✓ 0 browser console errors recorded!');
    }

    console.log('\n🎉 ALL PHASE 4 GARDEN TESTS PASSED PERFECTLY!\n');
  } catch (err) {
    console.error('\n❌ Phase 4 Test Suite Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPhase4Tests();
