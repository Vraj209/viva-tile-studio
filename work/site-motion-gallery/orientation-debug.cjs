const { chromium } = require('C:/Users/Vraj Panchal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-gallery-position]');
  await page.evaluate(() => {
    const track = document.querySelector('[data-gallery-track]');
    const start = Number(track.dataset.galleryScrollStart), end = Number(track.dataset.galleryScrollEnd);
    window.scrollTo({ top: start + (end - start) * .48, behavior: 'instant' });
  });
  await page.waitForTimeout(1100);
  await page.evaluate(() => {
    window.__scrollCalls = [];
    const scroll = window.scrollTo.bind(window);
    window.scrollTo = (...args) => {
      window.__scrollCalls.push({ y: scrollY, to: args, stack: new Error().stack, at: performance.now() });
      return scroll(...args);
    };
  });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(1300);
  console.log(JSON.stringify(await page.evaluate(() => ({y:scrollY, calls:window.__scrollCalls})),null,2));
  await browser.close();
})().catch((error) => { console.error(error); process.exitCode = 1; });
