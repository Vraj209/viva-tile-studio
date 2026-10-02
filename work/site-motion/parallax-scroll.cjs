/* Behavior checks for scroll-linked depth. Uses the existing bundled browser runtime.
 * MOTION_BASE_URL=http://127.0.0.1:3000 node work/site-motion/parallax-scroll.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/Vraj Panchal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseURL = process.env.MOTION_BASE_URL || 'http://127.0.0.1:3002';
const suffix = new URL(baseURL).port === '3000' ? 'dev' : 'production';
const results = [];
const wait = (page, milliseconds = 350) => page.waitForTimeout(milliseconds);

async function move(page, top) {
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), top);
  await wait(page);
}

async function read(page, selector, index = 0) {
  return page.locator(selector).nth(index).evaluate(el => {
    const matrix = new DOMMatrix(getComputedStyle(el).transform);
    return { y: matrix.m42, x: matrix.m41, scale: matrix.m22, scroll: scrollY };
  });
}

async function positions(page, selector, index, aperture = false) {
  return page.locator(selector).nth(index).evaluate((el, aperture) => {
    const reference = aperture ? el.parentElement : el.closest('section, footer');
    const bounds = reference.getBoundingClientRect();
    const max = document.documentElement.scrollHeight - innerHeight;
    const start = Math.max(0, bounds.top + scrollY - innerHeight);
    const end = Math.min(max, bounds.bottom + scrollY);
    return [0.18, 0.43, 0.68].map(progress => start + (end - start) * progress);
  }, aperture);
}

async function coverage(page, selector) {
  return page.locator(selector).evaluateAll(apertures => apertures.flatMap(aperture => {
    const box = aperture.getBoundingClientRect();
    if (!box.width || !box.height) return [];
    const image = aperture.querySelector('img');
    const photograph = image.getBoundingClientRect();
    return [{
      loaded: image.complete && image.naturalWidth > 0,
      covered: photograph.top <= box.top + 0.6 && photograph.bottom >= box.bottom - 0.6
        && photograph.left <= box.left + 0.6 && photograph.right >= box.right - 0.6,
      topOverscan: box.top - photograph.top,
      bottomOverscan: photograph.bottom - box.bottom,
    }];
  }));
}

async function track(page, name, selector, index = 0, aperture = false) {
  const stops = await positions(page, selector, index, aperture);
  const states = [];
  for (const stop of stops) {
    await move(page, stop);
    states.push(await read(page, selector, index));
    const edges = await coverage(page, '[data-opening], .footer-artwork');
    assert(edges.every(edge => edge.covered), `${name}: photograph covers its aperture: ${JSON.stringify(edges)}`);
  }
  assert(Math.abs(states[2].y - states[0].y) > 1, `${name}: visible parallax progresses while scrolling: ${JSON.stringify(states)}`);
  assert((states[1].y - states[0].y) * (states[2].y - states[1].y) >= 0, `${name}: continuous direction`);
  await wait(page, 550);
  const settled = await read(page, selector, index);
  assert(Math.abs(settled.y - states[2].y) < .2, `${name}: no drifting after scroll settles`);
  await move(page, stops[1]);
  const reversed = await read(page, selector, index);
  assert(Math.abs(reversed.y - states[1].y) < .6, `${name}: same position on reverse scroll`);
  return { name, states, settled, reversed, passed: true };
}

async function reducedMotion(page, label) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await wait(page, 700);
  assert.equal(await page.locator('html').getAttribute('data-scroll-motion'), 'reduced');
  assert.equal(await page.locator('html.lenis').count(), 0, `${label}: interpolation removed`);
  const selectors = '[data-motion-depth], [data-motion-image], [data-opening] > picture';
  const initial = await page.locator(selectors).evaluateAll(nodes => nodes.map(el => getComputedStyle(el).transform));
  await move(page, 0);
  await move(page, 450);
  const after = await page.locator(selectors).evaluateAll(nodes => nodes.map(el => getComputedStyle(el).transform));
  assert.deepEqual(after, initial, `${label}: depth remains still while scrolling under reduced motion`);
  assert(await page.locator(selectors).evaluateAll(nodes => nodes.every(el => {
    const matrix = new DOMMatrix(getComputedStyle(el).transform);
    return Math.abs(matrix.m42) < .1;
  })), `${label}: depth translations cleared`);
  results.push({ name: `${label}-reduced-motion`, passed: true });
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const config of [
      { name: 'desktop', viewport: { width: 1440, height: 960 } },
      { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    ].filter(config => !process.env.MOTION_CASE || process.env.MOTION_CASE === config.name)) {
      const { name, ...options } = config;
      const context = await browser.newContext(options);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(baseURL, { waitUntil: 'networkidle' });
      await wait(page, 1200);
      await page.mouse.move(0, 0);
      const depths = await page.locator('[data-motion-depth]').evaluateAll(nodes => nodes
        .filter(el => el.getBoundingClientRect().width && el.getBoundingClientRect().height)
        .map(el => el.dataset.motionDepth));
      for (const kind of depths) {
        const selector = `[data-motion-depth="${kind}"]`;
        results.push(await track(page, `${name}-${kind}`, selector));
        if (kind === 'atelier' || kind === 'footer') {
          await page.screenshot({ path: path.join(__dirname, `parallax-${suffix}-${name}-${kind}.png`) });
        }
      }
      if (name === 'desktop') {
        results.push(await track(page, `${name}-footer-image`, '[data-motion-image]'));
        await page.screenshot({ path: path.join(__dirname, `parallax-${suffix}-${name}-footer.png`) });
      }
      for (let index = 0; index < await page.locator('[data-opening] > picture').count(); index++) {
        results.push(await track(page, `${name}-portal-${index + 1}`, '[data-opening] > picture', index, true));
        if (index === 0) await page.screenshot({ path: path.join(__dirname, `parallax-${suffix}-${name}-portal.png`) });
      }

      // Actual wheel or touch input must drive the same visible picture transform.
      const stops = await positions(page, '[data-opening] > picture', 0, true);
      await move(page, stops[0]);
      const beforeInput = await read(page, '[data-opening] > picture');
      if (options.hasTouch) {
        const session = await context.newCDPSession(page);
        await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 190, y: 650 }] });
        for (const y of [610, 550, 490, 410, 330]) {
          await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 190, y }] });
          await wait(page, 45);
        }
        await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      } else {
        await page.mouse.move(700, 650);
        await page.mouse.wheel(0, 320);
      }
      await wait(page, 1200);
      const afterInput = await read(page, '[data-opening] > picture');
      assert(afterInput.scroll > beforeInput.scroll + 100, `${name}: native input moves document`);
      assert(Math.abs(afterInput.y - beforeInput.y) > 1, `${name}: native input drives parallax`);
      results.push({ name: `${name}-native-input`, beforeInput, afterInput, passed: true });

      await move(page, 0);
      const pause = page.getByRole('button', { name: 'Pause motion', exact: true });
      await pause.click();
      await wait(page, 500);
      await page.mouse.move(0, 0);
      const paused = await read(page, '[data-motion-depth="atelier"]');
      await move(page, 450);
      const pausedScrolled = await read(page, '[data-motion-depth="atelier"]');
      assert(Math.abs(pausedScrolled.y - paused.y) < .2, `${name}: hero pause prevents scroll depth`);
      await move(page, 0);
      await page.getByRole('button', { name: 'Enable motion', exact: true }).click();
      await wait(page, 400);
      const resumed = await read(page, '[data-motion-depth="atelier"]');
      await move(page, resumed.scroll + 350);
      assert(Math.abs((await read(page, '[data-motion-depth="atelier"]')).y - resumed.y) > 1, `${name}: hero resumes scroll depth`);
      results.push({ name: `${name}-hero-pause`, passed: true });

      await reducedMotion(page, name);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}: no horizontal overflow`);
      assert.deepEqual(errors, [], `${name}: no browser exceptions`);
      console.log(`${name}: all parallax behavior checks passed`);
      await context.close();
    }
    fs.writeFileSync(path.join(__dirname, `parallax-results-${suffix}.json`), JSON.stringify({ baseURL, checkedAt: new Date().toISOString(), results }, null, 2));
    console.log('Parallax checks passed: progress, settling, reverse, aperture coverage, actual wheel/touch, hero pause, reduced motion.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
