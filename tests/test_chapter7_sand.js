import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = `file://${path.resolve('dist/index.html')}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSandAnimationSuite() {
  console.log('🚀 Starting Verification Suite for Chapter 7: Sand Portrait...\n');

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
    // TEST 1: Navigation Stepper Check (7 Chapters)
    // -----------------------------------------------------------
    console.log('📌 Test 1: Navigation stepper displays 7 dots...');
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await sleep(800);

    // Reset progress to ensure clean test state
    await page.evaluate(() => {
      localStorage.clear();
      window.location.reload();
    });
    await sleep(1000);

    const stepDotsCount = await page.evaluate(() => {
      return document.querySelectorAll('.chapter-stepper .step-dot').length;
    });
    assert(stepDotsCount === 7, `Expected 7 step dots, found ${stepDotsCount}`);

    const ch7DotTitle = await page.evaluate(() => {
      const dot7 = document.querySelector('.step-dot[data-chapter="7"]');
      return dot7 ? dot7.getAttribute('data-title') : null;
    });
    assert(ch7DotTitle === 'Sand Portrait', `Chapter 7 dot title: "${ch7DotTitle}"`);

    // -----------------------------------------------------------
    // TEST 2: Journey from Chapter 6 to Chapter 7
    // -----------------------------------------------------------
    console.log('\n📌 Test 2: Unlocking journey to Chapter 6 and entering Chapter 7...');
    await page.evaluate(() => {
      window.__sapphireApp.progress.goToChapter(6, true);
    });
    await sleep(900);

    const ch6Active = await page.evaluate(() => {
      const ch6 = document.getElementById('chapter-6');
      return ch6 && ch6.classList.contains('active');
    });
    assert(ch6Active, 'Chapter 6 (Finale) is active');

    // Click Celebrate Birthday to reveal Grand Finale
    console.log('  Triggering Grand Finale in Chapter 6...');
    await page.click('#btn-reveal-finale');
    await sleep(1000);

    // Check that "One Last Surprise ✨" button is visible
    const toSandBtnExists = await page.evaluate(() => {
      const btn = document.getElementById('btn-to-sand-portrait');
      return btn && btn.offsetParent !== null;
    });
    assert(toSandBtnExists, '"One Last Surprise ✨" button is visible in Grand Finale');

    // Click "One Last Surprise ✨" to navigate to Chapter 7
    console.log('  Clicking "One Last Surprise ✨" to transition to Chapter 7...');
    await page.click('#btn-to-sand-portrait');
    await sleep(1200);

    const ch7Active = await page.evaluate(() => {
      const ch7 = document.getElementById('chapter-7');
      const dot7 = document.querySelector('.step-dot[data-chapter="7"]');
      return ch7 && ch7.classList.contains('active') && dot7 && dot7.classList.contains('active');
    });
    assert(ch7Active, 'Chapter 7 is now active with 7th navigation dot highlighted');

    // -----------------------------------------------------------
    // TEST 3: Chapter 7 Canvas & Particle Physics Simulation
    // -----------------------------------------------------------
    console.log('\n📌 Test 3: Sand Canvas initialization and particle progression...');
    const canvasInfo = await page.evaluate(() => {
      const canvas = document.getElementById('sand-canvas');
      if (!canvas) return null;
      return {
        width: canvas.width,
        height: canvas.height,
        offsetWidth: canvas.offsetWidth,
        offsetHeight: canvas.offsetHeight,
      };
    });

    assert(canvasInfo && canvasInfo.width > 0 && canvasInfo.height > 0,
      `Sand canvas initialized with resolution: ${canvasInfo?.width}x${canvasInfo?.height}`);

    // Wait 3.5 seconds to verify particle progression increases
    console.log('  Observing particle formation progression over time...');
    const initialProg = await page.evaluate(() => {
      const slider = document.getElementById('sand-rv');
      return slider ? parseInt(slider.value, 10) : 0;
    });

    await sleep(3500);

    const advancedProg = await page.evaluate(() => {
      const slider = document.getElementById('sand-rv');
      const valText = document.getElementById('sand-rv-o');
      return {
        value: slider ? parseInt(slider.value, 10) : 0,
        text: valText ? valText.textContent : '',
      };
    });

    assert(advancedProg.value > initialProg,
      `Particle progression advanced from ${initialProg} to ${advancedProg.value} (${advancedProg.text})`);

    // -----------------------------------------------------------
    // TEST 4: Interactive Controls & Scrubbing
    // -----------------------------------------------------------
    console.log('\n📌 Test 4: Testing interactive scrub slider, restart, and drawer...');
    
    // Test Scrubbing Slider to 100%
    await page.evaluate(() => {
      const slider = document.getElementById('sand-rv');
      slider.value = 1000;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await sleep(400);

    const scrubbedVal = await page.evaluate(() => {
      const valText = document.getElementById('sand-rv-o');
      return valText ? valText.textContent : '';
    });
    assert(scrubbedVal === '100%', `Scrubbing slider set formation to 100% (value: ${scrubbedVal})`);

    // Test Scatter & Re-form (Restart) button
    console.log('  Clicking Scatter & Re-form ✨ button...');
    await page.click('#sand-btn-restart');
    await sleep(600);

    const restartVal = await page.evaluate(() => {
      const slider = document.getElementById('sand-rv');
      return slider ? parseInt(slider.value, 10) : -1;
    });
    assert(restartVal === 0, `Scatter & Re-form successfully reset formation to 0% (value: ${restartVal})`);

    // Test Settings Drawer toggle
    console.log('  Toggling Advanced Settings drawer...');
    await page.click('#sand-btn-toggle-panel');
    await sleep(400);

    const drawerOpen = await page.evaluate(() => {
      const drawer = document.getElementById('sand-advanced-panel');
      return drawer && !drawer.classList.contains('closed');
    });
    assert(drawerOpen, 'Advanced settings drawer opened successfully');

    // Close drawer
    await page.click('#sand-btn-toggle-panel');
    await sleep(300);

    // -----------------------------------------------------------
    // TEST 5: Clean Unmount & Navigation Back to Previous Chapter
    // -----------------------------------------------------------
    console.log('\n📌 Test 5: Testing clean unmount and navigation back...');
    await page.evaluate(() => {
      window.__sapphireApp.progress.goToChapter(5); // Go back to Letter
    });
    await sleep(1400);

    const ch5Active = await page.evaluate(() => {
      const ch5 = document.getElementById('chapter-5');
      const ch7 = document.getElementById('chapter-7');
      return ch5.classList.contains('active') && ch7.classList.contains('inactive');
    });
    assert(ch5Active, 'Successfully navigated back to Chapter 5 with Chapter 7 inactive');

    // Return to Chapter 7 to confirm re-mount works cleanly
    await page.evaluate(() => {
      window.__sapphireApp.progress.goToChapter(7);
    });
    await sleep(1400);

    const ch7Remounted = await page.evaluate(() => {
      const ch7 = document.getElementById('chapter-7');
      const canvas = document.getElementById('sand-canvas');
      return ch7.classList.contains('active') && canvas !== null;
    });
    assert(ch7Remounted, 'Chapter 7 re-mounted cleanly without errors');

    // -----------------------------------------------------------
    // TEST 6: Mobile Viewport Responsiveness (375x812 iPhone X)
    // -----------------------------------------------------------
    console.log('\n📌 Test 6: Testing mobile viewport responsiveness...');
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await sleep(600);

    const mobileCanvasResolution = await page.evaluate(() => {
      const canvas = document.getElementById('sand-canvas');
      return canvas ? { w: canvas.width, h: canvas.height } : null;
    });
    assert(mobileCanvasResolution && mobileCanvasResolution.w > 0,
      `Mobile canvas resized properly: ${mobileCanvasResolution?.w}x${mobileCanvasResolution?.h}`);

    const mobileControlsVisible = await page.evaluate(() => {
      const bar = document.querySelector('.sand-controls-bar');
      return bar && bar.offsetWidth <= 375 && bar.offsetHeight > 0;
    });
    assert(mobileControlsVisible, 'Mobile controls fit comfortably within viewport bounds');

    // -----------------------------------------------------------
    // TEST 7: Console Error Check
    // -----------------------------------------------------------
    console.log('\n📌 Test 7: Checking for any console errors during execution...');
    const relevantErrors = consoleErrors.filter(e => !e.includes('favicon'));
    assert(relevantErrors.length === 0,
      `Console errors encountered: ${relevantErrors.length === 0 ? 'None (0)' : JSON.stringify(relevantErrors)}`);

    console.log(`\n==================================================`);
    console.log(`🎉 TEST SUMMARY: ${passCount} / ${totalTests} TESTS PASSED`);
    console.log(`==================================================\n`);

  } catch (err) {
    console.error('💥 Test suite crashed with error:', err);
  } finally {
    await browser.close();
  }
}

runSandAnimationSuite();
