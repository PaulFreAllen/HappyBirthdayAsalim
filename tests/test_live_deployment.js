import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const LIVE_URL = 'https://paulfreallen.github.io/HappyBirthdayAsalim/';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyLiveSite() {
  console.log(`🚀 Connecting to LIVE GitHub Pages: ${LIVE_URL} ...\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    pipe: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleErrors = [];
  const failedRequests = [];
  const successfulRequests = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('pageerror', (err) => consoleErrors.push(err.toString()));

  page.on('requestfailed', (req) => {
    failedRequests.push(`${req.url()} (${req.failure()?.errorText || 'failed'})`);
  });

  page.on('response', (resp) => {
    if (resp.status() >= 400) {
      failedRequests.push(`${resp.url()} (HTTP ${resp.status()})`);
    } else {
      successfulRequests.push(`${resp.url()} (HTTP ${resp.status()})`);
    }
  });

  try {
    const resp = await page.goto(LIVE_URL, { waitUntil: 'load', timeout: 25000 });
    console.log(`  Live HTTP Status: ${resp.status()}`);
    await sleep(2000);

    const title = await page.title();
    console.log(`  Page Title: "${title}"`);

    const appState = await page.evaluate(() => {
      const activeStage = document.querySelector('.chapter-stage.active');
      const dots = document.querySelectorAll('.step-dot');
      const canvas = document.getElementById('particle-canvas');
      const computedBg = window.getComputedStyle(document.body).backgroundColor;

      // Verify that CSS styles are loaded by checking computed styles of elements
      const navBrand = document.querySelector('.nav-brand');
      const navBrandColor = navBrand ? window.getComputedStyle(navBrand).color : '';
      const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;

      return {
        activeChapterId: activeStage?.id,
        dotCount: dots.length,
        hasParticleCanvas: !!canvas && canvas.width > 0,
        bodyBgColor: computedBg,
        htmlBgColor: htmlBg,
        navBrandColor: navBrandColor,
      };
    });

    console.log('\n  Live DOM State:', appState);
    console.log('\n  Successful Asset Requests:');
    successfulRequests.forEach((req) => console.log('   ✅ ' + req));

    const relevantErrors = consoleErrors.filter((e) => !e.includes('favicon'));
    console.log('\n  Console Errors:', relevantErrors.length === 0 ? 'None (0)' : relevantErrors);
    console.log('  Failed Requests:', failedRequests.length === 0 ? 'None (0)' : failedRequests);

    if (failedRequests.length > 0) {
      throw new Error(`Failed network requests detected: ${JSON.stringify(failedRequests)}`);
    }

    if (relevantErrors.length > 0) {
      throw new Error(`Console errors detected: ${JSON.stringify(relevantErrors)}`);
    }

    if (appState.dotCount !== 4 || appState.activeChapterId !== 'chapter-1') {
      throw new Error(`Unexpected app state: ${JSON.stringify(appState)}`);
    }

    console.log('\n==================================================');
    console.log('🎉 LIVE GITHUB PAGES DEPLOYMENT VERIFIED 100% OPERATIONAL!');
    console.log('==================================================\n');
  } finally {
    await browser.close();
  }
}

verifyLiveSite().catch((err) => {
  console.error('💥 Live verification failed:', err);
  process.exit(1);
});
