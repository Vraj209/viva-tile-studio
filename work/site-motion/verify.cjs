/* Run against a built site: MOTION_BASE_URL=http://127.0.0.1:3002 node work/site-motion/verify.cjs
 * Uses the bundled browser runtime; no application test dependencies are added. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/Vraj Panchal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const baseURL = process.env.MOTION_BASE_URL || 'http://127.0.0.1:3002';
const results = [];
const output = __dirname;
const settle = (page, ms = 1150) => page.waitForTimeout(ms);
const y = (page) => page.evaluate(() => scrollY);
const mode = (page) => page.evaluate(() => document.documentElement.dataset.scrollMotion);

async function checkLayout(page) {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal overflow');
  assert.equal(await page.locator('[data-nextjs-dialog]').count(), 0, 'No error overlay');
}

async function scrollTo(page, selector, offset = 0) {
  await page.evaluate(({ selector, offset }) => {
    const target = document.querySelector(selector);
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY + offset, behavior: 'instant' });
  }, { selector, offset });
  await settle(page);
}

async function journey(page, reduced) {
  await scrollTo(page, '#possibilities', 250);
  const opener = page.getByRole('button', { name: 'Step inside: For Homeowners', exact: true });
  await opener.scrollIntoViewIfNeeded();
  await settle(page);
  const before = await y(page);
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Made around you: an interior journey' });
  await dialog.waitFor();
  await page.waitForFunction(() => document.querySelector('[data-motion-owned="journey"]')?.dataset.phase === 'exploring');
  await settle(page, 450);
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), '', 'Journey scroll released');
  const categories = dialog.getByRole('navigation', { name: 'Journey categories' }).getByRole('button');
  await categories.nth(1).click();
  await settle(page, 800);
  assert(await y(page) > 1000, 'Category navigates document');
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), '', 'Category lock released');
  if (reduced) {
    assert(await dialog.locator('[data-depth]').evaluateAll(nodes => nodes.every(node => {
      const matrix = new DOMMatrix(getComputedStyle(node).transform);
      return Math.abs(matrix.m22 - 1) < .001 && Math.abs(matrix.m42) < .01;
    })), 'Reduced journey has no image parallax');
  }
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  await settle(page, 500);
  assert(Math.abs(await y(page) - before) < 3, 'Journey restores overview position: ' + before + ' -> ' + await y(page));
  assert.equal(await opener.evaluate(el => el === document.activeElement), true, 'Journey restores opener focus');
  assert.equal(await page.evaluate(() => document.documentElement.style.overflow), '', 'Exit releases lock');
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const config of [
      { name: 'desktop', viewport: { width: 1440, height: 960 } },
      { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
      { name: 'small-mobile', viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true },
      { name: 'tablet', viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true },
      { name: 'reduced', viewport: { width: 1440, height: 960 }, reducedMotion: 'reduce' },
    ]) {
      const { name, ...options } = config;
      const context = await browser.newContext(options);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(baseURL, { waitUntil: 'networkidle' });
      await settle(page);
      await checkLayout(page);
      assert.equal(await mode(page), name === 'reduced' ? 'reduced' : 'smooth');
      assert(await page.locator('h1').isVisible());
      await page.screenshot({ path: path.join(output, `${name}-hero.png`) });

      if (name === 'desktop') {
        await page.mouse.move(700, 700);
        await page.mouse.wheel(0, 600);
        await settle(page, 40);
        const early = await y(page);
        await settle(page, 120);
        const middle = await y(page);
        await settle(page, 750);
        const end = await y(page);
        assert(early > 0 && early < middle && middle <= end, 'Wheel interpolation progresses');
        assert(Math.abs(end - 600) < 3, 'Wheel settles without excess inertia');
        results.push({ name: 'wheel', early, middle, end });
        await scrollTo(page, '#top');
        await page.locator('.desktop-nav a[href="#process"]').click();
        await settle(page);
        assert.equal(new URL(page.url()).hash, '#process');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'process');
        assert(Math.abs(await page.locator('#process').evaluate(el => el.getBoundingClientRect().top) - 100) < 4, 'Anchor padding');
        await page.goBack();
        await settle(page);
        assert((await y(page)) < 3, 'Back restores pre-anchor scroll');
        await page.goForward();
        await settle(page);
        assert(Math.abs(await page.locator('#process').evaluate(el => el.getBoundingClientRect().top) - 100) < 4, 'Forward restores anchor');
        await journey(page, false);
        // Safe overscan: the photograph must cover its aperture at both travel ends.
        await scrollTo(page, '#possibilities', 50);
        assert(await page.locator('[data-opening]').evaluateAll(nodes => nodes.every(node => {
          const aperture = node.getBoundingClientRect();
          const image = node.querySelector('img').getBoundingClientRect();
          return image.top <= aperture.top && image.bottom >= aperture.bottom && image.left <= aperture.left && image.right >= aperture.right;
        })), 'Parallax has no empty image edges');
        await page.screenshot({ path: path.join(output, 'desktop-spaces.png') });
        await scrollTo(page, '.site-footer');
        await page.screenshot({ path: path.join(output, 'desktop-footer.png') });
        await page.getByRole('link', { name: 'Back to top ↑' }).click();
        await settle(page);
        assert((await y(page)) < 3, 'Back to top');
        await page.keyboard.press('Tab');
        assert(await page.evaluate(() => document.activeElement.matches('a, button')), 'Keyboard navigation preserved');
      }

      if (options.isMobile) {
        await page.getByRole('button', { name: 'Open menu', exact: true }).click();
        assert.equal(await page.evaluate(() => document.documentElement.style.overflow), 'hidden', 'Menu lock');
        await page.locator('#mobile-nav a[href="#process"]').click();
        await settle(page);
        assert.equal(await page.evaluate(() => document.documentElement.style.overflow), '', 'Menu unlock');
        assert.equal(await page.locator('#mobile-nav').isHidden(), true);
        assert(Math.abs(await page.locator('#process').evaluate(el => el.getBoundingClientRect().top) - 24) < 4, 'Mobile anchor padding');
        if (name === 'mobile') {
          const start = await y(page);
          const cdp = await context.newCDPSession(page);
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 190, y: 650 }] });
          for (const point of [600, 540, 470, 380, 280]) {
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 190, y: point }] });
            await settle(page, 30);
          }
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
          await settle(page);
          assert((await y(page)) > start + 100, 'Native touch swipe scrolls document');
          await journey(page, false);
          await scrollTo(page, '#enquiry');
          await page.screenshot({ path: path.join(output, 'mobile-enquiry.png') });
        }
      }

      if (name === 'reduced') {
        assert.equal(await page.locator('html.lenis').count(), 0, 'No Lenis interpolation under reduced motion');
        assert(await page.locator('[data-motion-item]').evaluateAll(nodes => nodes.every(el => getComputedStyle(el).opacity === '1')), 'All copy fully visible');
        await journey(page, true);
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await settle(page);
        assert.equal(await mode(page), 'smooth');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await settle(page);
        assert.equal(await page.locator('html.lenis').count(), 0, 'Live preference cleans up Lenis');
      }
      await checkLayout(page);
      assert.deepEqual(errors, [], 'No browser exceptions');
      results.push({ name, passed: true });
      console.log(`${name}: passed`);
      await context.close();
    }
    // Direct fragments must wait for client-only story/gallery geometry, while
    // honoring both the document padding and the target's own scroll margin.
    for (const hash of ['#process', '#work', '#enquiry']) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
      await page.goto(`${baseURL}/${hash}`, { waitUntil: 'networkidle' });
      await settle(page);
      const alignment = await page.locator(hash).evaluate(el => ({
        actual: el.getBoundingClientRect().top,
        expected: (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
          + (parseFloat(getComputedStyle(el).scrollMarginTop) || 0),
      }));
      assert(Math.abs(alignment.actual - alignment.expected) < 2, `Direct fragment ${hash} alignment`);
      results.push({ name: `direct-${hash}`, passed: true });
      await page.close();
    }
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(baseURL);
    assert(await page.locator('h1').isVisible());
    assert.equal(await page.locator('[data-motion-item]').evaluateAll(nodes => nodes.every(el => getComputedStyle(el).opacity === '1')), true);
    assert(await page.locator('.site-footer').isVisible());
    results.push({ name: 'no-javascript', passed: true });
    await context.close();
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    console.log('All sitewide motion checks passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

