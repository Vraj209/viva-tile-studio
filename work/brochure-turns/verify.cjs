const { chromium } = require('C:/Users/Vraj Panchal/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const out = path.join(__dirname, `run-${Date.now()}`);
const results = { started: new Date().toISOString(), tests: [], console: [] };
fs.mkdirSync(out, { recursive: true });
const reader = 'dialog[data-turn-state]';
const save = () => { const data = JSON.stringify({ ...results, artifactDirectory: out }, null, 2); fs.writeFileSync(path.join(out, 'results.json'), data); fs.writeFileSync(path.join(__dirname, 'results.json'), data); };
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function check(name, run) {
  if (process.argv[2] && !name.includes(process.argv[2])) return;
  const started = Date.now();
  try {
    const detail = await run();
    results.tests.push({ name, passed: true, ms: Date.now() - started, detail });
    console.log('PASS', name, detail ? JSON.stringify(detail) : '');
  } catch (error) {
    results.tests.push({ name, passed: false, ms: Date.now() - started, error: String(error.stack || error) });
    console.error('FAIL', name, error.message);
    process.exitCode = 1;
  }
  save();
}

async function open(browser, name, options = {}, routeSetup, title = 'Evoke Collection', beforeReady) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ...options });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const requested = new Set();
  page.on('request', request => { if (/\/brochures\/evoke\/page-\d+\.webp/.test(request.url())) requested.add(new URL(request.url()).pathname); });
  page.on('pageerror', error => results.console.push({ scenario: name, kind: 'pageerror', message: error.message }));
  page.on('console', message => { if (message.type() === 'error') results.console.push({ scenario: name, kind: 'console', message: message.text(), location: message.location() }); });
  await page.addInitScript(() => {
    window.__continuity = { frames: 0, issues: [], states: {}, maxLayers: 0 };
    const inspect = () => {
      const dialog = document.querySelector('dialog[data-turn-state][open]');
      if (dialog) {
        const record = window.__continuity;
        const state = dialog.dataset.turnState;
        record.states[state] = (record.states[state] || 0) + 1;
        const surfaces = [...dialog.querySelectorAll('[data-page-surface]')].filter(node => getComputedStyle(node).visibility === 'visible');
        const layers = dialog.querySelectorAll('[data-compact-turn]').length;
        record.maxLayers = Math.max(record.maxLayers, layers);
        record.frames++;
        const arena = dialog.querySelector('[class*="arena"]');
        if (arena && getComputedStyle(arena).visibility === 'visible' && surfaces.length === 0) record.issues.push({ frame: record.frames, state, issue: 'reader has no visible page surface', pages: [...dialog.querySelectorAll('[data-page-surface]')].map(node => ({ page: node.dataset.pageSurface, visible: node.dataset.visible, visibility: getComputedStyle(node).visibility, style: node.getAttribute('style') })), arena: arena.getAttribute('style') });
        for (const surface of surfaces) {
          const image = surface.querySelector('img');
          if (image && (!image.complete || image.naturalWidth === 0)) record.issues.push({ frame: record.frames, state, page: surface.dataset.pageSurface, issue: 'visible image without pixels' });
          if (!image && surface.dataset.pageSurface !== 'endpaper') record.issues.push({ frame: record.frames, state, page: surface.dataset.pageSurface, issue: 'visible page missing image' });
        }
        if (layers > 1) record.issues.push({ frame: record.frames, issue: 'multiple turning leaves' });
      }
      requestAnimationFrame(inspect);
    };
    requestAnimationFrame(inspect);
  });
  if (routeSetup) await routeSetup(page);
  await page.goto('http://127.0.0.1:3000/brochures', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: `Explore ${title} brochure` }).click();
  if (beforeReady) await beforeReady(page);
  await settled(page, 1);
  await page.screenshot({ path: path.join(out, `${name}-open.png`) });
  return { context, page, requested };
}

async function settled(page, position) {
  await page.waitForFunction(({ reader, position }) => {
    const dialog = document.querySelector(reader);
    const select = dialog?.querySelector('select[aria-label="Go to page"]');
    return dialog?.dataset.turnState === 'idle' && select && !select.disabled && (position === undefined || select.value === String(position));
  }, { reader, position });
}

