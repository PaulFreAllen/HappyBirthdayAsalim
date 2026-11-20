import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FILE_URL = `file://${path.resolve('dist/index.html')}`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testNewPortrait() {
  console.log('🚀 Starting Verification of New Sand Portrait Image...\n');

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

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      if (msg.text().includes('ERR_NAME_NOT_RESOLVED')) return;
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => consoleErrors.push(err.toString()));

  try {
    await page.goto(FILE_URL, { waitUntil: 'load' });
    await sleep(600);

    // Set progress directly to Chapter 4 (Sand Portrait)
    console.log('📌 Navigating to Chapter 4 (Sand Portrait)...');
    await page.evaluate(() => {
      localStorage.setItem('sapphire_blossom_progress', JSON.stringify({
        currentChapter: 4,
        unlockedChapters: [1, 2, 3, 4],
        dateUnlocked: true,
        missYouCount: 0,
      }));
      window.location.reload();
    });

    await page.waitForSelector('#chapter-4.active', { timeout: 6000 });
    await sleep(1500); // Wait for image to load and particles to build targets

    // Check canvas and image source
    const portraitState = await page.evaluate(() => {
      const cv = document.getElementById('sand-canvas');
      const photoSrc = window.config?.chapter4?.photoSrc;
      return {
        canvasExists: !!cv,
        canvasWidth: cv ? cv.width : 0,
        canvasHeight: cv ? cv.height : 0,
        hasPhotoSrc: !!photoSrc,
        photoSrcPrefix: photoSrc ? photoSrc.substring(0, 30) : '',
        photoSrcLength: photoSrc ? photoSrc.length : 0,
      };
    });

    console.log('  Canvas state:', portraitState);
    if (!portraitState.hasPhotoSrc || portraitState.photoSrcLength < 1000) {
      throw new Error('Photo source is not loaded or too small!');
    }

    // Let's capture the canvas at 0% (scattered)
    const screenshotDir = path.resolve('tests/screenshots');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

    await page.screenshot({ path: path.join(screenshotDir, 'portrait_0_scattered.png') });
    console.log('  📸 Captured 0% scattered screenshot');

    // Advance slider to 50% formation
    console.log('  Setting formation progress to 50%...');
    await page.evaluate(() => {
      const slider = document.getElementById('sand-rv');
      slider.value = 500;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await sleep(800);
    await page.screenshot({ path: path.join(screenshotDir, 'portrait_50_forming.png') });
    console.log('  📸 Captured 50% forming screenshot');

    // Advance slider to 100% formation
    console.log('  Setting formation progress to 100% (Complete Portrait)...');
    await page.evaluate(() => {
      const slider = document.getElementById('sand-rv');
      slider.value = 1000;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await sleep(1200);
    await page.screenshot({ path: path.join(screenshotDir, 'portrait_100_formed.png') });
    console.log('  📸 Captured 100% formed screenshot');

    // Check that birthday banner is visible and has correct text
    const bannerInfo = await page.evaluate(() => {
      const banner = document.getElementById('sand-birthday-banner');
      const text = document.querySelector('.sand-birthday-text');
      const restartBtn = document.getElementById('sand-btn-restart-banner');
      const reliveBtn = document.getElementById('sand-btn-relive-journey');
      return {
        isBannerVisible: banner && window.getComputedStyle(banner).display !== 'none',
        bannerText: text ? text.textContent.trim() : '',
        hasRestart: !!restartBtn,
        hasRelive: !!reliveBtn,
      };
    });

    console.log('  Banner info:', bannerInfo);
    if (!bannerInfo.isBannerVisible || bannerInfo.bannerText !== 'Happy Birthday, Asalim!') {
      throw new Error(`Banner validation failed: ${JSON.stringify(bannerInfo)}`);
    }

    // Test mobile portrait responsiveness
    console.log('\n📌 Testing mobile viewport (375x812)...');
    await page.setViewport({ width: 375, height: 812, isMobile: true });
    await sleep(800);
    await page.screenshot({ path: path.join(screenshotDir, 'portrait_mobile.png') });
    console.log('  📸 Captured mobile screenshot');

    const mobileCanvasValid = await page.evaluate(() => {
      const cv = document.getElementById('sand-canvas');
      return cv && cv.width === 375 && cv.height === 812;
    });
    console.log('  Mobile canvas size valid:', mobileCanvasValid);

    // Check console errors
    const fatalErrors = consoleErrors.filter((e) => !e.includes('favicon'));
    console.log('  Console errors:', fatalErrors.length === 0 ? 'None (0)' : fatalErrors);
    if (fatalErrors.length > 0) {
      throw new Error(`Console errors encountered: ${JSON.stringify(fatalErrors)}`);
    }

    console.log('\n==================================================');
    console.log('✅ ALL NEW PORTRAIT VERIFICATION TESTS PASSED!');
    console.log('==================================================\n');
  } catch (err) {
    console.error('💥 Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testNewPortrait();
