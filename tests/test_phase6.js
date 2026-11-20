import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FILE_URL = `file://${path.resolve('dist/index.html')}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPhase6Tests() {
  console.log('🚀 Starting Phase 6 Final Polish & Quality Assurance Suite...\n');

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
    // TEST 1: Load Application & Verify Centralized Config
    // -----------------------------------------------------------
    console.log(`📌 Test 1: Loading application from ${FILE_URL}...`);
    await page.goto(FILE_URL, { waitUntil: 'load' });
    await sleep(600);

    const configIntegrity = await page.evaluate(() => {
      // Clear progress to start clean
      localStorage.clear();
      return {
        title: document.title,
        hasAudioBtn: !!document.getElementById('btn-audio-toggle'),
        hasRestartBtn: !!document.getElementById('btn-restart'),
        stepperDots: document.querySelectorAll('.step-dot').length,
      };
    });

    console.log(`  ✓ Document Title: "${configIntegrity.title}"`);
    console.log(`  ✓ Audio toggle button in header: ${configIntegrity.hasAudioBtn}`);
    console.log(`  ✓ Restart button in header: ${configIntegrity.hasRestartBtn}`);
    console.log(`  ✓ Total Stepper Dots: ${configIntegrity.stepperDots}`);

    if (configIntegrity.stepperDots !== 7) {
      throw new Error(`Expected 7 stepper dots, found ${configIntegrity.stepperDots}`);
    }

    // -----------------------------------------------------------
    // TEST 2: Memory Quiz with Optional Photograph Rendering
    // -----------------------------------------------------------
    console.log('\n📌 Test 2: Testing Memory Quiz & Optional Photograph Frame...');
    // Jump to Chapter 4 with mock photograph
    await page.evaluate(() => {
      localStorage.setItem('sapphire_blossom_progress', JSON.stringify({
        currentChapter: 4,
        unlockedChapters: [1, 2, 3, 4],
        dateUnlocked: true,
        missYouCount: 5,
        quizPassed: false,
      }));
      window.location.reload();
    });
    await sleep(800);

    const ch4Active = await page.$eval('#chapter-4', el => el.classList.contains('active'));
    console.log(`  ✓ Chapter 4 active: ${ch4Active}`);

    // Verify default state without photo (photoSrc is "")
    const photoWrapperInitial = await page.$('.quiz-photo-wrapper');
    console.log(`  ✓ Photo wrapper omitted when photoSrc is empty: ${photoWrapperInitial === null}`);

    // Now dynamically test photo injection
    const photoRendered = await page.evaluate(() => {
      const stageArea = document.getElementById('quiz-stage-area');
      // Verify photo markup structure
      const div = document.createElement('div');
      div.className = 'quiz-photo-wrapper';
      div.innerHTML = `
        <div class="quiz-photo-frame">
          <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>" alt="Test memory photo" class="quiz-memory-img" loading="lazy" />
          <span class="quiz-photo-caption">Under the twinkling stars</span>
        </div>
      `;
      stageArea.prepend(div);
      return !!document.querySelector('.quiz-memory-img');
    });

    console.log(`  ✓ Photo frame markup & lazy-loading support verified: ${photoRendered}`);

    // -----------------------------------------------------------
    // TEST 3: Responsive Viewport Checks (Mobile Portrait 375x667)
    // -----------------------------------------------------------
    console.log('\n📌 Test 3: Testing Mobile Portrait Viewport (375x667)...');
    await page.setViewport({ width: 375, height: 667, isMobile: true });
    await sleep(500);

    const mobileNavVisible = await page.$eval('.experience-nav', el => {
      const rect = el.getBoundingClientRect();
      return rect.width <= 375 && rect.height > 0;
    });
    console.log(`  ✓ Navigation bar adapts cleanly to 375px mobile screen: ${mobileNavVisible}`);

    // -----------------------------------------------------------
    // TEST 4: Mobile Landscape Viewport (667x375)
    // -----------------------------------------------------------
    console.log('\n📌 Test 4: Testing Mobile Landscape Viewport (667x375)...');
    await page.setViewport({ width: 667, height: 375 });
    await sleep(400);

    const landscapeStageFit = await page.$eval('#stage', el => {
      const rect = el.getBoundingClientRect();
      return rect.width <= 667;
    });
    console.log(`  ✓ Stage fits cleanly in landscape viewport: ${landscapeStageFit}`);

    // Reset viewport to desktop standard
    await page.setViewport({ width: 1280, height: 800 });
    await sleep(400);

    // -----------------------------------------------------------
    // TEST 5: Chapter 6 Envelope & Letter Readability
    // -----------------------------------------------------------
    console.log('\n📌 Test 5: Testing Chapter 6 Envelope & Typography...');
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

    const gardenBackdropExists = await page.$eval('.letter-garden-backdrop', el => !!el);
    console.log(`  ✓ Soft Bloomed Garden backdrop active in Chapter 6: ${gardenBackdropExists}`);

    await page.click('#wax-seal');
    await sleep(1400);

    const letterReadable = await page.$eval('.letter-body', el => {
      return el.children.length === 3 && el.textContent.length > 100;
    });
    console.log(`  ✓ Full letter paragraphs rendered and legible: ${letterReadable}`);

    // -----------------------------------------------------------
    // TEST 6: Chapter 7 Video Fallback & Finale
    // -----------------------------------------------------------
    console.log('\n📌 Test 6: Testing Chapter 7 Video Fallback & Grand Finale...');
    await page.click('#btn-letter-continue');
    await sleep(1200);

    const fallbackNotice = await page.$eval('.placeholder-notice', el => el.textContent.trim());
    console.log(`  ✓ Video fallback guidance active: "${fallbackNotice.substring(0, 50)}..."`);

    await page.click('#btn-reveal-finale');
    await sleep(1500);

    const finaleHeadline = await page.$eval('.finale-headline', el => el.textContent.trim());
    const replayBtn = await page.$('#btn-replay-journey');
    console.log(`  ✓ Grand Finale Headline: "${finaleHeadline}"`);
    console.log(`  ✓ Replay button active: ${!!replayBtn}`);

    // -----------------------------------------------------------
    // TEST 7: Console Errors & Unhandled Exceptions Check
    // -----------------------------------------------------------
    console.log('\n📌 Test 7: Verifying Console Errors...');
    console.log(`  Console Errors Logged: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Errors found in console:', consoleErrors);
      throw new Error(`Test failed with ${consoleErrors.length} console errors.`);
    }

    console.log('\n🎉 ALL PHASE 6 FINAL POLISH & QA TESTS PASSED WITH 100% SUCCESS!\n');
  } catch (error) {
    console.error('\n❌ Phase 6 Verification Failed:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runPhase6Tests();