async function position(page) { return Number(await page.getByRole('combobox', { name: 'Go to page' }).inputValue()); }
async function continuity(page) {
  const record = await page.evaluate(() => window.__continuity);
  assert.deepEqual(record.issues, [], 'No visible image may be missing pixels');
  assert.ok(record.maxLayers <= 1, 'At most one turning leaf');
  return record;
}
async function next(page, expected) { await page.getByRole('button', { name: 'Next page', exact: true }).click(); await settled(page, expected); }
async function previous(page, expected) { await page.getByRole('button', { name: 'Previous page', exact: true }).click(); await settled(page, expected); }

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    await check('desktop first open, repeated forward/back, rapid clicks, tactile drag, product controls', async () => {
      const { context, page, requested } = await open(browser, 'desktop');
      try {
        const firstRequests = requested.size;
        assert.ok(firstRequests <= 8, `Only adjacent pages preload, got ${firstRequests}`);
        for (let i = 0; i < 3; i++) { await next(page, 3); await previous(page, 1); }
        await page.getByRole('button', { name: 'Next page', exact: true }).evaluate(button => { for (let i = 0; i < 8; i++) button.click(); });
        await settled(page, 5);
        const surface = page.locator('[data-page-surface="7"][data-visible="true"]');
        const box = await surface.boundingBox();
        const x = box.x + box.width * .8, y = box.y + box.height * .5;
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x - box.width * .12, y, { steps: 4 });
        await page.locator('[data-strip]').first().waitFor();
        const firstTransform = await page.locator('[data-strip]').nth(5).evaluate(node => node.style.transform);
        await page.mouse.move(x - box.width * .35, y, { steps: 5 });
        const nextTransform = await page.locator('[data-strip]').nth(5).evaluate(node => node.style.transform);
        assert.notEqual(firstTransform, nextTransform, 'Leaf follows drag before pointerup');
        await page.screenshot({ path: path.join(out, 'desktop-drag.png') });
        await page.mouse.move(x - box.width * .05, y, { steps: 4 });
        await page.waitForTimeout(150);
        await page.mouse.up();
        await settled(page, 5);

        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x - box.width * .55, y, { steps: 8 });
        await page.mouse.up();
        await settled(page, 7);
        await previous(page, 5);
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x - box.width * .4, y, { steps: 6 });
        await page.locator('[class*="arena"]').dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse', isPrimary: true });
        await page.mouse.up();
        await settled(page, 5);

        const hotspot = page.locator('[data-page-surface][data-visible="true"] [data-brochure-product]').first();
        await hotspot.click();
        await page.screenshot({ path: path.join(out, 'desktop-after-hotspot-click.png') });
        await page.getByRole('button', { name: 'Close interior preview' }).waitFor({ timeout: 45000 });
        await page.screenshot({ path: path.join(out, 'desktop-hotspot.png') });
        await page.getByRole('button', { name: 'Close interior preview' }).click();
        await page.getByRole('button', { name: 'Close interior preview' }).waitFor({ state: 'hidden' });
        await page.getByRole('button', { name: /^Zoom/ }).click();
        await page.getByLabel('Enlarged brochure pages. Scroll to inspect.').waitFor();
        await page.getByRole('button', { name: /Fit to screen/ }).click();
        await page.getByRole('button', { name: /All pages/ }).click();
        await page.getByRole('button', { name: 'Open page 3', exact: true }).click();
        await settled(page, 2);
        await page.screenshot({ path: path.join(out, 'desktop-final.png') });
        return { firstRequests, ...(await continuity(page)) };
      } finally { await context.close(); }
    });

    await check('mobile touch swipes, hotspot swipe suppression, click hotspot, backward', async () => {
      const { context, page } = await open(browser, 'mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
      try {
        await next(page, 2);
        const hotspot = page.locator('[data-page-surface="3"] [data-brochure-product]');
        const box = await hotspot.boundingBox();
        const x = Math.min(320, box.x + box.width * .75), y = box.y + box.height * .4;
        const cdp = await context.newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 55, y }] });
        await page.locator('[data-compact-leaf]').waitFor();
        const first = await page.locator('[data-compact-leaf]').evaluate(node => node.style.transform);
        for (let amount = 80; amount <= 200; amount += 30) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - amount, y }] });
          await page.waitForTimeout(20);
        }
        const second = await page.locator('[data-compact-leaf]').evaluate(node => node.style.transform);
        assert.notEqual(first, second, 'Mobile leaf tracks touch movement');
        await page.screenshot({ path: path.join(out, 'mobile-swipe.png') });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await settled(page, 3);
        assert.equal(await page.getByRole('button', { name: 'Close interior preview' }).count(), 0, 'Swipe must not open a product');
        const currentBox = await page.locator('[data-page-surface="4"][data-visible="true"]').boundingBox();
        const backX = currentBox.x + currentBox.width * .2, backY = currentBox.y + currentBox.height * .45;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: backX, y: backY }] });
        for (let amount = 25; amount <= 200; amount += 25) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: backX + amount, y: backY }] });
          await page.waitForTimeout(20);
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await settled(page, 2);
        await page.screenshot({ path: path.join(out, 'mobile-backward-after.png') });
        assert.equal(await page.getByRole('button', { name: 'Close interior preview' }).count(), 0, 'Backward swipe must not open a product');
        // Chromium suppresses compatibility clicks immediately after a native
        // swipe; let its gesture recognizer settle before a distinct tap.
        await page.waitForTimeout(600);
        const tapBox = await page.locator('[data-page-surface="3"] [data-brochure-product]').boundingBox();
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tapBox.x + tapBox.width / 2, y: tapBox.y + tapBox.height / 2 }] });
        await page.waitForTimeout(80);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(out, 'mobile-after-hotspot-tap.png') });
        await page.getByRole('button', { name: 'Close interior preview' }).waitFor({ timeout: 45000 });
        await page.getByRole('button', { name: 'Close interior preview' }).click();
        await page.getByRole('button', { name: 'Close interior preview' }).waitFor({ state: 'hidden' });
        await previous(page, 1);
        await page.screenshot({ path: path.join(out, 'mobile-final.png') });
        return await continuity(page);
      } finally { await context.close(); }
    });

    await check('delayed jump beyond five seconds retains the same decoded current page nodes', async () => {
      const { context, page } = await open(browser, 'slow', {}, async page => {
        await page.route(/\/brochures\/evoke\/page-01[89]\.webp/, async route => { await delay(6500); await route.continue(); });
      });
      try {
        await page.evaluate(() => { window.__originalPages = [...document.querySelectorAll('[data-page-surface][data-visible="true"]')]; });
        await page.getByRole('combobox', { name: 'Go to page' }).selectOption('18');
        await page.waitForFunction(() => document.querySelector('dialog[data-turn-state]')?.dataset.turnState === 'preparing');
        await page.waitForTimeout(5500);
        assert.equal(await position(page), 1);
        assert.equal(await page.evaluate(() => window.__originalPages.every(node => node.isConnected && node.dataset.visible === 'true' && node.querySelector('img').complete && node.querySelector('img').naturalWidth > 0)), true);
        await page.screenshot({ path: path.join(out, 'slow-still-current-after-5s.png') });
        await settled(page, 18);
        await page.screenshot({ path: path.join(out, 'slow-jump-landed.png') });
        return await continuity(page);
      } finally { await context.close(); }
    });

    await check('first opening keeps the decoded cover when first spread takes over five seconds', async () => {
      const { context, page } = await open(browser, 'slow-first-open', {}, async page => {
        await page.route(/\/brochures\/evoke\/page-002\.webp/, async route => { await delay(7000); await route.continue(); });
      }, 'Evoke Collection', async page => {
        await page.waitForFunction(() => document.querySelector('dialog[data-turn-state]')?.dataset.turnState === 'preparing');
        await page.waitForTimeout(5500);
        assert.equal(await position(page), 0);
        assert.equal(await page.locator('[data-page-surface="1"]').evaluate(node => getComputedStyle(node).visibility === 'visible' && node.querySelector('img').complete && node.querySelector('img').naturalWidth > 0), true);
        await page.screenshot({ path: path.join(out, 'first-open-cover-after-5s.png') });
      });
      try { return await continuity(page); } finally { await context.close(); }
    });

    await check('failed destination preserves current pages and succeeds on retry', async () => {
      const { context, page } = await open(browser, 'failure');
      try {
        await page.route(/\/brochures\/evoke\/page-026\.webp/, route => route.abort('failed'));
        await page.getByRole('combobox', { name: 'Go to page' }).selectOption('25');
        await page.getByText('Try turning again, or download the PDF.', { exact: false }).waitFor();
        await settled(page, 1);
        await page.screenshot({ path: path.join(out, 'failure-current-preserved.png') });
        await page.unroute(/\/brochures\/evoke\/page-026\.webp/);
        await page.getByRole('combobox', { name: 'Go to page' }).selectOption('25');
        await settled(page, 25);
        await page.screenshot({ path: path.join(out, 'failure-retry-landed.png') });
        return await continuity(page);
      } finally { await context.close(); }
    });

    await check('reduced motion keeps image readiness while using stable immediate transitions', async () => {
      const { context, page } = await open(browser, 'reduced', { reducedMotion: 'reduce' });
      try {
        await next(page, 3);
        await previous(page, 1);
        await page.getByRole('combobox', { name: 'Go to page' }).selectOption('12');
        await settled(page, 12);
        await page.screenshot({ path: path.join(out, 'reduced-final.png') });
        const record = await continuity(page);
        assert.equal(record.maxLayers, 0, 'Reduced motion never mounts a 3D leaf');
        return record;
      } finally { await context.close(); }
    });

    await check('live reduced motion toggle and resize interrupt an active turn cleanly', async () => {
      const { context, page } = await open(browser, 'interrupt');
      try {
        await page.getByRole('button', { name: 'Next page', exact: true }).click();
        await page.locator('[data-compact-turn]').waitFor();
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await settled(page, 3);
        assert.equal(await page.locator('[data-compact-turn]').count(), 0);
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.getByRole('button', { name: 'Next page', exact: true }).click();
        await page.locator('[data-compact-turn]').waitFor();
        await page.setViewportSize({ width: 390, height: 844 });
        await settled(page, 3);
        assert.equal(await page.locator(reader).getAttribute('data-compact'), 'true');
        await next(page, 4);
        await page.screenshot({ path: path.join(out, 'interrupt-landed-mobile.png') });
        return await continuity(page);
      } finally { await context.close(); }
    });

    await check('mobile to desktop layout retains its current surface while the facing page loads', async () => {
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      const { context, page } = await open(browser, 'resize-slow', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, async page => {
        await page.route(/\/brochures\/evoke\/page-003\.webp/, async route => { await gate; await route.continue().catch(() => {}); });
      });
      try {
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.waitForTimeout(500);
        assert.equal(await page.locator(reader).getAttribute('data-compact'), 'true', 'Retain old layout until facing page is decoded');
        await page.screenshot({ path: path.join(out, 'resize-slow-current.png') });
        assert.equal(await page.locator('[data-page-surface="2"]').evaluate(node => getComputedStyle(node).visibility), 'visible', 'Current page stays visible during layout preparation');
        release();
        await page.waitForFunction(() => document.querySelector('dialog[data-turn-state]')?.dataset.compact === 'false');
        await settled(page, 1);
        await page.screenshot({ path: path.join(out, 'resize-slow-landed.png') });
        return await continuity(page);
      } finally { release(); await context.close(); }
    });

    await check('other collections open, navigate and keep correct final page bounds and endpaper', async () => {
      const records = [];
      for (const brochure of [{ title: 'Artful Surfaces', count: 15, name: 'artful' }, { title: 'New Poster Collection', count: 10, name: 'poster' }]) {
        const { context, page } = await open(browser, brochure.name, {}, undefined, brochure.title);
        try {
          await next(page, 3);
          await previous(page, 1);
          await page.getByRole('combobox', { name: 'Go to page' }).selectOption(String(brochure.count - 1));
          await settled(page, brochure.count - 1);
          assert.equal(await page.getByRole('button', { name: 'Next page', exact: true }).isDisabled(), true);
          const pages = await page.locator('[data-page-surface][data-visible="true"]').evaluateAll(nodes => nodes.map(node => node.dataset.pageSurface));
          assert.ok(pages.includes(String(brochure.count)));
          assert.equal(pages.includes('endpaper'), brochure.count % 2 === 0);
          await page.screenshot({ path: path.join(out, `${brochure.name}-last-page.png`) });
          await page.getByRole('button', { name: 'Previous page', exact: true }).click();
          await settled(page);
          await page.getByRole('combobox', { name: 'Go to page' }).selectOption('0');
          await settled(page, 0);
          assert.equal(await page.getByRole('button', { name: 'Previous page', exact: true }).isDisabled(), true);
          await next(page, 1);
          records.push({ title: brochure.title, ...(await continuity(page)) });
        } finally { await context.close(); }
      }
      return records;
    });
    const errors = results.console.filter(item => item.kind === 'pageerror');
    if (errors.length) { console.error('Uncaught browser errors', JSON.stringify(errors)); process.exitCode = 1; }
  } finally {
    await browser.close();
    results.finished = new Date().toISOString();
    save();
  }
})().catch(error => { console.error(error); results.fatal = String(error.stack || error); save(); process.exitCode = 1; });
