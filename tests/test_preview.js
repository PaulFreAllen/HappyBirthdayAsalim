import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 4173;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPreviewTest() {
  console.log('🚀 Launching Vite Preview Server on port ' + PORT + '...');

  const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT)], {
    stdio: 'pipe',
  });

  preview.stdout.on('data', (d) => console.log('  [preview stdout]', d.toString().trim()));
  preview.stderr.on('data', (d) => console.error('  [preview stderr]', d.toString().trim()));

  await sleep(2500);

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

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.toString()));
  page.on('requestfailed', (req) => {
    failedRequests.push(`${req.url()} (${req.failure()?.errorText || 'failed'})`);
  });
  page.on('response', (resp) => {
    if (resp.status() >= 400) {
      failedRequests.push(`${resp.url()} (status ${resp.status()})`);
    }
  });

  try {
    console.log(`📌 Navigating to http://localhost:${PORT}/sapphire-blossom/ ...`);
    const resp = await page.goto(`http://localhost:${PORT}/sapphire-blossom/`, { waitUntil: 'load', timeout: 15000 });
    console.log(`  HTTP Response Status: ${resp.status()}`);

    const title = await page.title();
    console.log(`  Page Title: ${title}`);

    const appState = await page.evaluate(() => {
      const activeStage = document.querySelector('.chapter-stage.active');
      const dots = document.querySelectorAll('.step-dot');
      const canvas = document.getElementById('particle-canvas');
      const computedBg = window.getComputedStyle(document.body).backgroundColor;

      return {
        activeChapterId: activeStage?.id,
        dotCount: dots.length,
        hasParticleCanvas: !!canvas && canvas.width > 0,
        bodyBgColor: computedBg,
      };
    });

    console.log('  App State:', appState);

    const relevantErrors = consoleErrors.filter((e) => !e.includes('favicon'));
    console.log('  Console Errors:', relevantErrors.length === 0 ? 'None (0)' : relevantErrors);
    console.log('  Failed Requests:', failedRequests.length === 0 ? 'None (0)' : failedRequests);

    if (relevantErrors.length > 0 || failedRequests.length > 0) {
      throw new Error('Errors or failed network requests detected in preview!');
    }

    if (appState.dotCount !== 4 || appState.activeChapterId !== 'chapter-1') {
      throw new Error(`Unexpected app state: ${JSON.stringify(appState)}`);
    }

    console.log('\n==================================================');
    console.log('✅ PRODUCTION PREVIEW TEST PASSED WITH 0 ERRORS!');
    console.log('==================================================\n');
  } finally {
    await browser.close();
    preview.kill();
  }
}

runPreviewTest().catch((err) => {
  console.error('💥 Preview test failed:', err);
  process.exit(1);
});
